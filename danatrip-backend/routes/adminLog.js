const express = require('express');
const router = express.Router();
const { getAdminLogs } = require('../controllers/adminLogController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');

router.get('/', protect, allowRoles('Admin'), getAdminLogs);

module.exports = router;
