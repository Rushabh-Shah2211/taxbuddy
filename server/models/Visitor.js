const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    counterId: { type: String, required: true, unique: true }, // Fixed ID to keep 1 record
    count: { type: Number, default: 0 }
});

module.exports = mongoose.model('Visitor', visitorSchema);