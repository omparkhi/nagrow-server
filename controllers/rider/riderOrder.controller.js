const Rider = require("../../models/rider.model");
const Order = require("../../models/orders.model");
const { emitToUser, emitToRestaurant } = require("../../services/emit.socket");
const { assignRiderToOrder } = require("../../services/riderAssignment");

exports.riderResponse = async(req, res) => {
    const { riderId, orderId, action } = req.body;

    const order = await Order.findById(orderId);
    const rider = await Rider.findById(riderId);
    console.log("order details at rider acceptance:", order);

    if (!order || !rider) return res.status(404).json({ message: "Invalid" });

     if (!rider.isAvailable && action === "accept") {
        return res.status(400).json({ message: "Rider already has an order" });
    }

    if (action === "accept") {
        order.riderId = riderId;
        order.riderAssigned = true;
        // order.status = "rider_assigned";
        await order.save();
        console.log("order accept by rider:", order, "orderID:", orderId, "riderId:", riderId);

        rider.isAvailable = false;
        rider.currentOrderId = orderId;
        rider.assignedOrders.push(orderId);
        await rider.save();

        emitToUser(order.userId, "order:status", {
            orderId,
            riderId,
            riderAssigned: true
        });
        emitToRestaurant(order.restaurantId, "delivery:accepted", {
            id: order?._id || order?.id,
            orderId,
            riderId,
            riderAssigned: true
        });
        return res.json({ success: true, message: "Order accepted" });
    }

     if (action === "reject") {
        // find next nearest rider
        assignRiderToOrder(orderId);
        return res.json({ success: true, message: "Order passed to next rider" });
    }
};

exports.getRiderOrderdetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId })
            .populate("userId", "firstName lastName phone")
            .populate("restaurantId", "name address phone")
            .populate("items.menuItemId", "name price image");

        if (!order) {
            return res.status(404).json({ message: "Order not found or not assigned to rider" });
        }

        return res.json({ success: true, order });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to fetch order" });
    }
};

exports.updateRiderOrderStatus = async (req, res) => {
    try {
        const { id, riderId, status } = req.body;

        const validStatus = ["pick_up_by_rider", "on the way", "delivered"];
        if (!validStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const order = await Order.findOne({
            _id: id,
            riderId: riderId,
            riderAssigned: true
        }).populate("userId restaurantId riderId");
        
        if (!order) {
            return res.status(404).json({ message: "Order not found for this rider" });
        }

        order.status = status;
        await order.save();

        // Notify user + restaurant
        emitToUser(order.userId, "order:status", { orderId: order._id, status });
        emitToRestaurant(order.restaurantId, "order:status", { orderId: order._id, status });

        // If delivered, rider becomes free
        if (status === "delivered") {
            await Rider.findByIdAndUpdate(riderId, {
                isAvailable: true,
                currentOrderId: null,
            });
        }
        
        return res.json({ success: true, order });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update status" });
    }
};