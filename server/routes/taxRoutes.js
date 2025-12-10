const express = require('express');
const router = express.Router();
const { calculateTax, getTaxHistory, deleteTaxRecord } = require('../controllers/taxController');

router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.delete('/:id', deleteTaxRecord); // <--- NEW DELETE ROUTE

module.exports = router;