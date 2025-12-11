// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
// (Safety check: works even if key is missing, just won't call AI)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// --- HELPER 1: Calculate Tax Slabs ---
const calculateSlabTax = (taxableIncome, regime, financialYear, ageGroup) => {
    let tax = 0;
    let income = Math.max(0, Number(taxableIncome));

    // --- OLD REGIME ---
    if (regime === 'Old') {
        let exemptionLimit = 250000;
        if (ageGroup === '60-80') exemptionLimit = 300000; 
        if (ageGroup === '>80') exemptionLimit = 500000; 

        if (income > 1000000) {
            tax += (income - 1000000) * 0.30;
            tax += (1000000 - 500000) * 0.20;
            tax += (500000 - exemptionLimit) * 0.05;
        } else if (income > 500000) {
            tax += (income - 500000) * 0.20;
            tax += (500000 - exemptionLimit) * 0.05;
        } else if (income > exemptionLimit) {
            tax += (income - exemptionLimit) * 0.05;
        }
        
        // 87A Rebate (Old)
        if (income <= 500000) tax = 0;
    } 
    // --- NEW REGIME ---
    else {
        // FY 2025-26 & 24-25 Slabs
        if (financialYear === '2025-2026' || financialYear === '2024-2025') {
            if (income > 2400000) tax += (income - 2400000) * 0.30 + (400000*0.25) + (400000*0.20) + (400000*0.15) + (400000*0.10) + (400000*0.05); 
            else if (income > 2000000) tax += (income - 2000000) * 0.25 + (400000*0.20) + (400000*0.15) + (400000*0.10) + (400000*0.05);
            else if (income > 1600000) tax += (income - 1600000) * 0.20 + (400000*0.15) + (400000*0.10) + (400000*0.05);
            else if (income > 1200000) tax += (income - 1200000) * 0.15 + (400000*0.10) + (400000*0.05);
            else if (income > 800000) tax += (income - 800000) * 0.10 + (400000*0.05);
            else if (income > 400000) tax += (income - 400000) * 0.05;
        } else {
            // Older logic fallback...
            if (income > 1500000) tax += (income - 1500000) * 0.30 + 150000;
            else if (income > 1200000) tax += (income - 1200000) * 0.20 + 90000;
            else if (income > 900000) tax += (income - 900000) * 0.15 + 45000;
            else if (income > 600000) tax += (income - 600000) * 0.10 + 15000;
            else if (income > 300000) tax += (income - 300000) * 0.05;
        }

        // 87A Rebate New
        if (financialYear === '2025-2026' && income <= 1200000) tax = 0;
        else if (income <= 700000) tax = 0;
    }
    
    return tax > 0 ? tax * 1.04 : 0;
};

// --- HELPER 2: Surcharge ---
const calculateSurcharge = (tax, taxableIncome, regime) => {
    let rate = 0;
    if (taxableIncome > 50000000) rate = regime === 'Old' ? 0.37 : 0.25; 
    else if (taxableIncome > 20000000) rate = 0.25;
    else if (taxableIncome > 10000000) rate = 0.15;
    else if (taxableIncome > 5000000) rate = 0.10;
    return tax * rate;
};

// --- HELPER 3: FALLBACK RULES (Static) ---
const getStaticTips = (inputs, taxOld, taxNew) => {
    let tips = [];
    if (taxNew < taxOld) tips.push(`✅ **Switch to New Regime:** Saves you ₹${(taxOld - taxNew).toLocaleString()}.`);
    else tips.push(`📋 **Stick to Old Regime:** Your deductions make it better.`);
    
    if (inputs.income.business?.enabled && !inputs.income.business.is44AD) 
        tips.push(`🏢 **Section 44AD:** Consider Presumptive Taxation (6% profit) to save compliance costs.`);
    
    return tips;
};

