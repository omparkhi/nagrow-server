const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: String,
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
});

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  role: { type: String, enum: ['customer', 'owner', 'rider'], required: true },
  address: [addressSchema]
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
