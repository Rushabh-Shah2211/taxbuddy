import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Added useLocation
import logo from '../assets/rb_logo.png';
import './TaxCalculator.css';
import AITaxAdvisor from './AITaxAdvisor';
import DetailedSalaryCalculator from './DetailedSalaryCalculator';
import CapitalGainsCalculator from './CapitalGainsCalculator';
import DeductionsCalculator from './DeductionsCalculator';
import { generateTaxReportPDF } from '../utils/pdfGenerator';

const TaxCalculator = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation(); // Hook to access passed data

    // WIZARD STATE
    const [step, setStep] = useState(1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // FORM DATA INITIAL STATE
    const [formData, setFormData] = useState({
        financialYear: '2025-2026', 
        ageGroup: '<60',
        residentialStatus: 'Resident',
        
        // SALARY
        salaryEnabled: false, 
        detailedMode: false,
        basic: '', hra: '', gratuity: '', pension: '', prevSalary: '', allowances: '',
        rentPaid: '', isMetro: false, // Explicitly add these for hydration
        
        // BUSINESS
        business: { 
            enabled: false, 
            businesses: [{ type: 'Presumptive', name: '', turnover: '', profit: '', presumptiveRate: '6' }] 
        },

        // HOUSE PROPERTY
        hpEnabled: false, hpType: 'Self Occupied', rentReceived: '', municipalTaxes: '', interestPaid: '',
        
        // CAPITAL GAINS
        capitalGains: {},

        // OTHER INCOME
        otherEnabled: false, otherSources: [{ name: '', amount: '', expenses: '' }],
        
        // DEDUCTIONS
        deductions: {},

        // TAXES PAID
        tds: '', advanceTax: '', selfAssessment: ''
    });

    useEffect(() => {
        // 1. Auth Check
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        } else {
            navigate('/');
            return;
        }

        // 2. CHECK FOR RECORD TO EDIT (This fixes the blank screen issue)
        if (location.state && location.state.recordToEdit) {
            const rec = location.state.recordToEdit;
            const inc = rec.income || {};
            const sal = inc.salary || {};
            const salDetails = sal.details || {}; // Raw inputs from backend

            // Map DB Record back to Form State
            setFormData({
                financialYear: rec.financialYear || '2025-2026',
                ageGroup: rec.ageGroup || '<60',
                residentialStatus: rec.residentialStatus || 'Resident',

                // --- Salary Re-hydration ---
                salaryEnabled: sal.enabled || false,
                detailedMode: sal.detailedMode || false,
                basic: sal.basic || '',
                hra: sal.hra || '',
                allowances: sal.allowances || '',
                
                // IMPORTANT: Restore Raw Inputs for Detailed Mode
                // If detailed input exists (Object), use it. Otherwise use the taxable amount (Number).
                gratuity: salDetails.gratuityInput || sal.gratuity || '',
                leaveEncashment: salDetails.leaveInput || sal.leaveEncashment || '',
                pension: salDetails.pensionInput || sal.pension || '',
                perquisites: sal.perquisites || '',
                rentPaid: salDetails.rentPaid || '',
                isMetro: salDetails.isMetro || false,

                // --- Business ---
                business: inc.business || { enabled: false, businesses: [{ type: 'Presumptive', name: '', turnover: '', profit: '', presumptiveRate: '6' }] },

                // --- House Property ---
                hpEnabled: inc.houseProperty?.enabled || false,
                hpType: inc.houseProperty?.type || 'Self Occupied',
                rentReceived: inc.houseProperty?.rentReceived || '',
                municipalTaxes: inc.houseProperty?.municipalTaxes || '',
                interestPaid: inc.houseProperty?.interestPaid || '',

                // --- Capital Gains ---
                capitalGains: inc.capitalGains || { enabled: false },

                // --- Other Income ---
                otherEnabled: inc.otherIncome?.enabled || false,
                otherSources: inc.otherIncome?.sources?.length > 0 ? inc.otherIncome.sources : [{ name: '', amount: '', expenses: '' }],

                // --- Deductions ---
                deductions: rec.deductions || { enabled: false },

                // --- Taxes Paid ---
                tds: rec.taxesPaid?.tds || '',
                advanceTax: rec.taxesPaid?.advanceTax || '',
                selfAssessment: rec.taxesPaid?.selfAssessment || ''
            });
        }
    }, [navigate, location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // --- BUSINESS HELPERS ---
    const addBusiness = () => {
        const newBiz = [...formData.business.businesses, { type: 'Presumptive', name: '', turnover: '', profit: '', presumptiveRate: '6' }];
        setFormData({ ...formData, business: { ...formData.business, businesses: newBiz } });
    };

    const removeBusiness = (index) => {
        const newBiz = [...formData.business.businesses];
        newBiz.splice(index, 1);
        setFormData({ ...formData, business: { ...formData.business, businesses: newBiz } });
    };

    const updateBusiness = (index, field, value) => {
        const newBiz = [...formData.business.businesses];
        newBiz[index][field] = value;
        setFormData({ ...formData, business: { ...formData.business, businesses: newBiz } });
    };

    // --- OTHER INCOME HELPERS ---
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

    // --- CALCULATION LOGIC ---
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
                    ...formData // Passes flattened salary fields
                },
                business: formData.business,
                houseProperty: {
                    enabled: formData.hpEnabled,
                    type: formData.hpType, rentReceived: formData.rentReceived,
                    municipalTaxes: formData.municipalTaxes, interestPaid: formData.interestPaid
                },
                capitalGains: formData.capitalGains,
                otherIncome: {
                    enabled: formData.otherEnabled,
                    sources: formData.otherSources
                }
            },
            deductions: formData.deductions,
            taxesPaid: { tds: formData.tds, advanceTax: formData.advanceTax, selfAssessment: formData.selfAssessment }
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : '' }};
            const response = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/calculate', payload, config);
            setResult(response.data);
            setStep(9); // Go to Result Page
        } catch (error) { 
            console.error(error);
            alert("Calculation Failed. Please check inputs."); 
        }
        setLoading(false);
    };

    // --- PDF EXPORT ---
    const handleDownloadPDF = () => {
        if (user && result) {
            generateTaxReportPDF(user, formData, result);
        }
    };

    const logout = () => { localStorage.removeItem('userInfo'); navigate('/'); };

    const getMonthlyTDS = () => {
        if (!result || result.netPayable <= 0) return 0;
        const currentMonth = new Date().getMonth(); 
        let monthsRemaining = (currentMonth > 2) ? (11 - currentMonth) + 3 : 2 - currentMonth;
        if (monthsRemaining <= 0) monthsRemaining = 1;
        return Math.round(result.netPayable / monthsRemaining);
    };

    return (
        <div className="calculator-container">
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
                {step === 1 && (<div className="fade-in"><h3>📋 Basic Information</h3><div className="form-grid"><div className="input-group"><label>Financial Year</label><select name="financialYear" value={formData.financialYear} onChange={handleChange}><option value="2025-2026">FY 2025-26 (Latest)</option><option value="2024-2025">FY 2024-25</option><option value="2023-2024">FY 2023-24</option></select></div><div className="input-group"><label>Age Group</label><select name="ageGroup" value={formData.ageGroup} onChange={handleChange}><option value="<60">Below 60</option><option value="60-80">60 - 80 (Senior)</option><option value=">80">Above 80 (Super Senior)</option></select></div><div className="input-group"><label>Residential Status</label><select name="residentialStatus" value={formData.residentialStatus} onChange={handleChange}><option value="Resident">Resident</option><option value="NRI">Non-Resident</option></select></div></div></div>)}
                
                {step === 2 && (<div className="fade-in"><h3>💼 Salary Income</h3><DetailedSalaryCalculator onDataChange={(data) => {setFormData(prev => ({ ...prev, salaryEnabled: true, ...data }));}} initialData={formData} /></div>)}

                {step === 3 && (
                    <div className="fade-in">
                        <h3>🏢 Business / Profession</h3>
                        <div className="toggle-wrapper"><label>Business Income?</label><div className="btn-group"><button className={formData.business.enabled?'active':''} onClick={()=>setFormData({...formData, business:{...formData.business, enabled:true}})}>Yes</button><button className={!formData.business.enabled?'active':''} onClick={()=>setFormData({...formData, business:{...formData.business, enabled:false}})}>No</button></div></div>
                        {formData.business.enabled && (
                            <div>
                                {formData.business.businesses.map((biz, idx) => (
                                    <div key={idx} style={{marginBottom:'20px', padding:'15px', background:'#f8f9fa', borderRadius:'10px', border:'1px solid #eee'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}><strong style={{color:'#667eea'}}>Business Source #{idx+1}</strong>{idx > 0 && <button onClick={()=>removeBusiness(idx)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Remove</button>}</div>
                                        <div style={{marginBottom:'10px'}}><label style={{display:'block', fontSize:'12px', marginBottom:'5px'}}>Taxation Type</label><select value={biz.type} onChange={(e)=>updateBusiness(idx, 'type', e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}}><option value="Presumptive">44AD/ADA (Presumptive - No Audit)</option><option value="Regular">Regular (Net Profit - With Audit)</option></select></div>
                                        <div className="form-grid"><input placeholder="Business Name" value={biz.name} onChange={(e)=>updateBusiness(idx, 'name', e.target.value)} />{biz.type === 'Presumptive' ? (<><input placeholder="Gross Turnover" type="number" value={biz.turnover} onChange={(e)=>updateBusiness(idx, 'turnover', e.target.value)} /><div><input placeholder="Rate % (6 or 8)" type="number" value={biz.presumptiveRate} onChange={(e)=>updateBusiness(idx, 'presumptiveRate', e.target.value)} />{biz.turnover && biz.presumptiveRate && (<div className="live-calc">Est. Income: ₹{(Number(biz.turnover) * (Number(biz.presumptiveRate)/100)).toFixed(0)}</div>)}</div></>) : (<input placeholder="Net Profit (After Expenses)" type="number" value={biz.profit} onChange={(e)=>updateBusiness(idx, 'profit', e.target.value)} />)}</div>
                                    </div>
                                ))}
                                <button className="btn-secondary" onClick={addBusiness} style={{width:'100%'}}>+ Add Another Business</button>
                            </div>
                        )}
                    </div>
                )}

                {step === 4 && (<div className="fade-in"><h3>🏠 House Property</h3><div className="toggle-wrapper"><label>Own House Property?</label><div className="btn-group"><button className={formData.hpEnabled?'active':''} onClick={()=>setFormData({...formData,hpEnabled:true})}>Yes</button><button className={!formData.hpEnabled?'active':''} onClick={()=>setFormData({...formData,hpEnabled:false})}>No</button></div></div>{formData.hpEnabled&&( <><select name="hpType" value={formData.hpType} onChange={handleChange} style={{marginBottom:'15px'}}><option value="Self Occupied">Self Occupied</option><option value="Rented">Rented</option></select><div className="form-grid">{formData.hpType==='Rented'&&( <><input placeholder="Rent Received" name="rentReceived" value={formData.rentReceived} onChange={handleChange}/><input placeholder="Municipal Taxes" name="municipalTaxes" value={formData.municipalTaxes} onChange={handleChange}/></>)}<input placeholder="Interest on Loan" name="interestPaid" value={formData.interestPaid} onChange={handleChange}/></div></>)}</div>)}
                {step === 5 && (<div className="fade-in"><h3>💰 Other Income</h3><div className="toggle-wrapper"><label>Other income?</label><div className="btn-group"><button className={formData.otherEnabled?'active':''} onClick={()=>setFormData({...formData,otherEnabled:true})}>Yes</button><button className={!formData.otherEnabled?'active':''} onClick={()=>setFormData({...formData,otherEnabled:false})}>No</button></div></div>{formData.otherEnabled&&( <div>{formData.otherSources.map((source,index)=>( <div key={index} className="form-grid" style={{marginBottom:'10px'}}><input placeholder="Name" name="name" value={source.name} onChange={(e)=>handleOtherIncomeChange(index,e)}/><input placeholder="Amount" name="amount" value={source.amount} onChange={(e)=>handleOtherIncomeChange(index,e)}/><input placeholder="Expenses" name="expenses" value={source.expenses} onChange={(e)=>handleOtherIncomeChange(index,e)}/>{index>0&&<button className="btn-danger-small" onClick={()=>removeOtherIncomeRow(index)}>X</button>}</div>))}<button className="btn-secondary" onClick={addOtherIncomeRow}>+ Add Line</button></div>)}</div>)}
                {step === 6 && (<div className="fade-in"><h3>📈 Capital Gains</h3><CapitalGainsCalculator initialData={formData.capitalGains} onDataChange={(data) => setFormData({ ...formData, capitalGains: data })}/></div>)}
                {step === 7 && (<div className="fade-in"><h3>🛡️ Deductions (Chapter VI-A)</h3><DeductionsCalculator initialData={formData.deductions} onDataChange={(data) => setFormData({ ...formData, deductions: data })}/></div>)}
                {step === 8 && (<div className="fade-in"><h3>💸 Taxes Paid</h3><div className="form-grid"><div className="input-group"><label>TDS Deducted</label><input name="tds" value={formData.tds} onChange={handleChange}/></div><div className="input-group"><label>Advance Tax</label><input name="advanceTax" value={formData.advanceTax} onChange={handleChange}/></div><div className="input-group"><label>Self Assessment</label><input name="selfAssessment" value={formData.selfAssessment} onChange={handleChange}/></div></div></div>)}

                {/* STEP 9: RESULT DASHBOARD */}
                {step === 9 && result && (
                    <div className="fade-in">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}><h3>🎉 Calculation Summary</h3><button className="btn-secondary" onClick={()=>setStep(1)}>✏️ Edit Inputs</button></div>
                        <div className="result-container" style={{display:'flex', gap:'20px', marginBottom:'30px'}}>
                            <div className="result-card" style={{flex:1, padding:'20px', background:'#f8f9fa', borderRadius:'15px', border:'1px solid #ddd'}}><h4 style={{color:'#666'}}>Total Income</h4><h2 style={{fontSize:'28px'}}>₹{(result.grossTotalIncome/100000).toFixed(2)} Lakhs</h2></div>
                            <div className="result-card" style={{flex:1, padding:'20px', background:'#e8f5e9', borderRadius:'15px', border:'2px solid #28a745'}}><h4 style={{color:'#2e7d32'}}>Net Tax Payable</h4><h2 style={{fontSize:'28px', color:'#2e7d32'}}>₹{result.netPayable.toLocaleString()}</h2></div>
                        </div>
                        <div className="comparison-box" style={{background:'white', padding:'20px', borderRadius:'15px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', marginBottom:'30px'}}>
                            <h4 style={{marginBottom:'15px'}}>Regime Comparison</h4>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                                <div style={{padding:'15px', background: result.recommendation === "Old Regime" ? '#d4edda' : '#f8f9fa', borderRadius:'10px', border:'1px solid #ddd'}}><strong>Old Regime</strong><div style={{fontSize:'24px', marginTop:'5px'}}>₹{result.oldRegimeTax.toLocaleString()}</div></div>
                                <div style={{padding:'15px', background: result.recommendation === "New Regime" ? '#d4edda' : '#f8f9fa', borderRadius:'10px', border:'1px solid #ddd'}}><strong>New Regime</strong><div style={{fontSize:'24px', marginTop:'5px'}}>₹{result.newRegimeTax.toLocaleString()}</div></div>
                            </div>
                            <div style={{marginTop:'15px', textAlign:'center', color:'#28a745', fontWeight:'bold'}}>💡 Suggested: {result.recommendation}</div>
                        </div>
                        <div className="tips-box" style={{background:'#fff8e1', borderLeft:'4px solid #ffc107', padding:'20px', borderRadius:'8px', marginBottom:'30px'}}>
                            <h4 style={{marginTop:0, color:'#856404'}}>🤖 Smart Tax Tips</h4>
                            {result.suggestions && result.suggestions.length > 0 ? ( <ul style={{margin:0, paddingLeft:'20px', color:'#856404'}}>{result.suggestions.map((tip, i) => <li key={i} style={{marginBottom:'5px'}}>{tip}</li>)}</ul> ) : ( <p style={{color:'#856404'}}>No specific tips generated. Consider investing in 80C or 80D.</p> )}
                        </div>
                        {result.advanceTaxSchedule && result.advanceTaxSchedule.length > 0 && (<div style={{marginBottom:'30px'}}><h4 style={{color:'#d9534f'}}>📅 Advance Tax Schedule</h4><table className="summary-table" style={{marginTop:'10px'}}><thead style={{background:'#ffebee'}}><tr><th>Due Date</th><th>%</th><th>Amount</th></tr></thead><tbody>{result.advanceTaxSchedule.map((row, i) => (<tr key={i}><td>{row.dueDate}</td><td>{row.percentage}</td><td style={{fontWeight:'bold'}}>₹{row.amountDue.toLocaleString()}</td></tr>))}</tbody></table></div>)}
                        {formData.salaryEnabled && result.netPayable > 0 && (<div style={{padding:'15px', background:'#e3f2fd', borderRadius:'10px', color:'#0d47a1', marginBottom:'30px'}}><strong>💡 For Salaried:</strong> You should ask your employer to deduct <strong> ₹{getMonthlyTDS().toLocaleString()}</strong> per month.</div>)}
                        
                        <div style={{display:'flex', gap:'15px'}}>
                             <button onClick={handleDownloadPDF} className="btn-success" style={{flex:1, padding:'15px', fontSize:'16px'}}>📄 Download PDF</button>
                             <button onClick={()=>navigate('/dashboard')} className="btn-primary" style={{flex:1, padding:'15px', fontSize:'16px'}}>Save & History</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="wizard-footer">
                {step > 1 && step < 9 && <button className="btn-secondary" onClick={()=>setStep(step-1)}>Back</button>}
                {step < 8 && <button className="btn-primary" onClick={()=>setStep(step+1)}>Next</button>}
                {step === 8 && <button className="btn-success" onClick={calculateTax}>{loading ? 'Calculating...' : 'Submit'}</button>}
            </div>
            
            <AITaxAdvisor userProfile={user} calculationData={result} />
        </div>
    );
};

export default TaxCalculator;