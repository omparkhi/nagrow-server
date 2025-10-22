const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const razorpay = require("../../config/razorpay");
const Order = require("../../models/orders.model");

// step 1. Create Razorpay Order
router.post("/order", async (req, res) => {
    try {
        const { items, tip = 0, distanceKm = 0 } = req.body;
        if(!items || items.length === 0) return res.status(400).json({ message: "Cart is empty" });

        // securely calculate total
        const subTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const deliveryFee = Math.ceil(distanceKm * 12);
        const grandTotal = subTotal + deliveryFee + Number(tip);

        const options = {
            amount: grandTotal * 100,
            currency: "INR",
            receipt: `receipt_${Math.floor(Math.random() * 100000)}`,
        };

        const order = await razorpay.orders.create(options);
        return res.json({ 
            success: true,
            order,
            totalAmount: grandTotal,
            subTotal,
            deliveryFee,
            tip,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error creating Razorpay order" });
    }
});


// step 2. Verify payment
router.post("/verify", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if(!isAuthentic)
            return res.status(400).json({ success: false, message: "Invalid Signature" });

        // save order in db
        const newOrder = await Order.create({
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            deliveryAddress: orderData.deliveryAddress,
            razorpayOrderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            paymentStatus: "completed",
        });

        res.json({ success: true, order: newOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Verification failed" });
    }
});

module.exports = router;

