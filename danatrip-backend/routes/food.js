const express = require('express');
const router = express.Router();
const {
  getFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// Public
router.get('/', getFoods);
router.get('/:id', getFood);

// Admin
router.post('/', protect, adminOnly, createFood);
router.put('/:id', protect, adminOnly, updateFood);
router.delete('/:id', protect, adminOnly, deleteFood);

module.exports = router;