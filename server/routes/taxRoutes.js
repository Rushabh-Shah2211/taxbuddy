const express = require('express');
const router = express.Router();
const { calculateTax, getTaxHistory, updateTaxRecord } = require('../controllers/taxController');

router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);
router.put('/:id', updateTaxRecord); // <--- NEW EDIT ROUTE

module.exports = router;