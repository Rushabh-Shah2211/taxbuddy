import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/rb_logo.png';
import './TaxCalculator.css';

const TaxCalculator = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // WIZARD STATE
    const [step, setStep] = useState(1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // FORM DATA
    const [formData, setFormData] = useState({
        financialYear: '2025-2026', // Default to New Year
        ageGroup: '<60',
        residentialStatus: 'Resident',
        salaryEnabled: false, basic: '', hra: '', gratuity: '', pension: '', prevSalary: '', allowances: '',
        businessEnabled: false, turnover: '', profit: '', is44AD: false, is44ADA: false, presumptiveRate: '6',
        hpEnabled: false, hpType: 'Self Occupied', rentReceived: '', municipalTaxes: '', interestPaid: '',
        otherEnabled: false, otherSources: [{ name: '', amount: '', expenses: '' }],
        tds: '', advanceTax: '', selfAssessment: ''
    });

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));
        else navigate('/');
    }, [navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Other Income Helpers
    const handleOtherIncomeChange = (index, e) => {
        const newSources = [...formData.otherSources];
        newSources[index][e.target.name] = e.target.value;
        setFormData({ ...formData, otherSources: newSources });
    };
    const addOtherIncomeRow = () => setFormData({ ...formData, otherSources: [...formData.otherSources, { name: '', amount: '', expenses: '' }] });
    const removeOtherIncomeRow = (index) => {
        const newSources = formData.otherSources.filter((_, i) => i !== index);
        setFormData({ ...formData, otherSources: newSources });
    };

    const calculateTax = async () => {
        setLoading(true);
        const payload = {
            userId: user ? user._id : null,
            financialYear: formData.financialYear,
            ageGroup: formData.ageGroup,
            residentialStatus: formData.residentialStatus,
            income: {
                salary: { 
                    enabled: formData.salaryEnabled,
                    basic: formData.basic, hra: formData.hra, gratuity: formData.gratuity, 
                    pension: formData.pension, prevSalary: formData.prevSalary, allowances: formData.allowances 
                },
                business: {
                    enabled: formData.businessEnabled,
                    turnover: formData.turnover, profit: formData.profit,
                    is44AD: formData.is44AD, is44ADA: formData.is44ADA, presumptiveRate: formData.presumptiveRate
                },
                houseProperty: {
                    enabled: formData.hpEnabled,
                    type: formData.hpType, rentReceived: formData.rentReceived,
                    municipalTaxes: formData.municipalTaxes, interestPaid: formData.interestPaid
                },
                otherIncome: {
                    enabled: formData.otherEnabled,
                    sources: formData.otherSources
                }
            },
            taxesPaid: { tds: formData.tds, advanceTax: formData.advanceTax, selfAssessment: formData.selfAssessment }
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : '' }};
            const response = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/calculate', payload, config);
            setResult(response.data);
            setStep(9); // Go to Result Page
        } catch (error) { alert("Calculation Failed"); }
        setLoading(false);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22); doc.setTextColor(126, 217, 87); doc.text("Artha by RB", 14, 20);
        doc.setFontSize(10); doc.setTextColor(0); 
        doc.text(`FY: ${formData.financialYear} | User: ${user.name}`, 14, 28);
        
        let inputRows = [];
        if(formData.salaryEnabled) inputRows.push(['Salary', `Basic: ${formData.basic}, HRA: ${formData.hra}`]);
        if(formData.businessEnabled) inputRows.push(['Business', `Turnover: ${formData.turnover}, Profit: ${formData.profit}`]);
        inputRows.push(['Taxes Paid', `TDS: ${formData.tds}`]);

        autoTable(doc, { startY: 35, head: [['Source', 'Details']], body: inputRows, theme: 'grid' });

        autoTable(doc, { 
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Regime', 'Tax Payable']], 
            body: [['Old Regime', result.oldRegimeTax], ['New Regime', result.newRegimeTax]],
            theme: 'striped',
            headStyles: { fillColor: [126, 217, 87] } 
        });

        doc.text(`Final Net Payable: ${result.netPayable}`, 14, doc.lastAutoTable.finalY + 10);
        doc.save("Artha_Full_Calculation.pdf");
    };

    const logout = () => { localStorage.removeItem('userInfo'); navigate('/'); };

    return (
        <div className="calculator-container">
            {/* TOP NAVBAR */}
            <div className="navbar">
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <img src={logo} alt="Logo" style={{height:'40px'}} />
                    <h2 style={{margin:0, fontSize:'22px', fontWeight:'600', color:'#2c3e50'}}>Artha</h2>
                </div>
                <div className="nav-links">
                    {user && (
                        <>
                            <span>Hi, {user.name}</span>
                            <Link to="/profile">Profile</Link>
                            <Link to="/dashboard">History</Link>
                            <button onClick={logout} className="logout-link">Logout</button>
                        </>
                    )}
                </div>
            </div>

            {step < 9 && <div className="step-indicator">Step {step} of 8</div>}

            <div className="wizard-content">
                {/* PAGE 1: BASIC INFO */}
                {step === 1 && (
                    <div className="fade-in">
                        <h3>📋 Basic Information</h3>
                        <div className="form-grid">
                            <div className="input-group"><label>Financial Year</label>
                                <select name="financialYear" value={formData.financialYear} onChange={handleChange}>
                                    <option value="2025-2026">FY 2025-26 (Return in 2026)</option>
                                    <option value="2024-2025">FY 2024-25 (Return in 2025)</option>
                                    <option value="2023-2024">FY 2023-24 (Past)</option>
                                </select>
                            </div>
                            <div className="input-group"><label>Age Group</label>
                                <select name="ageGroup" value={formData.ageGroup} onChange={handleChange}>
                                    <option value="<60">Below 60</option>
                                    <option value="60-80">60 - 80 (Senior)</option>
                                    <option value=">80">Above 80 (Super Senior)</option>
                                </select>
                            </div>
                            <div className="input-group"><label>Residential Status</label>
                                <select name="residentialStatus" value={formData.residentialStatus} onChange={handleChange}>
                                    <option value="Resident">Resident</option>
                                    <option value="NRI">Non-Resident (NRI)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* PAGE 2: SALARY */}
                {step === 2 && (
                    <div className="fade-in"><h3>💼 Salary Income</h3><div className="toggle-wrapper"><label>Do you have Salary Income?</label><div className="btn-group"><button className={formData.salaryEnabled?'active':''} onClick={()=>setFormData({...formData,salaryEnabled:true})}>Yes</button><button className={!formData.salaryEnabled?'active':''} onClick={()=>setFormData({...formData,salaryEnabled:false})}>No</button></div></div>{formData.salaryEnabled&&( <div className="form-grid"><input placeholder="Basic Salary" name="basic" value={formData.basic} onChange={handleChange}/><input placeholder="HRA" name="hra" value={formData.hra} onChange={handleChange}/><input placeholder="Gratuity" name="gratuity" value={formData.gratuity} onChange={handleChange}/><input placeholder="Pension" name="pension" value={formData.pension} onChange={handleChange}/><input placeholder="Prev. Employer Salary" name="prevSalary" value={formData.prevSalary} onChange={handleChange}/><input placeholder="Allowances" name="allowances" value={formData.allowances} onChange={handleChange}/></div>)}</div>
                )}
                
                {/* PAGE 3: BUSINESS */}
                {step === 3 && (
                    <div className="fade-in"><h3>🏢 Business / Profession</h3><div className="toggle-wrapper"><label>Do you have Business Income?</label><div className="btn-group"><button className={formData.businessEnabled?'active':''} onClick={()=>setFormData({...formData,businessEnabled:true})}>Yes</button><button className={!formData.businessEnabled?'active':''} onClick={()=>setFormData({...formData,businessEnabled:false})}>No</button></div></div>{formData.businessEnabled&&( <div className="form-grid"><input placeholder="Total Turnover" name="turnover" value={formData.turnover} onChange={handleChange}/><div className="checkbox-group"><label><input type="checkbox" checked={formData.is44AD} onChange={(e)=>setFormData({...formData,is44AD:e.target.checked})}/> 44AD</label><label><input type="checkbox" checked={formData.is44ADA} onChange={(e)=>setFormData({...formData,is44ADA:e.target.checked})}/> 44ADA</label></div>{ (formData.is44AD||formData.is44ADA)?(<> <input placeholder="Rate %" name="presumptiveRate" value={formData.presumptiveRate} onChange={handleChange}/><div className="live-calc">Est. Profit: ₹{(Number(formData.turnover)*(Number(formData.presumptiveRate)/100)).toFixed(0)}</div></>):(<input placeholder="Actual Net Profit" name="profit" value={formData.profit} onChange={handleChange}/>)}</div>)}</div>
                )}

                {/* PAGE 4: HOUSE PROPERTY */}
                {step === 4 && (
                    <div className="fade-in"><h3>🏠 House Property</h3><div className="toggle-wrapper"><label>Own House Property?</label><div className="btn-group"><button className={formData.hpEnabled?'active':''} onClick={()=>setFormData({...formData,hpEnabled:true})}>Yes</button><button className={!formData.hpEnabled?'active':''} onClick={()=>setFormData({...formData,hpEnabled:false})}>No</button></div></div>{formData.hpEnabled&&( <><select name="hpType" value={formData.hpType} onChange={handleChange} style={{marginBottom:'15px'}}><option value="Self Occupied">Self Occupied</option><option value="Rented">Rented</option></select><div className="form-grid">{formData.hpType==='Rented'&&( <><input placeholder="Rent Received" name="rentReceived" value={formData.rentReceived} onChange={handleChange}/><input placeholder="Municipal Taxes" name="municipalTaxes" value={formData.municipalTaxes} onChange={handleChange}/></>)}<input placeholder="Interest on Loan" name="interestPaid" value={formData.interestPaid} onChange={handleChange}/></div></>)}</div>
                )}

                {/* PAGE 5: OTHER INCOME */}
                {step === 5 && (
                    <div className="fade-in"><h3>💰 Other Income</h3><div className="toggle-wrapper"><label>Other income?</label><div className="btn-group"><button className={formData.otherEnabled?'active':''} onClick={()=>setFormData({...formData,otherEnabled:true})}>Yes</button><button className={!formData.otherEnabled?'active':''} onClick={()=>setFormData({...formData,otherEnabled:false})}>No</button></div></div>{formData.otherEnabled&&( <div>{formData.otherSources.map((source,index)=>( <div key={index} className="form-grid" style={{marginBottom:'10px'}}><input placeholder="Name" name="name" value={source.name} onChange={(e)=>handleOtherIncomeChange(index,e)}/><input placeholder="Amount" name="amount" value={source.amount} onChange={(e)=>handleOtherIncomeChange(index,e)}/><input placeholder="Expenses" name="expenses" value={source.expenses} onChange={(e)=>handleOtherIncomeChange(index,e)}/>{index>0&&<button className="btn-danger-small" onClick={()=>removeOtherIncomeRow(index)}>X</button>}</div>))}<button className="btn-secondary" onClick={addOtherIncomeRow}>+ Add Line</button></div>)}</div>
                )}

                {/* PAGE 6 & 7: COMING SOON */}
                {(step===6||step===7)&&(<div className="fade-in" style={{textAlign:'center',padding:'40px'}}><h2>🚧 Coming Soon</h2><p>Capital Gains & Deductions modules are under development.</p></div>)}

                {/* PAGE 8: TAXES PAID */}
                {step === 8 && (
                    <div className="fade-in"><h3>💸 Taxes Paid</h3><div className="form-grid"><div className="input-group"><label>TDS Deducted</label><input name="tds" value={formData.tds} onChange={handleChange}/></div><div className="input-group"><label>Advance Tax</label><input name="advanceTax" value={formData.advanceTax} onChange={handleChange}/></div><div className="input-group"><label>Self Assessment</label><input name="selfAssessment" value={formData.selfAssessment} onChange={handleChange}/></div></div></div>
                )}

                {/* PAGE 9: INTERACTIVE DASHBOARD RESULT */}
                {step === 9 && result && (
                    <div className="fade-in">
                        {/* 1. Header with Edit Button */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                            <h3>🎉 Calculation Summary</h3>
                            <button className="btn-secondary" onClick={()=>setStep(1)}>✏️ Edit Inputs</button>
                        </div>
                        
                        {/* 2. Visual Comparison Cards */}
                        <div className="result-container" style={{display:'flex', gap:'20px', marginBottom:'30px'}}>
                            <div className="result-card" style={{flex:1, padding:'20px', background:'#f8f9fa', borderRadius:'15px', border:'1px solid #ddd'}}>
                                <h4 style={{color:'#666'}}>Total Income</h4>
                                <h2 style={{fontSize:'28px'}}>₹{(result.grossTotalIncome/100000).toFixed(2)} Lakhs</h2>
                                <div style={{height:'10px', background:'#e0e0e0', borderRadius:'5px', marginTop:'10px', overflow:'hidden'}}>
                                    <div style={{width:'100%', height:'100%', background:'#007bff'}}></div>
                                </div>
                            </div>
                            <div className="result-card" style={{flex:1, padding:'20px', background:'#e8f5e9', borderRadius:'15px', border:'2px solid #28a745'}}>
                                <h4 style={{color:'#2e7d32'}}>Tax Payable</h4>
                                <h2 style={{fontSize:'28px', color:'#2e7d32'}}>₹{result.netPayable.toLocaleString()}</h2>
                                <div style={{height:'10px', background:'#c8e6c9', borderRadius:'5px', marginTop:'10px', overflow:'hidden'}}>
                                    <div style={{width: `${(result.netPayable/result.grossTotalIncome)*100}%`, height:'100%', background:'#28a745'}}></div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Regime Comparison Table */}
                        <div className="comparison-box" style={{background:'white', padding:'20px', borderRadius:'15px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', marginBottom:'30px'}}>
                            <h4 style={{marginBottom:'15px'}}>Regime Comparison</h4>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                                <div style={{padding:'15px', background: result.recommendation === "Old Regime" ? '#d4edda' : '#f8f9fa', borderRadius:'10px', border:'1px solid #ddd'}}>
                                    <strong>Old Regime</strong>
                                    <div style={{fontSize:'24px', marginTop:'5px'}}>₹{result.oldRegimeTax.toLocaleString()}</div>
                                </div>
                                <div style={{padding:'15px', background: result.recommendation === "New Regime" ? '#d4edda' : '#f8f9fa', borderRadius:'10px', border:'1px solid #ddd'}}>
                                    <strong>New Regime</strong>
                                    <div style={{fontSize:'24px', marginTop:'5px'}}>₹{result.newRegimeTax.toLocaleString()}</div>
                                </div>
                            </div>
                            <div style={{marginTop:'15px', textAlign:'center', color:'#28a745', fontWeight:'bold'}}>
                                💡 Suggested: {result.recommendation}
                            </div>
                        </div>

                        {/* 4. Action Buttons */}
                        <div style={{display:'flex', gap:'15px'}}>
                             <button onClick={downloadPDF} className="btn-success" style={{flex:1, padding:'15px', fontSize:'16px'}}>
                                📄 Download Full Report
                            </button>
                             <button onClick={()=>navigate('/dashboard')} className="btn-primary" style={{flex:1, padding:'15px', fontSize:'16px'}}>
                                Save & Go to History
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="wizard-footer">
                {step > 1 && step < 9 && <button className="btn-secondary" onClick={()=>setStep(step-1)}>Back</button>}
                {step < 8 && <button className="btn-primary" onClick={()=>setStep(step+1)}>Next</button>}
                {step === 8 && <button className="btn-success" onClick={calculateTax}>{loading ? 'Calculating...' : 'Submit'}</button>}
            </div>
        </div>
    );
};

export default TaxCalculator;