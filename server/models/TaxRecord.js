// server/models/TaxRecord.js
const mongoose = require('mongoose');

const taxRecordSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    
    // Page 1: Basic Info
    financialYear: { type: String, default: "2025-2026" },
    ageGroup: { type: String, enum: ['<60', '60-80', '>80'], default: '<60' },
    residentialStatus: { type: String, enum: ['Resident', 'NRI'], default: 'Resident' },

    income: {
        // Page 2: Salary
        salary: {
            enabled: { type: Boolean, default: false },
            detailedMode: { type: Boolean, default: false },
            
            // These fields will now store ONLY the TAXABLE (Computed) Amount
            // This prevents the "Cast to Number failed" error
            basic: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            gratuity: { type: Number, default: 0 },
            leaveEncashment: { type: Number, default: 0 },
            pension: { type: Number, default: 0 },
            perquisites: { type: Number, default: 0 },
            allowances: { type: Number, default: 0 },
            
            // [NEW FIELD] Stores the raw complex inputs (for editing later)
            details: { type: Object, default: {} } 
        },
        // Page 3: Business
        business: {
            enabled: { type: Boolean, default: false },
            turnover: { type: Number, default: 0 },
            profit: { type: Number, default: 0 },
            is44AD: { type: Boolean, default: false },
            is44ADA: { type: Boolean, default: false },
            presumptiveRate: { type: Number, default: 6 }
        },
        // Page 4: House Property
        houseProperty: {
            enabled: { type: Boolean, default: false },
            type: { type: String, enum: ['Self Occupied', 'Rented'], default: 'Self Occupied' },
            rentReceived: { type: Number, default: 0 },
            interestPaid: { type: Number, default: 0 },
            municipalTaxes: { type: Number, default: 0 }
        },
        // Page 5: Other Income
        otherIncome: {
            enabled: { type: Boolean, default: false },
            sources: [{
                name: String,
                amount: Number,
                expenses: Number
            }]
        }
    },

    // Page 8: Taxes Paid
    taxesPaid: {
        tds: { type: Number, default: 0 },
        advanceTax: { type: Number, default: 0 },
        selfAssessment: { type: Number, default: 0 }
    },

    // Results
    computedTax: {
        oldRegimeTax: Number,
        newRegimeTax: Number,
        taxPayable: Number,
        netTaxPayable: Number,
        regimeSelected: String,
        suggestions: [String]
    },
    grossTotalIncome: Number
}, { timestamps: true });

module.exports = mongoose.model('TaxRecord', taxRecordSchema);