const Restaurant = require("../../models/restaurant.model");
const Order = require("../../models/orders.model");
const { emitToUser } = require("../../socket");
const { getIO } = require("../../socket");
const { findNearestRider } = require("../../services/findNearestRider");


exports.getOrder = async (req, res) => {
    try {
        
        const order = await Order.find({ restaurantId: req.params.id })
        .sort({ createdAt: -1 })
        .populate("userId", "name phone")
        .populate("items.menuItemId", "name price image");
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
        const { id, status } = req.body;

        const validStatus = ["placed", "accepted", "preparing", "ready", "on the way", "delivered", "cancelled"];
        if(!validStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate("userId restaurantId riderId");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status = status;
        await order.save();

        const msg = `Your order is now ${order.status}`;
        
        const io = getIO();

        // ✅ When restaurant marks as READY assin nearest rider
        if(status === "ready") {
            const restaurantCoords = order.restaurantId.address.location.coordinates;
            const rider = await findNearestRider(restaurantCoords);

            // if(!rider) {
            //     io.to
            // }

            // Assign rider
            order.riderId = rider._id;
            order.status = "on the way";
            await order.save();

            // update rider status
            rider.isAvailable = false;
            rider.currentOrderId = order._id;
            await rider.save();

            // Notify all parties
            io.to(`order_${order._id}`).emit( "orderStatusUpdate", {
                _id: order._id,
                orderId: order.orderId,
                status: order.status,
                message: "Your order is out for delivery 🚴‍♀️",
            });

            io.to(`restaurant_${order.restaurantId._id}`).emit( "restaurantOrderUpdate", {
                _id: order._id,
                orderId: order.orderId,
                status: order.status,
                message: `Rider ${rider.name} assigned and picked up the order.`,
            });

            io.to(`rider_${rider._id}`).emit( "newDelivery", {
                _id: order._id,
                orderId: order.orderId,
                restaurant: order.restaurantId.name,
                destination: order.deliveryAddress,
                totalAmount: order.totalAmount,
            });

        }

         // ✅ Normal status updates

        // ✅ Emit to USER order room
        io.to(`order_${id}`).emit( "orderStatusUpdate", {
            _id: order._id,
            orderId: order.orderId,
            status: order.status,
            message: msg,

        });

        // ✅ Emit to RESTAURANT room (kitchen dashboard)
        io.to(`restaurant_${order.restaurantId._id}`).emit("restaurantOrderUpdate", {
            _id: order._id,
            status: order.status,
            message: `Order #${order.orderId} → ${status}`,
        })

        res.json({ succes: true, order });
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error updating status" });
    }
};