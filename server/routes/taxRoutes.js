const express = require('express');
const router = express.Router();
const multer = require('multer');
const { forceResetAdmin } = require('../controllers/adminController');
const { getAdminStats } = require('../controllers/adminController');


// ==========================================
//   MULTER CONFIG (File Upload Middleware)
// ==========================================
// We use memoryStorage to keep the file in RAM for quick parsing
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ==========================================
//   IMPORT CONTROLLERS
// ==========================================
const { 
    calculateTax, 
    getTaxHistory, 
    deleteTaxRecord, 
    aiTaxAdvisor, 
    emailReport,
    parseForm16Data // New Parser Controller
} = require('../controllers/taxController');

const { 
    adminLogin, 
    createAdmin, 
    getAllUsers, 
    getUserFullData
    forceResetAdmin, // <--- Must allow import
    getAdminStats    // <--- Must allow import
} = require('../controllers/adminController');

// ==========================================
//   TAX & USER ROUTES
// ==========================================

// Public Route (Guest Calculation)
router.post('/calculate-guest', calculateTax); 

// AI Advisor
router.post('/ai-advisor', aiTaxAdvisor);

// Protected Routes (Logged in Users)
// Note: In a production app, add 'protect' middleware here
router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.delete('/:id', deleteTaxRecord);
router.post('/email-report', emailReport);

// ==========================================
//   NEW: FORM-16 OCR ROUTE
// ==========================================
// Accepts a single file with key 'pdfFile'
router.post('/parse-form16', upload.single('pdfFile'), parseForm16Data);

// ==========================================
//   ADMIN ROUTES
// ==========================================
router.post('/admin/login', adminLogin);       // Database-based Admin Login
router.post('/admin/create', createAdmin);     // Setup Route (Run once to create admin)
router.post('/admin/force-reset', forceResetAdmin);
router.get('/admin/users', getAllUsers);       // Fetch all users
router.get('/admin/user/:userId', getUserFullData); // Fetch specific user history
router.get('/admin/stats', getAdminStats);

module.exports = router;