const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Database холболт
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB холбогдлоо'))
  .catch(err => console.error('MongoDB алдаа:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер ${PORT} порт дээр ажиллаж байна`));
