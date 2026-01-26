const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure Multer (Memory Storage for PDF parsing)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Import Tax Controllers
const { 
    calculateTax, 
    getTaxHistory, 
    deleteTaxRecord, 
    aiTaxAdvisor, 
    emailReport,
    parseForm16Data 
} = require('../controllers/taxController');

// Import Admin Controllers
const { 
    adminLogin, 
    createAdmin, 
    getAllUsers, 
    getUserFullData,
    forceResetAdmin,
    getAdminStats
} = require('../controllers/adminController');

// ==========================
//      TAX ROUTES
// ==========================

// Public Route (Guest Calculation)
router.post('/calculate-guest', calculateTax); 

// AI Advisor
router.post('/ai-advisor', aiTaxAdvisor);

// Protected Routes (Ideally add auth middleware here)
router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.delete('/:id', deleteTaxRecord);
router.post('/email-report', emailReport);

// Form-16 Parsing (Note: 'pdfFile' key must match frontend)
router.post('/parse-form16', upload.single('pdfFile'), parseForm16Data);

// ==========================
//      ADMIN ROUTES
// ==========================

// 1. Dashboard Stats
router.get('/admin/stats', getAdminStats);

// 2. Authentication
router.post('/admin/login', adminLogin);
router.post('/admin/create', createAdmin);

// 3. User Management
router.get('/admin/users', getAllUsers);
router.get('/admin/user/:userId', getUserFullData);

// 4. Emergency Password Reset
router.post('/admin/force-reset', forceResetAdmin);

module.exports = router;