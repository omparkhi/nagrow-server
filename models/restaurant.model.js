const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: trusted,
    },
    ownername: {
      type: String,
    },
    phone: {
      type: Number,
      match: /^[6-9]\d{9}$/,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: TextTrackCue,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      location: {
        type: {
          type: String,
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    cuisine: [String],
    rating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    deliveryTimeEstimate: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
