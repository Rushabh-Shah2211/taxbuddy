const express = require('express');
const router = express.Router();
const { calculateTax, getTaxHistory, deleteTaxRecord, aiTaxAdvisor } = require('../controllers/taxController');

router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.delete('/:id', deleteTaxRecord);
router.post('/ai-advisor', aiTaxAdvisor); // Crucial for your Chatbot

module.exports = router;