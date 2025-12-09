// server/models/TaxRecord.js
const mongoose = require('mongoose');

const taxRecordSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    financialYear: { type: String, default: "2024-2025" },
    
    // Updated structure to match Frontend Payload
    income: {
        salary: {
            basic: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            specialAllowance: { type: Number, default: 0 },
            bonus: { type: Number, default: 0 },
            pension: { type: Number, default: 0 },
            arrears: { type: Number, default: 0 },
            gratuity: { type: Number, default: 0 },
            otherAllowances: { type: Number, default: 0 }
        },
        otherSources: {
            type: Map, // Allows flexible fields (interest, dividend, etc.)
            of: Number
        },
        capitalGains: {
            stcg: { type: Number, default: 0 },
            ltcg: { type: Number, default: 0 }
        }
    },

    deductions: {
        section80C: { type: Number, default: 0 },
        section80D: { type: Number, default: 0 },
        section80CCD1B: { type: Number, default: 0 },
        section80G: { type: Number, default: 0 },
        standardDeduction: { type: Number, default: 50000 }
    },

    computedTax: {
        oldRegimeTax: { type: Number, default: 0 },
        newRegimeTax: { type: Number, default: 0 },
        taxPayable: { type: Number, default: 0 },
        regimeSelected: { type: String, default: 'New' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TaxRecord', taxRecordSchema);