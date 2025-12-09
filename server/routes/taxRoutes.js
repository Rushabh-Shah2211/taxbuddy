// server/routes/taxRoutes.js
const express = require('express');
const router = express.Router();
const { calculateTax, getTaxHistory } = require('../controllers/taxController');

router.post('/calculate', calculateTax);
router.get('/history', getTaxHistory);

module.exports = router;