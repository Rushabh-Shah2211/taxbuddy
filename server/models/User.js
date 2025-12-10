// server/models/User.js
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // NEW FIELDS FOR RESET PASSWORD
    resetPasswordToken: String,
    resetPasswordExpire: Date

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);