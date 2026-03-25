const express = require('express');
const router = express.Router();
const {
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getToursByPlace,
} = require('../controllers/tourController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Public
router.get('/', getTours);
router.get('/:id', getTour);
router.get('/place/:placeId', getToursByPlace);

// Admin
router.post('/', protect, adminOnly, createTour);
router.put('/:id', protect, adminOnly, updateTour);
router.delete('/:id', protect, adminOnly, deleteTour);

module.exports = router;