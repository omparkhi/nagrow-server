const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: trusted,
    },
    phone: {
      type: Number,
      match: /^[6-9]\d{9}$/,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isavailable: {
      type: Boolean,
      default: true,
    },
    assignedOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rider", riderSchema);