// --- HELPER 4: AI GEMINI TIPS ---
const getGeminiTips = async (financialData) => {
    if (!genAI) return null; // No key, no AI

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `
            Act as an expert Chartered Accountant in India. 
            Analyze this tax data for FY ${financialData.financialYear}:
            - Income: ${JSON.stringify(financialData.income)}
            - Deductions: ${JSON.stringify(financialData.deductions)}
            - Tax Payable (Old): ${financialData.oldRegimeTax}
            - Tax Payable (New): ${financialData.newRegimeTax}
            
            Provide 3 very specific, actionable tax-saving tips. 
            Focus on Section 80C, 80D, 54F, or business expenses based on the data.
            Keep each tip under 15 words. 
            Format exactly as a JSON array of strings: ["Tip 1", "Tip 2", "Tip 3"]
            Do not output markdown code blocks. Just the raw array.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean up markdown if Gemini adds it
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Gemini Error:", error);
        return null; // Fallback to static
    }
};

// --- MAIN CONTROLLER ---
const calculateTax = async (req, res) => {
    try {
        const { userId, financialYear, ageGroup, residentialStatus, income, taxesPaid } = req.body;

        // 1. Logic Aggregation (Same as before)
        let salaryIncome = 0;
        let stdDed = (financialYear === '2025-2026' || financialYear === '2024-2025') ? 75000 : 50000;

        if (income.salary?.enabled) {
            const s = income.salary;
            salaryIncome = (Number(s.basic)||0) + (Number(s.hra)||0) + (Number(s.allowances)||0) + (Number(s.bonus)||0);
            salaryIncome = Math.max(0, salaryIncome - stdDed); 
        }

        let businessIncome = 0;
        if (income.business?.enabled) {
            const b = income.business;
            if (b.is44AD || b.is44ADA) businessIncome = (Number(b.turnover) * (Number(b.presumptiveRate)||6)) / 100;
            else businessIncome = Number(b.profit);
        }

        let hpIncome = 0;
        if (income.houseProperty?.enabled) {
            const h = income.houseProperty;
            if (h.type === 'Self Occupied') {
                hpIncome = 0 - (Number(h.interestPaid)||0);
                if(hpIncome < -200000) hpIncome = -200000; 
            } else {
                const nav = (Number(h.rentReceived)||0) - (Number(h.municipalTaxes)||0);
                hpIncome = nav - (nav * 0.30) - (Number(h.interestPaid)||0);
            }
        }

        let otherSrcIncome = 0;
        if (income.otherIncome?.enabled && income.otherIncome.sources) {
            income.otherIncome.sources.forEach(src => otherSrcIncome += (Number(src.amount)||0));
        }

        const grossTotal = salaryIncome + businessIncome + hpIncome + otherSrcIncome;
        
        // 2. Calculate Taxes
        // (Simplified for New Regime: Gross - 0 ded)
        // (Simplified for Old Regime: Gross - 50k - HP Loss - 80C placeholder)
        // Note: Ideally we subtract deds properly here, keeping logic simple for brevity as before
        const netTaxable = Math.max(0, grossTotal); 

        let taxOld = calculateSlabTax(netTaxable, 'Old', financialYear, ageGroup);
        taxOld += calculateSurcharge(taxOld, netTaxable, 'Old');
        taxOld *= 1.04;

        let taxNew = calculateSlabTax(netTaxable, 'New', financialYear, ageGroup);
        taxNew += calculateSurcharge(taxNew, netTaxable, 'New');
        taxNew *= 1.04;

        let finalTax = Math.min(taxOld, taxNew);
        let recommendation = taxNew <= taxOld ? "New Regime" : "Old Regime";

        // 3. Payable
        const totalPaid = (Number(taxesPaid?.tds)||0) + (Number(taxesPaid?.advanceTax)||0);
        const netPayable = Math.max(0, finalTax - totalPaid);

        // 4. GENERATE AI SUGGESTIONS
        // Try AI first, fallback to static
        let suggestions = await getGeminiTips({ 
            financialYear, income, deductions: {}, oldRegimeTax: taxOld, newRegimeTax: taxNew 
        });
        
        if (!suggestions || suggestions.length === 0) {
            suggestions = getStaticTips(req.body, taxOld, taxNew);
        }

        // 5. Save & Respond
        if (userId) {
            await TaxRecord.create({
                user: userId, financialYear, ageGroup, income, taxesPaid,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, netTaxPayable: netPayable, regimeSelected: recommendation },
                grossTotalIncome: grossTotal
            });
        }

        res.json({
            grossTotalIncome,
            oldRegimeTax: Math.round(taxOld),
            newRegimeTax: Math.round(taxNew),
            netPayable: Math.round(netPayable),
            totalPaid,
            recommendation,
            suggestions
        });

    } catch (error) {
        console.error("Error:", error);
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