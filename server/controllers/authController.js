// server/controllers/authController.js
const User = require('../models/User');
const TaxRecord = require('../models/TaxRecord');
// const ChatRecord = require('../models/ChatRecord'); // Uncomment if model exists
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
        // ... (validation and existing user check) ...

        const user = await User.create({ name, email, password: hashedPassword });

        if (user) {
            // --- START WELCOME EMAIL BLOCK ---
            // We use 'setImmediate' or simply don't await it to prevent slowing down the response
            const welcomeMessage = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2e7d32;">Welcome to Artha!</h2>
                    <p>Hi ${user.name},</p>
                    <p>We are thrilled to have you on board. Artha is designed to make your tax planning simple, intelligent, and stress-free.</p>
                    <p><strong>What you can do now:</strong></p>
                    <ul>
                        <li>Upload your Form-16 for instant analysis.</li>
                        <li>Compare Old vs. New Regime savings.</li>
                        <li>Get AI-powered tax saving suggestions.</li>
                    </ul>
                    <p>Happy Saving,<br>The Artha Team</p>
                </div>
            `;

            sendEmail({
                email: user.email,
                subject: 'Welcome to Artha! 🚀',
                message: welcomeMessage
            }).catch(err => console.error("Welcome Email Failed:", err));
            // --- END WELCOME EMAIL BLOCK ---

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
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

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Hash token and save to DB
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

        await user.save();

        // Create Reset URL
        // Ensure this matches your frontend URL structure
        const resetUrl = `https://taxbuddy-delta.vercel.app/reset-password/${resetToken}`;

        // Create Styled HTML Message
        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #2e7d32; text-align: center;">Artha Password Reset</h2>
                <p>Hi ${user.name},</p>
                <p>You requested a password reset. Please click the button below to set a new password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #555;">
                    <a href="${resetUrl}">${resetUrl}</a>
                </p>
                
                <p style="font-size: 13px; color: #777;">This link expires in 10 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 11px; color: #999; text-align: center;">
                    If you did not request this email, you can safely ignore it.
                </p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Artha Password Reset Request', // Clear subject line
                message: message
            });

            res.json({ success: true, data: "Reset link sent to email" });
        } catch (error) {
            console.error("Forgot Password Email Error:", error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent. Please try again later." });
        }
    } catch (error) {
        console.error("Forgot Password System Error:", error);
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

        if (!user) return res.status(400).json({ message: "Invalid or Expired Token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        res.json({ success: true, message: "Password Updated Successfully" });
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
            // if (ChatRecord) await ChatRecord.deleteMany({ user: user._id }); // Uncomment when model exists

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
    deleteUser 
};