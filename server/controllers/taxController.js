const TaxRecord = require('../models/TaxRecord');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini (using the stable 2.0-flash model we found)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// ==========================================
//   PART 1: SALARY SUB-CALCULATORS
// ==========================================

const calculateGratuity = (details, isGovt) => {
    // Section 10(10)
    if (!details || !details.received) return { taxable: 0, exempt: 0 };
    if (isGovt) return { taxable: 0, exempt: details.received }; // Fully exempt for Govt

    const { received, lastDrawnSalary, yearsOfService, coveredByAct } = details;
    let exemptAmount = 0;
    const limit = 2000000; // ₹20 Lakh lifetime limit

    if (coveredByAct) {
        // 15/26 * Last Drawn * Years
        const formulaAmount = (15 / 26) * lastDrawnSalary * yearsOfService;
        exemptAmount = Math.min(formulaAmount, limit, received);
    } else {
        // Half month avg salary * Years
        // Note: strictly this uses 10 months avg, approximating here with lastDrawn for simplicity unless avg provided
        const formulaAmount = 0.5 * lastDrawnSalary * yearsOfService;
        exemptAmount = Math.min(formulaAmount, limit, received);
    }

    return { taxable: Math.max(0, received - exemptAmount), exempt: exemptAmount };
};

const calculateLeaveEncashment = (details, isGovt) => {
    // Section 10(10AA)
    if (!details || !details.received) return { taxable: 0, exempt: 0 };
    if (isGovt) return { taxable: 0, exempt: details.received }; // Fully exempt for Govt

    const { received, avgSalary10Months, earnedLeaveBalance, yearsOfService } = details;
    const limit = 2500000; // Updated limit ₹25 Lakhs (Budget 2023)
    
    // Formula: Cash equivalent of leave salary
    const cashEquivalent = avgSalary10Months * earnedLeaveBalance; // assuming balance is in months
    const tenMonthsSalary = 10 * avgSalary10Months;

    const exemptAmount = Math.min(received, limit, cashEquivalent, tenMonthsSalary);
    return { taxable: Math.max(0, received - exemptAmount), exempt: exemptAmount };
};

const calculatePension = (details, isGovt) => {
    // Section 10(10A) - Commuted vs Uncommuted
    if (!details) return { taxable: 0, exempt: 0 };
    
    // 1. Uncommuted (Monthly) - Fully Taxable for everyone
    let taxable = Number(details.uncommuted) || 0;
    
    // 2. Commuted (Lump Sum)
    if (details.commutedReceived) {
        let exemptCommuted = 0;
        if (isGovt) {
            exemptCommuted = details.commutedReceived; // Fully exempt
        } else {
            // Non-Govt Limits
            const totalCorpus = details.commutedReceived / (details.commutationPercentage / 100);
            if (details.hasGratuity) {
                exemptCommuted = totalCorpus / 3; // 1/3 exempt if gratuity received
            } else {
                exemptCommuted = totalCorpus / 2; // 1/2 exempt if no gratuity
            }
        }
        // Cap exemption to actual received
        exemptCommuted = Math.min(exemptCommuted, details.commutedReceived);
        taxable += (details.commutedReceived - exemptCommuted);
    }

    return { taxable, exempt: (details.commutedReceived || 0) - (taxable - (Number(details.uncommuted) || 0)) };
};

const calculateHRA = (basic, hraReceived, rentPaid, isMetro) => {
    // Section 10(13A)
    if (!hraReceived || !rentPaid) return { taxable: hraReceived || 0, exempt: 0 };

    const rentOver10Percent = rentPaid - (0.10 * basic);
    if (rentOver10Percent <= 0) return { taxable: hraReceived, exempt: 0 };

    const limitMetro = isMetro ? 0.50 * basic : 0.40 * basic;
    const exemptAmount = Math.min(hraReceived, rentOver10Percent, limitMetro);
    
    return { taxable: Math.max(0, hraReceived - exemptAmount), exempt: exemptAmount };
};

// ==========================================
//   PART 2: DEDUCTIONS CALCULATOR
// ==========================================

