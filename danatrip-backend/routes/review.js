const express = require('express');
const router = express.Router();
const {
  getReviewsByTour,
  getAllReviews,
  getPublicReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Public
router.get('/tour/:tourId', getReviewsByTour);
router.get('/public', getPublicReviews);

// User (cần đăng nhập)
router.get('/my', protect, getMyReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin
router.get('/', protect, adminOnly, getAllReviews);

module.exports = router;