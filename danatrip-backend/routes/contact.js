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

// Public (không cần đăng nhập)
router.post('/', createContact);

// Admin
router.get('/', protect, allowRoles('WebsiteManager'), getAllContacts);
router.get('/:id', protect, allowRoles('WebsiteManager'), getContact);
router.put('/:id', protect, allowRoles('WebsiteManager'), updateContact);
router.delete('/:id', protect, allowRoles('WebsiteManager'), deleteContact);

module.exports = router;
