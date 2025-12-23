const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Бүртгүүлэх
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Хэрэглэгч байгаа эсэхийг шалгах
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Энэ имэйл аль хэдийн бүртгэлтэй байна' });
    }

    // Нууц үг hash хийх
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Шинэ хэрэглэгч үүсгэх
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
      phone,
      address
    });

    await user.save();

    // JWT token үүсгэх
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Амжилттай бүртгэгдлээ',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// Нэвтрэх
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Хэрэглэгч олох
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Имэйл эсвэл нууц үг буруу байна' });
    }

    // Нууц үг шалгах
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Имэйл эсвэл нууц үг буруу байна' });
    }

    // JWT token үүсгэх
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Амжилттай нэвтэрлээ',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

module.exports = router;
