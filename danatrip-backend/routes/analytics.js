const express = require('express');
const router = express.Router();
const { trackVisit } = require('../controllers/analyticsController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (error) {
    req.user = null;
  }

  return next();
};

router.post('/visit', optionalAuth, trackVisit);

module.exports = router;
