const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');

router.get('/overview', protect, allowRoles('WebsiteManager', 'Partner'), getDashboardOverview);

module.exports = router;
