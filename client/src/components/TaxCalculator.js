import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
        // Page 1
        financialYear: '2024-2025',
        ageGroup: '<60',
        residentialStatus: 'Resident',
        // Page 2: Salary
        salaryEnabled: false,
        basic: '', hra: '', gratuity: '', pension: '', prevSalary: '', allowances: '',
        // Page 3: Business
        businessEnabled: false,
        turnover: '', profit: '', is44AD: false, is44ADA: false, presumptiveRate: '6',
        // Page 4: House Property
        hpEnabled: false,
        hpType: 'Self Occupied', rentReceived: '', municipalTaxes: '', interestPaid: '',
        // Page 5: Other Income (Array)
        otherEnabled: false,
        otherSources: [{ name: '', amount: '', expenses: '' }],
        // Page 8: Taxes
        tds: '', advanceTax: '', selfAssessment: ''
    });

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));
    }, []);

    // Helper to handle simple inputs
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Helper to handle Other Income dynamic rows
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

    // SUBMIT FUNCTION
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
            taxesPaid: {
                tds: formData.tds,
                advanceTax: formData.advanceTax,
                selfAssessment: formData.selfAssessment
            }
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : '' }};
            const response = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/calculate', payload, config);
            setResult(response.data);
            setStep(9); // Move to Result Page
        } catch (error) { alert("Calculation Failed"); }
        setLoading(false);
    };

    // --- RENDER HELPERS ---
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    
    // Live Business Profit Calc
    const liveProfit = (formData.is44AD || formData.is44ADA) 
        ? (Number(formData.turnover) * (Number(formData.presumptiveRate)/100)).toFixed(0) 
        : formData.profit;

    return (
        <div className="calculator-container">
            {/* Header */}
            <div className="header-actions">
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <img src={logo} alt="Logo" style={{height:'35px'}} />
                    <h2 style={{margin:0}}>Artha by RB</h2>
                </div>
                {step < 9 && <div className="step-indicator">Step {step} of 8</div>}
            </div>

            {/* --- WIZARD PAGES --- */}
            <div className="wizard-content">
                
                {/* PAGE 1: BASIC INFO */}
                {step === 1 && (
                    <div className="fade-in">
                        <h3>📋 Basic Information</h3>
                        <div className="form-grid">
                            <div className="input-group"><label>Name</label><input value={user?.name || ''} disabled style={{background:'#f0f0f0'}}/></div>
                            <div className="input-group"><label>Financial Year</label>
                                <select name="financialYear" value={formData.financialYear} onChange={handleChange}>
                                    <option value="2024-2025">FY 2024-25</option>
                                    <option value="2023-2024">FY 2023-24</option>
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
                    <div className="fade-in">
                        <h3>💼 Salary Income</h3>
                        <div className="toggle-wrapper">
                            <label>Do you have Salary Income?</label>
                            <div className="btn-group">
                                <button className={formData.salaryEnabled ? 'active' : ''} onClick={()=>setFormData({...formData, salaryEnabled:true})}>Yes</button>
                                <button className={!formData.salaryEnabled ? 'active' : ''} onClick={()=>setFormData({...formData, salaryEnabled:false})}>No</button>
                            </div>
                        </div>
                        {formData.salaryEnabled && (
                            <div className="form-grid">
                                <input placeholder="Basic Salary" name="basic" value={formData.basic} onChange={handleChange} />
                                <input placeholder="HRA" name="hra" value={formData.hra} onChange={handleChange} />
                                <input placeholder="Gratuity" name="gratuity" value={formData.gratuity} onChange={handleChange} />
                                <input placeholder="Pension" name="pension" value={formData.pension} onChange={handleChange} />
                                <input placeholder="Prev. Employer Salary" name="prevSalary" value={formData.prevSalary} onChange={handleChange} />
                                <input placeholder="Allowances" name="allowances" value={formData.allowances} onChange={handleChange} />
                            </div>
                        )}
                    </div>
                )}

                {/* PAGE 3: BUSINESS */}
                {step === 3 && (
                    <div className="fade-in">
                        <h3>🏢 Business / Profession</h3>
                        <div className="toggle-wrapper">
                            <label>Do you have Business Income?</label>
                            <div className="btn-group">
                                <button className={formData.businessEnabled ? 'active' : ''} onClick={()=>setFormData({...formData, businessEnabled:true})}>Yes</button>
                                <button className={!formData.businessEnabled ? 'active' : ''} onClick={()=>setFormData({...formData, businessEnabled:false})}>No</button>
                            </div>
                        </div>
                        {formData.businessEnabled && (
                            <div className="form-grid">
                                <input placeholder="Total Turnover / Receipts" name="turnover" value={formData.turnover} onChange={handleChange} />
                                <div className="checkbox-group">
                                    <label><input type="checkbox" checked={formData.is44AD} onChange={(e)=>setFormData({...formData, is44AD:e.target.checked, is44ADA:false})}/> 44AD (Business)</label>
                                    <label><input type="checkbox" checked={formData.is44ADA} onChange={(e)=>setFormData({...formData, is44ADA:e.target.checked, is44AD:false})}/> 44ADA (Profession)</label>
                                </div>
                                {(formData.is44AD || formData.is44ADA) ? (
                                    <>
                                        <div className="input-group">
                                            <label>Presumptive Rate (%)</label>
                                            <input name="presumptiveRate" value={formData.presumptiveRate} onChange={handleChange} />
                                        </div>
                                        <div className="live-calc">Estimated Profit: ₹{Number(liveProfit).toLocaleString()}</div>
                                    </>
                                ) : (
                                    <input placeholder="Actual Net Profit" name="profit" value={formData.profit} onChange={handleChange} />
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* PAGE 4: HOUSE PROPERTY */}
                {step === 4 && (
                    <div className="fade-in">
                        <h3>🏠 House Property</h3>
                        <div className="toggle-wrapper">
                            <label>Do you own House Property?</label>
                            <div className="btn-group">
                                <button className={formData.hpEnabled ? 'active' : ''} onClick={()=>setFormData({...formData, hpEnabled:true})}>Yes</button>
                                <button className={!formData.hpEnabled ? 'active' : ''} onClick={()=>setFormData({...formData, hpEnabled:false})}>No</button>
                            </div>
                        </div>
                        {formData.hpEnabled && (
                            <>
                                <select name="hpType" value={formData.hpType} onChange={handleChange} style={{marginBottom:'15px', padding:'10px', width:'100%'}}>
                                    <option value="Self Occupied">Self Occupied</option>
                                    <option value="Rented">Rented</option>
                                </select>
                                <div className="form-grid">
                                    {formData.hpType === 'Rented' && (
                                        <>
                                            <input placeholder="Rent Received" name="rentReceived" value={formData.rentReceived} onChange={handleChange} />
                                            <input placeholder="Municipal Taxes Paid" name="municipalTaxes" value={formData.municipalTaxes} onChange={handleChange} />
                                        </>
                                    )}
                                    <input placeholder="Interest Paid on Loan" name="interestPaid" value={formData.interestPaid} onChange={handleChange} />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* PAGE 5: OTHER INCOME */}
                {step === 5 && (
                    <div className="fade-in">
                        <h3>💰 Other Income</h3>
                        <div className="toggle-wrapper">
                            <label>Any other income (Interest, Dividend)?</label>
                            <div className="btn-group">
                                <button className={formData.otherEnabled ? 'active' : ''} onClick={()=>setFormData({...formData, otherEnabled:true})}>Yes</button>
                                <button className={!formData.otherEnabled ? 'active' : ''} onClick={()=>setFormData({...formData, otherEnabled:false})}>No</button>
                            </div>
                        </div>
                        {formData.otherEnabled && (
                            <div>
                                {formData.otherSources.map((source, index) => (
                                    <div key={index} className="form-grid" style={{borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'10px'}}>
                                        <input placeholder="Income Name (e.g. FD Interest)" name="name" value={source.name} onChange={(e)=>handleOtherIncomeChange(index, e)} />
                                        <input placeholder="Amount" name="amount" value={source.amount} onChange={(e)=>handleOtherIncomeChange(index, e)} />
                                        <input placeholder="Expenses Claimed" name="expenses" value={source.expenses} onChange={(e)=>handleOtherIncomeChange(index, e)} />
                                        {index > 0 && <button className="btn-danger-small" onClick={()=>removeOtherIncomeRow(index)}>X</button>}
                                    </div>
                                ))}
                                <button className="btn-secondary" onClick={addOtherIncomeRow}>+ Add Another Line</button>
                            </div>
                        )}
                    </div>
                )}

                {/* PAGE 6 & 7: COMING SOON */}
                {(step === 6 || step === 7) && (
                    <div className="fade-in" style={{textAlign:'center', padding:'40px'}}>
                        <h2>🚧 Coming Soon</h2>
                        <p>{step === 6 ? "Capital Gains" : "Deductions"} module is under development.</p>
                        <p>We will work on it later in detail.</p>
                    </div>
                )}

                {/* PAGE 8: TAXES PAID */}
                {step === 8 && (
                    <div className="fade-in">
                        <h3>💸 Taxes Paid</h3>
                        <div className="form-grid">
                            <div className="input-group"><label>TDS Deducted</label><input name="tds" value={formData.tds} onChange={handleChange} /></div>
                            <div className="input-group"><label>Advance Tax Paid</label><input name="advanceTax" value={formData.advanceTax} onChange={handleChange} /></div>
                            <div className="input-group"><label>Self Assessment Tax</label><input name="selfAssessment" value={formData.selfAssessment} onChange={handleChange} /></div>
                        </div>
                    </div>
                )}

                {/* PAGE 9: RESULT */}
                {step === 9 && result && (
                    <div className="fade-in">
                        <h3>🎉 Calculation Result</h3>
                        <div className="result-container">
                            <div className={`result-card ${result.recommendation === "Old Regime" ? "winner" : ""}`}>
                                <h3>Old Regime Tax</h3>
                                <h2>₹{Math.round(result.oldRegimeTax).toLocaleString()}</h2>
                            </div>
                            <div className={`result-card ${result.recommendation === "New Regime" ? "winner" : ""}`}>
                                <h3>New Regime Tax</h3>
                                <h2>₹{Math.round(result.newRegimeTax).toLocaleString()}</h2>
                            </div>
                        </div>

                        <div className="final-payable">
                            <h3>Net Tax Payable: ₹{Math.round(result.netPayable).toLocaleString()}</h3>
                            <small>(After adjusting TDS & Advance Tax)</small>
                        </div>
                        
                        {result.advanceTaxSchedule && result.advanceTaxSchedule.length > 0 && (
                            <div className="advance-tax-box">
                                <h4>📅 Advance Tax Plan</h4>
                                <table style={{width:'100%'}}>
                                    <tbody>
                                        {result.advanceTaxSchedule.map((row, i) => (
                                            <tr key={i}>
                                                <td>{row.dueDate}</td>
                                                <td>{row.percentage}</td>
                                                <td>₹{row.amountDue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* AI Tips - Placeholder logic for now */}
                        <div className="tips-box">
                            <h4>🤖 AI Tips</h4>
                            <ul><li>Consider New Regime for lower rates if deductions are low.</li></ul>
                        </div>
                    </div>
                )}

            </div>

            {/* --- NAVIGATION FOOTER --- */}
            <div className="wizard-footer">
                {step > 1 && step < 9 && <button className="btn-secondary" onClick={prevStep}>Back</button>}
                
                {step < 8 && <button className="btn-primary" onClick={nextStep}>Next</button>}
                
                {step === 8 && <button className="btn-success" onClick={calculateTax}>{loading ? 'Calculating...' : 'Submit & Calculate'}</button>}
                
                {step === 9 && <button className="btn-primary" onClick={()=>setStep(1)}>Start Over</button>}
            </div>
        </div>
    );
};

export default TaxCalculator;