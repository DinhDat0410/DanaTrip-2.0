const express = require('express');
const router = express.Router();
const {
  getTours,
  getTour,
  getManagedTours,
  createTour,
  updateTour,
  deleteTour,
  getToursByPlace,
} = require('../controllers/tourController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');
const adminLogger = require('../middleware/adminLogger');

// Public
router.get('/', getTours);
router.get('/place/:placeId', getToursByPlace);
router.get('/manage/all', protect, allowRoles('WebsiteManager', 'Partner'), getManagedTours);
router.get('/:id', getTour);

// Quản trị tour
router.post('/', protect, allowRoles('WebsiteManager', 'Partner'), adminLogger('create', 'tour'), createTour);
router.put('/:id', protect, allowRoles('WebsiteManager', 'Partner'), adminLogger('update', 'tour'), updateTour);
router.delete('/:id', protect, allowRoles('WebsiteManager', 'Partner'), adminLogger('delete', 'tour'), deleteTour);

module.exports = router;
