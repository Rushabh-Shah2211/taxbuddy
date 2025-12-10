// client/src/components/TaxCalculator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './TaxCalculator.css';

const TaxCalculator = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Toggle State
    const [userCategory, setUserCategory] = useState('Salaried');
    const [editModeId, setEditModeId] = useState(null);

    // Consolidated Form Data
    const [formData, setFormData] = useState({
        // Salary Fields
        basic: '', hra: '', specialAllowance: '', bonus: '',
        // Business Fields
        grossReceipts: '', businessProfit: '',
        // Deductions
        section80C: '', section80D: ''
    });

    const [result, setResult] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));

        // Handle Edit Mode (Populate Data)
        if (location.state && location.state.recordToEdit) {
            const record = location.state.recordToEdit;
            setEditModeId(record._id);
            setUserCategory(record.userCategory || 'Salaried');

            // Map Backend Data back to Frontend Form
            setFormData({
                basic: record.income.salary?.basic || '',
                hra: record.income.salary?.hra || '',
                specialAllowance: record.income.salary?.specialAllowance || '',
                bonus: record.income.salary?.bonus || '',
                
                // If we saved business income in 'otherSources', retrieve it
                businessProfit: record.income.otherSources?.businessProfit || '',
                grossReceipts: record.income.otherSources?.grossReceipts || '',

                section80C: record.deductions?.section80C || '',
                section80D: record.deductions?.section80D || '',
            });

            // Restore Result View immediately
            setResult({
                ...record.computedTax,
                grossTotalIncome: (record.income.salary?.basic || 0) + (record.income.otherSources?.businessProfit || 0),
                oldRegime: { taxableIncome: 0, tax: record.computedTax.oldRegimeTax },
                newRegime: { taxableIncome: 0, tax: record.computedTax.newRegimeTax },
                recommendation: record.computedTax.regimeSelected,
                savings: 0,
                // Restore these if they exist in record, else default
                suggestions: [], 
                advanceTax: { applicable: record.computedTax.taxPayable > 10000, schedule: [] } 
            });
        }
    }, [location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- MAIN CALCULATION LOGIC ---
    const calculateTax = async (e) => {
        e.preventDefault();
        const apiUrl = 'https://taxbuddy-o5wu.onrender.com/api/tax/calculate';

        // LOGIC: Filter inputs based on Category
        let finalIncome = {
            salary: { basic: 0, hra: 0, specialAllowance: 0, bonus: 0 },
            otherSources: { businessProfit: Number(formData.businessProfit) || 0, grossReceipts: Number(formData.grossReceipts) || 0 },
            capitalGains: { stcg: 0 }
        };

        if (userCategory === 'Salaried') {
            finalIncome.salary = {
                basic: Number(formData.basic) || 0,
                hra: Number(formData.hra) || 0,
                specialAllowance: Number(formData.specialAllowance) || 0,
                bonus: Number(formData.bonus) || 0
            };
        } 
        // If Business, Salary stays 0.

        const payload = {
            userId: user ? user._id : null,
            userCategory,
            income: finalIncome,
            deductions: {
                section80C: Number(formData.section80C) || 0,
                section80D: Number(formData.section80D) || 0
            }
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : '' }};
            const response = await axios.post(apiUrl, payload, config);
            setResult(response.data);
            if(editModeId) alert("Record Updated!");
        } catch (error) {
            console.error(error);
            alert("Calculation failed. Check connection.");
        }
    };

    // --- PDF GENERATION ---
    const generateAndDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18); doc.setTextColor(40, 167, 69);
        doc.text("TaxBuddy Premium Report", 14, 20);
        
        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`User Category: ${userCategory}`, 14, 26);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Payment: VERIFIED`, 14, 34);

        let bodyData = [];
        if(userCategory === 'Salaried') {
            bodyData = [
                ['Basic Salary', formData.basic || 0],
                ['HRA', formData.hra || 0],
                ['Allowances', formData.specialAllowance || 0],
                ['Other Business Income', formData.businessProfit || 0]
            ];
        } else {
            bodyData = [
                ['Gross Receipts', formData.grossReceipts || 0],
                ['Net Profit / Income', formData.businessProfit || 0]
            ];
        }

        autoTable(doc, {
            startY: 40, head: [['Income Source', 'Amount (Rs)']], body: bodyData,
            theme: 'grid', headStyles: { fillColor: [0, 123, 255] }
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Regime', 'Tax Payable']],
            body: [['Old Regime', result.oldRegime.tax], ['New Regime', result.newRegime.tax]],
            theme: 'striped'
        });

        // Advance Tax Table in PDF
        if (result.advanceTax && result.advanceTax.applicable) {
            doc.text("Advance Tax Schedule:", 14, doc.lastAutoTable.finalY + 15);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 18,
                head: [['Due Date', 'Amount']],
                body: result.advanceTax.schedule.map(row => [row.dueDate, row.amountDue]),
                theme: 'grid'
            });
        }

        doc.save(`TaxReport_${userCategory}.pdf`);
    };

    // --- PAYMENT LOGIC ---
    const handlePayment = async () => {
        try {
            const { data: order } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/payment/create-order');
            const options = {
                key: "YOUR_RAZORPAY_KEY_ID_HERE", // <--- PASTE YOUR KEY ID HERE
                amount: order.amount,
                currency: "INR",
                name: "TaxBuddy Premium",
                description: "Detailed Report",
                order_id: order.id,
                handler: function (response) {
                    alert("Payment Success! Downloading PDF...");
                    generateAndDownloadPDF();
                },
                theme: { color: "#3399cc" }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            alert("Payment Gateway Error. Check Backend Keys.");
        }
    };

    return (
        <div className="calculator-container">
            {/* Header */}
            <div className="header-actions">
                <div>
                    <h2 style={{margin:0}}>Tax Planner {editModeId ? '(Edit Mode)' : ''}</h2>
                    <small>For {userCategory} Users</small>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                     {user && <Link to="/dashboard" className="toggle-btn" style={{textDecoration:'none', border:'1px solid #ccc'}}>View History</Link>}
                </div>
            </div>

            {/* Category Toggle */}
            <div className="user-type-toggle">
                <button type="button" className={`toggle-btn ${userCategory === 'Salaried' ? 'active' : ''}`} onClick={() => setUserCategory('Salaried')}>
                    👨‍💼 Salaried (Salary + Business)
                </button>
                <button type="button" className={`toggle-btn ${userCategory === 'Business' ? 'active' : ''}`} onClick={() => setUserCategory('Business')}>
                    🏢 Business Only (No Salary)
                </button>
            </div>
            
            <form onSubmit={calculateTax}>
                {/* --- INPUTS FOR SALARIED --- */}
                {userCategory === 'Salaried' && (
                    <div className="section-card">
                        <div className="section-title">Salary Details</div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Basic Salary</label>
                                <input type="number" name="basic" value={formData.basic} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>HRA</label>
                                <input type="number" name="hra" value={formData.hra} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Special / Other Allowances</label>
                                <input type="number" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Bonus / Arrears</label>
                                <input type="number" name="bonus" value={formData.bonus} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- INPUTS FOR BUSINESS (Shared Logic: Salaried can also have business income) --- */}
                <div className="section-card">
                    <div className="section-title">{userCategory === 'Salaried' ? 'Other Income / Side Business' : 'Business Income Details'}</div>
                    <div className="form-grid">
                         <div className="input-group">
                            <label>Gross Receipts / Turnover</label>
                            <input type="number" name="grossReceipts" value={formData.grossReceipts} onChange={handleChange} placeholder="Total Revenue" />
                        </div>
                        <div className="input-group">
                            <label>{userCategory === 'Business' ? 'Net Profit / Presumptive Income' : 'Net Business Income'}</label>
                            <input type="number" name="businessProfit" value={formData.businessProfit} onChange={handleChange} placeholder="Actual Taxable Profit" />
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-title">Deductions (Common)</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>80C (LIC/PF) - Max 1.5L</label>
                            <input type="number" name="section80C" value={formData.section80C} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>80D (Health Insurance)</label>
                            <input type="number" name="section80D" value={formData.section80D} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-primary">Calculate Tax</button>
            </form>

            {/* --- RESULTS SECTION --- */}
            {result && (
                <div style={{marginTop: '30px'}}>
                    <div className="result-container">
                        <div className={`result-card ${result.recommendation === "Old Regime" ? "winner" : ""}`}>
                            <h3>Old Regime</h3>
                            <h2>₹{Math.round(result.oldRegime.tax).toLocaleString()}</h2>
                        </div>
                        <div className={`result-card ${result.recommendation === "New Regime" ? "winner" : ""}`}>
                            <h3>New Regime</h3>
                            <h2>₹{Math.round(result.newRegime.tax).toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="recommendation-banner" style={{marginTop:'15px', padding:'10px', background:'#d1ecf1', borderRadius:'5px', textAlign:'center', color:'#0c5460'}}>
                        Suggested: <strong>{result.recommendation}</strong> {result.savings > 0 && <span>(Save ₹{result.savings})</span>}
                    </div>

                    {/* RESTORED: Pay Button */}
                    <button onClick={handlePayment} style={{marginTop: '20px', padding: '15px', background: '#ffc107', width: '100%', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize:'16px'}}>
                        🔒 Pay ₹49 to Download Report
                    </button>

                    {/* RESTORED: Smart Tips */}
                    {result.suggestions && result.suggestions.length > 0 && (
                        <div style={{marginTop: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '5px'}}>
                            <h4 style={{margin:'0 0 10px 0', color:'#856404'}}>💡 Smart Tax Saving Tips</h4>
                            <ul style={{margin:0, paddingLeft:'20px'}}>
                                {result.suggestions.map((tip, i) => <li key={i} style={{color:'#856404'}}>{tip}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* RESTORED: Advance Tax Table */}
                    {result.advanceTax && result.advanceTax.applicable && (
                        <div style={{marginTop: '25px'}}>
                            <h3 style={{borderBottom:'2px solid #ddd'}}>📅 Advance Tax Schedule</h3>
                            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                                <thead>
                                    <tr style={{background:'#f2f2f2'}}><th style={{padding:'8px'}}>Due Date</th><th style={{padding:'8px'}}>Amount</th></tr>
                                </thead>
                                <tbody>
                                    {result.advanceTax.schedule.map((row, i) => (
                                        <tr key={i}><td style={{padding:'8px', borderBottom:'1px solid #eee'}}>{row.dueDate}</td><td style={{padding:'8px', borderBottom:'1px solid #eee'}}>₹{row.amountDue}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaxCalculator;