// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini (Using 1.5-flash for stability)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// --- HELPERS ---
const calculateGratuity = (details, isGovt) => {
    if (!details || !details.received) return { taxable: 0, exempt: 0 };
    if (isGovt) return { taxable: 0, exempt: details.received };

    const { received, lastDrawnSalary, yearsOfService, coveredByAct } = details;
    let exemptAmount = 0;
    const limit = 2000000;

    if (coveredByAct) exemptAmount = Math.min((15 / 26) * lastDrawnSalary * yearsOfService, limit, received);
    else exemptAmount = Math.min(0.5 * lastDrawnSalary * yearsOfService, limit, received);
    
    return { taxable: Math.max(0, received - exemptAmount), exempt: exemptAmount };
};

const calculateLeaveEncashment = (details, isGovt) => {
    if (!details || !details.received) return { taxable: 0, exempt: 0 };
    if (isGovt) return { taxable: 0, exempt: details.received };

    const { received, avgSalary10Months, earnedLeaveBalance } = details;
    const limit = 2500000;
    const exemptAmount = Math.min(received, limit, avgSalary10Months * earnedLeaveBalance, 10 * avgSalary10Months);
    
    return { taxable: Math.max(0, received - exemptAmount), exempt: exemptAmount };
};

const calculatePension = (details, isGovt) => {
    if (!details) return { taxable: 0, exempt: 0 };
    let taxable = Number(details.uncommuted) || 0;
    
    if (details.commutedReceived) {
        let exemptCommuted = 0;
        if (isGovt) exemptCommuted = details.commutedReceived;
        else {
            const totalCorpus = details.commutedReceived / (details.commutationPercentage / 100);
            exemptCommuted = Math.min(details.hasGratuity ? (totalCorpus / 3) : (totalCorpus / 2), details.commutedReceived);
        }
        taxable += (details.commutedReceived - exemptCommuted);
    }
    return { taxable, exempt: (Number(details.commutedReceived)||0) - (taxable - (Number(details.uncommuted)||0)) };
};

const calculateHRA = (basic, hraReceived, rentPaid, isMetro) => {
    if (!hraReceived || !rentPaid) return { taxable: hraReceived || 0, exempt: 0 };
    const rentOver10 = rentPaid - (0.10 * basic);
    if (rentOver10 <= 0) return { taxable: hraReceived, exempt: 0 };
    const exemptAmount = Math.min(hraReceived, rentOver10, isMetro ? 0.50 * basic : 0.40 * basic);
    return { taxable: Math.max(0, hraReceived - exemptAmount), exempt: exemptAmount };
};

const calculateSlabTax = (taxableIncome, regime, financialYear, ageGroup) => {
    let tax = 0;
    let income = Math.max(0, Number(taxableIncome));

    if (regime === 'Old') {
        let limit = ageGroup === '>80' ? 500000 : (ageGroup === '60-80' ? 300000 : 250000);
        if (income > 1000000) {
            tax += (income - 1000000) * 0.30 + 112500;
            if(ageGroup === '60-80') tax -= 2500;
            if(ageGroup === '>80') tax -= 12500;
        } else if (income > 500000) tax += (income - 500000) * 0.20 + (500000 - limit) * 0.05;
        else if (income > limit) tax += (income - limit) * 0.05;
        if (income <= 500000) tax = 0; 
    } else {
        if (income > 2400000) tax += (income - 2400000) * 0.30 + 300000;
        else if (income > 2000000) tax += (income - 2000000) * 0.25 + 200000;
        else if (income > 1600000) tax += (income - 1600000) * 0.20 + 120000;
        else if (income > 1200000) tax += (income - 1200000) * 0.15 + 60000;
        else if (income > 800000) tax += (income - 800000) * 0.10 + 20000;
        else if (income > 400000) tax += (income - 400000) * 0.05;
        if (income <= 1200000) tax = 0;
    }
    return tax > 0 ? tax * 1.04 : 0;
};

