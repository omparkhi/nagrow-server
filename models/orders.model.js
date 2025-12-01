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
    riderId: {
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
    distanceKm: {
      type: Number,
    },
    deliveryFee: {
      type: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      fullAddress: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
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
        "waiting_for_rider",
        "ready",
        "pick_up_by_rider",
        "on the way",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
    riderAssigned : {
      type: Boolean,
      default: false,
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
