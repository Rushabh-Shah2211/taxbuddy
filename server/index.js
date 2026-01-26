// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const taxRoutes = require('./routes/taxRoutes');
const trackVisitor = require('./middleware/visitorCounter');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

// 1. INITIALIZE APP FIRST
const app = express();

// 2. CONFIGURE CORE MIDDLEWARE
// Increase payload limit for PDF uploads
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use(cors());

// 3. APPLY CUSTOM MIDDLEWARE (Visitor Tracking)
// Now 'app' exists, so this will work
app.use(trackVisitor);

// 4. DEFINE ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);

// Base Route
app.get('/', (req, res) => {
    res.send('Artha API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));