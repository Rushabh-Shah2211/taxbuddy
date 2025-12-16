// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { adminLogin, getAllUsers, getUserFullData, saveChatInteraction } = require('../controllers/adminController');

router.post('/login', adminLogin);
router.get('/users', getAllUsers);
router.get('/user-data/:userId', getUserFullData);
router.post('/save-chat', saveChatInteraction); // Used by chatbot

module.exports = router;