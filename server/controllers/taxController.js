const TaxRecord = require('../models/TaxRecord');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini (using the stable 2.0-flash model)
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
    const limit = 2500000; // ₹25 Lakh limit (Budget 2023)
    
    const cashEquivalent = avgSalary10Months * earnedLeaveBalance; 
    const tenMonthsSalary = 10 * avgSalary10Months;

    const exemptAmount = Math.min(received, limit, cashEquivalent, tenMonthsSalary);
    return { taxable: Math.max(0, received - exemptAmount), exempt: exemptAmount };
};

const calculatePension = (details, isGovt) => {
    // Section 10(10A)
    if (!details) return { taxable: 0, exempt: 0 };
    
    // 1. Uncommuted (Monthly) - Fully Taxable
    let taxable = Number(details.uncommuted) || 0;
    
    // 2. Commuted (Lump Sum)
    if (details.commutedReceived) {
        let exemptCommuted = 0;
        if (isGovt) {
            exemptCommuted = details.commutedReceived;
        } else {
            const totalCorpus = details.commutedReceived / (details.commutationPercentage / 100);
            if (details.hasGratuity) {
                exemptCommuted = totalCorpus / 3; 
            } else {
                exemptCommuted = totalCorpus / 2; 
            }
        }
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
    if (!deductionsInput) return 0;
    let totalDeduction = 0;

    // 80C (Limit 1.5L)
    const sec80C = Math.min(Number(deductionsInput.section80C) || 0, 150000);
    totalDeduction += sec80C;

    // 80D (Health Insurance) - Simplified (User enters total eligible)
    const sec80D = Number(deductionsInput.section80D) || 0;
    totalDeduction += sec80D;

    // 80CCD(1B) (NPS additional 50k)
    const sec80CCD1B = Math.min(Number(deductionsInput.section80CCD1B) || 0, 50000);
    totalDeduction += sec80CCD1B;

    // 80G, 80E, 80TTA
    totalDeduction += (Number(deductionsInput.section80G) || 0);
    totalDeduction += (Number(deductionsInput.section80E) || 0);
    totalDeduction += (Number(deductionsInput.section80TT) || 0);

    return totalDeduction;
};

// ==========================================
//   PART 3: TAX HELPERS
// ==========================================

const calculateSlabTax = (taxableIncome, regime, financialYear, ageGroup) => {
    let tax = 0;
    let income = Math.max(0, Number(taxableIncome));

    if (regime === 'Old') {
        let limit = ageGroup === '>80' ? 500000 : (ageGroup === '60-80' ? 300000 : 250000);
        
        if (income > 1000000) {
            tax += (income - 1000000) * 0.30;
            tax += (1000000 - 500000) * 0.20;
            tax += (500000 - limit) * 0.05;
        } else if (income > 500000) {
            tax += (income - 500000) * 0.20;
            tax += (500000 - limit) * 0.05;
        } else if (income > limit) {
            tax += (income - limit) * 0.05;
        }
        
        // Rebate 87A (Old Regime)
        if (income <= 500000) tax = 0;
    } else {
        // New Regime (FY 2025-26)
        if (financialYear === '2025-2026' || financialYear === '2024-2025') {
            if (income > 2400000) tax += (income - 2400000) * 0.30 + (400000*0.25) + (400000*0.20) + (400000*0.15) + (400000*0.10) + (400000*0.05);
            else if (income > 2000000) tax += (income - 2000000) * 0.25 + (400000*0.20) + (400000*0.15) + (400000*0.10) + (400000*0.05);
            else if (income > 1600000) tax += (income - 1600000) * 0.20 + (400000*0.15) + (400000*0.10) + (400000*0.05);
            else if (income > 1200000) tax += (income - 1200000) * 0.15 + (400000*0.10) + (400000*0.05);
            else if (income > 800000) tax += (income - 800000) * 0.10 + (400000*0.05);
            else if (income > 400000) tax += (income - 400000) * 0.05;
        } else {
            // Older Logic Fallback
            if (income > 1500000) tax += (income - 1500000) * 0.30 + 150000;
            else if (income > 1200000) tax += (income - 1200000) * 0.20 + 90000;
            else if (income > 900000) tax += (income - 900000) * 0.15 + 45000;
            else if (income > 600000) tax += (income - 600000) * 0.10 + 15000;
            else if (income > 300000) tax += (income - 300000) * 0.05;
        }

        // Rebate 87A (New Regime)
        if (financialYear === '2025-2026' && income <= 1200000) tax = 0;
        else if (income <= 700000) tax = 0;
    }
    
    return tax > 0 ? tax * 1.04 : 0;
};

const calculateSurcharge = (tax, taxableIncome, regime) => {
    let rate = 0;
    if (taxableIncome > 50000000) rate = regime === 'Old' ? 0.37 : 0.25; 
    else if (taxableIncome > 20000000) rate = 0.25;
    else if (taxableIncome > 10000000) rate = 0.15;
    else if (taxableIncome > 5000000) rate = 0.10;
    return tax * rate;
};

// --- HELPER 4: AI GEMINI TIPS ---
const getGeminiTips = async (geminiContext) => {
    if (!genAI) return null; 
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
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
//   MAIN CONTROLLER FUNCTIONS
// ==========================================

const calculateTax = async (req, res) => {
    try {
        const { 
            userId, financialYear, ageGroup, residentialStatus, 
            income, deductions, 
            taxesPaid, name, familyStatus, riskTolerance 
        } = req.body;

        let totalSalaryTaxable = 0;
        let salaryExemptions = {};
        
        // --- 1. DETAILED SALARY COMPUTATION ---
        if (income.salary?.enabled) {
            const s = income.salary;
            const isGovt = s.employmentType === 'Government'; 
            let stdDed = (financialYear === '2025-2026' || financialYear === '2024-2025') ? 75000 : 50000;

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

                // F. Perquisites
                const perqs = Number(s.perquisites?.taxableValue) || 0;
                basicTotal += perqs;

                // G. Allowances
                const otherAllowances = Number(s.otherAllowancesTaxable) || 0;
                basicTotal += otherAllowances;

                totalSalaryTaxable = Math.max(0, basicTotal - stdDed);

            } else {
                // Simple Mode
                let basic = (Number(s.basic)||0) + (Number(s.hra)||0) + (Number(s.allowances)||0) + (Number(s.bonus)||0);
                totalSalaryTaxable = Math.max(0, basic - stdDed);
            }
        }

        // --- 2. OTHER HEADS ---
        let businessIncome = 0;
        if (income.business?.enabled) {
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
        const totalDeductions = calculateChapterVIA(deductions, 'Old');
        const netTaxableOld = Math.max(0, grossTotalIncome - totalDeductions);
        const netTaxableNew = Math.max(0, grossTotalIncome); 

        // --- 5. CALCULATE TAX ---
        let taxOld = calculateSlabTax(netTaxableOld, 'Old', financialYear, ageGroup);
        let taxNew = calculateSlabTax(netTaxableNew, 'New', financialYear, ageGroup);
        
        taxOld = (taxOld + calculateSurcharge(taxOld, netTaxableOld, 'Old')) * 1.04;
        taxNew = (taxNew + calculateSurcharge(taxNew, netTaxableNew, 'New')) * 1.04;

        const finalTax = Math.min(taxOld, taxNew);
        const recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // Net Payable
        const totalPaid = (Number(taxesPaid?.tds)||0) + (Number(taxesPaid?.advanceTax)||0) + (Number(taxesPaid?.selfAssessment)||0);
        const netPayable = Math.max(0, finalTax - totalPaid);

        // Advance Tax Schedule
        let advanceTaxSchedule = [];
        if (netPayable > 10000) {
            advanceTaxSchedule = [
                { dueDate: "15th June", percentage: "15%", amountDue: Math.round(finalTax * 0.15) },
                { dueDate: "15th Sept", percentage: "45%", amountDue: Math.round(finalTax * 0.30) },
                { dueDate: "15th Dec", percentage: "75%", amountDue: Math.round(finalTax * 0.30) },
                { dueDate: "15th Mar", percentage: "100%", amountDue: Math.round(finalTax * 0.25) }
            ];
        }

        // --- 6. AI ANALYSIS ---
        const geminiContext = {
            name, age: ageGroup, grossTotalIncome, 
            salaryDetails: income.salary?.detailedMode ? "Detailed Computed" : "Basic",
            exemptionsClaimed: salaryExemptions,
            deductions: deductions,
            oldRegimeTax: Math.round(taxOld),
            newRegimeTax: Math.round(taxNew)
        };
        
        let suggestions = await getGeminiTips(geminiContext);

        // --- 7. SAVE & RESPONSE ---
        if (userId) {
            await TaxRecord.create({
                user: userId, financialYear, ageGroup, residentialStatus, income, deductions, taxesPaid,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, netTaxPayable: netPayable, regimeSelected: recommendation },
                grossTotalIncome
            });
        }

        res.json({
            grossTotalIncome,
            salaryBreakdown: {
                gross: totalSalaryTaxable + (financialYear === '2025-2026'?75000:50000), 
                taxable: totalSalaryTaxable,
                exemptions: salaryExemptions
            },
            deductionsClaimed: totalDeductions,
            oldRegime: { taxableIncome: netTaxableOld, tax: Math.round(taxOld) },
            newRegime: { taxableIncome: netTaxableNew, tax: Math.round(taxNew) },
            netPayable: Math.round(netPayable),
            totalPaid,
            recommendation,
            advanceTaxSchedule,
            suggestions
        });

    } catch (error) {
        console.error("Calc Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// --- RESTORED FUNCTIONS ---

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
        const { question, userProfile, calculationData } = req.body;

        if (!genAI) {
            return res.status(503).json({ 
                response: "AI service is temporarily unavailable." 
            });
        }

        let context = `You are an expert Indian CA. Answer: ${question}\n`;
        
        if (calculationData) {
            context += `Tax Data: Income ₹${calculationData.grossTotalIncome}, Tax ₹${calculationData.netPayable}\n`;
        }
        
        context += `Provide concise, actionable Indian tax advice (max 300 words).`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(context);
        
        res.json({ response: result.response.text() });
    } catch (error) {
        res.status(500).json({ 
            response: "Sorry, I'm having trouble right now. Please try again." 
        });
    }
};

module.exports = { calculateTax, getTaxHistory, deleteTaxRecord, aiTaxAdvisor };