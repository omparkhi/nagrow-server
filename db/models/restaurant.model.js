const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  cuisine: String,
  imageUrl: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
})

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
