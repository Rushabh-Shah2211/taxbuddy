// server/controllers/taxController.js
const TaxRecord = require('../models/TaxRecord');
const sendEmail = require('../utils/sendEmail');

// ==========================================
//   HELPER FUNCTIONS (Salary & Components)
// ==========================================

const calculateGratuity = (details, isGovt) => {
    if (!details || !details.received) return { taxable: 0, exempt: 0 };
    if (isGovt) return { taxable: 0, exempt: details.received };
    const { received, lastDrawnSalary, yearsOfService, coveredByAct } = details;
    const limit = 2000000;
    const lastDraw = Number(lastDrawnSalary) || 0;
    const years = Number(yearsOfService) || 0;
    const rec = Number(received) || 0;
    let exemptAmount = 0;
    if (coveredByAct) exemptAmount = Math.min((15 / 26) * lastDraw * years, limit, rec);
    else exemptAmount = Math.min(0.5 * lastDraw * years, limit, rec);
    return { taxable: Math.max(0, rec - exemptAmount), exempt: exemptAmount };
};

const calculateLeaveEncashment = (details, isGovt) => {
    if (!details || !details.received) return { taxable: 0, exempt: 0 };
    if (isGovt) return { taxable: 0, exempt: details.received };
    const { received, avgSalary10Months, earnedLeaveBalance } = details;
    const limit = 2500000;
    const rec = Number(received) || 0;
    const avgSal = Number(avgSalary10Months) || 0;
    const bal = Number(earnedLeaveBalance) || 0;
    const exemptAmount = Math.min(rec, limit, avgSal * bal, 10 * avgSal);
    return { taxable: Math.max(0, rec - exemptAmount), exempt: exemptAmount };
};

const calculatePension = (details, isGovt) => {
    if (!details) return { taxable: 0, exempt: 0 };
    let taxable = Number(details.uncommuted) || 0;
    const commutedRec = Number(details.commutedReceived) || 0;
    const commPct = Number(details.commutationPercentage) || 0;
    if (commutedRec > 0) {
        let exemptCommuted = 0;
        if (isGovt) exemptCommuted = commutedRec;
        else {
            const totalCorpus = commPct > 0 ? (commutedRec / (commPct / 100)) : 0;
            exemptCommuted = Math.min(details.hasGratuity ? (totalCorpus / 3) : (totalCorpus / 2), commutedRec);
        }
        taxable += (commutedRec - exemptCommuted);
    }
    return { taxable, exempt: 0 };
};

const calculateHRA = (basic, hraReceived, rentPaid, isMetro) => {
    const hra = Number(hraReceived) || 0;
    const rent = Number(rentPaid) || 0;
    const b = Number(basic) || 0;
    if (!hra || !rent) return { taxable: hra, exempt: 0 };
    const rentOver10 = rent - (0.10 * b);
    if (rentOver10 <= 0) return { taxable: hra, exempt: 0 };
    const exemptAmount = Math.min(hra, rentOver10, isMetro ? 0.50 * b : 0.40 * b);
    return { taxable: Math.max(0, hra - exemptAmount), exempt: exemptAmount };
};

const calculateCGTax = (cg) => {
    if (!cg || !cg.enabled) return 0;
    let tax = 0;
    const stcgShares = Number(cg.shares?.stcg111a) || 0;
    if (stcgShares > 0) tax += stcgShares * 0.20;
    const ltcgShares = Number(cg.shares?.ltcg112a) || 0;
    if (ltcgShares > 125000) tax += (ltcgShares - 125000) * 0.125;
    const ltcgProp = Number(cg.property?.ltcg) || 0;
    if (ltcgProp > 0) tax += ltcgProp * 0.125;
    return tax; 
};

// ==========================================
//   ENTITY-SPECIFIC TAX LOGIC
// ==========================================

