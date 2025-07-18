const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
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
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phone: {
    type: Number,
    min: 10,
    max: 10,
  },
  password: {
    type: String,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
