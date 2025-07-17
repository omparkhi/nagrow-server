const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: String,
  description: String,
  isAvailable: { type: Boolean, default: true },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
});

module.exports = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
