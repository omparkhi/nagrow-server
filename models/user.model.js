const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: String,
  fullAddress: { type: String, required: true },
  // formattedAddress: { type: String, required: true },
  coordinates: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  selectedAddress: {
    type: Boolean,
    default: false,
  }
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
  },

  lastName: {
    type: String,
    required: true,
    minlength: 3,
  },

  email: {
    type: String,
    unique: true,
    sparse: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
    minlength: 6,
  },

  address: [addressSchema],
});

module.exports = mongoose.model("User", userSchema);
