// server/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const taxRoutes = require('./routes/taxRoutes');
const authRoutes = require('./routes/authRoutes'); 

dotenv.config();
connectDB();

// --- FIX: Create 'app' BEFORE using it ---
const app = express(); 

// Middleware
app.use(express.json());
app.use(cors());

// Mount Routes (These must come AFTER 'const app = express()')
app.use('/api/auth', authRoutes); // Login/Register routes
app.use('/api/tax', taxRoutes);   // Tax Calculation routes

// Basic Test Route
app.get('/', (req, res) => {
    res.send('Tax SaaS API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});