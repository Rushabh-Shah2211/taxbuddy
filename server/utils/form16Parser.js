const pdf = require('pdf-extraction');

// Helper: Cleans "10,64,836.00" -> 1064836
const parseAmount = (text) => {
    if (!text) return 0;
    const clean = text.replace(/[^\d.]/g, '');
    const val = parseFloat(clean);
    // Filter: Ignore small numbers (Section numbers like 17, 16, 80)
    return (isNaN(val) || val < 100) ? 0 : val;
};

const parseForm16 = async (dataBuffer) => {
    try {
        const data = await pdf(dataBuffer);
        const text = data.text;

        // --- 1. METADATA ---
        const pan = (text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/) || [])[0] || null;
        const ay = (text.match(/20[2-9][0-9]-[0-9]{2,4}/) || [])[0] || null;

        // --- 2. SALARY COMPONENTS (Part B) ---
        
        // Gross Salary: Scans for '17(1)' and grabs the large number nearby
        const grossMatch = text.match(/section 17\(1\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const grossSalary = grossMatch ? parseAmount(grossMatch[1]) : 0;

        // Standard Deduction: Scans for '16(ia)'
        const stdDedMatch = text.match(/section 16\(ia\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const standardDeduction = stdDedMatch ? parseAmount(stdDedMatch[1]) : 75000; // Default to 75k if not found

        // Professional Tax: Scans for '16(iii)'
        const profTaxMatch = text.match(/section 16\(iii\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const professionalTax = profTaxMatch ? parseAmount(profTaxMatch[1]) : 0;

        // Exemptions u/s 10 (HRA/LTA/etc)
        const exemptMatch = text.match(/exemption claimed under section 10[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const exemptions = exemptMatch ? parseAmount(exemptMatch[1]) : 0;

        // --- 3. DEDUCTIONS (Chapter VI-A) ---
        const ded80cMatch = text.match(/section 80C[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const ded80c = ded80cMatch ? parseAmount(ded80cMatch[1]) : 0;

        const ded80dMatch = text.match(/section 80D[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const ded80d = ded80dMatch ? parseAmount(ded80dMatch[1]) : 0;

        // --- 4. TDS (Part A Summary) ---
        // Look for the "Total" row in the tax summary table
        let tds = 0;
        const summaryMatch = text.match(/Summary of amount paid\/credited[\s\S]{0,2000}?Total\s*\(Rs\)\.?/i);
        
        if (summaryMatch) {
            // Found the table? Look for the sequence of totals at the bottom.
            // Usually: [Total Income] [Tax Deducted] [Tax Deposited]
            const nearbyNumbers = summaryMatch[0].match(/[\d,]+\.\d{2}/g);
            if (nearbyNumbers && nearbyNumbers.length >= 2) {
                // The second large number is Tax Deducted
                tds = parseAmount(nearbyNumbers[1]); 
            }
        }
        
        // Fallback: Look for "Net tax payable" if table parsing fails
        if (tds === 0) {
            const fallback = text.match(/Net tax payable[\s\S]{0,50}?([\d,]+\.\d{2})/i);
            if (fallback) tds = parseAmount(fallback[1]);
        }

        return {
            success: true,
            data: {
                pan,
                assessmentYear: ay,
                salary: {
                    gross: grossSalary,
                    exemptions: exemptions,
                    standardDeduction: standardDeduction,
                    professionalTax: professionalTax
                },
                deductions: {
                    section80C: ded80c,
                    section80D: ded80d,
                    section80G: 0
                },
                tds: tds
            }
        };

    } catch (error) {
        console.error("Parser failed:", error);
        return { success: false, error: "Could not read PDF text" };
    }
};

module.exports = parseForm16;