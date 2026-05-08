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
const adminLogger = require('../middleware/adminLogger');

// Public
router.get('/', getFoods);
router.get('/:id', getFood);

// Admin
router.post('/', protect, allowRoles('WebsiteManager'), adminLogger('create', 'food'), createFood);
router.put('/:id', protect, allowRoles('WebsiteManager'), adminLogger('update', 'food'), updateFood);
router.delete('/:id', protect, allowRoles('WebsiteManager'), adminLogger('delete', 'food'), deleteFood);

module.exports = router;
