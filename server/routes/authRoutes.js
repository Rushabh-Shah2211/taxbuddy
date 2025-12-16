const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // You need a middleware to verify token
const { registerUser, loginUser, updateProfile, forgotPassword, resetPassword, deleteUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateProfile); // Protect this
router.delete('/profile', protect, deleteUser); // New Delete Route
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;