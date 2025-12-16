// server/index.js
const express = require('express');
const dotenv = require('dotenv'); // 1. Load the tool
const cors = require('cors');

// 2. CONFIG MUST BE HERE (Top of the file)
dotenv.config(); 

// 3. NOW it is safe to import files that use the keys
const connectDB = require('./config/db');
const taxRoutes = require('./routes/taxRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

// 4. Connect to Database
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// 5. Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes); 

app.get('/', (req, res) => {
    res.send('Tax SaaS API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});