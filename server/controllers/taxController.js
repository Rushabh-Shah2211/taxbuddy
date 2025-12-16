// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');

// --- HELPER: Slab Calculation ---
const calculateSlabTax = (taxableIncome, regime, ageGroup) => {
    let tax = 0;
    let income = Math.max(0, Number(taxableIncome) || 0);

    if (regime === 'Old') {
        let limit = ageGroup === '>80' ? 500000 : (ageGroup === '60-80' ? 300000 : 250000);
        if (income > 1000000) tax += 112500 + (income - 1000000) * 0.30;
        else if (income > 500000) tax += 12500 + (income - 500000) * 0.20;
        else if (income > limit) tax += (income - limit) * 0.05;
        
        // Slab adjustments for seniors
        if(ageGroup === '60-80' && income > 1000000) tax -= 2500; 
        if(ageGroup === '>80' && income > 1000000) tax -= 12500;
        
        if (income <= 500000) tax = 0; // Rebate 87A
    } else {
        // New Regime FY 25-26
        if (income > 2400000) tax += 300000 + (income - 2400000) * 0.30;
        else if (income > 2000000) tax += 200000 + (income - 2000000) * 0.25;
        else if (income > 1600000) tax += 120000 + (income - 1600000) * 0.20;
        else if (income > 1200000) tax += 60000 + (income - 1200000) * 0.15;
        else if (income > 800000) tax += 20000 + (income - 800000) * 0.10;
        else if (income > 400000) tax += (income - 400000) * 0.05;
        
        if (income <= 1200000) tax = 0; // Rebate 87A
    }
    return tax > 0 ? tax * 1.04 : 0; // Add Cess
};

// --- HELPER: Capital Gains Tax ---
const calculateCGTax = (cg) => {
    if (!cg || !cg.enabled) return 0;
    let tax = 0;
    
    // 1. STCG 111A (Shares): Flat 20%
    const stcgShares = Number(cg.shares?.stcg111a) || 0;
    if (stcgShares > 0) tax += stcgShares * 0.20;
    
    // 2. LTCG 112A (Shares): 12.5% above 1.25 Lakhs
    const ltcgShares = Number(cg.shares?.ltcg112a) || 0;
    if (ltcgShares > 125000) {
        tax += (ltcgShares - 125000) * 0.125;
    }

    // 3. Property LTCG: 12.5%
    const ltcgProp = Number(cg.property?.ltcg) || 0;
    if (ltcgProp > 0) tax += ltcgProp * 0.125;

    return tax * 1.04; // Add Cess
};

