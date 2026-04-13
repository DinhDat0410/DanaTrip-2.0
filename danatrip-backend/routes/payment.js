const express = require('express');
const router = express.Router();
const momoController = require('../controllers/momoController');
const vnpayController = require('../controllers/vnpayController');
const { protect } = require('../middleware/auth');

// API user gọi để tạo thanh toán Momo
router.post('/create-momo', protect, momoController.createMomoPayment);
router.post('/create-vnpay', protect, vnpayController.createVNPayPayment);
// Frontend gọi khi người dùng quay lại redirectUrl để cập nhật ngay trạng thái booking
router.post('/momo-return-sync', momoController.syncMomoReturn);
router.post('/vnpay-return-sync', vnpayController.syncVNPayReturn);
// API Momo server gọi để gửi thông báo thanh toán (IPN)
router.post('/momo-ipn', momoController.handleMomoIPN);

module.exports = router;
