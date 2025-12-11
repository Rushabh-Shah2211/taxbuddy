const TaxRecord = require('../models/TaxRecord');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
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
        
        if (income <= 500000) tax = 0; // 87A Old
    } 
    // --- NEW REGIME ---
    else {
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

// --- HELPER 3: ROBUST STATIC FALLBACK ---
const getStaticTips = (inputs, taxOld, taxNew) => {
    let tips = [];
    
    // 1. Regime Tip
    if (taxNew < taxOld) tips.push(`✅ **Switch to New Regime:** Saves you ₹${(taxOld - taxNew).toLocaleString()}.`);
    else tips.push(`📋 **Stick to Old Regime:** Your deductions make it better.`);
    
    // 2. Business Tip
    if (inputs.income.business?.enabled && !inputs.income.business.is44AD) 
        tips.push(`🏢 **Section 44AD:** Freelancers can declare 50% profit to save huge tax.`);

    // 3. Investment Tip (High Income / General)
    if (taxNew > 100000) {
        tips.push(`📈 **Wealth Creation:** Consider Nifty 50 Index Funds for long-term growth.`);
    } else {
        tips.push(`💰 **Secure Future:** Invest in PPF or Sukanya Samriddhi for risk-free returns.`);
    }
    
    return tips;
};

// --- HELPER 4: AI GEMINI TIPS (ENHANCED CA PERSONA) ---
const getGeminiTips = async (userData) => {
    if (!genAI) return null; 

    try {
        // UPDATED MODEL NAME HERE
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
        
        // Calculate Assessment Year (Usually FY + 1)
        const fyParts = userData.financialYear.split('-');
        const ayYear = `${parseInt(fyParts[0]) + 1}-${parseInt(fyParts[1]) + 1}`;

        const prompt = `
You are a certified Chartered Accountant (CA) and SEBI-registered investment advisor with 20+ years of experience in India, specializing in personalized strategies for tax optimization under the Income Tax Act, 1961, and smart investing via RBI/SEBI-regulated avenues. Your goal is to empower users with actionable, legal insights that feel tailored and encouraging, while always prioritizing accuracy, ethics, and user privacy. Never give personalized financial advice that could be construed as professional counsel—end with a clear disclaimer.

**User Context:**
- Name: ${userData.name}
- Annual Gross Income: ₹${userData.grossTotal.toLocaleString('en-IN')}
- Taxable Income After Deductions: ₹${userData.netTaxable.toLocaleString('en-IN')}
- Current Tax Liability: ₹${userData.taxLiability.toLocaleString('en-IN')} (for Assessment Year ${ayYear} i.e., Financial Year ${userData.financialYear})
- Key Deductions/Credits Already Claimed: ${userData.deductionsList}
- Age: ${userData.age}
- Family Status: ${userData.familyStatus}
- Risk Tolerance for Investments: ${userData.riskTolerance}
- Other Relevant Details: ${userData.context}

**Task:**
Analyze the user's tax computation and generate 4-6 highly relevant, prioritized tips. Focus on:
- **Tax-Saving Strategies**: Legal ways to reduce taxable income or liability under the Income Tax Act (e.g., maximizing deductions under Sections 80C/80D/80G, exemptions like HRA/LTA, or rebates/credits like Section 87A for incomes up to ₹5 lakh under new regime).
- **Investment Opportunities**: Low-to-moderate risk, tax-advantaged options aligned with Indian regulations (e.g., ELSS funds under 80C, PPF/NSC for Section 80C, NPS for 80CCD(1B), or tax-free bonds). Tie them to potential after-tax returns, considering inflation and LTCG/STCG rules.
Prioritize tips with the highest impact first (e.g., quick wins like overlooked Section 80C limits before long-term NPS). Ensure tips are feasible based on the user's age, income, and status—avoid suggesting anything unrealistic (e.g., no high-risk equity for seniors; respect ₹1.5 lakh cap under 80C).

**Output Format:**
Respond in a warm, conversational tone like a trusted CA chatting over chai. Structure as follows:
1. **Opening Hook**: A 1-2 sentence empathetic intro summarizing their situation positively.
2. **Tips Section**: Bullet-point list of 4-6 tips. For each:
   - **Bold Tip Title**: Short and catchy.
   - **Explanation**: 1-2 sentences on why it fits their profile and Indian tax rules.
   - **Potential Impact**: Rough estimate of savings/returns.
   - **Action Steps**: 2-3 simple, numbered steps to implement.
3. **Closing Motivation**: 1 sentence encouraging next steps.
4. **Disclaimer**: In italics: "This is general guidance based on current Indian tax laws—I'm not a substitute for a licensed CA or advisor. Consult a professional and verify on incometax.gov.in for your unique situation, as rules may change."

Keep the entire response concise (under 500 words), evidence-based, and optimistic. Use simple language—no jargon without explanation.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text(); 

    } catch (error) {
        console.error("Gemini Error (Using Fallback):", error.message);
        return null; 
    }
};

// --- MAIN CONTROLLER ---
const calculateTax = async (req, res) => {
    try {
        // Updated destructuring to include personalization fields
        const { 
            userId, financialYear, ageGroup, residentialStatus, income, taxesPaid, 
            name, familyStatus, riskTolerance, deductions // deductions might be passed if added in UI
        } = req.body;

        // 1. Calculate Income
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
        
        // Note: Chapter VI-A Deductions (80C etc) would normally be subtracted here. 
        // Using grossTotal as netTaxable for now if deductions aren't provided in body logic.
        const netTaxable = Math.max(0, grossTotal); 

        // 2. Tax Calc
        let taxOld = calculateSlabTax(netTaxable, 'Old', financialYear, ageGroup);
        taxOld += calculateSurcharge(taxOld, netTaxable, 'Old');
        taxOld *= 1.04;

        let taxNew = calculateSlabTax(netTaxable, 'New', financialYear, ageGroup);
        taxNew += calculateSurcharge(taxNew, netTaxable, 'New');
        taxNew *= 1.04;

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

        // 4. GET TIPS (AI or Static)
        // Construct the rich context for the new CA Persona
        const geminiContext = {
            name: name || "User",
            grossTotal: grossTotal,
            netTaxable: netTaxable,
            taxLiability: finalTax,
            financialYear: financialYear,
            deductionsList: deductions 
                ? JSON.stringify(deductions) 
                : `Standard Deduction of ₹${stdDed} (Salary). No other major deductions detected in input.`,
            age: ageGroup || "Unknown",
            familyStatus: familyStatus || "Single/Unknown",
            riskTolerance: riskTolerance || "Moderate",
            context: `Residential Status: ${residentialStatus}. Recommendation computed: ${recommendation}.`
        };

        let suggestions = await getGeminiTips(geminiContext);
        
        // Safety: If AI fails, use Static. 
        // Note: Static returns array, AI returns String (Markdown). Frontend should handle both.
        if (!suggestions) {
            suggestions = getStaticTips(req.body, taxOld, taxNew);
        }

        // 5. Save & Return
        if (userId) {
            await TaxRecord.create({
                user: userId, financialYear, ageGroup, residentialStatus, income, taxesPaid,
                computedTax: { oldRegimeTax: taxOld, newRegimeTax: taxNew, taxPayable: finalTax, netTaxPayable: netPayable, regimeSelected: recommendation },
                grossTotalIncome: grossTotal
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