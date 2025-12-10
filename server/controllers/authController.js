// server/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node module
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User'); // Ensure this is imported

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, entityType } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            entityType
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id), // Send the digital key
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        // Check password
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                entityType: user.entityType,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc Update User Profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.body._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                // Password encryption is handled by the User model pre-save hook usually, 
                // but since we hashed manually in register, we do it here too:
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                token: generateToken(updatedUser._id), // Send new token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        // 1. Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // 2. Hash it and save to DB (Security best practice)
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes valid

        await user.save();

        // 3. Create Reset URL (Points to your Frontend)
        // Note: Change localhost to your Vercel link when deploying
        const resetUrl = `https://taxbuddy-delta.vercel.app/reset-password/${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset for Artha by RB.</p>
            <p>Click the link below to verify your identity:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Artha Password Reset Token',
                message
            });

            res.json({ success: true, data: "Email sent" });
        } catch (error) {
            // If email fails, clear the token field
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password (Set New Password)
// @route   PUT /api/auth/reset-password/:resetToken
const resetPassword = async (req, res) => {
    try {
        // 1. Hash the token from URL to compare with DB
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

        // 2. Find user with this token AND check if time hasn't expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or Expired Token" });
        }

        // 3. Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        
        // 4. Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ success: true, message: "Password Updated Successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Don't forget to export them!
module.exports = { registerUser, loginUser, updateProfile, forgotPassword, resetPassword };