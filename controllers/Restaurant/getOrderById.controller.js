const Restaurant = require("../../models/restaurant.model");
const Order = require("../../models/orders.model");
const { emitToUser } = require("../../socket");



exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        // console.log("order id:", req.params);   

        if(!id) {
            return res.status(400).json({ success: false, message: "Order Id required" });
        }

        const order = await Order.findById( id )
            .populate("userId", "name phone")
            .populate("items.menuItemId", "name price image");
        

        if(!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.json({ success: true, order });

    } catch (err) {
        console.log("getOrderById error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}