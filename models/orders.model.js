const mongoose = require("mongoose");
const restaurantModel = require("./restaurant.model");

const orderschema = new mongoose.Schema(
  {
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
    deliveryAddress: String,
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "on the way",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },
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
