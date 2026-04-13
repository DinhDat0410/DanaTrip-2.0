const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getMySessions,
  deleteChatHistory,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { allowRoles } = require('../middleware/admin');

// Public (chat không cần đăng nhập)
router.post('/', sendMessage);
router.get('/:sessionId', getChatHistory);

// User (cần đăng nhập)
router.get('/user/sessions', protect, getMySessions);

// Admin
router.delete('/:sessionId', protect, allowRoles('WebsiteManager'), deleteChatHistory);

module.exports = router;
