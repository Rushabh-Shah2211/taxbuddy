// server/models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // NEW: Add Role to distinguish Admin vs User
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
    
    resetPasswordToken: String,
    resetPasswordExpire: Date

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);