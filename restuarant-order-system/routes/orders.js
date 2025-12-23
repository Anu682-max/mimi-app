const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Захиалга үүсгэх
router.post('/', auth, async (req, res) => {
  try {
    const { restaurantId, items, totalPrice, deliveryAddress, phone, notes } = req.body;

    const order = new Order({
      customerId: req.user.userId,
      restaurantId,
      items,
      totalPrice,
      deliveryAddress,
      phone,
      notes
    });

    await order.save();
    res.status(201).json({ 
      message: 'Захиалга амжилттай үүсгэгдлээ', 
      order 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Өөрийн захиалгуудыг авах
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.userId })
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Тодорхой захиалга авах
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'name phone')
      .populate('customerId', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Захиалга олдсонгүй' });
    }

    // Зөвхөн өөрийн захиалгыг харах эрхтэй
    if (order.customerId._id.toString() !== req.user.userId && req.user.role !== 'restaurant' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Хандах эрхгүй байна' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Захиалгын статус өөрчлөх (ресторан эзэмшигч)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('restaurantId', 'ownerId');

    if (!order) {
      return res.status(404).json({ message: 'Захиалга олдсонгүй' });
    }

    // Зөвхөн ресторан эзэмшигч статус өөрчлөх эрхтэй
    if (order.restaurantId.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Хандах эрхгүй байна' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.json({ message: 'Захиалгын статус шинэчлэгдлээ', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Захиалга цуцлах
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Захиалга олдсонгүй' });
    }

    if (order.customerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Хандах эрхгүй байна' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Зөвхөн хүлээгдэж буй захиалгыг цуцлах боломжтой' });
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    res.json({ message: 'Захиалга цуцлагдлаа' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

module.exports = router;
