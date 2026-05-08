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
const adminLogger = require('../middleware/adminLogger');

// Public routes
router.get('/', getPlaces);
router.get('/:id', getPlace);

// Admin routes
router.post('/', protect, allowRoles('WebsiteManager'), adminLogger('create', 'place'), createPlace);
router.put('/:id', protect, allowRoles('WebsiteManager'), adminLogger('update', 'place'), updatePlace);
router.delete('/:id', protect, allowRoles('WebsiteManager'), adminLogger('delete', 'place'), deletePlace);

module.exports = router;
