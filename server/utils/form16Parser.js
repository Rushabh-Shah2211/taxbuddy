const pdf = require('pdf-extraction');

const extractValue = (text, patterns) => {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            // Remove commas and return number
            return parseFloat(match[1].replace(/,/g, ''));
        }
    }
    return 0;
};

const parseForm16 = async (dataBuffer) => {
    try {
        const data = await pdf(dataBuffer);
        const text = data.text; // The raw string content of the PDF

        // 1. EXTRACT PAN
        // Pattern: 5 letters, 4 digits, 1 letter
        const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
        const pan = panMatch ? panMatch[0] : null;

        // 2. EXTRACT ASSESSMENT YEAR (AY)
        // Matches "2024-25", "2025-26" etc.
        const ayMatch = text.match(/20[2-9][0-9]-[0-9]{2}/);
        const assessmentYear = ayMatch ? ayMatch[0] : null;

        // 3. EXTRACT GROSS SALARY
        // Searches for "Gross Salary" followed by a number
        const salaryPatterns = [
            /Gross Salary[\s\S]*?([\d,]+\.\d{2}|[\d,]+)/i,
            /Salary as per provisions contained in section 17\(1\)[\s\S]*?([\d,]+\.\d{2}|[\d,]+)/i
        ];
        const grossSalary = extractValue(text, salaryPatterns);

        // 4. EXTRACT 80C DEDUCTIONS
        // Searches for "80C" followed by a number
        const ded80cPatterns = [
            /80C[\s\S]*?([\d,]+\.\d{2}|[\d,]+)/i,
            /Chapter VI-A[\s\S]*?([\d,]+\.\d{2}|[\d,]+)/i
        ];
        const deduction80c = extractValue(text, ded80cPatterns);

        // 5. EXTRACT TDS (Tax Deducted)
        const tdsPatterns = [
            /Total tax deducted[\s\S]*?([\d,]+\.\d{2}|[\d,]+)/i,
            /Tax payable[\s\S]*?([\d,]+\.\d{2}|[\d,]+)/i
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