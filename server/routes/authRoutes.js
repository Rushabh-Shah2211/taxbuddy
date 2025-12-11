// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;