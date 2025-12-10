// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');

// --- HELPER 1: Calculate Tax Slabs ---
const calculateTaxAmount = (taxableIncome, regime = 'New') => {
    let tax = 0;
    taxableIncome = Number(taxableIncome) || 0;

    if (regime === 'Old') {
        if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30 + 112500;
        else if (taxableIncome > 500000) tax += (taxableIncome - 500000) * 0.20 + 12500;
        else if (taxableIncome > 250000) tax += (taxableIncome - 250000) * 0.05;
    } else {
        // New Regime (FY 2024-25)
        if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30 + 150000;
        else if (taxableIncome > 1200000) tax += (taxableIncome - 1200000) * 0.20 + 90000;
        else if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.15 + 60000;
        else if (taxableIncome > 700000) tax += (taxableIncome - 700000) * 0.10 + 30000;
        else if (taxableIncome > 300000) tax += (taxableIncome - 300000) * 0.05;
        
        if (taxableIncome <= 700000) tax = 0;
    }
    return tax > 0 ? tax * 1.04 : 0;
};

// --- HELPER 2: Generate Tips ---
const generateSuggestions = (income, deductions) => {
    let tips = [];
    const sec80C = Number(deductions?.section80C) || 0;
    if (sec80C < 150000) tips.push(`📉 Invest ₹${150000 - sec80C} more in 80C (PPF/ELSS) to save tax.`);
    return tips;
};

// --- MAIN: CALCULATE ---
const calculateTax = async (req, res) => {
    try {
        const { income, deductions, userId, userCategory } = req.body;

        // 1. Calculate Income (FIXED LOGIC)
        const salaryTotal = (Number(income?.salary?.basic) || 0) + 
                            (Number(income?.salary?.hra) || 0) + 
                            (Number(income?.salary?.specialAllowance) || 0) + 
                            (Number(income?.salary?.bonus) || 0);
        
        // FIX: Explicitly add Business Profit
        const businessIncome = Number(income?.otherSources?.businessProfit) || 0;
        
        const grossTotal = salaryTotal + businessIncome;

        // 2. Calculate Deductions
        const dedOld = (Number(deductions?.section80C) || 0) + (Number(deductions?.section80D) || 0) + 50000;
        const dedNew = 75000; // Std Deduction

        const netIncomeOld = Math.max(0, grossTotal - dedOld);
        const netIncomeNew = Math.max(0, grossTotal - dedNew);

        // 3. Compute Tax
        const taxOld = calculateTaxAmount(netIncomeOld, 'Old');
        const taxNew = calculateTaxAmount(netIncomeNew, 'New');

        let finalTax = taxNew <= taxOld ? taxNew : taxOld;
        let recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // 4. Generate Tips
        const suggestions = generateSuggestions(income, deductions);

        // 5. Advance Tax Schedule (FIXED)
        let advanceTaxSchedule = [];
        if (finalTax > 10000) {
            advanceTaxSchedule = [
                { dueDate: "15th June", percentage: "15%", amountDue: Math.round(finalTax * 0.15), cumulative: Math.round(finalTax * 0.15) },
                { dueDate: "15th Sept", percentage: "30%", amountDue: Math.round(finalTax * 0.30), cumulative: Math.round(finalTax * 0.45) },
                { dueDate: "15th Dec", percentage: "30%", amountDue: Math.round(finalTax * 0.30), cumulative: Math.round(finalTax * 0.75) },
                { dueDate: "15th Mar", percentage: "25%", amountDue: Math.round(finalTax * 0.25), cumulative: Math.round(finalTax) }
            ];
        }

        // 6. SAVE TO DB
        if (userId) {
            await TaxRecord.create({
                user: userId,
                userCategory: userCategory || 'Salaried',
                income: income,
                deductions: deductions,
                computedTax: { 
                    oldRegimeTax: taxOld, 
                    newRegimeTax: taxNew, 
                    taxPayable: finalTax, 
                    regimeSelected: recommendation 
                }
            });
        }

        res.json({
            grossTotalIncome: grossTotal,
            oldRegime: { taxableIncome: netIncomeOld, tax: Math.round(taxOld) },
            newRegime: { taxableIncome: netIncomeNew, tax: Math.round(taxNew) },
            recommendation,
            savings: Math.round(Math.abs(taxOld - taxNew)),
            suggestions,
            advanceTax: { applicable: finalTax > 10000, schedule: advanceTaxSchedule },
            payroll: { monthlyTDS: Math.round(finalTax / 12) }
        });

    } catch (error) {
        console.error("Calculation Error:", error);
        res.status(500).json({ message: "Server Error: " + error.message });
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

const updateTaxRecord = async (req, res) => { /* Keeping update logic if you need it */ };

module.exports = { calculateTax, getTaxHistory, updateTaxRecord };