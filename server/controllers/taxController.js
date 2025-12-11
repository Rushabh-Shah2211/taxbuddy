const TaxRecord = require('../models/TaxRecord');

// --- HELPER 1: Calculate Tax Slabs ---
const calculateTaxAmount = (taxableIncome, regime, financialYear, ageGroup) => {
    let tax = 0;
    taxableIncome = Math.max(0, Number(taxableIncome));

    // --- OLD REGIME ---
    if (regime === 'Old') {
        let basicExemption = 250000;
        if (ageGroup === '60-80') basicExemption = 300000; // Senior
        if (ageGroup === '>80') basicExemption = 500000;  // Super Senior

        if (taxableIncome > 1000000) {
            tax += (taxableIncome - 1000000) * 0.30;
            tax += (1000000 - 500000) * 0.20;
            tax += (500000 - basicExemption) * 0.05;
        } 
        else if (taxableIncome > 500000) {
            tax += (taxableIncome - 500000) * 0.20;
            tax += (500000 - basicExemption) * 0.05;
        } 
        else if (taxableIncome > basicExemption) {
            tax += (taxableIncome - basicExemption) * 0.05;
        }
        
        // 87A Rebate
        if (taxableIncome <= 500000) tax = 0;
    } 
    // --- NEW REGIME ---
    else {
        // FY 2024-25 & 2025-26 Slabs
        if (financialYear === '2024-2025' || financialYear === '2025-2026') {
            if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30 + 150000;
            else if (taxableIncome > 1200000) tax += (taxableIncome - 1200000) * 0.20 + 90000;
            else if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.15 + 60000;
            else if (taxableIncome > 700000) tax += (taxableIncome - 700000) * 0.10 + 30000;
            else if (taxableIncome > 300000) tax += (taxableIncome - 300000) * 0.05;
        } else {
            // Older FY 2023-24
            if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30 + 150000;
            else if (taxableIncome > 1200000) tax += (taxableIncome - 1200000) * 0.20 + 90000;
            else if (taxableIncome > 900000) tax += (taxableIncome - 900000) * 0.15 + 45000;
            else if (taxableIncome > 600000) tax += (taxableIncome - 600000) * 0.10 + 15000;
            else if (taxableIncome > 300000) tax += (taxableIncome - 300000) * 0.05;
        }

        // 87A Rebate
        if (taxableIncome <= 700000) tax = 0;
    }
    
    return tax > 0 ? tax * 1.04 : 0;
};

// --- HELPER 2: Smart Tips ---
const generateSmartTips = (inputs, taxOld, taxNew) => {
    let tips = [];
    const { income, taxesPaid } = inputs;

    if (taxNew < taxOld) {
        tips.push(`✅ **Switch to New Regime:** It saves you ₹${(taxOld - taxNew).toLocaleString()}.`);
    } else {
        tips.push(`📋 **Stick to Old Regime:** Your deductions make the Old Regime better.`);
    }

    if (income.business?.enabled && !income.business.is44AD && !income.business.is44ADA) {
        tips.push(`🏢 **Section 44AD:** If turnover < ₹3Cr, consider Presumptive Taxation.`);
    }

    if (income.houseProperty?.enabled && income.houseProperty.type === 'Self Occupied') {
        tips.push(`🏠 **Home Loan Interest:** Claim up to ₹2 Lakhs deduction under Section 24(b).`);
    }

    const netPayable = Math.max(0, Math.min(taxOld, taxNew) - (taxesPaid?.tds || 0));
    if (netPayable > 10000) {
        tips.push(`⚠️ **Advance Tax:** You have a liability of ₹${netPayable.toLocaleString()}. Pay installments to avoid interest.`);
    }

    return tips;
};

// --- MAIN CONTROLLER ---
const calculateTax = async (req, res) => {
    try {
        const { userId, financialYear, ageGroup, residentialStatus, income, taxesPaid } = req.body;

        // 1. Income Calculations
        let salaryIncome = 0;
        let stdDeduction = (financialYear === '2024-2025' || financialYear === '2025-2026') ? 75000 : 50000;

        if (income.salary?.enabled) {
            const s = income.salary;
            salaryIncome = (Number(s.basic)||0) + (Number(s.hra)||0) + (Number(s.gratuity)||0) + 
                           (Number(s.pension)||0) + (Number(s.prevSalary)||0) + (Number(s.allowances)||0);
            salaryIncome = Math.max(0, salaryIncome - stdDeduction); 
        }

        let businessIncome = 0;
        if (income.business?.enabled) {
            const b = income.business;
            if (b.is44AD || b.is44ADA) {
                const rate = Number(b.presumptiveRate) || 6;
                businessIncome = (Number(b.turnover) * rate) / 100;
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
                if(hpIncome < -200000) hpIncome = -200000; 
            } else {
                const nav = (Number(h.rentReceived)||0) - (Number(h.municipalTaxes)||0);
                const stdDedHP = nav * 0.30;
                hpIncome = nav - stdDedHP - interest;
            }
        }

        let otherSrcIncome = 0;
        if (income.otherIncome?.enabled && income.otherIncome.sources) {
            income.otherIncome.sources.forEach(src => {
                otherSrcIncome += (Number(src.amount)||0) - (Number(src.expenses)||0);
            });
        }

        const grossTotal = salaryIncome + businessIncome + hpIncome + otherSrcIncome;
        const netTaxableIncome = Math.max(0, grossTotal); // Assuming 0 ded for now as requested

        // 2. Tax Calc
        const taxOld = calculateTaxAmount(netTaxableIncome, 'Old', financialYear, ageGroup);
        const taxNew = calculateTaxAmount(netTaxableIncome, 'New', financialYear, ageGroup);

        let finalTax = Math.min(taxOld, taxNew);
        let recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // 3. Payable
        const totalPaid = (Number(taxesPaid?.tds)||0) + (Number(taxesPaid?.advanceTax)||0) + (Number(taxesPaid?.selfAssessment)||0);
        const netPayable = Math.max(0, finalTax - totalPaid);

        let advanceTaxSchedule = [];
        if (netPayable > 10000) {
            advanceTaxSchedule = [
                { dueDate: "15th June", percentage: "15%", amountDue: Math.round(finalTax * 0.15) },
                { dueDate: "15th Sept", percentage: "45%", amountDue: Math.round(finalTax * 0.30) },
                { dueDate: "15th Dec", percentage: "75%", amountDue: Math.round(finalTax * 0.30) },
                { dueDate: "15th Mar", percentage: "100%", amountDue: Math.round(finalTax * 0.25) }
            ];
        }

        const suggestions = generateSmartTips(req.body, taxOld, taxNew);

        // 4. Save
        if (userId) {
            await TaxRecord.create({
                user: userId, financialYear, ageGroup, residentialStatus, income, taxesPaid,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, netTaxPayable: netPayable, regimeSelected: recommendation }
            });
        }

        res.json({
            grossTotalIncome: grossTotal,
            oldRegimeTax: Math.round(taxOld),
            newRegimeTax: Math.round(taxNew),
            netPayable: Math.round(netPayable),
            totalPaid,
            recommendation,
            advanceTaxSchedule,
            suggestions
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTaxHistory = async (req, res) => {
    try {
        const history = await TaxRecord.find({ user: req.query.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTaxRecord = async (req, res) => {
    try {
        await TaxRecord.findByIdAndDelete(req.params.id);
        res.json({ message: "Record Deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { calculateTax, getTaxHistory, deleteTaxRecord };