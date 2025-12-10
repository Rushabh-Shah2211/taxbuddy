// client/src/components/TaxCalculator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/rb_logo.png'; 
import './TaxCalculator.css';

const TaxCalculator = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // States
    const [userCategory, setUserCategory] = useState('Salaried');
    const [financialYear, setFinancialYear] = useState('2024-2025'); // NEW State
    const [formData, setFormData] = useState({
        basic: '', hra: '', specialAllowance: '', bonus: '',
        grossReceipts: '', businessProfit: '',
        section80C: '', section80D: ''
    });
    const [result, setResult] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));

        if (location.state && location.state.recordToEdit) {
            const record = location.state.recordToEdit;
            setUserCategory(record.userCategory || 'Salaried');
            setFinancialYear(record.financialYear || '2024-2025');
            setFormData({
                basic: record.income.salary?.basic || '',
                hra: record.income.salary?.hra || '',
                specialAllowance: record.income.salary?.specialAllowance || '',
                bonus: record.income.salary?.bonus || '',
                businessProfit: record.income.otherSources?.businessProfit || '',
                grossReceipts: record.income.otherSources?.grossReceipts || '',
                section80C: record.deductions?.section80C || '',
                section80D: record.deductions?.section80D || '',
            });
        }
    }, [location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const calculateTax = async (e) => {
        e.preventDefault();
        const apiUrl = 'https://taxbuddy-o5wu.onrender.com/api/tax/calculate';

        const payload = {
            userId: user ? user._id : null,
            userCategory,
            financialYear, // Send FY
            income: {
                salary: userCategory === 'Salaried' ? {
                    basic: Number(formData.basic),
                    hra: Number(formData.hra),
                    specialAllowance: Number(formData.specialAllowance),
                    bonus: Number(formData.bonus)
                } : {},
                otherSources: { 
                    businessProfit: Number(formData.businessProfit),
                    grossReceipts: Number(formData.grossReceipts) 
                }
            },
            deductions: {
                section80C: Number(formData.section80C),
                section80D: Number(formData.section80D)
            }
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : '' }};
            const response = await axios.post(apiUrl, payload, config);
            setResult(response.data);
        } catch (error) {
            alert("Calculation failed.");
        }
    };

    // --- DIRECT DOWNLOAD (No Payment) ---
    const downloadPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(22); doc.setTextColor(0, 51, 102);
        doc.text("Artha by RB", 14, 20);
        doc.setFontSize(12); doc.setTextColor(100);
        doc.text("Taxes. Refined. Redefined.", 14, 26);

        doc.setFontSize(10); doc.setTextColor(0);
        doc.text(`Financial Year: ${financialYear}`, 14, 34);
        doc.text(`Category: ${userCategory}`, 14, 39);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 44);

        // Income Table
        let bodyData = userCategory === 'Salaried' ? 
            [['Basic Salary', formData.basic || 0], ['HRA', formData.hra || 0], ['Allowances', formData.specialAllowance || 0], ['Other', formData.bonus || 0], ['Business Profit', formData.businessProfit || 0]] : 
            [['Gross Receipts', formData.grossReceipts || 0], ['Net Profit', formData.businessProfit || 0]];
        
        autoTable(doc, {
            startY: 50, head: [['Income Head', 'Amount (Rs)']], body: bodyData,
            theme: 'grid', headStyles: { fillColor: [0, 123, 255] }
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Regime', 'Tax Payable']],
            body: [['Old Regime', result.oldRegime.tax], ['New Regime', result.newRegime.tax]],
            theme: 'striped'
        });

        doc.text(`Recommendation: ${result.recommendation}`, 14, doc.lastAutoTable.finalY + 10);

        if (result.advanceTax && result.advanceTax.applicable) {
            doc.text("Advance Tax Schedule:", 14, doc.lastAutoTable.finalY + 20);
            autoTable(doc, {
                startY: doc.lastAutoTable.finalY + 24,
                head: [['Due Date', 'Amount']],
                body: result.advanceTax.schedule.map(r => [r.dueDate, r.amountDue]),
                theme: 'grid'
            });
        }
        doc.save(`Artha_Report_${financialYear}.pdf`);
    };

    const logout = () => { localStorage.removeItem('userInfo'); navigate('/'); };

    return (
        <div className="calculator-container">
            <div className="header-actions">
                <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <img src={logo} alt="Logo" style={{height:'35px'}} />
                        <h2 style={{margin:0}}>Artha by RB</h2>
                    </div>
                    <small>Taxes. Refined. Redefined.</small>
                </div>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    {user && (
                        <>
                            <Link to="/profile" className="btn-secondary">👤 Profile</Link>
                            <Link to="/dashboard" className="btn-secondary">History</Link>
                            <button onClick={logout} className="btn-danger">Logout</button>
                        </>
                    )}
                </div>
            </div>

            {/* CONTROLS ROW: Category & Financial Year */}
            <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
                <div className="user-type-toggle" style={{flex:1, marginBottom:0}}>
                    <button type="button" className={`toggle-btn ${userCategory === 'Salaried' ? 'active' : ''}`} onClick={() => setUserCategory('Salaried')}>Salaried</button>
                    <button type="button" className={`toggle-btn ${userCategory === 'Business' ? 'active' : ''}`} onClick={() => setUserCategory('Business')}>Business</button>
                </div>
                
                <div style={{flex:1}}>
                    <select 
                        value={financialYear} 
                        onChange={(e) => setFinancialYear(e.target.value)}
                        style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #ccc', background:'#f1f3f6', fontWeight:'bold', color:'#555'}}
                    >
                        <option value="2024-2025">FY 2024-25 (Return filed in 2025)</option>
                        <option value="2023-2024">FY 2023-24 (Return filed in 2024)</option>
                    </select>
                </div>
            </div>
            
            <form onSubmit={calculateTax}>
                {userCategory === 'Salaried' ? (
                     <div className="section-card"><div className="section-title">Salary Info</div>
                        <div className="form-grid">
                            <input placeholder="Basic Salary" name="basic" value={formData.basic} onChange={handleChange} />
                            <input placeholder="HRA" name="hra" value={formData.hra} onChange={handleChange} />
                            <input placeholder="Special Allowance" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange} />
                            <input placeholder="Bonus" name="bonus" value={formData.bonus} onChange={handleChange} />
                        </div>
                     </div>
                ) : (
                    <div className="section-card"><div className="section-title">Business Info</div>
                        <div className="form-grid">
                             <input placeholder="Gross Receipts" name="grossReceipts" value={formData.grossReceipts} onChange={handleChange} />
                             <input placeholder="Net Profit" name="businessProfit" value={formData.businessProfit} onChange={handleChange} />
                        </div>
                    </div>
                )}

                {/* Shared Business Income for Salaried */}
                {userCategory === 'Salaried' && (
                    <div className="section-card"><div className="section-title">Other Income</div>
                        <div className="form-grid">
                            <input placeholder="Side Business / Freelance Profit" name="businessProfit" value={formData.businessProfit} onChange={handleChange} />
                        </div>
                    </div>
                )}
                
                <div className="section-card"><div className="section-title">Deductions</div>
                    <div className="form-grid">
                        <input placeholder="80C" name="section80C" value={formData.section80C} onChange={handleChange} />
                        <input placeholder="80D" name="section80D" value={formData.section80D} onChange={handleChange} />
                    </div>
                </div>
                <button type="submit" className="btn-primary">Calculate Tax</button>
            </form>

            {result && (
                <div style={{marginTop: '40px'}}>
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

                    <div className="recommendation-banner" style={{marginTop:'20px', padding:'15px', background:'#e0f7fa', color:'#006064', borderRadius:'8px', textAlign:'center'}}>
                        Recommendation: <strong>{result.recommendation}</strong> (FY: {financialYear})
                    </div>

                    {result.advanceTax?.applicable && (
                        <div style={{marginTop: '20px'}}>
                            <h4 style={{color:'#d9534f'}}>Advance Tax Schedule</h4>
                            <table style={{width: '100%', borderCollapse: 'collapse', fontSize:'14px'}}>
                                <tbody>
                                    {result.advanceTax.schedule.map((row, i) => (
                                        <tr key={i}><td style={{padding:'5px', borderBottom:'1px solid #eee'}}>{row.dueDate}</td><td style={{padding:'5px', borderBottom:'1px solid #eee'}}>₹{row.amountDue.toLocaleString()}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* DIRECT DOWNLOAD BUTTON */}
                    <button onClick={downloadPDF} style={{marginTop: '30px', padding: '16px', background: '#28a745', width: '100%', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize:'18px', color:'white', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
                        📄 Download Detailed Report (Free)
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaxCalculator;