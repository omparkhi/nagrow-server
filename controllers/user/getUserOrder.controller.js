const Restaurant = require("../../models/restaurant.model");
const User = require("../../models/user.model");
const Order = require("../../models/orders.model");

exports.getUserOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId })
            .populate("userId", "phone name") 
            .populate("restaurantId", "name address phone")
            .populate("items.menuItemId", "name price image");

            // console.log("req.user:", req.user?._id);
            // console.log("order.userId:", order.userId?._id);


        if(!order || order.userId._id.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }



        return res.json({ success: true, order });
    } catch (err) {
        console.log("Get user order error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}