const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // 👇 THIS IS CRITICAL. WITHOUT THIS, ADMIN LOGIN FAILS.
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
    
    resetPasswordToken: String,
    resetPasswordExpire: Date

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);