const pdf = require('pdf-parse');

// Helper: Cleans "35,10,628.00" -> 3510628.00
const parseAmount = (text) => {
    if (!text) return 0;
    const clean = text.replace(/[^\d.]/g, '');
    const val = parseFloat(clean);
    // Filter: Ignore section numbers (e.g. 17, 80) and zero values
    return (isNaN(val) || val < 100) ? 0 : val;
};

const parseForm16 = async (dataBuffer) => {
    try {
        const data = await pdf(dataBuffer);
        const text = data.text;

        // 1. METADATA (High Confidence)
        const pan = (text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/) || [])[0] || null;
        const ay = (text.match(/20[2-9][0-9]-[0-9]{2,4}/) || [])[0] || null;

        // 2. TDS EXTRACTION (Strict Table Search)
        let tds = 0;
        // Look for the Part A Summary table header
        const summaryMatch = text.match(/Summary of amount paid\/credited[\s\S]{0,1500}?Total\s*\(Rs\)\.?/i);
        
        if (summaryMatch) {
            // We found the table. Now look for the "Total" row numbers nearby.
            // This captures the sequence of totals at the bottom of the table.
            // Typically: [Amount Paid] [Tax Deducted] [Tax Deposited]
            const nearbyNumbers = summaryMatch[0].match(/[\d,]+\.\d{2}/g);
            if (nearbyNumbers && nearbyNumbers.length >= 2) {
                // The second large number is usually Tax Deducted
                tds = parseAmount(nearbyNumbers[1]); 
            }
        }
        
        // Fallback for TDS if table parsing fails
        if (tds === 0) {
            const fallback = text.match(/Net tax payable[\s\S]{0,50}?([\d,]+\.\d{2})/i);
            if (fallback) tds = parseAmount(fallback[1]);
        }

        // 3. SALARY COMPONENTS (Part B / Annexure)
        // Gross Salary (Section 17(1))
        // We look for the phrase and grab the FIRST large number that appears after it.
        const grossMatch = text.match(/section 17\(1\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const grossSalary = grossMatch ? parseAmount(grossMatch[1]) : 0;

        // Exemptions u/s 10
        const exemptMatch = text.match(/exemption claimed under section 10[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const exemptions = exemptMatch ? parseAmount(exemptMatch[1]) : 0;

        // Standard Deduction u/s 16(ia)
        const stdDedMatch = text.match(/section 16\(ia\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const standardDeduction = stdDedMatch ? parseAmount(stdDedMatch[1]) : 0;

        // Professional Tax u/s 16(iii)
        const profTaxMatch = text.match(/section 16\(iii\)[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const professionalTax = profTaxMatch ? parseAmount(profTaxMatch[1]) : 0;

        // 4. DEDUCTIONS (Chapter VI-A)
        const ded80cMatch = text.match(/section 80C[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const ded80c = ded80cMatch ? parseAmount(ded80cMatch[1]) : 0;

        const ded80dMatch = text.match(/section 80D[\s\S]{0,100}?([\d,]+\.\d{2})/i);
        const ded80d = ded80dMatch ? parseAmount(ded80dMatch[1]) : 0;

        return {
            success: true,
            data: {
                pan,
                assessmentYear: ay,
                salary: {
                    gross: grossSalary,
                    exemptions: exemptions,
                    standardDeduction: standardDeduction || 75000, // Default if 0
                    professionalTax: professionalTax
                },
                deductions: {
                    section80C: ded80c,
                    section80D: ded80d,
                    section80G: 0 // Hard to parse reliably, safe to default 0
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