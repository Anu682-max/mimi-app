const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  image: { 
    type: String 
  },
  category: { 
    type: String,
    enum: ['appetizer', 'main', 'dessert', 'drink', 'other'],
    default: 'other'
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
