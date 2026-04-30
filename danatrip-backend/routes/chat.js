const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getMySessions,
  getAllSessions,
  deleteChatHistory,
} = require('../controllers/chatController');
const { protect, optionalAuth } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');

// Public (chat không cần đăng nhập)
router.post('/', optionalAuth, sendMessage);

// User (cần đăng nhập)
router.get('/user/sessions', protect, getMySessions);

// Admin
router.get('/admin/sessions', protect, allowRoles('WebsiteManager'), getAllSessions);
router.delete('/:sessionId', protect, allowRoles('WebsiteManager'), deleteChatHistory);

// Public (đặt sau route user/admin để không bị nhầm sessionId)
router.get('/:sessionId', getChatHistory);

module.exports = router;
