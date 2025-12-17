// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Assuming you have this
const authRoutes = require('./routes/authRoutes');
const taxRoutes = require('./routes/taxRoutes');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- CRITICAL FIX: INCREASE PAYLOAD LIMIT ---
// This allows large files (like PDFs) to be sent in the request body
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use(cors());

// Routes
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