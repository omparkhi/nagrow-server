const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const razorpay = require("../../config/razorpay");
const Order = require("../../models/orders.model");
const User = require("../../models/user.model");
const Restaurant = require("../../models/restaurant.model");
const getDistanceKm = require("../../utils/getDistanceKm");
const { emitToUser, emitToRestaurant } = require("../../socket");
const mongoose = require("mongoose");
// const { default: items } = require("razorpay/dist/types/items");


function generateNextOrderId() {
    const date = new Date();
    const datePrefix = date.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD
    const timePart = date.getTime().toString().slice(-4);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    
    return `${datePrefix}${timePart}${randomPart}`;
}

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

        const customOrderId = generateNextOrderId();

        const formattedItems = orderData.items.map(i => ({
    menuItemId: new mongoose.Types.ObjectId(i.menuItemId || i.id), // ✅ Fail-safe
    quantity: i.quantity
}));



        // save order in db
        const newOrder = await Order.create({
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            items: formattedItems,
            totalAmount: orderData.totalAmount,
            deliveryAddress: orderData.deliveryAddress,
            paymentType: orderData.paymentType,
            razorpayOrderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            paymentStatus: "completed",
            orderId: customOrderId,
        });

        const resId = orderData.restaurantId.toString().replace(/"/g, "");
        console.log("🔥 Emitting to restaurant room:", resId);

        emitToRestaurant(resId, "newOrder", {
            id: newOrder._id,
            orderId: newOrder.orderId,
            totalAmount: newOrder.totalAmount,
            items: newOrder.items.length,
            message: "New Online Order Received"
        });

        res.json({ success: true, order: newOrder });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Verification failed" });
    }
});

router.post("/order/cod", async (req, res) => { 
    try { 
        const { userId, restaurantId, items, tip = 0, distanceKm = 0, deliveryAddress } = req.body; 
        console.log("COD Body ===>", req.body); 
    
    if(!items || items.length === 0) { 
        return res.status(400).json({ message: "Cart is Empty" }); 
    } 
    
    const subTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0); 
    
    const deliveryFee = Math.ceil(distanceKm * 12); 
    
    const grandTotal = subTotal + deliveryFee + Number(tip); 

    const customOrderId = generateNextOrderId();

    

    // const formattedItems = orderData.items.map(i => ({
    //     menuItemId: new mongoose.Types.ObjectId(i.menuItemId),
    //     quantity: i.quantity
    // }));
    
    const newOrder = await Order.create({ 
        userId, 
        restaurantId, 
        items: items.map(i => ({
            menuItemId: new mongoose.Types.ObjectId(i.menuItemId || i.id), // ✅ FIX
            quantity: i.quantity
        })),


        totalAmount: grandTotal, 
        deliveryAddress, 
        paymentType: "cod", 
        paymentStatus: "pending", 
        orderId: customOrderId,
    }); 

    const resId = restaurantId.toString().replace(/"/g, "");
    console.log("🔥 Emitting to restaurant room:", resId);

    emitToRestaurant(resId, "newOrder", {
        id: newOrder._id,
        orderId: newOrder.orderId,
        totalAmount: newOrder.totalAmount,
        items: newOrder.items.length,
        message: "New COD Order Received"
    })
    
    return res.json({ success: true, order: newOrder, message: "COD order placed successfully" });

 } catch (err) { 
    console.log(err); 
    return res.status(500).json({ message: "Error creating COD order" }); 
    } 
});


router.post("/cal/deliveryFee", async (req, res) => {
    try {
        const { userId, restaurantId } = req.body;
         console.log("COD Body ===>", req.body); 
        if(!userId || !restaurantId) return res.status(400).json({ message: "Missing Parameters" });

        const user = await User.findById(userId);
        const restaurant = await Restaurant.findById(restaurantId);

        if(!user || !restaurant) return res.status(404).json({ message: "User or restaurant not found" });

        const selectedAddress = user.address.find((a) => a.selectedAddress === true);
        if(!selectedAddress) return res.status(400).json({ message: "No selected address found" });

        const distanceKm = await getDistanceKm(
            {
                lat: selectedAddress.coordinates.coordinates[1],
                lng: selectedAddress.coordinates.coordinates[0],
            },
            {
                lat: restaurant.address.location.coordinates[1],
                lng: restaurant.address.location.coordinates[0],
            }
        );
        console.log("user address: ", "lat :", selectedAddress.coordinates.coordinates[1], "lng: ", selectedAddress.coordinates.coordinates[0])
         console.log("restaurant address: ", "lat :", restaurant.address.location.coordinates[1], "lng: ", restaurant.address.location.coordinates[0]);

        console.log(distanceKm);

        const deliveryFee = Math.ceil(distanceKm * 12);
        return res.json({ success: true, distanceKm, deliveryFee });
  } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error calculating delivery" });
    }
});

module.exports = router;

router.get("/test-notify", (req, res) => {
  emitToRestaurant("690320836e29a2bad6e82d3b", "newOrder", {
    message: "Test order popup ✅",
  })
  res.send("sent");
});

