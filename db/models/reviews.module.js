const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  comment: {
    type: String,
    maxlength: 1000,
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // optional, if review tied to completed order
  },

  createdAt: {
    type: Date,
    default: Date.now,
  }
});

reviewSchema.index({ restaurantId: 1, userId: 1 }, { unique: true }); // prevent multiple reviews per restaurant per user

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
