const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

// Бүх рестораныг авах
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isOpen: true });
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Тодорхой ресторан авах
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Ресторан олдсонгүй' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Рестораны цэс авах
router.get('/:id/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ 
      restaurantId: req.params.id,
      available: true 
    });
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Ресторан нэмэх (зөвхөн restaurant эзэмшигч)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'restaurant' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Хандах эрхгүй байна' });
    }

    const { name, description, address, phone, cuisine, openingHours } = req.body;

    const restaurant = new Restaurant({
      name,
      description,
      ownerId: req.user.userId,
      address,
      phone,
      cuisine,
      openingHours
    });

    await restaurant.save();
    res.status(201).json({ message: 'Ресторан амжилттай нэмэгдлээ', restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Цэсэнд хоол нэмэх
router.post('/:id/menu', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Ресторан олдсонгүй' });
    }

    if (restaurant.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Хандах эрхгүй байна' });
    }

    const { name, description, price, category } = req.body;

    const menuItem = new MenuItem({
      restaurantId: req.params.id,
      name,
      description,
      price,
      category
    });

    await menuItem.save();
    res.status(201).json({ message: 'Хоол амжилттай нэмэгдлээ', menuItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

module.exports = router;