const calculateBaseTax = (taxableIncome, entityType, regime, ageGroup) => {
    let tax = 0;
    let income = Math.max(0, Number(taxableIncome) || 0);

    // 1. SLAB SYSTEM (Individuals, HUF, AOP, BOI, AJP)
    if (['Individual', 'HUF', 'AOP', 'BOI', 'AJP'].includes(entityType)) {
        if (regime === 'Old') {
            let limit = (entityType === 'Individual' && ageGroup === '>80') ? 500000 : 
                        (entityType === 'Individual' && ageGroup === '60-80') ? 300000 : 250000;
            
            if (income > 1000000) tax += 112500 + (income - 1000000) * 0.30;
            else if (income > 500000) tax += 12500 + (income - 500000) * 0.20;
            else if (income > limit) tax += (income - limit) * 0.05;
            
            // Rebate 87A (Old - Only for Resident Individuals)
            // Assuming Resident check is handled at controller or simplifying for general logic
            if (entityType === 'Individual' && income <= 500000) tax = 0; 
        } else {
            // New Regime (FY 24-25)
            if (income > 2400000) tax += 300000 + (income - 2400000) * 0.30;
            else if (income > 2000000) tax += 200000 + (income - 2000000) * 0.25;
            else if (income > 1600000) tax += 120000 + (income - 1600000) * 0.20;
            else if (income > 1200000) tax += 60000 + (income - 1200000) * 0.15;
            else if (income > 800000) tax += 20000 + (income - 800000) * 0.10;
            else if (income > 400000) tax += (income - 400000) * 0.05; // Note: Usually starts at 3L; maintaining your logic logic consistency

            // Rebate 87A (New - Up to 7L tax free)
            if (entityType === 'Individual' && income <= 700000) tax = 0; 
        }
    } 
    // 2. FLAT RATES
    else if (['Firm', 'LLP'].includes(entityType)) {
        // Flat 30%
        tax = income * 0.30;
    }
    else if (entityType === 'Company') {
        // Flat 30% (Standard Domestic Assumption)
        // If turnover < 400Cr, it is 25%, but sticking to standard 30% for MVP
        tax = income * 0.30; 
    }
    else if (entityType === 'Trust') {
        // MMR or Flat 30% depending on status
        tax = income * 0.30;
    }

    return tax;
};

const calculateFinalTaxWithSurcharge = (income, baseTax, entityType, regime) => {
    let surchargeRate = 0;
    let limit = 0;

    // --- SURCHARGE RULES ---
    if (['Individual', 'HUF', 'AOP', 'BOI', 'AJP'].includes(entityType)) {
        // Individual Slabs
        if (income > 50000000 && regime === 'Old') { surchargeRate = 0.37; limit = 50000000; }
        else if (income > 20000000) { surchargeRate = 0.25; limit = 20000000; }
        else if (income > 10000000) { surchargeRate = 0.15; limit = 10000000; }
        else if (income > 5000000) { surchargeRate = 0.10; limit = 5000000; }
    } 
    else if (['Firm', 'LLP'].includes(entityType)) {
        // Flat 12% if > 1Cr
        if (income > 10000000) { surchargeRate = 0.12; limit = 10000000; }
    }
    else if (entityType === 'Company') {
        // Domestic Company: 7% (>1Cr), 12% (>10Cr)
        if (income > 100000000) { surchargeRate = 0.12; limit = 100000000; }
        else if (income > 10000000) { surchargeRate = 0.07; limit = 10000000; }
    }

    let surcharge = baseTax * surchargeRate;
    let totalTax = baseTax + surcharge;

    // --- MARGINAL RELIEF (Simplified Logic) ---
    if (limit > 0) {
        // Calculate tax exactly at the limit
        // We estimate the max payable as: TaxAtLimit + (Income - Limit)
        // To do this accurately, we need the tax at the exact limit threshold
        // For MVP: We check if Surcharge pushes tax > (Income - Limit)
        
        let taxAtLimit = calculateBaseTax(limit, entityType, regime, '<60'); // age irrelevant for limit calculation here
        let surchargeAtLimitRate = 0;

        // Determine surcharge at the limit (tier below current)
        if (entityType === 'Company') {
            if (limit === 100000000) surchargeAtLimitRate = 0.07;
            // if limit is 1Cr, rate is 0
        } else if (entityType === 'Firm' || entityType === 'LLP') {
            // limit is 1Cr, rate is 0
        } else {
            // Individuals
            if (limit === 50000000 && regime === 'Old') surchargeAtLimitRate = 0.25;
            else if (limit === 20000000) surchargeAtLimitRate = 0.15;
            else if (limit === 10000000) surchargeAtLimitRate = 0.10;
        }

        let taxAtLimitWithSurcharge = taxAtLimit + (taxAtLimit * surchargeAtLimitRate);
        const incomeExcess = income - limit;
        const maxPayable = taxAtLimitWithSurcharge + incomeExcess;

        if (totalTax > maxPayable) {
            totalTax = maxPayable;
        }
    }

    // Add 4% Health & Education Cess
    return totalTax * 1.04;
};

// ==========================================
//   MAIN CALCULATOR CONTROLLER
// ==========================================

