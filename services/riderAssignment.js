const { findNearestRider } = require("./findNearestRider");
const { emitToRider } = require("../services/emit.socket");
const Order = require("../models/orders.model");
const Rider = require("../models/rider.model");

exports.assignRiderToOrder = async (orderId) => {
    const order = await Order.findById(orderId).populate("restaurantId");

    if(!order) return;
    if (order.riderAssigned === true) return;
    if (order.status !== "preparing") return;

    const restaurantCoords = order.restaurantId.address.location.coordinates;
    const rider = await findNearestRider(restaurantCoords);

    if (!rider) {
        order.status = "waiting_for_rider";
        await order.save();
        console.log("❌ No rider found. Added to queue.");
        return;
    }
    console.log("rider delivery request:", order);

    // send request to rider to accept/reject
    emitToRider(rider._id, "delivery:request", {
        id: order._id,
        orderId: order.orderId,
        restaurantName: order.restaurantId.name,
        amount: order.totalAmount,
        pickup: restaurantCoords,
    });

    console.log("📨 Rider notified:", rider._id);
};