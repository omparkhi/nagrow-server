const mongoose = require("mongoose");
const restaurantModel = require("./restaurant.model");

const orderschema = new mongoose.Schema(
  {
    orderId: {
      type: String, 
      unique: true, 
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    riderid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItems",
        },
        quantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["online", "cod"],
      default: "online",
    },
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready",
        "on the way",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    deliveryTime: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderschema);
