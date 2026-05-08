const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');
const adminLogger = require('../middleware/adminLogger');

// Public (không cần đăng nhập)
router.post('/', createContact);

// Admin
router.get('/', protect, allowRoles('WebsiteManager'), getAllContacts);
router.get('/:id', protect, allowRoles('WebsiteManager'), getContact);
router.put('/:id', protect, allowRoles('WebsiteManager'), adminLogger('status_change', 'contact'), updateContact);
router.delete('/:id', protect, allowRoles('WebsiteManager'), adminLogger('delete', 'contact'), deleteContact);

module.exports = router;
