// server/models/ChatRecord.js
const mongoose = require('mongoose');

const chatRecordSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatRecord', chatRecordSchema);