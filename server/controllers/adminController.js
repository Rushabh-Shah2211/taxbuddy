// server/controllers/adminController.js
const User = require('../models/User');
const TaxRecord = require('../models/TaxRecord');
const ChatRecord = require('../models/ChatRecord');

// 1. Admin Login (Simple Hardcoded Check)
const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        // Return a simple "admin-token" string for frontend to store
        res.json({ token: 'admin-secret-token', email: email });
    } else {
        res.status(401).json({ message: "Invalid Admin Credentials" });
    }
};

// 2. Get All Users
const getAllUsers = async (req, res) => {
    try {
        // Fetch all users but exclude passwords
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Get Specific User Data (Tax + Chat History)
const getUserFullData = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Fetch Tax History
        const taxHistory = await TaxRecord.find({ user: userId }).sort({ createdAt: -1 });
        
        // Fetch Chat History
        const chatHistory = await ChatRecord.find({ user: userId }).sort({ timestamp: -1 });

        res.json({ taxHistory, chatHistory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Save Chat (Called by the User's Frontend)
const saveChatInteraction = async (req, res) => {
    try {
        const { userId, question, answer } = req.body;
        if (userId) {
            await ChatRecord.create({ user: userId, question, answer });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to save chat" });
    }
};

module.exports = { adminLogin, getAllUsers, getUserFullData, saveChatInteraction };