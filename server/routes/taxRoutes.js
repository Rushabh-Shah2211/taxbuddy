// server/routes/taxRoutes.js
const express = require('express');
const router = express.Router();
const { calculateTax, getTaxHistory, deleteTaxRecord, aiTaxAdvisor, emailReport } = require('../controllers/taxController');
const { adminLogin, createAdmin, getAllUsers, getUserFullData } = require('../controllers/adminController');
// Public Route (Guest)
router.post('/calculate-guest', calculateTax); 

// Protected Routes (User)
// (Ideally, you should add 'protect' middleware here in the future for these)
router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.delete('/:id', deleteTaxRecord);
router.post('/ai-advisor', aiTaxAdvisor);
router.post('/email-report', emailReport);

// ADMIN ROUTES
router.post('/admin/login', adminLogin);       // Replaces the old env-var check
router.post('/admin/create', createAdmin);     // Hit this ONCE to set up your account
router.get('/admin/users', getAllUsers);
router.get('/admin/user/:userId', getUserFullData);

module.exports = router;