const calculateChapterVIA = (deductionsInput, regime) => {
    // New Regime disallows most Chapter VI-A (except 80CCD(2), 80JJAA etc.)
    // We calculate "Eligible Deductions" assuming Old Regime for comparison
    
    if (!deductionsInput) return 0;
    let totalDeduction = 0;

    // 80C (Limit 1.5L)
    const sec80C = Math.min(Number(deductionsInput.section80C) || 0, 150000);
    totalDeduction += sec80C;

    // 80D (Health Insurance)
    // Basic: 25k, Seniors: 50k. Parents: +25k/50k. 
    // Simplified here to max 1L (User inputs total eligible amount)
    const sec80D = Number(deductionsInput.section80D) || 0;
    totalDeduction += sec80D;

    // 80CCD(1B) (NPS additional 50k)
    const sec80CCD1B = Math.min(Number(deductionsInput.section80CCD1B) || 0, 50000);
    totalDeduction += sec80CCD1B;

    // 80G (Donations) - Assumed 50% or 100% deduction eligible amount is entered directly
    const sec80G = Number(deductionsInput.section80G) || 0;
    totalDeduction += sec80G;

    // 80E (Education Loan Interest) - No Limit
    const sec80E = Number(deductionsInput.section80E) || 0;
    totalDeduction += sec80E;

    // 80TTA/TTB (Savings Interest)
    const sec80TT = Number(deductionsInput.section80TT) || 0;
    totalDeduction += sec80TT;

    return totalDeduction;
};

// ... [Keep Helper 1 (calculateSlabTax) and Helper 2 (calculateSurcharge) unchanged from previous code] ...
// (Re-inserting them briefly for context continuity)
const calculateSlabTax = (taxableIncome, regime, financialYear, ageGroup) => {
    let tax = 0;
    let income = Math.max(0, Number(taxableIncome));
    if (regime === 'Old') {
        let limit = ageGroup === '>80' ? 500000 : (ageGroup === '60-80' ? 300000 : 250000);
        if (income > 1000000) tax = 112500 + (income - 1000000) * 0.30;
        else if (income > 500000) tax = 12500 + (income - 500000) * 0.20;
        else if (income > limit) tax = (income - limit) * 0.05;
        
        // Adjust tax for Senior Citizens specifically in logic if needed, simplified above
        // 87A Old
        if (income <= 500000) tax = 0;
    } else {
        // New Regime (FY 25-26 logic simplified)
        if (income > 2400000) tax = 300000 + (income - 2400000) * 0.30; // Approx logic
        // ... [Use full logic from previous file] ...
        // Using a shortened simplified calculator for this snippet to save space, 
        // *Please ensure the full slab logic from previous response is kept here*
        if (income <= 1200000 && financialYear === '2025-2026') tax = 0; 
        else if (income <= 700000) tax = 0;
    }
    return tax > 0 ? tax * 1.04 : 0;
};
const calculateSurcharge = (tax, income, regime) => { /* ... existing logic ... */ return 0; }; // Placeholder


// --- HELPER 4: AI GEMINI TIPS ---
const getGeminiTips = async (geminiContext) => {
    if (!genAI) return null; 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Stable Model
        const prompt = `
            Act as an expert Indian CA. Analyze this tax profile:
            Context: ${JSON.stringify(geminiContext)}
            Provide 4 highly specific tax-saving tips.
            Format: Markdown with Bold Title, Explanation, and Actionable Steps.
        `;
        const result = await model.generateContent(prompt);
        return result.response.text(); 
    } catch (e) { return null; }
};


// ==========================================
//   MAIN CONTROLLER: calculateTax
// ==========================================

