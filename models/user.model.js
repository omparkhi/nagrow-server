const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: String,
  coordinates: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
});

const userSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      min: 3,
    },
    lastname: {
      type: String,
      required: true,
      min: 3,
    },
  },
  email: { type: String, unique: true },
  phone: {
    type: Number,
    min: 10,
    max: 10,
  },
  password: String,
  address: [addressSchema],
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
