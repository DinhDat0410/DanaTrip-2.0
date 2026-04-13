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
const { allowRoles } = require('../middleware/admin');

// Public routes
router.get('/', getPlaces);
router.get('/:id', getPlace);

// Admin routes
router.post('/', protect, allowRoles('WebsiteManager'), createPlace);
router.put('/:id', protect, allowRoles('WebsiteManager'), updatePlace);
router.delete('/:id', protect, allowRoles('WebsiteManager'), deletePlace);

module.exports = router;
