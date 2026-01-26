// server/controllers/adminController.js
const User = require('../models/User');
const TaxRecord = require('../models/TaxRecord');
// const ChatRecord = require('../models/ChatRecord'); // Uncomment if you have this model
const Visitor = require('../models/Visitor'); // Ensure this model exists
const bcrypt = require('bcryptjs');

// 1. Admin Login (Database Check)
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (user.role === 'admin') && (await bcrypt.compare(password, user.password))) {
            res.json({ token: 'admin-secret-token', email: user.email, name: user.name });
        } else {
            res.status(401).json({ message: "Invalid Admin Credentials or Access Denied" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Create Admin (Setup)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (user) {
            user.password = hashedPassword;
            user.role = 'admin';
            user.name = name || user.name;
            await user.save();
            return res.status(200).json({ message: "Existing User Upgraded to Admin", user });
        } else {
            user = await User.create({ name, email, password: hashedPassword, role: 'admin' });
            return res.status(201).json({ message: "Admin Created Successfully", user });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 4. Get User Data
const getUserFullData = async (req, res) => {
    try {
        const userId = req.params.userId;
        const taxHistory = await TaxRecord.find({ user: userId }).sort({ createdAt: -1 });
        // const chatHistory = await ChatRecord.find({ user: userId }); // Uncomment if needed
        res.json({ taxHistory }); // Add chatHistory here if needed
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 5. Emergency Reset (Task 1)
const forceResetAdmin = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "Admin User Not Found" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.role = 'admin';
        
        await user.save();
        res.json({ message: `Success! Password for ${email} reset.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Get Stats (Task 2)
const getAdminStats = async (req, res) => {
    try {
        // Safe check in case Visitor model isn't created yet
        let visitors = 0;
        try {
            const vRecord = await Visitor.findOne({ counterId: 'global-visitor-count' });
            visitors = vRecord ? vRecord.count : 0;
        } catch (err) { console.log("Visitor model not ready yet"); }

        const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
        
        res.json({
            totalVisitors: visitors,
            totalUsers: userCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- CRITICAL STEP: EXPORT ALL FUNCTIONS ---
module.exports = { 
    adminLogin, 
    createAdmin, 
    getAllUsers, 
    getUserFullData, 
    forceResetAdmin, // <-- Ensure this is here
    getAdminStats    // <-- Ensure this is here
};