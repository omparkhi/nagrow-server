const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
  },

  lastName: {
    type: String,
    required: true,
    minlength: 3,
  },

  email: {
    type: String,
    unique: true,
    required: true,
  },

  phone: {
    type: Number,
    min: 10,
  },

  password: {
    type: String,
  },
});

module.exports = mongoose.model("Admin", adminSchema);
