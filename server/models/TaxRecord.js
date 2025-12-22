// server/models/TaxRecord.js
const mongoose = require('mongoose');

const taxRecordSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    
    // Page 1: Basic Info & Entity Details
    entityType: { 
        type: String, 
        enum: ['Individual', 'HUF', 'Company', 'Firm', 'LLP', 'Trust', 'AOP', 'AJP'], 
        default: 'Individual' 
    },
    financialYear: { type: String, default: "2025-2026" },
    
    // Only relevant for Individuals
    ageGroup: { type: String, enum: ['<60', '60-80', '>80'], default: '<60' },
    residentialStatus: { type: String, enum: ['Resident', 'NRI'], default: 'Resident' },

    income: {
        // Page 2: Salary (Normally Individual only)
        salary: {
            enabled: { type: Boolean, default: false },
            detailedMode: { type: Boolean, default: false },
            
            // Taxable Amounts (Numbers)
            basic: { type: Number, default: 0 },
            hra: { type: Number, default: 0 },
            gratuity: { type: Number, default: 0 },
            leaveEncashment: { type: Number, default: 0 },
            pension: { type: Number, default: 0 },
            perquisites: { type: Number, default: 0 },
            allowances: { type: Number, default: 0 },
            
            // Raw Inputs (Object)
            details: { type: Object, default: {} } 
        },
        
        // Page 3: Business
        business: {
            enabled: { type: Boolean, default: false },
            businesses: [{
                type: { type: String, default: "Presumptive" }, // Presumptive or Regular
                name: String,
                turnover: Number,
                profit: Number,
                presumptiveRate: Number // for 44AD/ADA
            }]
        },

        // Page 4: House Property
        houseProperty: {
            enabled: { type: Boolean, default: false },
            type: { type: String, enum: ['Self Occupied', 'Rented'], default: 'Self Occupied' },
            rentReceived: { type: Number, default: 0 },
            interestPaid: { type: Number, default: 0 },
            municipalTaxes: { type: Number, default: 0 }
        },

        // Page 6: Capital Gains
        capitalGains: {
            enabled: { type: Boolean, default: false },
            shares: {
                stcg111a: { type: Number, default: 0 }, // Short Term (15%/20%)
                ltcg112a: { type: Number, default: 0 }  // Long Term (>1L 10%/12.5%)
            },
            property: {
                ltcg: { type: Number, default: 0 },     // 20% / 12.5%
                stcg: { type: Number, default: 0 }      // Slab
            },
            other: { type: Number, default: 0 }         // Slab
        },

        // Page 5: Other Income
        otherIncome: {
            enabled: { type: Boolean, default: false },
            sources: [{ name: String, amount: Number, expenses: Number }]
        }
    },

    // Page 7: Deductions
    deductions: {
        enabled: { type: Boolean, default: false },
        detailedMode: { type: Boolean, default: false },
        section80C: { type: Number, default: 0 },
        section80D: { type: Number, default: 0 },
        section80E: { type: Number, default: 0 },  // Education Loan
        section80G: { type: Number, default: 0 },  // Donations
        section80TTA: { type: Number, default: 0 }, // Savings Interest
        otherDeductions: { type: Number, default: 0 }
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