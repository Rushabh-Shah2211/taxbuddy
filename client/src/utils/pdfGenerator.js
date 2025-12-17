// client/src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/rb_logo.png'; 

export const generateTaxReportPDF = (user, formData, result) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;

    // 1. ADD WATERMARK
    try {
        doc.setGState(new doc.GState({ opacity: 0.1 })); 
        const watermarkSize = 80;
        doc.addImage(logo, 'PNG', (pageWidth - watermarkSize)/2, (pageHeight - watermarkSize)/2, watermarkSize, watermarkSize);
        doc.setGState(new doc.GState({ opacity: 1.0 })); 
    } catch (e) {
        console.warn("Watermark not supported", e);
    }

    // 2. HEADER
    doc.addImage(logo, 'PNG', margin, 10, 15, 15);
    doc.setFontSize(22); 
    doc.setTextColor(126, 217, 87); 
    doc.text("Artha by RB", 35, 20);

    doc.setFontSize(10); 
    doc.setTextColor(100); 
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Generated: ${dateStr}`, pageWidth - margin - 40, 20);
    
    doc.setDrawColor(200); 
    doc.line(margin, 28, pageWidth - margin, 28); 

    // 3. USER DETAILS
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`User: ${user.name}`, margin, 36);
    doc.text(`Financial Year: ${formData.financialYear}`, margin, 42);
    doc.text(`Age Group: ${formData.ageGroup}`, pageWidth / 2, 42);

    // 4. DETAILED BREAKDOWN TABLE
    let incomeRows = [];

    // Salary Details
    if (formData.salaryEnabled) {
        incomeRows.push([{ content: 'SALARY COMPONENTS', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
        if(Number(formData.basic)) incomeRows.push(['Basic Salary', `Rs. ${Number(formData.basic).toLocaleString()}`]);
        if(Number(formData.hra)) incomeRows.push(['HRA Received', `Rs. ${Number(formData.hra).toLocaleString()}`]);
        if(Number(formData.allowances)) incomeRows.push(['Allowances', `Rs. ${Number(formData.allowances).toLocaleString()}`]);
        // ... (Include other salary components similarly)
    }

    // Business Details
    if (formData.business.enabled && formData.business.businesses.length > 0) {
        incomeRows.push([{ content: 'BUSINESS INCOME', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
        formData.business.businesses.forEach((biz, i) => {
            const label = biz.name || `Business ${i+1}`;
            const val = biz.type === 'Presumptive' 
                ? `Turnover: ${biz.turnover} (Rate: ${biz.presumptiveRate}%)` 
                : `Net Profit: ${biz.profit}`;
            incomeRows.push([label, val]);
        });
    }

    // Capital Gains
    if (formData.capitalGains?.enabled) {
        incomeRows.push([{ content: 'CAPITAL GAINS', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
        const cg = formData.capitalGains;
        if(cg.shares?.stcg111a) incomeRows.push(['Shares STCG (111A)', `Rs. ${cg.shares.stcg111a}`]);
        if(cg.shares?.ltcg112a) incomeRows.push(['Shares LTCG (112A)', `Rs. ${cg.shares.ltcg112a}`]);
        if(cg.property?.ltcg) incomeRows.push(['Property LTCG', `Rs. ${cg.property.ltcg}`]);
    }

    // --- ADDED: OTHER INCOME ---
    if (formData.otherEnabled && formData.otherSources.length > 0) {
        incomeRows.push([{ content: 'OTHER INCOME', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
        formData.otherSources.forEach(src => {
            if(src.amount) incomeRows.push([src.name || 'Other Source', `Rs. ${Number(src.amount).toLocaleString()}`]);
        });
    }

    // Deductions
    if (formData.deductions?.enabled) {
        incomeRows.push([{ content: 'DEDUCTIONS', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
        const d = formData.deductions;
        if(d.section80C) incomeRows.push(['Section 80C', `Rs. ${d.section80C}`]);
        if(d.section80D) incomeRows.push(['Section 80D', `Rs. ${d.section80D}`]);
        if(d.otherDeductions) incomeRows.push(['Other Deductions', `Rs. ${d.otherDeductions}`]);
    }

    // --- UPDATED: Taxes Paid (Including Self Assessment) ---
    if (formData.tds || formData.advanceTax || formData.selfAssessment) {
        incomeRows.push([{ content: 'TAXES PAID', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
        if(formData.tds) incomeRows.push(['TDS', `Rs. ${formData.tds}`]);
        if(formData.advanceTax) incomeRows.push(['Advance Tax', `Rs. ${formData.advanceTax}`]);
        if(formData.selfAssessment) incomeRows.push(['Self Assessment Tax', `Rs. ${formData.selfAssessment}`]);
    }

    // Generate Main Table
    autoTable(doc, { 
        startY: 48, 
        head: [['Description', 'Amount / Details']], 
        body: incomeRows, 
        theme: 'grid',
        headStyles: { fillColor: [126, 217, 87], textColor: 255 },
        columnStyles: { 0: { cellWidth: 100 }, 1: { cellWidth: 'auto' } }
    });

    // 5. SUMMARY SECTION
    let finalY = doc.lastAutoTable.finalY + 10;
    if (finalY > pageHeight - 50) { doc.addPage(); finalY = 20; }

    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("Tax Calculation Summary", margin, finalY);

    autoTable(doc, {
        startY: finalY + 5,
        head: [['Regime', 'Tax Payable (incl Surcharge & Cess)']],
        body: [
            ['Old Regime', `Rs. ${result.oldRegimeTax.toLocaleString()}`],
            ['New Regime', `Rs. ${result.newRegimeTax.toLocaleString()}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [60, 60, 60] }
    });

    // 6. FINAL RESULT
    finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Recommendation: ${result.recommendation}`, margin, finalY);
    
    doc.setFontSize(16);
    doc.setTextColor(126, 217, 87);
    doc.setFont(undefined, 'bold');
    doc.text(`Net Payable: Rs. ${result.netPayable.toLocaleString()}`, margin, finalY + 8);

    // --- ADDED: DISCLAIMER ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont(undefined, 'normal');
    doc.text("Disclaimer: This report is generated based on the information provided by the user. There is no guarantee of accuracy for legal filing. Please consult a professional Chartered Accountant before filing your returns.", margin, pageHeight - 10, { maxWidth: pageWidth - 28 });

    // 7. SAVE FILE
    const safeName = user.name.replace(/[^a-z0-9]/gi, '_'); 
    const fileDate = new Date().toISOString().split('T')[0]; 
    doc.save(`${safeName}_ArthaReport_${fileDate}.pdf`);
};