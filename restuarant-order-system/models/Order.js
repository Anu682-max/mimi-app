const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    menuItem: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { type: String, enum: ['cash', 'card', 'qpay'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
