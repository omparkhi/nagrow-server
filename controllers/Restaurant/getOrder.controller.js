    const Restaurant = require("../../models/restaurant.model");
    const Order = require("../../models/orders.model");
    const { emitToUser, emitToRider } = require("../../services/emit.socket");
    const { getSocket } = require("../../socket");
    const { findNearestRider } = require("../../services/findNearestRider");
    const { assignRiderToOrder } = require("../../services/riderAssignment");


    exports.getOrder = async (req, res) => {
        try {
            
            const order = await Order.find({ restaurantId: req.params.id })
            .sort({ createdAt: -1 })
            .populate("userId", "name phone")
            .populate("items.menuItemId", "name price image");
            // res.send("order fetch");
            // console.log(order);
            res.json({ success: true, order });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Cannot fetch restaurant orders" });
        }
    };



    exports.updateStatus = async (req, res) => {
        try {
            const { id, status } = req.body;

            const validStatus = ["placed", "accepted", "preparing", "ready"];
            if(!validStatus.includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }

            let order = await Order.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            ).populate("userId restaurantId riderId");

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            // Restaurant Accept Order
            if (status === "accepted") {
                order.status = "preparing";
                order.riderAssigned = false;
                await order.save();

                // start rider assignment in background
                assignRiderToOrder(order._id);

                emitToUser(order.userId._id, "order:status", {
                    id: order._id,
                    orderId: order.orderId,
                    status: "preparing"
                });

                return res.json({ success: true, order });
            }
            
            // other status updated
            order.status = status;
            await order.save();

            emitToUser(order.userId._id, "order:status", {
                id: order._id,
                orderId: order.orderId,
                status: "preparing"
            });

            return res.json({ success: true, order });


        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Error updating status" });
        }
    };