const calculateTax = async (req, res) => {
    try {
        const { userId, entityType = 'Individual', financialYear, ageGroup, residentialStatus, income, deductions, taxesPaid } = req.body;

        // 1. SALARY (Only for Individuals)
        let totalSalaryTaxable = 0;
        let dbSalary = {
            enabled: false, detailedMode: false,
            basic: 0, hra: 0, gratuity: 0, leaveEncashment: 0, pension: 0, perquisites: 0, allowances: 0,
            details: {}
        };

        // Strict Check: Only Individuals calculate salary
        if (entityType === 'Individual' && income.salary) {
            const s = income.salary;
            const isGovt = s.employmentType === 'Government';
            dbSalary.enabled = s.enabled || false;
            dbSalary.detailedMode = s.detailedMode || false;
            
            dbSalary.basic = (Number(s.basic)||0) + (Number(s.da)||0) + (Number(s.bonus)||0);
            const hraCalc = calculateHRA(dbSalary.basic, s.hra, s.rentPaid, s.isMetro);
            dbSalary.hra = hraCalc.taxable;

            if (s.gratuity && typeof s.gratuity === 'object') {
                dbSalary.gratuity = calculateGratuity(s.gratuity, isGovt).taxable;
                dbSalary.details.gratuityInput = s.gratuity;
            } else dbSalary.gratuity = Number(s.gratuity) || 0;

            if (s.leaveEncashment && typeof s.leaveEncashment === 'object') {
                dbSalary.leaveEncashment = calculateLeaveEncashment(s.leaveEncashment, isGovt).taxable;
                dbSalary.details.leaveInput = s.leaveEncashment;
            } else dbSalary.leaveEncashment = Number(s.leaveEncashment) || 0;

            if (s.pension && typeof s.pension === 'object') {
                dbSalary.pension = calculatePension(s.pension, isGovt).taxable;
                dbSalary.details.pensionInput = s.pension;
            } else dbSalary.pension = Number(s.pension) || 0;

            if (s.perquisites && typeof s.perquisites === 'object') dbSalary.perquisites = Number(s.perquisites.taxableValue) || 0;
            else dbSalary.perquisites = Number(s.perquisites) || 0;

            dbSalary.allowances = Number(s.otherAllowancesTaxable) || Number(s.allowances) || 0;
            dbSalary.details.rentPaid = s.rentPaid;
            dbSalary.details.isMetro = s.isMetro;

            if (dbSalary.enabled) {
                const grossSal = dbSalary.basic + dbSalary.hra + dbSalary.gratuity + dbSalary.leaveEncashment + dbSalary.pension + dbSalary.perquisites + dbSalary.allowances;
                totalSalaryTaxable = Math.max(0, grossSal - 75000); // Standard Deduction
            }
        }

        // 2. BUSINESS
        let businessIncome = 0;
        if (income.business?.enabled && income.business.businesses) {
            income.business.businesses.forEach(biz => {
                if (biz.type === "Presumptive") {
                    const turnover = Number(biz.turnover) || 0;
                    const rate = Number(biz.presumptiveRate) || 6;
                    businessIncome += (turnover * rate / 100);
                } else businessIncome += (Number(biz.profit) || 0);
            });
        }

        // 3. HOUSE PROPERTY
        let hpIncome = 0;
        if(income.houseProperty?.enabled) {
             const h = income.houseProperty;
             const rent = Number(h.rentReceived) || 0;
             const municipal = Number(h.municipalTaxes) || 0;
             const interest = Number(h.interestPaid) || 0;
             if(h.type==='Rented') hpIncome = ((rent - municipal) * 0.7) - interest;
             else hpIncome = Math.max(-200000, 0 - interest);
        }

        // 4. OTHER INCOME
        let otherSrcIncome = 0;
        if(income.otherIncome?.sources) {
            income.otherIncome.sources.forEach(s => otherSrcIncome += (Number(s.amount)||0));
        }

        // 5. CAPITAL GAINS
        let cgSlabIncome = 0; 
        if (income.capitalGains?.enabled) {
            cgSlabIncome += (Number(income.capitalGains.property?.stcg) || 0);
            cgSlabIncome += (Number(income.capitalGains.other) || 0);
        }
        
        // 6. GROSS TOTAL INCOME
        const grossTotalIncome = totalSalaryTaxable + businessIncome + hpIncome + otherSrcIncome + cgSlabIncome;

        // 7. DEDUCTIONS
        let totalDeductions = 0;
        // Logic: 80C etc usually apply to Individuals/HUF. 
        // We allow the calculation but assume the frontend or user knows applicability.
        if (deductions?.enabled) {
            const d = deductions;
            const val80C = Math.min(Number(d.section80C)||0, 150000);
            totalDeductions = val80C + (Number(d.section80D)||0) + (Number(d.section80E)||0) + (Number(d.section80G)||0) + (Number(d.section80TTA)||0) + (Number(d.otherDeductions)||0);
        }

        // 8. TAX COMPUTATION
        const netTaxableOld = Math.max(0, grossTotalIncome - totalDeductions);
        const netTaxableNew = Math.max(0, grossTotalIncome);

        // CG Tax (Special Rates)
        const cgTaxBase = calculateCGTax(income.capitalGains);

        // Base Tax (Slabs vs Flat)
        let taxOldBase = calculateBaseTax(netTaxableOld, entityType, 'Old', ageGroup);
        let taxNewBase = calculateBaseTax(netTaxableNew, entityType, 'New', ageGroup);

        // Final Tax (Surcharge + Cess)
        let taxOldFinal = calculateFinalTaxWithSurcharge(netTaxableOld, taxOldBase + cgTaxBase, entityType, 'Old');
        let taxNewFinal = calculateFinalTaxWithSurcharge(netTaxableNew, taxNewBase + cgTaxBase, entityType, 'New');

        const finalTax = Math.min(taxOldFinal, taxNewFinal);
        const recommendation = taxNewFinal <= taxOldFinal ? "New Regime / Concessional" : "Old Regime";
        
        const paid = (Number(taxesPaid?.tds)||0) + (Number(taxesPaid?.advanceTax)||0) + (Number(taxesPaid?.selfAssessment)||0);
        const netPayable = Math.max(0, finalTax - paid);

        // Advance Tax Schedule
        let advanceTaxSchedule = [];
        if (netPayable > 10000) {
            advanceTaxSchedule = [
                { dueDate: "15th June", percentage: "15%", amountDue: Math.round(netPayable * 0.15) },
                { dueDate: "15th Sept", percentage: "45%", amountDue: Math.round(netPayable * 0.45) },
                { dueDate: "15th Dec", percentage: "75%", amountDue: Math.round(netPayable * 0.75) },
                { dueDate: "15th Mar", percentage: "100%", amountDue: Math.round(netPayable) }
            ];
        }

        // Detailed Breakdown for Frontend/Email
        const detailedBreakdown = {
            salary: Math.round(totalSalaryTaxable || 0),
            business: Math.round(businessIncome || 0),
            other: Math.round(otherSrcIncome || 0),
            capitalGains: Math.round(
                (Number(cgSlabIncome) || 0) + 
                (Number(income.capitalGains?.shares?.stcg111a) || 0) + 
                (Number(income.capitalGains?.shares?.ltcg112a) || 0) + 
                (Number(income.capitalGains?.property?.ltcg) || 0)
            ),
            houseProperty: Math.round(hpIncome || 0),
            tds: Number(taxesPaid?.tds) || 0,
            advanceTax: Number(taxesPaid?.advanceTax) || 0,
            selfAssessment: Number(taxesPaid?.selfAssessment) || 0
        };

        if (userId) {
            await TaxRecord.create({
                user: userId, entityType, financialYear, ageGroup, residentialStatus,
                income: { ...income, salary: dbSalary }, 
                deductions, taxesPaid,
                computedTax: { oldRegimeTax: taxOldFinal, newRegimeTax: taxNewFinal, taxPayable: finalTax, netTaxPayable: netPayable, regimeSelected: recommendation, suggestions: [] },
                grossTotalIncome: grossTotalIncome || 0 
            });
        }

        res.json({
            grossTotalIncome,
            oldRegimeTax: Math.round(taxOldFinal),
            newRegimeTax: Math.round(taxNewFinal),
            netPayable: Math.round(netPayable),
            recommendation,
            suggestions: [],
            advanceTaxSchedule,
            detailedBreakdown 
        });

    } catch (error) {
        console.error("Calculation Error:", error);
        res.status(500).json({ message: "Error: " + error.message });
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

const aiTaxAdvisor = async (req, res) => {
    res.json({ response: "I am a local tax assistant. Please ask about 80C or Tax Regimes." });
};

const emailReport = async (req, res) => {
    const { email, name, financialYear, pdfAttachment } = req.body;
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    try {
        const message = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                <h2 style="color: #2e7d32;">Artha Tax Report</h2>
                <p>Hi ${name || 'User'},</p>
                <p>Please find attached your report for FY ${financialYear}, generated on ${dateStr}.</p>
                <p>If you have any questions, feel free to log back into the Artha Dashboard.</p>
                <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
                <p style="font-size:12px; color:#999;">Regards,<br>Team Artha</p>
            </div>
        `;
        
        await sendEmail({
            email: email,
            subject: `Artha Tax Report (PDF) - FY ${financialYear}`,
            message: message,
            attachment: pdfAttachment
        });

        res.json({ success: true, message: 'Email sent successfully with PDF.' });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ message: 'Email could not be sent.' });
    }
};

module.exports = { calculateTax, getTaxHistory, deleteTaxRecord, aiTaxAdvisor, emailReport };