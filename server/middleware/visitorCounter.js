const Visitor = require('../models/Visitor');

const trackVisitor = async (req, res, next) => {
    try {
        // Find the counter, or create it if it doesn't exist
        const visitorRecord = await Visitor.findOneAndUpdate(
            { counterId: 'global-visitor-count' },
            { $inc: { count: 1 } }, // Increment by 1
            { new: true, upsert: true } // Return updated doc, create if missing
        );
        console.log(`👀 New Visitor! Total: ${visitorRecord.count}`);
    } catch (error) {
        console.error("Visitor Tracking Error:", error);
        // Don't block the request if tracking fails
    }
    next();
};

module.exports = trackVisitor;