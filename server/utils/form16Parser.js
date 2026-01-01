const pdf = require('pdf-extraction');

// Helper to clean currency strings (e.g., "35,10,628.00" -> 3510628)
const parseAmount = (text) => {
    if (!text) return 0;
    // Remove all non-numeric characters except the decimal point
    const cleanText = text.replace(/[^\d.]/g, '');
    return parseFloat(cleanText) || 0;
};

const parseForm16 = async (dataBuffer) => {
    try {
        const data = await pdf(dataBuffer);
        const text = data.text;

        // ===============================================
        // 1. EXTRACT METADATA (PAN, YEAR)
        // ===============================================
        const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
        const pan = panMatch ? panMatch[0] : null;

        const ayMatch = text.match(/20[2-9][0-9]-[0-9]{2,4}/);
        const assessmentYear = ayMatch ? ayMatch[0] : null;

        // ===============================================
        // 2. EXTRACT TDS (STRICTLY FROM PART A SUMMARY)
        // ===============================================
        // Strategy: Find the "Summary of amount paid..." table and look for the "Total" row.
        // The text often looks like: "Total (Rs).",,"10892684.02","3510628.00","3510628.00"
        let tds = 0;
        
        // Find the specific summary header
        const summaryIndex = text.indexOf("Summary of amount paid/credited");
        if (summaryIndex !== -1) {
            // Grab the next 1000 characters which contains the table
            const summaryBlock = text.substring(summaryIndex, summaryIndex + 2000);
            
            // Regex to find the "Total" row.
            // It looks for "Total" followed by 3 numbers.
            // Group 1: Amount Paid, Group 2: Tax Deducted, Group 3: Tax Deposited
            const totalRowPattern = /Total\s*\(Rs\)\.?.*?,["\s]*([\d,.]+).*?,["\s]*([\d,.]+).*?,["\s]*([\d,.]+)/i;
            const match = summaryBlock.match(totalRowPattern);
            
            if (match && match[2]) {
                tds = parseAmount(match[2]);
            }
        }

        // Fallback: If Part A parsing fails, look for "Net tax payable" (High confidence backup)
        if (tds === 0) {
            const fallbackTds = text.match(/Net tax payable[\s\S]{0,50}?([\d,]+\.\d{2})/i);
            if (fallbackTds) tds = parseAmount(fallbackTds[1]);
        }

        // ===============================================
        // 3. EXTRACT SALARY & DEDUCTIONS (PART B)
        // ===============================================
        
        // Gross Salary: Look for Section 17(1) or "Gross Salary" header
        const grossSalaryMatch = text.match(/Salary as per provisions contained in section 17\(1\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const grossSalary = grossSalaryMatch ? parseAmount(grossSalaryMatch[1]) : 0;

        // Exemptions u/s 10: Look for "Total amount of exemption claimed under section 10"
        // This handles HRA, LTA etc.
        const exemptMatch = text.match(/Total amount of exemption claimed under section 10[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const exemptions = exemptMatch ? parseAmount(exemptMatch[1]) : 0;

        // Standard Deduction: Look for Section 16(ia)
        const stdDedMatch = text.match(/Standard deduction under section 16\(ia\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const standardDeduction = stdDedMatch ? parseAmount(stdDedMatch[1]) : 0;

        // Professional Tax: Look for Section 16(iii)
        const profTaxMatch = text.match(/Tax on employment under section 16\(iii\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const professionalTax = profTaxMatch ? parseAmount(profTaxMatch[1]) : 0;

        // ===============================================
        // 4. CHAPTER VI-A DEDUCTIONS
        // ===============================================
        
        // 80C
        const ded80cMatch = text.match(/Total deduction under section 80C.*?([\d,]+\.\d{2})/i);
        const ded80c = ded80cMatch ? parseAmount(ded80cMatch[1]) : 0;

        // 80D (Health Insurance)
        const ded80dMatch = text.match(/section 80D[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const ded80d = ded80dMatch ? parseAmount(ded80dMatch[1]) : 0;

        // 80G (Donations)
        const ded80gMatch = text.match(/section 80G[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const ded80g = ded80gMatch ? parseAmount(ded80gMatch[1]) : 0;

        return {
            success: true,
            data: {
                pan,
                assessmentYear,
                salary: {
                    gross: grossSalary,
                    exemptions: exemptions, // HRA, LTA
                    standardDeduction: standardDeduction,
                    professionalTax: professionalTax
                },
                deductions: {
                    section80C: ded80c,
                    section80D: ded80d,
                    section80G: ded80g
                },
                tds: tds
            }
        };

    } catch (error) {
        console.error("PDF Parsing Error:", error);
        return { success: false, error: "Failed to parse PDF: " + error.message };
    }
};

module.exports = parseForm16;