const pdf = require('pdf-parse'); // Switched back to standard library

// Helper to clean currency strings
const parseAmount = (text) => {
    if (!text) return 0;
    const cleanText = text.replace(/[^\d.]/g, '');
    return parseFloat(cleanText) || 0;
};

const parseForm16 = async (dataBuffer) => {
    try {
        // Standard pdf-parse call
        const data = await pdf(dataBuffer);
        const text = data.text;

        // --- 1. METADATA ---
        const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
        const pan = panMatch ? panMatch[0] : null;
        
        const ayMatch = text.match(/20[2-9][0-9]-[0-9]{2,4}/);
        const assessmentYear = ayMatch ? ayMatch[0] : null;

        // --- 2. TDS (Part A Summary) ---
        let tds = 0;
        // Look for "Total" row in summary table
        // Matches pattern: Total ... 10,00,000 ... 3,50,000 ... 3,50,000
        const totalRowPattern = /Total\s*\(Rs\)\.?.*?,["\s]*([\d,.]+).*?,["\s]*([\d,.]+).*?,["\s]*([\d,.]+)/i;
        const tdsMatch = text.match(totalRowPattern);
        if (tdsMatch && tdsMatch[2]) {
            tds = parseAmount(tdsMatch[2]);
        }
        
        // Fallback for TDS
        if (tds === 0) {
            const fallback = text.match(/Net tax payable[\s\S]{0,50}?([\d,]+\.\d{2})/i);
            if (fallback) tds = parseAmount(fallback[1]);
        }

        // --- 3. SALARY & DEDUCTIONS ---
        const grossSalaryMatch = text.match(/Salary as per provisions contained in section 17\(1\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const grossSalary = grossSalaryMatch ? parseAmount(grossSalaryMatch[1]) : 0;

        const exemptMatch = text.match(/Total amount of exemption claimed under section 10[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const exemptions = exemptMatch ? parseAmount(exemptMatch[1]) : 0;

        const stdDedMatch = text.match(/Standard deduction under section 16\(ia\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const standardDeduction = stdDedMatch ? parseAmount(stdDedMatch[1]) : 0;

        const profTaxMatch = text.match(/Tax on employment under section 16\(iii\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const professionalTax = profTaxMatch ? parseAmount(profTaxMatch[1]) : 0;

        const ded80cMatch = text.match(/Total deduction under section 80C.*?([\d,]+\.\d{2})/i);
        const ded80c = ded80cMatch ? parseAmount(ded80cMatch[1]) : 0;

        const ded80dMatch = text.match(/section 80D[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const ded80d = ded80dMatch ? parseAmount(ded80dMatch[1]) : 0;

        return {
            success: true,
            data: {
                pan, assessmentYear, tds,
                salary: { gross: grossSalary, exemptions, standardDeduction, professionalTax },
                deductions: { section80C: ded80c, section80D: ded80d, section80G: 0 }
            }
        };

    } catch (error) {
        console.error("PDF Parsing Error:", error);
        // Return empty structure instead of crashing
        return { success: false, error: "Failed to parse PDF" };
    }
};

module.exports = parseForm16;