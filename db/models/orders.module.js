const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
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
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  status: {
    type: String,
    enum: ['placed', 'accepted', 'delivered', 'cancelled'],
    default: 'placed',
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  commission: { type: Number },        // Admin commission
  restaurantPayout: { type: Number },  // Amount paid to restaurant after commission
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash'], default: 'UPI' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