// --- MAIN CONTROLLER ---
const calculateTax = async (req, res) => {
    try {
        const { userId, financialYear, ageGroup, residentialStatus, income, deductions, taxesPaid, name } = req.body;

        let totalSalaryTaxable = 0;
        let salaryRecord = { ...income.salary };

        if (income.salary?.enabled) {
            const s = income.salary;
            const isGovt = s.employmentType === 'Government';
            let stdDed = 75000;

            if (s.detailedMode) {
                // --- FIX: Extract simple numbers from complex objects ---
                let taxableBasic = (Number(s.basic)||0) + (Number(s.da)||0) + (Number(s.bonus)||0);
                const hraCalc = calculateHRA(s.basic, s.hra, s.rentPaid, s.isMetro);
                const gratCalc = calculateGratuity(s.gratuity, isGovt);
                const leaveCalc = calculateLeaveEncashment(s.leaveEncashment, isGovt);
                const pensionCalc = calculatePension(s.pension, isGovt);
                const perqs = Number(s.perquisites?.taxableValue) || 0;
                const otherAll = Number(s.otherAllowancesTaxable) || 0;

                // 1. SAVE NUMBERS (Taxable)
                salaryRecord.basic = taxableBasic;
                salaryRecord.hra = hraCalc.taxable;
                salaryRecord.gratuity = gratCalc.taxable;
                salaryRecord.leaveEncashment = leaveCalc.taxable;
                salaryRecord.pension = pensionCalc.taxable;
                salaryRecord.perquisites = perqs;
                salaryRecord.allowances = otherAll;

                // 2. SAVE RAW OBJECTS (Details)
                salaryRecord.details = {
                    rentPaid: s.rentPaid, isMetro: s.isMetro,
                    gratuityInput: s.gratuity,
                    leaveInput: s.leaveEncashment,
                    pensionInput: s.pension
                };

                const grossSalary = taxableBasic + hraCalc.taxable + gratCalc.taxable + leaveCalc.taxable + pensionCalc.taxable + perqs + otherAll;
                totalSalaryTaxable = Math.max(0, grossSalary - stdDed);

            } else {
                let basic = (Number(s.basic)||0) + (Number(s.hra)||0) + (Number(s.allowances)||0) + (Number(s.bonus)||0);
                totalSalaryTaxable = Math.max(0, basic - stdDed);
            }
        }

        // Other Income Heads
        let businessIncome = 0;
        if (income.business?.enabled) {
            const b = income.business;
            businessIncome = (b.is44AD || b.is44ADA) ? (Number(b.turnover) * (Number(b.presumptiveRate)||6)/100) : Number(b.profit);
        }
        let hpIncome = 0;
        if (income.houseProperty?.enabled) {
            const h = income.houseProperty;
            if(h.type === 'Self Occupied') hpIncome = Math.max(-200000, 0 - (Number(h.interestPaid)||0));
            else {
                const nav = (Number(h.rentReceived)||0) - (Number(h.municipalTaxes)||0);
                hpIncome = nav - (nav * 0.30) - (Number(h.interestPaid)||0);
            }
        }
        let otherSrcIncome = 0;
        if (income.otherIncome?.enabled && income.otherIncome.sources) {
            income.otherIncome.sources.forEach(src => otherSrcIncome += (Number(src.amount)||0));
        }

        const grossTotalIncome = totalSalaryTaxable + businessIncome + hpIncome + otherSrcIncome;
        const totalDeductions = Math.min((Number(deductions?.section80C)||0), 150000) + (Number(deductions?.section80D)||0);
        
        const netTaxableOld = Math.max(0, grossTotalIncome - totalDeductions);
        const netTaxableNew = Math.max(0, grossTotalIncome);

        let taxOld = calculateSlabTax(netTaxableOld, 'Old', financialYear, ageGroup);
        let taxNew = calculateSlabTax(netTaxableNew, 'New', financialYear, ageGroup);
        const finalTax = Math.min(taxOld, taxNew);
        const recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";
        const netPayable = Math.max(0, finalTax - ((Number(taxesPaid?.tds)||0) + (Number(taxesPaid?.advanceTax)||0)));

        let suggestions = [];
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Indian Tax Advice. Income: ₹${grossTotalIncome}, Tax: ₹${netPayable}. Give 3 short tips.`;
                const result = await model.generateContent(prompt);
                suggestions = result.response.text().split('\n').filter(s => s.length > 5).slice(0, 3);
            } catch (e) { console.log("AI Error", e.message); }
        }

        if (userId) {
            // SAVE TO DB: We use the FIXED 'salaryRecord' here
            await TaxRecord.create({
                user: userId, financialYear, ageGroup, residentialStatus,
                income: { ...income, salary: salaryRecord }, 
                deductions, taxesPaid,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, netTaxPayable: netPayable, regimeSelected: recommendation, suggestions },
                grossTotalIncome
            });
        }

        res.json({ grossTotalIncome, oldRegime: { tax: Math.round(taxOld) }, newRegime: { tax: Math.round(taxNew) }, netPayable: Math.round(netPayable), recommendation, suggestions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Calculation Failed: " + error.message });
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
    try {
        const { question, calculationData } = req.body;
        if (!genAI) return res.json({ response: "AI Service Unavailable" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const context = `Context: User has Tax Payable ₹${calculationData?.netPayable || 0}. Question: ${question}. Answer in 2 sentences.`;
        const result = await model.generateContent(context);
        res.json({ response: result.response.text() });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ response: "I am having trouble connecting. Try again." });
    }
};

module.exports = { calculateTax, getTaxHistory, deleteTaxRecord, aiTaxAdvisor };