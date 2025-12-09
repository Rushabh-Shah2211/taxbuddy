const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // I have pasted your link directly here to test it. 
        // Note: I added 'tax_saas_db' before the '?' to ensure it creates a folder.
        const conn = await mongoose.connect('mongodb+srv://rushabh:Rbshah12@taxbuddy.8bajn4g.mongodb.net/tax_saas_db?retryWrites=true&w=majority&appName=taxbuddy');

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;