// --- MAIN CONTROLLER ---
const calculateTax = async (req, res) => {
    try {
        const { userId, financialYear, ageGroup, residentialStatus, income, deductions, taxesPaid } = req.body;

        // 1. SALARY
        let totalSalaryTaxable = 0;
        let salaryRecord = { ...income.salary }; // Create copy
        
        if (income.salary?.enabled) {
             let stdDed = 75000;
             // Ensure all inputs are numbers or 0
             let basic = (Number(salaryRecord.basic)||0) + (Number(salaryRecord.hra)||0) + (Number(salaryRecord.allowances)||0);
             totalSalaryTaxable = Math.max(0, basic - stdDed); 
        }

        // 2. BUSINESS (Multiple)
        let businessIncome = 0;
        if (income.business?.enabled && income.business.businesses) {
            income.business.businesses.forEach(biz => {
                if (biz.type === "Presumptive") {
                    const turnover = Number(biz.turnover) || 0;
                    const rate = Number(biz.presumptiveRate) || 6;
                    businessIncome += (turnover * rate / 100);
                } else {
                    const profit = Number(biz.profit) || 0;
                    businessIncome += profit;
                }
            });
        }

        // 3. HOUSE PROPERTY
        let hpIncome = 0;
        if(income.houseProperty?.enabled) {
             const h = income.houseProperty;
             const rent = Number(h.rentReceived) || 0;
             const taxes = Number(h.municipalTaxes) || 0;
             const interest = Number(h.interestPaid) || 0;

             if(h.type === 'Rented') {
                 // NAV Calculation: (Rent - Municipal Taxes) - 30% Std Ded - Interest
                 const nav = rent - taxes;
                 hpIncome = (nav * 0.7) - interest; 
             } else {
                 // Self Occupied: Max Loss 2 Lakhs
                 hpIncome = Math.max(-200000, 0 - interest);
             }
        }

        // 4. OTHER INCOME
        let otherSrcIncome = 0;
        if(income.otherIncome?.sources) {
            income.otherIncome.sources.forEach(s => {
                otherSrcIncome += (Number(s.amount) || 0);
            });
        }

        // 5. CAPITAL GAINS (Slab Components only)
        // Note: Special rate taxes are added directly to the final tax later
        let cgSlabIncome = 0; 
        if (income.capitalGains?.enabled) {
            cgSlabIncome += (Number(income.capitalGains.property?.stcg) || 0);
            cgSlabIncome += (Number(income.capitalGains.other) || 0);
        }
        
        // 6. GROSS TOTAL INCOME (The Sum)
        const grossTotalIncome = totalSalaryTaxable + businessIncome + hpIncome + otherSrcIncome + cgSlabIncome;

        // 7. DEDUCTIONS
        let totalDeductions = 0;
        if (deductions?.enabled) {
            const d = deductions;
            const val80C = Math.min(Number(d.section80C)||0, 150000);
            totalDeductions = val80C + (Number(d.section80D)||0) + (Number(d.section80E)||0) + (Number(d.section80G)||0) + (Number(d.section80TTA)||0) + (Number(d.otherDeductions)||0);
        }

        // 8. TAX CALCULATION
        const netTaxableOld = Math.max(0, grossTotalIncome - totalDeductions);
        const netTaxableNew = Math.max(0, grossTotalIncome); 

        let taxOld = calculateSlabTax(netTaxableOld, 'Old', ageGroup);
        let taxNew = calculateSlabTax(netTaxableNew, 'New', ageGroup);

        // Add Special CG Tax (Calculated separately)
        const cgTax = calculateCGTax(income.capitalGains);
        taxOld += cgTax;
        taxNew += cgTax;

        const finalTax = Math.min(taxOld, taxNew);
        const recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";
        
        // Calculate Paid Taxes
        const taxesPaidTotal = (Number(taxesPaid?.tds)||0) + (Number(taxesPaid?.advanceTax)||0) + (Number(taxesPaid?.selfAssessment)||0);
        const netPayable = Math.max(0, finalTax - taxesPaidTotal);

        // Advance Tax Schedule
        let advanceTaxSchedule = [];
        if (netPayable > 10000) {
            advanceTaxSchedule = [
                { dueDate: "15th June", percentage: "15%", amountDue: Math.round(netPayable * 0.15) },
                { dueDate: "15th Sept", percentage: "45%", amountDue: Math.round(netPayable * 0.45) },
                { dueDate: "15th Dec", percentage: "75%", amountDue: Math.round(netPayable * 0.75) },
                { dueDate: "15th Mar", percentage: "100%", amountDue: Math.round(netPayable) }
            ];
        }

        // 9. SAVE TO DB
        if (userId) {
            await TaxRecord.create({
                user: userId, financialYear, ageGroup, residentialStatus,
                income: { ...income, salary: salaryRecord }, 
                deductions, taxesPaid,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, netTaxPayable: netPayable, regimeSelected: recommendation, suggestions: [] },
                grossTotalIncome
            });
        }

        res.json({
            grossTotalIncome,
            oldRegimeTax: Math.round(taxOld),
            newRegimeTax: Math.round(taxNew),
            netPayable: Math.round(netPayable),
            recommendation,
            suggestions: [],
            advanceTaxSchedule
        });

    } catch (error) {
        console.error("Calculation Error:", error);
        res.status(500).json({ message: "Error: " + error.message });
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

const aiTaxAdvisor = async (req, res) => {
    res.json({ response: "I am a local tax assistant. Please ask about 80C or Tax Regimes." });
};

module.exports = { calculateTax, getTaxHistory, deleteTaxRecord, aiTaxAdvisor };