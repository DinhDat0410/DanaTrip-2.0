const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');

// User (cần đăng nhập)
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Admin
router.get('/', protect, allowRoles('WebsiteManager'), getAllBookings);
router.put('/:id', protect, allowRoles('WebsiteManager'), updateBooking);

module.exports = router;
