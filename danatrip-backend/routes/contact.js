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
const { adminOnly } = require('../middleware/admin');

// Public (không cần đăng nhập)
router.post('/', createContact);

// Admin
router.get('/', protect, adminOnly, getAllContacts);
router.get('/:id', protect, adminOnly, getContact);
router.put('/:id', protect, adminOnly, updateContact);
router.delete('/:id', protect, adminOnly, deleteContact);

module.exports = router;