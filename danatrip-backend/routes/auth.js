const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  socialLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  requestEmailChange,
  confirmEmailChange,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/social-login', socialLogin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/request-email-change', protect, requestEmailChange);
router.put('/confirm-email-change', protect, confirmEmailChange);

module.exports = router;
