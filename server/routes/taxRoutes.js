const express = require('express');
const router = express.Router();
const { calculateTax, getTaxHistory, deleteTaxRecord, aiTaxAdvisor, emailReport } = require('../controllers/taxController');

router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.delete('/:id', deleteTaxRecord);
router.post('/ai-advisor', aiTaxAdvisor);
router.post('/email-report', emailReport); // New Email Route

module.exports = router;