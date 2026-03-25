const express = require('express');
const router = express.Router();
const {
  getPlaces,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/placeController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Public routes
router.get('/', getPlaces);
router.get('/:id', getPlace);

// Admin routes
router.post('/', protect, adminOnly, createPlace);
router.put('/:id', protect, adminOnly, updatePlace);
router.delete('/:id', protect, adminOnly, deletePlace);

module.exports = router;