const pdf = require('pdf-extraction');

// Helper to clean and convert string to number
const parseAmount = (text) => {
    if (!text) return 0;
    // Remove commas, spaces, and 'Rs.' or '₹' symbols
    const cleanText = text.replace(/[^\d.]/g, '');
    return parseFloat(cleanText) || 0;
};

const extractValue = (text, patterns) => {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            // We matched a value! Let's check if it looks like a real money amount.
            // If the number is very small (like < 100), it might be a section number (e.g. 17 or 10).
            // We skip those unless we are extracting specific small fields.
            const val = parseAmount(match[1]);
            if (val > 100) { 
                return val;
            }
        }
    }
    return 0;
};

const parseForm16 = async (dataBuffer) => {
    try {
        const data = await pdf(dataBuffer);
        const text = data.text; 

        // 1. EXTRACT PAN
        // Matches: 5 letters, 4 digits, 1 letter (e.g., AEVPM6340L)
        const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
        const pan = panMatch ? panMatch[0] : null;

        // 2. EXTRACT ASSESSMENT YEAR (AY)
        // Matches "2025-2026" or "2025-26"
        const ayMatch = text.match(/20[2-9][0-9]-[0-9]{2,4}/);
        const assessmentYear = ayMatch ? ayMatch[0] : null;

        // 3. EXTRACT GROSS SALARY
        // Strategy: Look for "section 17(1)" and grab the large number appearing closely after it.
        // We ensure the number has at least 4 digits or a decimal point to avoid capturing "17" or "1".
        const salaryPatterns = [
            // Matches "10648368.00" appearing after 17(1) text
            /section 17\(1\)[\s\S]{0,100}?([\d,]+\.\d{2})/i, 
            /Gross Salary[\s\S]{0,50}?([\d,]+\.\d{2})/i
        ];
        const grossSalary = extractValue(text, salaryPatterns);

        // 4. EXTRACT 80C DEDUCTIONS
        // Looks for "80C" followed specifically by a number
        const ded80cPatterns = [
            /under section 80C[\s\S]{0,100}?([\d,]+\.\d{2})/i,
            /80C[\s\S]{0,50}?([\d,]+\.\d{2})/i
        ];
        const deduction80c = extractValue(text, ded80cPatterns);

        // 5. EXTRACT TDS (Total Tax Deducted)
        // Looks for "Net tax payable" or "Total tax deducted"
        const tdsPatterns = [
            /Net tax payable[\s\S]{0,100}?([\d,]+\.\d{2})/i,
            /Total tax deducted[\s\S]{0,100}?([\d,]+\.\d{2})/i,
            /Tax payable[\s\S]{0,100}?([\d,]+\.\d{2})/i
        ];
        const tds = extractValue(text, tdsPatterns);

        return {
            success: true,
            data: {
                pan,
                assessmentYear,
                grossSalary,
                deduction80c,
                tds
            }
        };

    } catch (error) {
        console.error("PDF Parsing Error:", error);
        return { success: false, error: "Failed to parse PDF" };
    }
};

module.exports = parseForm16;