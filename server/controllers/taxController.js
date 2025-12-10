// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');

// --- HELPER: Tax Slab Logic ---
const calculateTaxAmount = (taxableIncome, regime, financialYear) => {
    let tax = 0;
    taxableIncome = Number(taxableIncome) || 0;

    // --- OLD REGIME (Same for both years usually) ---
    if (regime === 'Old') {
        if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30 + 112500;
        else if (taxableIncome > 500000) tax += (taxableIncome - 500000) * 0.20 + 12500;
        else if (taxableIncome > 250000) tax += (taxableIncome - 250000) * 0.05;
        
        // 87A Rebate Old Regime (Income <= 5L)
        if (taxableIncome <= 500000) tax = 0;
    } 
    // --- NEW REGIME ---
    else {
        if (financialYear === '2024-2025') {
            // Budget 2024 Proposed Slabs
            if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30 + 150000;
            else if (taxableIncome > 1200000) tax += (taxableIncome - 1200000) * 0.20 + 90000;
            else if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.15 + 60000;
            else if (taxableIncome > 700000) tax += (taxableIncome - 700000) * 0.10 + 30000;
            else if (taxableIncome > 300000) tax += (taxableIncome - 300000) * 0.05;
        } else {
            // FY 2023-2024 Slabs
            if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30 + 150000;
            else if (taxableIncome > 1200000) tax += (taxableIncome - 1200000) * 0.20 + 90000;
            else if (taxableIncome > 900000) tax += (taxableIncome - 900000) * 0.15 + 45000;
            else if (taxableIncome > 600000) tax += (taxableIncome - 600000) * 0.10 + 15000;
            else if (taxableIncome > 300000) tax += (taxableIncome - 300000) * 0.05;
        }

        // 87A Rebate New Regime (Income <= 7L)
        if (taxableIncome <= 700000) tax = 0;
    }
    
    // Add 4% Cess
    return tax > 0 ? tax * 1.04 : 0;
};

// --- MAIN: CALCULATE ---
const calculateTax = async (req, res) => {
    try {
        const { income, deductions, userId, userCategory, financialYear = '2024-2025' } = req.body;

        const salaryTotal = (Number(income?.salary?.basic) || 0) + 
                            (Number(income?.salary?.hra) || 0) + 
                            (Number(income?.salary?.specialAllowance) || 0) + 
                            (Number(income?.salary?.bonus) || 0);
        
        const businessIncome = Number(income?.otherSources?.businessProfit) || 0;
        const grossTotal = salaryTotal + businessIncome;

        // Standard Deduction Logic
        let stdDeduction = 50000; // Old Regime & FY 23-24 New Regime
        if (financialYear === '2024-2025') stdDeduction = 75000; // New Regime FY 24-25

        const dedOld = (Number(deductions?.section80C) || 0) + (Number(deductions?.section80D) || 0) + 50000;
        // For New Regime calculation, we apply the specific Std Deduction for that year
        const netIncomeNew = Math.max(0, grossTotal - stdDeduction);
        const netIncomeOld = Math.max(0, grossTotal - dedOld);

        const taxOld = calculateTaxAmount(netIncomeOld, 'Old', financialYear);
        const taxNew = calculateTaxAmount(netIncomeNew, 'New', financialYear);

        let finalTax = taxNew <= taxOld ? taxNew : taxOld;
        let recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // Suggestions
        let tips = [];
        if((Number(deductions?.section80C) || 0) < 150000) tips.push("Invest in 80C to reduce Old Regime tax.");

        // Advance Tax
        let advanceTaxSchedule = [];
        if (finalTax > 10000) {
            advanceTaxSchedule = [
                { dueDate: "15th June", percentage: "15%", amountDue: Math.round(finalTax * 0.15) },
                { dueDate: "15th Sept", percentage: "45%", amountDue: Math.round(finalTax * 0.30) },
                { dueDate: "15th Dec", percentage: "75%", amountDue: Math.round(finalTax * 0.30) },
                { dueDate: "15th Mar", percentage: "100%", amountDue: Math.round(finalTax * 0.25) }
            ];
        }

        if (userId) {
            await TaxRecord.create({
                user: userId,
                userCategory: userCategory || 'Salaried',
                financialYear, // Store the FY
                income,
                deductions,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, regimeSelected: recommendation }
            });
        }

        res.json({
            financialYear,
            grossTotalIncome: grossTotal,
            oldRegime: { taxableIncome: netIncomeOld, tax: Math.round(taxOld) },
            newRegime: { taxableIncome: netIncomeNew, tax: Math.round(taxNew) },
            recommendation,
            savings: Math.round(Math.abs(taxOld - taxNew)),
            suggestions: tips,
            advanceTax: { applicable: finalTax > 10000, schedule: advanceTaxSchedule }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- NEW: DELETE RECORD ---
const deleteTaxRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await TaxRecord.findById(id);

        if (!record) return res.status(404).json({ message: "Record not found" });

        // Ensure user owns the record (Optional security check)
        // if (record.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: "Not authorized" });

        await TaxRecord.findByIdAndDelete(id);
        res.json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTaxHistory = async (req, res) => {
    try {
        const { userId } = req.query;
        const history = await TaxRecord.find({ user: userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { calculateTax, getTaxHistory, deleteTaxRecord };