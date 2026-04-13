const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');
const {
  getUsers,
  getPartnerOptions,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

router.get('/partner-options', protect, allowRoles('Admin', 'WebsiteManager'), getPartnerOptions);
router.route('/').get(protect, allowRoles('Admin'), getUsers).post(protect, allowRoles('Admin'), createUser);
router.route('/:id')
  .get(protect, allowRoles('Admin'), getUser)
  .put(protect, allowRoles('Admin'), updateUser)
  .delete(protect, allowRoles('Admin'), deleteUser);

module.exports = router;