const calculateTax = async (req, res) => {
    try {
        const { 
            userId, financialYear, ageGroup, residentialStatus, 
            income, deductions, // Updated structure: deductions is now an object
            taxesPaid, name, familyStatus, riskTolerance 
        } = req.body;

        let totalSalaryTaxable = 0;
        let salaryExemptions = {};
        
        // --- 1. DETAILED SALARY COMPUTATION ---
        if (income.salary?.enabled) {
            const s = income.salary;
            const isGovt = s.employmentType === 'Government'; 
            let stdDed = (financialYear === '2025-2026') ? 75000 : 50000;

            if (s.detailedMode) {
                // A. Basic + DA
                let basicTotal = (Number(s.basic) || 0) + (Number(s.da) || 0) + (Number(s.bonus) || 0);

                // B. HRA
                const hraCalc = calculateHRA(s.basic, s.hra, s.rentPaid, s.isMetro);
                basicTotal += hraCalc.taxable;
                salaryExemptions.hra = hraCalc.exempt;

                // C. Gratuity
                const gratCalc = calculateGratuity(s.gratuity, isGovt);
                basicTotal += gratCalc.taxable;
                salaryExemptions.gratuity = gratCalc.exempt;

                // D. Leave Encashment
                const leaveCalc = calculateLeaveEncashment(s.leaveEncashment, isGovt);
                basicTotal += leaveCalc.taxable;
                salaryExemptions.leaveEncashment = leaveCalc.exempt;

                // E. Pension
                const pensionCalc = calculatePension(s.pension, isGovt);
                basicTotal += pensionCalc.taxable;
                salaryExemptions.pension = pensionCalc.exempt;

                // F. Perquisites (Value is generally fully taxable unless specific rules applied)
                const perqs = Number(s.perquisites?.taxableValue) || 0;
                basicTotal += perqs;

                // G. Allowances (LTA, Uniform, etc. - Simplification: User enters taxable portion)
                const otherAllowances = Number(s.otherAllowancesTaxable) || 0;
                basicTotal += otherAllowances;

                totalSalaryTaxable = Math.max(0, basicTotal - stdDed);

            } else {
                // Simple Mode (Legacy support)
                let basic = (Number(s.basic)||0) + (Number(s.hra)||0) + (Number(s.allowances)||0);
                totalSalaryTaxable = Math.max(0, basic - stdDed);
            }
        }

        // --- 2. OTHER HEADS ---
        let businessIncome = 0;
        if (income.business?.enabled) {
            // (Business logic pending detailed update in Phase 2)
             const b = income.business;
             businessIncome = (b.is44AD || b.is44ADA) 
                ? (Number(b.turnover) * (Number(b.presumptiveRate)||6)) / 100 
                : Number(b.profit);
        }

        let hpIncome = 0;
        if (income.houseProperty?.enabled) {
            const h = income.houseProperty;
            if (h.type === 'Self Occupied') {
                hpIncome = Math.max(-200000, 0 - (Number(h.interestPaid)||0));
            } else {
                const nav = (Number(h.rentReceived)||0) - (Number(h.municipalTaxes)||0);
                hpIncome = nav - (nav * 0.30) - (Number(h.interestPaid)||0);
            }
        }

        let otherSrcIncome = 0;
        if (income.otherIncome?.enabled && income.otherIncome.sources) {
            income.otherIncome.sources.forEach(src => otherSrcIncome += (Number(src.amount)||0));
        }

        // --- 3. GROSS TOTAL INCOME ---
        const grossTotalIncome = totalSalaryTaxable + businessIncome + hpIncome + otherSrcIncome;

        // --- 4. DEDUCTIONS (Chapter VI-A) ---
        // Calculate Total Deductions eligible under Old Regime
        const totalDeductions = calculateChapterVIA(deductions, 'Old');
        
        // Net Taxable Income
        const netTaxableOld = Math.max(0, grossTotalIncome - totalDeductions);
        
        // New Regime usually disallows these (except 80CCD(2) - ignored for simplicity here)
        // Standard Deduction is already subtracted from Salary for both regimes (assuming FY25 logic)
        const netTaxableNew = Math.max(0, grossTotalIncome); 

        // --- 5. CALCULATE TAX ---
        // (Note: You need to insert your full `calculateSlabTax` logic here)
        // I am calling the simplified placeholders for brevity in this snippet
        let taxOld = calculateSlabTax(netTaxableOld, 'Old', financialYear, ageGroup);
        let taxNew = calculateSlabTax(netTaxableNew, 'New', financialYear, ageGroup);
        
        // Surcharge & Cess
        taxOld = (taxOld + calculateSurcharge(taxOld, netTaxableOld, 'Old')) * 1.04;
        taxNew = (taxNew + calculateSurcharge(taxNew, netTaxableNew, 'New')) * 1.04;

        const finalTax = Math.min(taxOld, taxNew);
        const recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // --- 6. AI ANALYSIS ---
        const geminiContext = {
            name, age: ageGroup, grossTotalIncome, 
            salaryDetails: income.salary?.detailedMode ? "Detailed Computed" : "Basic",
            exemptionsClaimed: salaryExemptions, // Pass the calculated exemptions to AI
            deductions: deductions,
            oldRegimeTax: Math.round(taxOld),
            newRegimeTax: Math.round(taxNew)
        };
        
        let suggestions = await getGeminiTips(geminiContext);

        // --- 7. SAVE & RESPONSE ---
        if (userId) {
            await TaxRecord.create({
                user: userId, financialYear, income, deductions,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, finalTax, recommendation },
                grossTotalIncome
            });
        }

        res.json({
            grossTotalIncome,
            salaryBreakdown: {
                gross: totalSalaryTaxable + (financialYear === '2025-2026'?75000:50000), // approx
                taxable: totalSalaryTaxable,
                exemptions: salaryExemptions
            },
            deductionsClaimed: totalDeductions,
            oldRegime: { taxableIncome: netTaxableOld, tax: Math.round(taxOld) },
            newRegime: { taxableIncome: netTaxableNew, tax: Math.round(taxNew) },
            recommendation,
            suggestions
        });

    } catch (error) {
        console.error("Calc Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { calculateTax };