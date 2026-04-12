const express = require('express');
const router = express.Router();
const momoController = require('../controllers/momoController');
const { protect } = require('../middleware/auth');

// API user gọi để tạo thanh toán Momo
router.post('/create-momo', protect, momoController.createMomoPayment);
// API Momo server gọi để gửi thông báo thanh toán (IPN)
router.post('/momo-ipn', momoController.handleMomoIPN);

module.exports = router;