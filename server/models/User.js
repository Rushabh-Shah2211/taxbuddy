// server/models/User.js
const mongoose = require('mongoose');

// This defines what a "User" looks like in our database
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // We will encrypt this later
    entityType: { 
        type: String, 
        required: true, 
        enum: ['Individual', 'HUF', 'Company'], // Restricts input to these 3
        default: 'Individual'
    }, 
    dob: { type: Date }, // Date of Birth / Incorporation
}, {
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt' times
});

module.exports = mongoose.model('User', userSchema);