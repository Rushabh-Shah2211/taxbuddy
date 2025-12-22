// server/controllers/adminController.js
const User = require('../models/User');
const TaxRecord = require('../models/TaxRecord');
const ChatRecord = require('../models/ChatRecord'); // Assuming this exists
const bcrypt = require('bcryptjs');


// 1. Admin Login (Database Check)
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });

        // Check if User exists AND is Admin AND Password matches
        if (user && (user.role === 'admin') && (await bcrypt.compare(password, user.password))) {
            // Return the same token structure your frontend expects
            res.json({ token: 'admin-secret-token', email: user.email, name: user.name });
        } else {
            res.status(401).json({ message: "Invalid Admin Credentials or Access Denied" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// NEW: One-time setup to create an Admin user in DB
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        let user = await User.findOne({ email });
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (user) {
            // OPTION 1: User exists -> Upgrade them to Admin
            user.password = hashedPassword;
            user.role = 'admin';
            user.name = name || user.name; // Update name if provided
            await user.save();
            return res.status(200).json({ message: "Existing User Upgraded to Admin", user });
        } else {
            // OPTION 2: New User -> Create as Admin
            user = await User.create({
                name, 
                email, 
                password: hashedPassword,
                role: 'admin'
            });
            return res.status(201).json({ message: "Admin Created Successfully", user });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... (Keep getAllUsers, getUserFullData, saveChatInteraction as they were) ...
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getUserFullData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const taxHistory = await TaxRecord.find({ user: userId }).sort({ createdAt: -1 });
        const chatHistory = await ChatRecord.find({ user: userId }).sort({ timestamp: -1 }); // Optional
        res.json({ taxHistory, chatHistory });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const saveChatInteraction = async (req, res) => {
    try {
        const { userId, question, answer } = req.body;
        if (userId) {
            // await ChatRecord.create({ user: userId, question, answer }); // Uncomment when model exists
        }
        res.json({ success: true });
    } catch (error) { res.status(500).json({ message: "Failed to save chat" }); }
};

module.exports = { adminLogin, createAdmin, getAllUsers, getUserFullData, saveChatInteraction };