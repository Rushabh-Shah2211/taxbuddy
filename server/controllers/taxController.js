// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');

// --- HELPER 1: Calculate Tax Slabs ---
const calculateTaxAmount = (taxableIncome, regime = 'New') => {
    let tax = 0;
    // Ensure inputs are numbers
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
        
        // 87A Rebate
        if (taxableIncome <= 700000) tax = 0;
    }
    // Add 4% Cess
    return tax > 0 ? tax * 1.04 : 0;
};

// --- HELPER 2: Generate Tips ---
const generateSuggestions = (income, deductions) => {
    let tips = [];
    const sec80C = Number(deductions?.section80C) || 0;
    const sec80D = Number(deductions?.section80D) || 0;
    const basic = Number(income?.salary?.basic) || 0;
    const hra = Number(income?.salary?.hra) || 0;

    if (sec80C < 150000) {
        tips.push(`📉 Invest ₹${150000 - sec80C} more in 80C (PPF/ELSS) to save tax.`);
    }
    if (sec80D < 25000) {
        tips.push(`🏥 Buy Health Insurance (Section 80D) to save up to ₹25,000 in deductions.`);
    }
    if (basic > 0 && hra === 0) {
        tips.push(`🏠 Provide Rent Receipts to claim HRA exemption if you live on rent.`);
    }
    return tips;
};

// --- MAIN: CALCULATE ---
const calculateTax = async (req, res) => {
    try {
        const { income, deductions, userId } = req.body;

        // 1. Parse Incomes (Safe Parsing)
        const grossSalary = (Number(income?.salary?.basic) || 0) + 
                            (Number(income?.salary?.hra) || 0) + 
                            (Number(income?.salary?.specialAllowance) || 0) + 
                            (Number(income?.salary?.bonus) || 0);
        
        const otherIncome = Number(income?.capitalGains?.stcg) || 0;
        const grossTotal = grossSalary + otherIncome;

        // 2. Parse Deductions
        const dedOld = (Number(deductions?.section80C) || 0) + 
                       (Number(deductions?.section80D) || 0) + 50000;
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

        // 5. Advance Tax Schedule
        let advanceTaxSchedule = [];
        if (finalTax > 10000) {
            advanceTaxSchedule = [
                { dueDate: "15th June", percentage: "15%", amountDue: Math.round(finalTax * 0.15), cumulative: Math.round(finalTax * 0.15) },
                { dueDate: "15th Sept", percentage: "30%", amountDue: Math.round(finalTax * 0.30), cumulative: Math.round(finalTax * 0.45) },
                { dueDate: "15th Dec", percentage: "30%", amountDue: Math.round(finalTax * 0.30), cumulative: Math.round(finalTax * 0.75) },
                { dueDate: "15th Mar", percentage: "25%", amountDue: Math.round(finalTax * 0.25), cumulative: Math.round(finalTax) }
            ];
        }

        // 6. SAVE TO DB (Only if User is logged in)
        if (userId) {
            try {
                await TaxRecord.create({
                    user: userId,
                    income: income,
                    deductions: deductions,
                    computedTax: { 
                        oldRegimeTax: taxOld, 
                        newRegimeTax: taxNew, 
                        taxPayable: finalTax, 
                        regimeSelected: recommendation 
                    }
                });
            } catch (saveError) {
                console.error("DB Save Failed (Non-fatal):", saveError.message);
                // We do NOT stop the response just because save failed
            }
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

// --- HISTORY ---
const getTaxHistory = async (req, res) => {
    try {
        const { userId } = req.query;
        const history = await TaxRecord.find({ user: userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateTaxRecord = async (req, res) => {
    try {
        const { id } = req.params; // The record ID to edit
        const { income, deductions, userCategory } = req.body;

        // Re-calculate tax logic (Same as create)
        // Note: In a real app, refactor calculation into a reusable function to avoid duplicate code
        // For now, we will just save the raw data and let the frontend show the result
        
        const updatedRecord = await TaxRecord.findByIdAndUpdate(
            id,
            {
                income,
                deductions,
                userCategory,
                // We assume the frontend sends the re-calculated values, 
                // or we re-run the calc logic here. 
                // For simplicity, we just update the inputs.
            },
            { new: true }
        );

        res.json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { calculateTax, getTaxHistory, updateTaxRecord }; // Add updateTaxRecord here