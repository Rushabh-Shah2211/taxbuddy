// server/routes/taxRoutes.js
const express = require('express');
const router = express.Router();
const { calculateTax, getTaxHistory, deleteTaxRecord, aiTaxAdvisor, emailReport } = require('../controllers/taxController');

// Public Route (Guest)
router.post('/calculate-guest', calculateTax); 

// Protected Routes (User)
// (Ideally, you should add 'protect' middleware here in the future for these)
router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.delete('/:id', deleteTaxRecord);
router.post('/ai-advisor', aiTaxAdvisor);
router.post('/email-report', emailReport);

module.exports = router;