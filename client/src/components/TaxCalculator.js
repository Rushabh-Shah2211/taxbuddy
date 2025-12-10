// client/src/components/TaxCalculator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/rb_logo.png'; // Make sure your logo is in this folder
import './TaxCalculator.css'; // Uses the new refined CSS

const TaxCalculator = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // --- STATES ---
    const [userCategory, setUserCategory] = useState('Salaried');
    const [editModeId, setEditModeId] = useState(null);
    const [formData, setFormData] = useState({
        // Salaried Inputs
        basic: '', hra: '', specialAllowance: '', bonus: '',
        // Business Inputs
        grossReceipts: '', businessProfit: '',
        // Deductions
        section80C: '', section80D: ''
    });
    const [result, setResult] = useState(null);

    // --- 1. INITIALIZE (Load User & Check for Edit Data) ---
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));

        // If coming from "Edit" button in Dashboard
        if (location.state && location.state.recordToEdit) {
            const record = location.state.recordToEdit;
            setEditModeId(record._id);
            setUserCategory(record.userCategory || 'Salaried');

            // Map Backend Data to Frontend Inputs
            setFormData({
                basic: record.income.salary?.basic || '',
                hra: record.income.salary?.hra || '',
                specialAllowance: record.income.salary?.specialAllowance || '',
                bonus: record.income.salary?.bonus || '',
                
                // Retrieve business income (stored in otherSources in backend)
                businessProfit: record.income.otherSources?.businessProfit || '',
                grossReceipts: record.income.otherSources?.grossReceipts || '',

                section80C: record.deductions?.section80C || '',
                section80D: record.deductions?.section80D || '',
            });

            // Restore the Result View immediately for better UX
            setResult({
                ...record.computedTax,
                grossTotalIncome: (record.income.salary?.basic || 0) + 
                                  (record.income.salary?.hra || 0) + 
                                  (record.income.salary?.specialAllowance || 0) + 
                                  (record.income.otherSources?.businessProfit || 0),
                oldRegime: { taxableIncome: 0, tax: record.computedTax.oldRegimeTax },
                newRegime: { taxableIncome: 0, tax: record.computedTax.newRegimeTax },
                recommendation: record.computedTax.regimeSelected,
                savings: Math.abs(record.computedTax.oldRegimeTax - record.computedTax.newRegimeTax),
                suggestions: [], // In edit mode, we might not re-generate tips immediately
                advanceTax: { 
                    applicable: record.computedTax.taxPayable > 10000, 
                    schedule: [] // Re-calculation would generate this
                } 
            });
        }
    }, [location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- 2. CALCULATION ENGINE ---
    const calculateTax = async (e) => {
        e.preventDefault();
        
        // Prepare Payload based on Category
        const payload = {
            userId: user ? user._id : null,
            userCategory,
            income: {
                salary: userCategory === 'Salaried' ? {
                    basic: Number(formData.basic) || 0,
                    hra: Number(formData.hra) || 0,
                    specialAllowance: Number(formData.specialAllowance) || 0,
                    bonus: Number(formData.bonus) || 0
                } : {}, // Send empty salary if Business user
                otherSources: { 
                    businessProfit: Number(formData.businessProfit) || 0,
                    grossReceipts: Number(formData.grossReceipts) || 0 
                },
                capitalGains: { stcg: 0 }
            },
            deductions: {
                section80C: Number(formData.section80C) || 0,
                section80D: Number(formData.section80D) || 0
            }
        };

        try {
            const config = { 
                headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : '' }
            };
            
            // NOTE: If in Edit Mode, we typically still POST to calculate fresh values. 
            // The PUT route we made earlier is good if you want to save without seeing results first.
            const response = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/calculate', payload, config);
            
            setResult(response.data);
            
            if(editModeId) {
                // Optional: Trigger the PUT update in background if needed
                // axios.put(`.../${editModeId}`, payload...)
                alert("Calculation Updated! (Note: This is saved as a new record in history)");
            }

        } catch (error) {
            console.error(error);
            alert("Calculation failed. Please check your internet connection.");
        }
    };

    // --- 3. PDF GENERATION ---
    const generateAndDownloadPDF = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22); 
        doc.setTextColor(0, 51, 102); // Navy Blue
        doc.text("TaxBuddy Report", 14, 20);

        // Metadata
        doc.setFontSize(10); 
        doc.setTextColor(100);
        doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`User Category: ${userCategory}`, 14, 34);
        doc.text(`Payment Status: PAID`, 14, 40);

        // Income Table
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
            startY: 45,
            head: [['Income Source', 'Amount (Rs)']],
            body: bodyData,
            theme: 'grid',
            headStyles: { fillColor: [0, 123, 255] }
        });

        // Tax Comparison Table
        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Regime', 'Tax Payable']],
            body: [
                ['Old Regime', result.oldRegime.tax], 
                ['New Regime', result.newRegime.tax]
            ],
            theme: 'striped'
        });

        // Recommendation
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Recommendation: ${result.recommendation}`, 14, doc.lastAutoTable.finalY + 10);

        // Advance Tax Table (Only if applicable)
        if (result.advanceTax && result.advanceTax.applicable) {
            doc.text("Advance Tax Schedule:", 14, doc.lastAutoTable.finalY + 20);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 24,
                head: [['Due Date', 'Amount']],
                body: result.advanceTax.schedule.map(r => [r.dueDate, r.amountDue]),
                theme: 'grid',
                headStyles: { fillColor: [220, 53, 69] }
            });
        }

        doc.save(`TaxReport_${userCategory}.pdf`);
    };

    // --- 4. PAYMENT LOGIC ---
    const handlePayment = async () => {
        try {
            // Create Order
            const { data: order } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/payment/create-order');
            
            // Razorpay Options
            const options = {
                key: "rzp_test_RpW1q1Qc3IGHKW", // <--- REPLACE THIS WITH YOUR ACTUAL KEY ID (rzp_test_...)
                amount: order.amount,
                currency: "INR",
                name: "TaxBuddy Premium",
                description: "Detailed Tax Report",
                order_id: order.id,
                handler: function (response) {
                    alert("Payment Successful! Downloading Report...");
                    generateAndDownloadPDF();
                },
                theme: { color: "#3399cc" }
            };
            
            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Could not initiate payment. Check Backend Keys.");
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    return (
        <div className="calculator-container">
            {/* --- HEADER --- */}
            <div className="header-actions">
                <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <img src={logo} alt="Logo" style={{height:'35px'}} />
                        <h2 style={{margin:0}}>Tax Planner {editModeId ? '(Edit Mode)' : ''}</h2>
                    </div>
                    <small>Smart Tool for {userCategory} Users</small>
                </div>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    {user && (
                        <>
                            <Link to="/profile" className="btn-secondary">👤 Profile</Link>
                            <Link to="/dashboard" className="btn-secondary">View History</Link>
                            <button onClick={logout} className="btn-danger">Logout</button>
                        </>
                    )}
                </div>
            </div>

            {/* --- TOGGLE --- */}
            <div className="user-type-toggle">
                <button 
                    type="button" 
                    className={`toggle-btn ${userCategory === 'Salaried' ? 'active' : ''}`} 
                    onClick={() => setUserCategory('Salaried')}
                >
                    👨‍💼 Salaried (Salary + Business)
                </button>
                <button 
                    type="button" 
                    className={`toggle-btn ${userCategory === 'Business' ? 'active' : ''}`} 
                    onClick={() => setUserCategory('Business')}
                >
                    🏢 Business Only (No Salary)
                </button>
            </div>
            
            <form onSubmit={calculateTax}>
                {/* --- INPUTS FOR SALARIED --- */}
                {userCategory === 'Salaried' && (
                    <div className="section-card">
                        <div className="section-title">Salary Income</div>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Basic Salary</label>
                                <input type="number" name="basic" value={formData.basic} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>HRA Received</label>
                                <input type="number" name="hra" value={formData.hra} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Special Allowances</label>
                                <input type="number" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange} />
                            </div>
                            <div className="input-group">
                                <label>Bonus / Arrears</label>
                                <input type="number" name="bonus" value={formData.bonus} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- INPUTS FOR BUSINESS --- */}
                <div className="section-card">
                    <div className="section-title">{userCategory === 'Salaried' ? 'Other Sources / Business' : 'Business Income'}</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Gross Receipts / Turnover</label>
                            <input type="number" name="grossReceipts" value={formData.grossReceipts} onChange={handleChange} placeholder="Total Revenue" />
                        </div>
                        <div className="input-group">
                            <label>{userCategory === 'Business' ? 'Net Profit (Taxable)' : 'Net Business Income'}</label>
                            <input type="number" name="businessProfit" value={formData.businessProfit} onChange={handleChange} placeholder="Actual Profit" />
                        </div>
                    </div>
                </div>

                {/* --- DEDUCTIONS --- */}
                <div className="section-card">
                    <div className="section-title">Deductions (Old Regime)</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>80C (LIC/PPF) - Max 1.5L</label>
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
                <div style={{marginTop: '40px'}}>
                    <h3 style={{borderBottom:'1px solid #ddd', paddingBottom:'10px'}}>Calculation Results</h3>
                    
                    {/* Comparison Cards */}
                    <div className="result-container">
                        <div className={`result-card ${result.recommendation === "Old Regime" ? "winner" : ""}`}>
                            <h3>Old Regime</h3>
                            <h2>₹{Math.round(result.oldRegime.tax).toLocaleString()}</h2>
                            <small>Taxable Income: ₹{result.oldRegime.taxableIncome.toLocaleString()}</small>
                        </div>
                        <div className={`result-card ${result.recommendation === "New Regime" ? "winner" : ""}`}>
                            <h3>New Regime</h3>
                            <h2>₹{Math.round(result.newRegime.tax).toLocaleString()}</h2>
                            <small>Taxable Income: ₹{result.newRegime.taxableIncome.toLocaleString()}</small>
                        </div>
                    </div>

                    {/* Recommendation Banner */}
                    <div className="recommendation-banner" style={{marginTop:'20px', padding:'15px', background:'#e0f7fa', color:'#006064', borderRadius:'8px', textAlign:'center', fontSize:'16px'}}>
                        <strong>Recommendation:</strong> Based on your inputs, you should opt for the <strong>{result.recommendation}</strong>.
                        {result.savings > 0 && <span> You will save <strong>₹{result.savings.toLocaleString()}</strong>.</span>}
                    </div>

                    {/* Smart Tips */}
                    {result.suggestions && result.suggestions.length > 0 && (
                        <div className="tips-box">
                            <h4 style={{marginTop:0, color:'#856404'}}>💡 Tax Saving Tips</h4>
                            <ul style={{margin:0, paddingLeft:'20px', color:'#856404'}}>
                                {result.suggestions.map((tip, i) => <li key={i}>{tip}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Advance Tax Schedule */}
                    {result.advanceTax && result.advanceTax.applicable && (
                        <div style={{marginTop: '30px'}}>
                            <h4 style={{color:'#d9534f'}}>📅 Advance Tax Liability (Tax > ₹10,000)</h4>
                            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize:'14px'}}>
                                <thead>
                                    <tr style={{background:'#f8f9fa', textAlign:'left'}}>
                                        <th style={{padding:'10px', borderBottom:'2px solid #ddd'}}>Due Date</th>
                                        <th style={{padding:'10px', borderBottom:'2px solid #ddd'}}>Installment</th>
                                        <th style={{padding:'10px', borderBottom:'2px solid #ddd'}}>Amount Payable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.advanceTax.schedule.map((row, i) => (
                                        <tr key={i}>
                                            <td style={{padding:'10px', borderBottom:'1px solid #eee'}}>{row.dueDate}</td>
                                            <td style={{padding:'10px', borderBottom:'1px solid #eee'}}>{row.percentage}</td>
                                            <td style={{padding:'10px', borderBottom:'1px solid #eee', fontWeight:'bold'}}>₹{row.amountDue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pay Button */}
                    <button 
                        onClick={handlePayment} 
                        style={{
                            marginTop: '30px', 
                            padding: '16px', 
                            background: '#ffc107', 
                            width: '100%', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontWeight: 'bold', 
                            fontSize:'18px', 
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        🔒 Pay ₹49 to Download Detailed Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaxCalculator;