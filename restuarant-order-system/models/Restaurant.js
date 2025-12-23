const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  cuisine: { 
    type: String, 
    required: true 
  },
  menu: [{
    name: String,
    price: Number,
    description: String,
    image: String
  }],
  rating: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
