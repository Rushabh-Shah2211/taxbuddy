const TaxRecord = require('../models/TaxRecord');

// --- HELPER 1: Calculate Tax on Slabs ---
const calculateSlabTax = (taxableIncome, regime, financialYear, ageGroup) => {
    let tax = 0;
    let income = Math.max(0, Number(taxableIncome));

    // --- OLD REGIME (Unchanged) [cite: 57] ---
    if (regime === 'Old') {
        // Basic Exemption Limit based on Age
        let exemptionLimit = 250000; // < 60
        if (ageGroup === '60-80') exemptionLimit = 300000; // Senior [cite: 57]
        if (ageGroup === '>80') exemptionLimit = 500000; // Super Senior [cite: 60]

        if (income > 1000000) {
            tax += (income - 1000000) * 0.30;
            tax += (1000000 - 500000) * 0.20;
            tax += (500000 - exemptionLimit) * 0.05;
        } else if (income > 500000) {
            tax += (income - 500000) * 0.20;
            tax += (500000 - exemptionLimit) * 0.05;
        } else if (income > exemptionLimit) {
            tax += (income - exemptionLimit) * 0.05;
        }
    } 
    // --- NEW REGIME ---
    else {
        // SLABS FOR FY 2025-26 (AY 2026-27) 
        // 0-4L: Nil | 4-8L: 5% | 8-12L: 10% | 12-16L: 15% | 16-20L: 20% | 20-24L: 25% | >24L: 30%
        if (financialYear === '2025-2026') {
            if (income > 2400000) {
                tax += (income - 2400000) * 0.30 + 400000*0.25 + 400000*0.20 + 400000*0.15 + 400000*0.10 + 400000*0.05;
            } else if (income > 2000000) {
                tax += (income - 2000000) * 0.25 + 400000*0.20 + 400000*0.15 + 400000*0.10 + 400000*0.05;
            } else if (income > 1600000) {
                tax += (income - 1600000) * 0.20 + 400000*0.15 + 400000*0.10 + 400000*0.05;
            } else if (income > 1200000) {
                tax += (income - 1200000) * 0.15 + 400000*0.10 + 400000*0.05;
            } else if (income > 800000) {
                tax += (income - 800000) * 0.10 + 400000*0.05;
            } else if (income > 400000) {
                tax += (income - 400000) * 0.05;
            }
        } 
        // SLABS FOR FY 2024-25 (AY 2025-26) 
        // 0-3L: Nil | 3-7L: 5% | 7-10L: 10% | 10-12L: 15% | 12-15L: 20% | >15L: 30%
        else {
            if (income > 1500000) {
                tax += (income - 1500000) * 0.30 + 300000*0.20 + 200000*0.15 + 300000*0.10 + 400000*0.05;
            } else if (income > 1200000) {
                tax += (income - 1200000) * 0.20 + 200000*0.15 + 300000*0.10 + 400000*0.05;
            } else if (income > 1000000) {
                tax += (income - 1000000) * 0.15 + 300000*0.10 + 400000*0.05;
            } else if (income > 700000) {
                tax += (income - 700000) * 0.10 + 400000*0.05;
            } else if (income > 300000) {
                tax += (income - 300000) * 0.05;
            }
        }
    }
    return tax;
};

// --- HELPER 2: Surcharge & Marginal Relief ---
const calculateSurcharge = (tax, taxableIncome, regime) => {
    let surchargeRate = 0;
    
    // Surcharge Rates [cite: 211, 524]
    // > 50L: 10% | > 1Cr: 15% | > 2Cr: 25% | > 5Cr: 37% (Old only)
    
    if (taxableIncome > 50000000) { // > 5 Cr
        surchargeRate = regime === 'Old' ? 0.37 : 0.25; // New Regime capped at 25% [cite: 211]
    } else if (taxableIncome > 20000000) { // > 2 Cr
        surchargeRate = 0.25;
    } else if (taxableIncome > 10000000) { // > 1 Cr
        surchargeRate = 0.15;
    } else if (taxableIncome > 5000000) { // > 50 Lakhs
        surchargeRate = 0.10;
    }

    let surcharge = tax * surchargeRate;
    
    // Note: Full Marginal Relief logic requires iterative checks. 
    // This is a simplified implementation.
    
    return surcharge;
};

// --- HELPER 3: 87A Rebate ---
const calculateRebate = (tax, taxableIncome, regime, financialYear) => {
    if (regime === 'New') {
        // FY 25-26: Rebate up to ₹60k if income <= 12L [cite: 187, 223]
        if (financialYear === '2025-2026' && taxableIncome <= 1200000) {
            return Math.min(tax, 60000); 
        }
        // FY 24-25: Rebate up to ₹25k if income <= 7L [cite: 186, 564]
        if (financialYear !== '2025-2026' && taxableIncome <= 700000) {
            return Math.min(tax, 25000);
        }
    } else {
        // Old Regime: Rebate ₹12,500 if income <= 5L [cite: 231, 564]
        if (taxableIncome <= 500000) {
            return Math.min(tax, 12500);
        }
    }
    return 0;
};

