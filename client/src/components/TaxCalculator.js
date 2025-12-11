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

    const [userCategory, setUserCategory] = useState('Salaried');
    const [financialYear, setFinancialYear] = useState('2024-2025');
    
    // EXPANDED FORM DATA
    const [formData, setFormData] = useState({
        // Salary
        basic: '', hra: '', specialAllowance: '', bonus: '',
        // Business
        grossReceipts: '', businessProfit: '',
        // House Property
        houseProperty: '', // Can be negative for Loss
        // Capital Gains
        stcg: '', ltcg: '',
        // Other Sources
        interestIncome: '', otherIncome: '',
        // Deductions
        section80C: '', section80D: ''
    });
    const [result, setResult] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));

        if (location.state && location.state.recordToEdit) {
            const r = location.state.recordToEdit;
            setUserCategory(r.userCategory);
            setFinancialYear(r.financialYear);
            setFormData({
                basic: r.income.salary?.basic || '',
                hra: r.income.salary?.hra || '',
                specialAllowance: r.income.salary?.specialAllowance || '',
                bonus: r.income.salary?.bonus || '',
                businessProfit: r.income.otherSources?.businessProfit || '',
                grossReceipts: r.income.otherSources?.grossReceipts || '',
                
                // New Fields
                houseProperty: r.income.houseProperty || '',
                stcg: r.income.capitalGains?.stcg || '',
                ltcg: r.income.capitalGains?.ltcg || '',
                interestIncome: r.income.otherSources?.interestIncome || '',
                otherIncome: r.income.otherSources?.otherIncome || '',

                section80C: r.deductions?.section80C || '',
                section80D: r.deductions?.section80D || ''
            });
        }
    }, [location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const calculateTax = async (e) => {
        e.preventDefault();
        const payload = {
            userId: user ? user._id : null,
            userCategory, financialYear,
            income: {
                salary: userCategory === 'Salaried' ? {
                    basic: Number(formData.basic), hra: Number(formData.hra), specialAllowance: Number(formData.specialAllowance), bonus: Number(formData.bonus)
                } : {},
                otherSources: { 
                    businessProfit: Number(formData.businessProfit), 
                    grossReceipts: Number(formData.grossReceipts),
                    interestIncome: Number(formData.interestIncome),
                    otherIncome: Number(formData.otherIncome)
                },
                houseProperty: Number(formData.houseProperty), // Can be negative
                capitalGains: {
                    stcg: Number(formData.stcg),
                    ltcg: Number(formData.ltcg)
                }
            },
            deductions: {
                section80C: Number(formData.section80C), section80D: Number(formData.section80D)
            }
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : '' }};
            const response = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/calculate', payload, config);
            setResult(response.data);
        } catch (error) { alert("Calculation Failed"); }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22); doc.setTextColor(0, 51, 102); doc.text("Artha by RB", 14, 20);
        
        let bodyData = [
            ['House Property', formData.houseProperty || 0],
            ['Capital Gains', (Number(formData.stcg)||0) + (Number(formData.ltcg)||0)],
            ['Other Sources', (Number(formData.interestIncome)||0) + (Number(formData.otherIncome)||0)]
        ];
        if(userCategory === 'Salaried') bodyData.unshift(['Salary Income', formData.basic || 0]);
        else bodyData.unshift(['Business Income', formData.businessProfit || 0]);

        autoTable(doc, { startY: 40, head: [['Head', 'Amount']], body: bodyData });
        // ... (Keep existing PDF tax table logic) ...
        doc.save("Artha_Report.pdf");
    };

    const logout = () => { localStorage.removeItem('userInfo'); navigate('/'); };

    return (
        <div className="calculator-container">
            {/* HEADER */}
            <div className="header-actions">
                <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <img src={logo} alt="Logo" style={{height:'40px'}} />
                        <h2 style={{margin:0}}>Artha by RB</h2>
                    </div>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                     {user && <><Link to="/dashboard" className="btn-secondary">History</Link><button onClick={logout} className="btn-danger">Logout</button></>}
                </div>
            </div>

            <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
                <div className="user-type-toggle" style={{flex:1, marginBottom:0}}>
                    <button type="button" className={`toggle-btn ${userCategory === 'Salaried' ? 'active' : ''}`} onClick={() => setUserCategory('Salaried')}>Salaried</button>
                    <button type="button" className={`toggle-btn ${userCategory === 'Business' ? 'active' : ''}`} onClick={() => setUserCategory('Business')}>Business</button>
                </div>
                <div style={{flex:1}}>
                    <select value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #ccc', background:'#f1f3f6'}}>
                        <option value="2024-2025">FY 2024-25</option>
                        <option value="2023-2024">FY 2023-24</option>
                    </select>
                </div>
            </div>
            
            <form onSubmit={calculateTax}>
                {/* 1. PRIMARY INCOME */}
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

                {/* 2. NEW INCOME HEADS */}
                <div className="section-card"><div className="section-title">Other Income Sources</div>
                    <div className="form-grid">
                        <input type="number" placeholder="House Property (Rent or -Loss)" name="houseProperty" value={formData.houseProperty} onChange={handleChange} />
                        <input type="number" placeholder="Interest Income (Savings/FD)" name="interestIncome" value={formData.interestIncome} onChange={handleChange} />
                        <input type="number" placeholder="Short Term Cap Gains (STCG)" name="stcg" value={formData.stcg} onChange={handleChange} />
                        <input type="number" placeholder="Long Term Cap Gains (LTCG)" name="ltcg" value={formData.ltcg} onChange={handleChange} />
                        {userCategory === 'Salaried' && <input type="number" placeholder="Side Business Profit" name="businessProfit" value={formData.businessProfit} onChange={handleChange} />}
                    </div>
                </div>
                
                {/* 3. DEDUCTIONS */}
                <div className="section-card"><div className="section-title">Deductions</div>
                    <div className="form-grid">
                        <input placeholder="80C (Max 1.5L)" name="section80C" value={formData.section80C} onChange={handleChange} />
                        <input placeholder="80D (Health Ins)" name="section80D" value={formData.section80D} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="btn-primary">Calculate Tax</button>
            </form>

            {/* RESULTS & AI TIPS */}
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
                        Recommendation: <strong>{result.recommendation}</strong>
                    </div>

                    {/* NEW AI TIPS SECTION */}
                    {result.suggestions && result.suggestions.length > 0 && (
                        <div className="tips-box">
                            <h4 style={{marginTop:0, color:'#856404'}}>🤖 Artha AI Recommendations</h4>
                            <ul style={{margin:0, paddingLeft:'20px', color:'#856404'}}>
                                {result.suggestions.map((tip, i) => (
                                    <li key={i} style={{marginBottom:'8px'}} dangerouslySetInnerHTML={{__html: tip}}></li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button onClick={downloadPDF} style={{marginTop: '20px', padding: '15px', background: '#28a745', width: '100%', border: 'none', borderRadius: '8px', color:'white', fontWeight:'bold', cursor:'pointer'}}>Download Report</button>
                </div>
            )}
        </div>
    );
};

export default TaxCalculator;