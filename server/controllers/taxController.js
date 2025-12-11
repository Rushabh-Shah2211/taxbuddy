// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');

const calculateTaxAmount = (taxableIncome, regime, ageGroup) => {
    let tax = 0;
    taxableIncome = Math.max(0, Number(taxableIncome));
    
    // Limits based on Age (Old Regime Only)
    let basicExemption = 250000;
    if (ageGroup === '60-80') basicExemption = 300000;
    if (ageGroup === '>80') basicExemption = 500000;

    if (regime === 'Old') {
        if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30 + (1000000 - 500000) * 0.20 + (500000 - basicExemption) * 0.05;
        else if (taxableIncome > 500000) tax += (taxableIncome - 500000) * 0.20 + (500000 - basicExemption) * 0.05;
        else if (taxableIncome > basicExemption) tax += (taxableIncome - basicExemption) * 0.05;
        
        if (taxableIncome <= 500000) tax = 0; // Rebate 87A
    } else {
        // New Regime FY 24-25 (Same for all ages)
        if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30 + 150000;
        else if (taxableIncome > 1200000) tax += (taxableIncome - 1200000) * 0.20 + 90000;
        else if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.15 + 60000;
        else if (taxableIncome > 700000) tax += (taxableIncome - 700000) * 0.10 + 30000;
        else if (taxableIncome > 300000) tax += (taxableIncome - 300000) * 0.05;
        
        if (taxableIncome <= 700000) tax = 0; // Rebate
    }
    return tax > 0 ? tax * 1.04 : 0; // Cess
};

const calculateTax = async (req, res) => {
    try {
        const { income, taxesPaid, userId, financialYear, ageGroup, residentialStatus } = req.body;

        // 1. CALCULATE HEADS OF INCOME
        
        // A. Salary
        let salaryIncome = 0;
        if (income.salary?.enabled) {
            salaryIncome = (Number(income.salary.basic)||0) + 
                           (Number(income.salary.hra)||0) + 
                           (Number(income.salary.gratuity)||0) + 
                           (Number(income.salary.pension)||0) + 
                           (Number(income.salary.prevSalary)||0) + 
                           (Number(income.salary.allowances)||0);
            // Std Deduction
            const stdDed = financialYear === '2024-2025' ? 75000 : 50000;
            salaryIncome = Math.max(0, salaryIncome - stdDed); 
        }

        // B. Business (44AD Logic)
        let businessIncome = 0;
        if (income.business?.enabled) {
            if (income.business.is44AD || income.business.is44ADA) {
                // Presumptive: Income = Turnover * Rate%
                const rate = Number(income.business.presumptiveRate) || 6;
                businessIncome = (Number(income.business.turnover) * rate) / 100;
            } else {
                // Normal: Income = Net Profit
                businessIncome = Number(income.business.profit);
            }
        }

        // C. House Property (NAV Calculation)
        let hpIncome = 0;
        if (income.houseProperty?.enabled) {
            const { type, rentReceived, municipalTaxes, interestPaid } = income.houseProperty;
            if (type === 'Self Occupied') {
                hpIncome = 0 - Number(interestPaid); // Loss
                // Cap loss at 2L for Old Regime usually, but keeping raw for now
            } else {
                const nav = Number(rentReceived) - Number(municipalTaxes);
                const stdDedHP = nav * 0.30; // 30% Std Ded
                hpIncome = nav - stdDedHP - Number(interestPaid);
            }
        }

        // D. Other Income (Sum of rows)
        let otherSrcIncome = 0;
        if (income.otherIncome?.enabled && income.otherIncome.sources) {
            income.otherIncome.sources.forEach(src => {
                otherSrcIncome += (Number(src.amount) - Number(src.expenses));
            });
        }

        // 2. GROSS TOTAL
        const grossTotal = salaryIncome + businessIncome + hpIncome + otherSrcIncome;

        // 3. TAX CALCULATION
        const taxOld = calculateTaxAmount(grossTotal, 'Old', ageGroup);
        const taxNew = calculateTaxAmount(grossTotal, 'New', ageGroup); // Age doesn't matter for New

        let taxLiability = Math.min(taxOld, taxNew);
        let recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // 4. NET PAYABLE (After Taxes Paid)
        const totalPaid = (Number(taxesPaid?.tds)||0) + (Number(taxesPaid?.advanceTax)||0) + (Number(taxesPaid?.selfAssessment)||0);
        const netPayable = Math.max(0, taxLiability - totalPaid);

        // 5. ADVANCE TAX SCHEDULE (Date Logic)
        let advanceTaxSchedule = [];
        const today = new Date();
        const fyEndYear = parseInt(financialYear.split('-')[1]); // 2025 for '2024-2025'
        const fyEndDate = new Date(`${fyEndYear}-03-31`);

        if (today > fyEndDate) {
            // Older FY -> No Advance Tax, all is Self Assessment
            // Logic handled in frontend display (schedule is empty)
        } else if (netPayable > 10000) {
            // Calculate remaining installments based on today's month
            const currentMonth = today.getMonth(); // 0=Jan, 11=Dec
            // Due dates: June(5), Sept(8), Dec(11), Mar(2)
            
            // Simplified logic: If we passed a date, that % is added to next or considered overdue
            // For this wizard, we just show standard schedule
            advanceTaxSchedule = [
                { dueDate: `15th June ${fyEndYear-1}`, percentage: "15%", amountDue: Math.round(taxLiability * 0.15) },
                { dueDate: `15th Sept ${fyEndYear-1}`, percentage: "45%", amountDue: Math.round(taxLiability * 0.30) },
                { dueDate: `15th Dec ${fyEndYear-1}`, percentage: "75%", amountDue: Math.round(taxLiability * 0.30) },
                { dueDate: `15th Mar ${fyEndYear}`, percentage: "100%", amountDue: Math.round(taxLiability * 0.25) }
            ];
        }

        // 6. SAVE
        if (userId) {
            await TaxRecord.create({
                user: userId, financialYear, ageGroup, residentialStatus, income, taxesPaid,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: taxLiability, netTaxPayable: netPayable, regimeSelected: recommendation }
            });
        }

        res.json({
            grossTotalIncome: grossTotal,
            taxLiability,
            totalPaid,
            netPayable,
            oldRegimeTax: taxOld,
            newRegimeTax: taxNew,
            recommendation,
            advanceTaxSchedule
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTaxHistory = async (req, res) => { /* Keep existing */ };
const deleteTaxRecord = async (req, res) => { /* Keep existing */ };

module.exports = { calculateTax, getTaxHistory, deleteTaxRecord };