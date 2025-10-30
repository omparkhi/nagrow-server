const Restaurant = require("../../models/restaurant.model");
const Order = require("../../models/orders.model");
const { emitToUser } = require("../../socket");

exports.getOrder = async (req, res) => {
    try {
        const order = await Order.find({ restaurantId: req.params.id })
        .sort({ createdAt: -1 })
        .populate("userId", "name phone")
        .populate("items.menuItemId", "name price");
        // res.send("order fetch");
        console.log(order);
        res.json({ success: true, order });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Cannot fetch restaurant orders" });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const validStatus = ["accepted", "preparing", "ready"];
        if(!validStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findByIdAndUpdate(
            { orderId },
            { status },
            { new: true }
        );
        
        emitToUser(order.orderId, "orderStatusUpdate", {
            orderId: order.orderId,
            status: order.status
        });

        res.json({ succes: true, order });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating status" });
    }
}