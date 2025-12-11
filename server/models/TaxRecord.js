// server/models/TaxRecord.js
const mongoose = require('mongoose');

const taxRecordSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    userCategory: { type: String, default: 'Salaried' },
    financialYear: { type: String, default: "2024-2025" },
    
    income: {
        salary: {
            basic: Number, hra: Number, specialAllowance: Number, bonus: Number
        },
        houseProperty: { type: Number, default: 0 }, // New: Rental Income or Loss
        capitalGains: {
            stcg: { type: Number, default: 0 }, // Short Term
            ltcg: { type: Number, default: 0 }  // Long Term
        },
        otherSources: {
            businessProfit: Number,
            grossReceipts: Number,
            interestIncome: { type: Number, default: 0 }, // New: Savings/FD Interest
            otherIncome: { type: Number, default: 0 }
        }
    },
    deductions: {
        section80C: Number, section80D: Number
    },
    computedTax: {
        oldRegimeTax: Number, newRegimeTax: Number, taxPayable: Number, regimeSelected: String
    }
}, { timestamps: true });

module.exports = mongoose.model('TaxRecord', taxRecordSchema);