// --- MAIN CONTROLLER ---
const calculateTax = async (req, res) => {
    try {
        const { userId, financialYear, ageGroup, residentialStatus, income, taxesPaid } = req.body;

        // 1. Calculate Gross Total Income
        let salaryIncome = 0;
        // Std Deduction: ₹75k for FY 25-26 & 24-25 New Regime (as per latest interim budget trends, mostly 75k)
        // Document [cite: 31, 172] confirms 75k for FY 25-26. 
        // For FY 24-25, standard deduction was 50k in Old, 75k proposed/updated. 
        // Let's stick to 75k for New Regime in both for simplicity or specific logic:
        let stdDeduction = (financialYear === '2025-2026') ? 75000 : 50000; 
        if (financialYear === '2024-2025') stdDeduction = 75000; // Updated per interim budget

        if (income.salary?.enabled) {
            const s = income.salary;
            salaryIncome = (Number(s.basic)||0) + (Number(s.hra)||0) + (Number(s.gratuity)||0) + 
                           (Number(s.pension)||0) + (Number(s.prevSalary)||0) + (Number(s.allowances)||0);
        }

        let businessIncome = 0;
        if (income.business?.enabled) {
            const b = income.business;
            if (b.is44AD || b.is44ADA) {
                businessIncome = (Number(b.turnover) * (Number(b.presumptiveRate)||6)) / 100;
            } else {
                businessIncome = Number(b.profit);
            }
        }

        let hpIncome = 0;
        if (income.houseProperty?.enabled) {
            const h = income.houseProperty;
            const interest = Number(h.interestPaid) || 0;
            if (h.type === 'Self Occupied') {
                hpIncome = 0 - interest; 
            } else {
                const nav = (Number(h.rentReceived)||0) - (Number(h.municipalTaxes)||0);
                hpIncome = nav - (nav * 0.30) - interest;
            }
        }

        let otherSrcIncome = 0;
        if (income.otherIncome?.enabled && income.otherIncome.sources) {
            income.otherIncome.sources.forEach(src => otherSrcIncome += (Number(src.amount)||0));
        }

        const grossTotal = salaryIncome + businessIncome + hpIncome + otherSrcIncome;

        // 2. Regime-Specific Net Income & Tax
        
        // --- OLD REGIME CALCULATION ---
        let oldRegimeDeductions = (income.salary?.enabled ? 50000 : 0); // Old Regime Std Ded is 50k [cite: 97]
        
        // HP Loss Cap (2L)
        let oldHpAdj = hpIncome < -200000 ? -200000 : hpIncome;
        let oldNetIncome = Math.max(0, salaryIncome + businessIncome + oldHpAdj + otherSrcIncome - oldRegimeDeductions);
        
        let taxOld = calculateSlabTax(oldNetIncome, 'Old', financialYear, ageGroup);
        let rebateOld = calculateRebate(taxOld, oldNetIncome, 'Old', financialYear);
        taxOld = Math.max(0, taxOld - rebateOld);
        let surchargeOld = calculateSurcharge(taxOld, oldNetIncome, 'Old');
        taxOld = (taxOld + surchargeOld) * 1.04; // Cess

        // --- NEW REGIME CALCULATION ---
        let newRegimeDeductions = (income.salary?.enabled ? 75000 : 0); // New Regime Std Ded is 75k [cite: 31, 97]
        
        // HP Loss on Self-Occupied NOT allowed in New Regime
        let newHpAdj = (income.houseProperty?.type === 'Self Occupied') ? 0 : hpIncome;
        let newNetIncome = Math.max(0, salaryIncome + businessIncome + newHpAdj + otherSrcIncome - newRegimeDeductions);

        let taxNew = calculateSlabTax(newNetIncome, 'New', financialYear, ageGroup);
        let rebateNew = calculateRebate(taxNew, newNetIncome, 'New', financialYear);
        taxNew = Math.max(0, taxNew - rebateNew);
        let surchargeNew = calculateSurcharge(taxNew, newNetIncome, 'New');
        taxNew = (taxNew + surchargeNew) * 1.04; // Cess

        // 3. Final Comparison
        let finalTax = Math.min(taxOld, taxNew);
        let recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // 4. Net Payable
        const totalPaid = (Number(taxesPaid?.tds)||0) + (Number(taxesPaid?.advanceTax)||0) + (Number(taxesPaid?.selfAssessment)||0);
        const netPayable = Math.max(0, finalTax - totalPaid);

        // 5. Advance Tax Schedule
        let advanceTaxSchedule = [];
        if (netPayable > 10000) {
            advanceTaxSchedule = [
                { dueDate: "15th June", percentage: "15%", amountDue: Math.round(finalTax * 0.15) },
                { dueDate: "15th Sept", percentage: "45%", amountDue: Math.round(finalTax * 0.30) },
                { dueDate: "15th Dec", percentage: "75%", amountDue: Math.round(finalTax * 0.30) },
                { dueDate: "15th Mar", percentage: "100%", amountDue: Math.round(finalTax * 0.25) }
            ];
        }

        // 6. Save
        if (userId) {
            await TaxRecord.create({
                user: userId, financialYear, ageGroup, residentialStatus, income, taxesPaid,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, netTaxPayable: netPayable, regimeSelected: recommendation },
                grossTotalIncome: grossTotal
            });
        }

        res.json({
            grossTotalIncome: grossTotal,
            oldRegimeTax: Math.round(taxOld),
            newRegimeTax: Math.round(taxNew),
            netPayable: Math.round(netPayable),
            totalPaid,
            recommendation,
            advanceTaxSchedule
        });

    } catch (error) {
        console.error("Calculation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

const getTaxHistory = async (req, res) => {
    try {
        const history = await TaxRecord.find({ user: req.query.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteTaxRecord = async (req, res) => {
    try {
        await TaxRecord.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { calculateTax, getTaxHistory, deleteTaxRecord };