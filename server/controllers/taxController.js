// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');

// --- MATH HELPER ---
const calculateTaxAmount = (taxableIncome, regime, financialYear) => {
    let tax = 0;
    taxableIncome = Math.max(0, Number(taxableIncome));

    if (regime === 'Old') {
        if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30 + 112500;
        else if (taxableIncome > 500000) tax += (taxableIncome - 500000) * 0.20 + 12500;
        else if (taxableIncome > 250000) tax += (taxableIncome - 250000) * 0.05;
        if (taxableIncome <= 500000) tax = 0; // Rebate
    } else {
        // New Regime FY 24-25
        if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30 + 150000;
        else if (taxableIncome > 1200000) tax += (taxableIncome - 1200000) * 0.20 + 90000;
        else if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.15 + 60000;
        else if (taxableIncome > 700000) tax += (taxableIncome - 700000) * 0.10 + 30000;
        else if (taxableIncome > 300000) tax += (taxableIncome - 300000) * 0.05;
        if (taxableIncome <= 700000) tax = 0; // Rebate
    }
    return tax > 0 ? tax * 1.04 : 0; // Cess
};

// --- AI RECOMMENDATION ENGINE ---
const generateSmartTips = (income, deductions, taxOld, taxNew) => {
    let tips = [];
    
    // 1. 80C Analysis
    const sec80C = Number(deductions?.section80C) || 0;
    if (sec80C < 150000) {
        tips.push(`📉 **Maximize 80C:** You have utilized only ₹${(sec80C/1000).toFixed(0)}k of ₹1.5L limit. Invest ₹${((150000 - sec80C)/1000).toFixed(0)}k in PPF/ELSS to save tax.`);
    }

    // 2. 80D Analysis
    const sec80D = Number(deductions?.section80D) || 0;
    if (sec80D === 0) {
        tips.push(`🏥 **Health Insurance:** Buying health insurance can give you an additional deduction of up to ₹25,000 (Sec 80D).`);
    }

    // 3. Capital Gains Harvesting
    const ltcg = Number(income?.capitalGains?.ltcg) || 0;
    if (ltcg > 100000) {
        tips.push(`📈 **Tax Harvesting:** Your LTCG exceeds ₹1 Lakh. Consider selling loss-making stocks to offset gains and reduce tax liability.`);
    }

    // 4. House Property Loss
    const hpIncome = Number(income?.houseProperty) || 0;
    if (hpIncome < 0 && Math.abs(hpIncome) > 200000) {
        tips.push(`🏠 **Home Loan:** You can only set off ₹2 Lakh of housing loss against salary this year. The remaining ₹${((Math.abs(hpIncome)-200000)/1000).toFixed(0)}k must be carried forward.`);
    }

    // 5. Savings Interest
    const interest = Number(income?.otherSources?.interestIncome) || 0;
    if (interest > 10000 && interest < 40000) {
        tips.push(`💰 **Section 80TTA:** Ensure you claim deduction up to ₹10,000 on your savings account interest.`);
    }

    // 6. Regime Specific
    if (taxNew < taxOld) {
        tips.push(`✅ **Switch Regime:** The New Regime saves you ₹${(taxOld - taxNew).toLocaleString()}. It generally works better if you have fewer deductions.`);
    } else {
        tips.push(`📋 **Stay with Old:** Your investments (80C/80D/HRA) make the Old Regime more beneficial for you.`);
    }

    return tips;
};

// --- MAIN CONTROLLER ---
const calculateTax = async (req, res) => {
    try {
        const { income, deductions, userId, userCategory, financialYear } = req.body;

        // 1. Aggregating Income
        const salary = (Number(income?.salary?.basic)||0) + (Number(income?.salary?.hra)||0) + (Number(income?.salary?.specialAllowance)||0) + (Number(income?.salary?.bonus)||0);
        const business = (Number(income?.otherSources?.businessProfit)||0);
        const houseProp = Number(income?.houseProperty) || 0;
        const capitalGains = (Number(income?.capitalGains?.stcg)||0) + (Number(income?.capitalGains?.ltcg)||0);
        const otherSrc = (Number(income?.otherSources?.interestIncome)||0) + (Number(income?.otherSources?.otherIncome)||0);

        // Gross Total Income
        let grossTotal = salary + business + houseProp + capitalGains + otherSrc;

        // 2. Deductions
        let stdDed = financialYear === '2024-2025' ? 75000 : 50000;
        
        // Net Income Calculation
        const netIncomeNew = Math.max(0, grossTotal - stdDed); 
        const dedOld = (Number(deductions?.section80C)||0) + (Number(deductions?.section80D)||0) + stdDed;
        const netIncomeOld = Math.max(0, grossTotal - dedOld);

        // 3. Tax Calculation
        const taxOld = calculateTaxAmount(netIncomeOld, 'Old', financialYear);
        const taxNew = calculateTaxAmount(netIncomeNew, 'New', financialYear);

        let finalTax = Math.min(taxOld, taxNew);
        let recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // 4. AI Recommendations
        const suggestions = generateSmartTips(income, deductions, taxOld, taxNew);

        // 5. Save Record
        if (userId) {
            await TaxRecord.create({
                user: userId, userCategory, financialYear, income, deductions,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, regimeSelected: recommendation }
            });
        }

        res.json({
            grossTotalIncome: grossTotal,
            oldRegime: { taxableIncome: netIncomeOld, tax: Math.round(taxOld) },
            newRegime: { taxableIncome: netIncomeNew, tax: Math.round(taxNew) },
            recommendation,
            savings: Math.round(Math.abs(taxOld - taxNew)),
            suggestions,
            advanceTax: { applicable: finalTax > 10000, schedule: [] } // Schedule logic abbreviated for space
        });

    } catch (error) {
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