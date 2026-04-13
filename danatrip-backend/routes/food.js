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
const { allowRoles } = require('../middleware/admin');

// Public
router.get('/', getFoods);
router.get('/:id', getFood);

// Admin
router.post('/', protect, allowRoles('WebsiteManager'), createFood);
router.put('/:id', protect, allowRoles('WebsiteManager'), updateFood);
router.delete('/:id', protect, allowRoles('WebsiteManager'), deleteFood);

module.exports = router;
