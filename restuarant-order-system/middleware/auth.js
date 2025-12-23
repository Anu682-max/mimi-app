const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Header-оос token авах
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Токен байхгүй байна' });
  }

  try {
    // Token баталгаажуулах
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Токен буруу байна' });
  }
};
