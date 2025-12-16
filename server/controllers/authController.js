const User = require('../models/User');
const TaxRecord = require('../models/TaxRecord');
const ChatRecord = require('../models/ChatRecord'); // If you have this model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc Register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Please add all fields' });

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword });

        if (user) {
            res.status(201).json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user.id) });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update Profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.body._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }
            const updatedUser = await user.save();
            res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, token: generateToken(updatedUser._id) });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Email not found" });

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const resetUrl = `https://taxbuddy-delta.vercel.app/reset-password/${resetToken}`;
        const message = `
            <h1>Password Reset Request</h1>
            <p>Click below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Artha Password Reset',
                message
            });
            res.json({ success: true, data: "Email sent" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Email send failed" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Reset Password
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid Token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        res.json({ success: true, message: "Password Updated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Delete User & All Data (GDPR Right to Erasure)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id); // req.user set by auth middleware

        if (user) {
            // 1. Delete all Tax Records
            await TaxRecord.deleteMany({ user: user._id });
            
            // 2. Delete all Chat Records
            if (ChatRecord) await ChatRecord.deleteMany({ user: user._id });

            // 3. Delete User
            await User.findByIdAndDelete(user._id);

            res.json({ message: 'User account and all data deleted successfully.' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    updateProfile, 
    forgotPassword, 
    resetPassword, 
    deleteUser // <--- Export this
};