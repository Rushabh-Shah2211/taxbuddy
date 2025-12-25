import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '../assets/rb_logo.png';
import './TaxCalculator.css';
import AITaxAdvisor from './AITaxAdvisor';
import DetailedSalaryCalculator from './DetailedSalaryCalculator';
import CapitalGainsCalculator from './CapitalGainsCalculator';
import DeductionsCalculator from './DeductionsCalculator';
import { generateTaxReportPDF } from '../utils/pdfGenerator';

// Accept isGuest prop
const TaxCalculator = ({ isGuest = false }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // NEW: Parsing State for Form-16 Upload
    const [parsing, setParsing] = useState(false);

    // Initial State
    const [formData, setFormData] = useState({
        financialYear: '2025-2026', 
        entityType: 'Individual', 
        opted115BAB: false, 
        ageGroup: '<60',
        residentialStatus: 'Resident',
        salaryEnabled: false, 
        detailedMode: false,
        basic: '', hra: '', gratuity: '', pension: '', prevSalary: '', allowances: '',
        rentPaid: '', isMetro: false,
        business: { enabled: false, businesses: [{ type: 'Presumptive', name: '', turnover: '', profit: '', presumptiveRate: '6' }] },
        hpEnabled: false, hpType: 'Self Occupied', rentReceived: '', municipalTaxes: '', interestPaid: '',
        capitalGains: {},
        otherEnabled: false, otherSources: [{ name: '', amount: '', expenses: '' }],
        deductions: {},
        tds: '', advanceTax: '', selfAssessment: ''
    });

    useEffect(() => {
        // GUEST MODE LOGIC
        if (isGuest) {
            return;
        }

        // USER MODE LOGIC
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        } else {
            navigate('/login'); 
            return;
        }

        // Hydration logic (only for logged-in users editing records)
        if (location.state && location.state.recordToEdit) {
            const rec = location.state.recordToEdit;
            const inc = rec.income || {};
            const sal = inc.salary || {};
            const salDetails = sal.details || {};

            setFormData({
                financialYear: rec.financialYear || '2025-2026',
                entityType: rec.entityType || 'Individual',
                opted115BAB: rec.opted115BAB || false,
                ageGroup: rec.ageGroup || '<60',
                residentialStatus: rec.residentialStatus || 'Resident',
                salaryEnabled: sal.enabled || false,
                detailedMode: sal.detailedMode || false,
                basic: sal.basic || '',
                hra: sal.hra || '',
                allowances: sal.allowances || '',
                gratuity: salDetails.gratuityInput || sal.gratuity || '',
                leaveEncashment: salDetails.leaveInput || sal.leaveEncashment || '',
                pension: salDetails.pensionInput || sal.pension || '',
                perquisites: sal.perquisites || '',
                rentPaid: salDetails.rentPaid || '',
                isMetro: salDetails.isMetro || false,
                business: inc.business || { enabled: false, businesses: [{ type: 'Presumptive', name: '', turnover: '', profit: '', presumptiveRate: '6' }] },
                hpEnabled: inc.houseProperty?.enabled || false,
                hpType: inc.houseProperty?.type || 'Self Occupied',
                rentReceived: inc.houseProperty?.rentReceived || '',
                municipalTaxes: inc.houseProperty?.municipalTaxes || '',
                interestPaid: inc.houseProperty?.interestPaid || '',
                capitalGains: inc.capitalGains || { enabled: false },
                otherEnabled: inc.otherIncome?.enabled || false,
                otherSources: inc.otherIncome?.sources?.length > 0 ? inc.otherIncome.sources : [{ name: '', amount: '', expenses: '' }],
                deductions: rec.deductions || { enabled: false },
                tds: rec.taxesPaid?.tds || '',
                advanceTax: rec.taxesPaid?.advanceTax || '',
                selfAssessment: rec.taxesPaid?.selfAssessment || ''
            });
        }
    }, [navigate, location, isGuest]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };
    
    // --- NEW: Handle Form-16 Upload ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setParsing(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const { data } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/parse-form16', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Auto-fill logic based on extracted data
            setFormData(prev => ({
                ...prev,
                // 1. Financial Year
                financialYear: data.financialYear || prev.financialYear,
                
                // 2. Salary (Map Gross Salary to Basic & Enable)
                salaryEnabled: true,
                basic: data.grossSalary || prev.basic,
                
                // 3. Deductions (Map 80C & Enable)
                deductions: {
                    ...prev.deductions,
                    enabled: true,
                    section80C: data.deductions80C || prev.deductions.section80C
                },
                
                // 4. TDS
                tds: data.tds || prev.tds
            }));

            alert(`✅ Auto-fill Successful!\n\nExtracted:\n- Gross Salary: ₹${data.grossSalary}\n- 80C Deductions: ₹${data.deductions80C}\n- TDS: ₹${data.tds}\n\nPlease verify the values in the next steps.`);

        } catch (error) {
            console.error("Form-16 Parse Error:", error);
            alert("❌ Failed to parse Form-16. Please ensure it is a valid PDF or enter details manually.");
        } finally {
            setParsing(false);
            // Clear input
            e.target.value = null;
        }
    };

    // Helpers
    const addBusiness = () => setFormData({ ...formData, business: { ...formData.business, businesses: [...formData.business.businesses, { type: 'Presumptive', name: '', turnover: '', profit: '', presumptiveRate: '6' }] } });
    const removeBusiness = (index) => { const n = [...formData.business.businesses]; n.splice(index, 1); setFormData({ ...formData, business: { ...formData.business, businesses: n } }); };
    const updateBusiness = (index, field, value) => { const n = [...formData.business.businesses]; n[index][field] = value; setFormData({ ...formData, business: { ...formData.business, businesses: n } }); };
    const handleOtherIncomeChange = (index, e) => { const n = [...formData.otherSources]; n[index][e.target.name] = e.target.value; setFormData({ ...formData, otherSources: n }); };
    const addOtherIncomeRow = () => setFormData({ ...formData, otherSources: [...formData.otherSources, { name: '', amount: '', expenses: '' }] });
    const removeOtherIncomeRow = (index) => { setFormData({ ...formData, otherSources: formData.otherSources.filter((_, i) => i !== index) }); };

    // --- RESTRICT DETAILED MODE FOR GUESTS ---
    const handleSalaryChange = (data) => {
        if (isGuest && data.detailedMode === true) {
            alert("🔒 Feature Locked\n\nDetailed Salary Calculation (HRA, Gratuity, Pension breakdown) is available for Registered Users only.\n\nPlease Login to access this.");
            return; 
        }
        setFormData(prev => ({ ...prev, salaryEnabled: true, ...data }));
    };

    const calculateTax = async () => {
        setLoading(true);
        const payload = {
            userId: user ? user._id : null, 
            financialYear: formData.financialYear,
            entityType: formData.entityType,
            opted115BAB: formData.entityType === 'Company' ? formData.opted115BAB : false,
            ageGroup: formData.entityType === 'Individual' ? formData.ageGroup : undefined, 
            residentialStatus: formData.residentialStatus,
            income: {
                salary: formData.entityType === 'Individual' ? { enabled: formData.salaryEnabled, ...formData } : { enabled: false },
                business: formData.business,
                houseProperty: { enabled: formData.hpEnabled, type: formData.hpType, rentReceived: formData.rentReceived, municipalTaxes: formData.municipalTaxes, interestPaid: formData.interestPaid },
                capitalGains: formData.capitalGains,
                otherIncome: { enabled: formData.otherEnabled, sources: formData.otherSources }
            },
            deductions: formData.deductions,
            taxesPaid: { tds: formData.tds, advanceTax: formData.advanceTax, selfAssessment: formData.selfAssessment }
        };

        try {
            const url = isGuest 
                ? 'https://taxbuddy-o5wu.onrender.com/api/tax/calculate-guest' 
                : 'https://taxbuddy-o5wu.onrender.com/api/tax/calculate';
            
            const config = { 
                headers: { 
                    'Content-Type': 'application/json', 
                    Authorization: user ? `Bearer ${user.token}` : '' 
                }
            };
            
            const response = await axios.post(url, payload, config);
            setResult(response.data);
            setStep(9); 
        } catch (error) { 
            console.error(error);
            alert("Calculation Failed. Please check inputs."); 
        }
        setLoading(false);
    };

    const handleDownloadPDF = () => { 
        const pdfUser = user || { name: "Guest User" };
        if (result) generateTaxReportPDF(pdfUser, formData, result); 
    };

    const handleEmailReport = async () => {
        if(isGuest) { alert("🔒 Please Login to email reports."); return; }
        if(!user || !result) return;
        
        const btn = document.getElementById('emailBtn');
        const originalText = btn.innerText;
        btn.innerText = "Generating PDF...";
        btn.disabled = true;
        
        try {
            const pdfDataUri = generateTaxReportPDF(user, formData, result, true);
            const pdfBase64 = pdfDataUri.split(',')[1];

            btn.innerText = "Sending Email...";

            await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/email-report', {
                email: user.email,
                name: user.name,
                financialYear: formData.financialYear,
                pdfAttachment: pdfBase64 
            });
            alert("✅ Report (PDF) emailed successfully to " + user.email);
        } catch (error) {
            console.error(error);
            alert("❌ Failed to send email. Check console.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    };
    
    const logout = () => { localStorage.removeItem('userInfo'); navigate('/'); };
    
    // NAVIGATION HELPERS
    const handleNext = () => {
        if (step === 1) {
            if (formData.entityType !== 'Individual') {
                setStep(3);
                return;
            }
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        if (step === 3) {
            if (formData.entityType !== 'Individual') {
                setStep(1);
                return;
            }
        }
        setStep(step - 1);
    };

    return (
        <div className="calculator-container">
            <div className="navbar">
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <img src={logo} alt="Logo" style={{height:'60px'}} />
                </div>
                <div className="nav-links">
                    {user ? (
                        <>
                            <span>Hi, {user.name}</span>
                            <Link to="/profile">Profile</Link>
                            <Link to="/dashboard">Dashboard</Link>
                            <button onClick={logout} className="logout-link">Logout</button>
                        </>
                    ) : (
                        <>
                            <span style={{color:'#666', fontSize:'14px'}}>Guest Mode</span>
                            <Link to="/login" style={{fontWeight:'bold'}}>Login</Link>
                        </>
                    )}
                </div>
            </div>

            {isGuest && (
                <div style={{background:'#fff3cd', color:'#856404', padding:'10px', textAlign:'center', fontSize:'14px', borderBottom:'1px solid #ffeeba'}}>
                    ⚠️ You are using <strong>Guest Mode</strong>. History and Detailed Calculations are disabled. <Link to="/login">Login here</Link>
                </div>
            )}

            {step < 9 && <div className="step-indicator">Step {step} of 8</div>}

            <div className="wizard-content">
                {/* STEP 1: BASIC INFO */}
                {step === 1 && (
                    <div className="fade-in">
                        {/* --- NEW: FORM-16 UPLOAD SECTION --- */}
                        <div style={{
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
                            padding: '20px', 
                            borderRadius: '12px', 
                            marginBottom: '25px', 
                            textAlign: 'center',
                            border: '2px dashed #2196f3'
                        }}>
                            <h4 style={{margin:'0 0 10px 0', color:'#1565c0'}}>⚡ Have a Form-16 PDF?</h4>
                            <p style={{fontSize:'13px', color:'#555', marginBottom:'15px'}}>Upload it here to auto-fill your Salary, Deductions, and TDS details instantly.</p>
                            
                            {parsing ? (
                                <div style={{color:'#1976d2', fontWeight:'bold'}}>
                                    🔄 Parsing your Form-16... Please wait...
                                </div>
                            ) : (
                                <div style={{position:'relative', display:'inline-block'}}>
                                    <button style={{
                                        background:'white', color:'#1976d2', border:'1px solid #1976d2', 
                                        padding:'10px 25px', borderRadius:'25px', cursor:'pointer', fontWeight:'bold',
                                        display:'flex', alignItems:'center', gap:'8px'
                                    }}>
                                        📄 Upload PDF
                                    </button>
                                    <input 
                                        type="file" 
                                        accept=".pdf" 
                                        onChange={handleFileUpload} 
                                        style={{
                                            position:'absolute', top:0, left:0, width:'100%', height:'100%', 
                                            opacity:0, cursor:'pointer'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        {/* --- END UPLOAD SECTION --- */}

                        <h3>📋 Basic Information</h3>
                        <div className="form-grid">
                            <div className="input-group">
                                <label>Financial Year</label>
                                <select name="financialYear" value={formData.financialYear} onChange={handleChange}>
                                    <option value="2025-2026">FY 2025-26 (Latest)</option>
                                    <option value="2024-2025">FY 2024-25</option>
                                    <option value="2023-2024">FY 2023-24</option>
                                </select>
                            </div>

                            {/* Nature of Entity */}
                            <div className="input-group">
                                <label>Nature of Entity</label>
                                <select name="entityType" value={formData.entityType} onChange={handleChange}>
                                    <option value="Individual">Individual</option>
                                    <option value="HUF">HUF (Hindu Undivided Family)</option>
                                    <option value="Firm">Partnership Firm</option>
                                    <option value="LLP">LLP</option>
                                    <option value="Company">Company</option>
                                    <option value="Trust">Trust</option>
                                    <option value="AOP">AOP / BOI</option>
                                    <option value="AJP">Artificial Juridical Person</option>
                                </select>
                            </div>

                            {/* CONDITIONAL: Section 115BAB Checkbox (Only for Companies) */}
                            {formData.entityType === 'Company' && (
                                <div className="input-group" style={{gridColumn: '1 / -1', background: '#e8f5e9', padding: '10px', borderRadius: '8px', border: '1px solid #c3e6cb'}}>
                                    <label className="checkbox-label" style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontWeight: '500', color: '#155724'}}>
                                        <input
                                            type="checkbox"
                                            name="opted115BAB"
                                            checked={formData.opted115BAB}
                                            onChange={(e) => setFormData({...formData, opted115BAB: e.target.checked})}
                                            style={{width:'18px', height:'18px'}}
                                        />
                                        <span>Opt for Section 115BAB (New Manufacturing Company - 15% Tax Rate)</span>
                                    </label>
                                    <div style={{fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '28px'}}>
                                        *By checking this, you confirm the company is a new manufacturing unit set up after 1st October 2019 and registered before 31st March 2024.
                                    </div>
                                </div>
                            )}

                            {/* Conditionally Show Age Group only for Individuals */}
                            {formData.entityType === 'Individual' && (
                                <div className="input-group">
                                    <label>Age Group</label>
                                    <select name="ageGroup" value={formData.ageGroup} onChange={handleChange}>
                                        <option value="<60">Below 60</option>
                                        <option value="60-80">60 - 80 (Senior)</option>
                                        <option value=">80">Above 80 (Super Senior)</option>
                                    </select>
                                </div>
                            )}

                            <div className="input-group">
                                <label>Residential Status</label>
                                <select name="residentialStatus" value={formData.residentialStatus} onChange={handleChange}>
                                    <option value="Resident">Resident</option>
                                    <option value="NRI">Non-Resident</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* STEP 2: SALARY */}
                {step === 2 && formData.entityType === 'Individual' && (
                    <div className="fade-in">
                        <h3>💼 Salary Income</h3>
                        <DetailedSalaryCalculator onDataChange={handleSalaryChange} initialData={formData} />
                    </div>
                )}

                {/* STEP 3: BUSINESS */}
                {step === 3 && (
                    <div className="fade-in">
                        <h3>🏢 Business / Profession</h3>
                        <div className="toggle-wrapper">
                            <label>Business Income?</label>
                            <div className="btn-group">
                                <button className={formData.business.enabled?'active':''} onClick={()=>setFormData({...formData, business:{...formData.business, enabled:true}})}>Yes</button>
                                <button className={!formData.business.enabled?'active':''} onClick={()=>setFormData({...formData, business:{...formData.business, enabled:false}})}>No</button>
                            </div>
                        </div>
                        {formData.business.enabled && (
                            <div>
                                {formData.business.businesses.map((biz, idx) => (
                                    <div key={idx} style={{marginBottom:'20px', padding:'15px', background:'#f8f9fa', borderRadius:'10px', border:'1px solid #eee'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                                            <strong style={{color:'#667eea'}}>Business Source #{idx+1}</strong>
                                            {idx > 0 && <button onClick={()=>removeBusiness(idx)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Remove</button>}
                                        </div>
                                        <div style={{marginBottom:'10px'}}>
                                            <label style={{display:'block', fontSize:'12px', marginBottom:'5px'}}>Taxation Type</label>
                                            <select value={biz.type} onChange={(e)=>updateBusiness(idx, 'type', e.target.value)} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid #ddd'}}>
                                                <option value="Presumptive">44AD/ADA (Presumptive - No Audit)</option>
                                                <option value="Regular">Regular (Net Profit - With Audit)</option>
                                            </select>
                                        </div>
                                        <div className="form-grid">
                                            <input placeholder="Business Name" value={biz.name} onChange={(e)=>updateBusiness(idx, 'name', e.target.value)} />
                                            {biz.type === 'Presumptive' ? (
                                                <>
                                                    <input placeholder="Gross Turnover" type="number" value={biz.turnover} onChange={(e)=>updateBusiness(idx, 'turnover', e.target.value)} />
                                                    <div>
                                                        <input placeholder="Rate % (6 or 8)" type="number" value={biz.presumptiveRate} onChange={(e)=>updateBusiness(idx, 'presumptiveRate', e.target.value)} />
                                                        {biz.turnover && biz.presumptiveRate && (<div className="live-calc">Est. Income: ₹{(Number(biz.turnover) * (Number(biz.presumptiveRate)/100)).toFixed(0)}</div>)}
                                                    </div>
                                                </>
                                            ) : (
                                                <input placeholder="Net Profit (After Expenses)" type="number" value={biz.profit} onChange={(e)=>updateBusiness(idx, 'profit', e.target.value)} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button className="btn-secondary" onClick={addBusiness} style={{width:'100%'}}>+ Add Another Business</button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 4: HOUSE PROPERTY */}
                {step === 4 && (
                    <div className="fade-in">
                        <h3>🏠 House Property</h3>
                        <div className="toggle-wrapper">
                            <label>Own House Property?</label>
                            <div className="btn-group">
                                <button className={formData.hpEnabled?'active':''} onClick={()=>setFormData({...formData,hpEnabled:true})}>Yes</button>
                                <button className={!formData.hpEnabled?'active':''} onClick={()=>setFormData({...formData,hpEnabled:false})}>No</button>
                            </div>
                        </div>
                        {formData.hpEnabled&&( 
                            <>
                                <select name="hpType" value={formData.hpType} onChange={handleChange} style={{marginBottom:'15px'}}>
                                    <option value="Self Occupied">Self Occupied</option>
                                    <option value="Rented">Rented</option>
                                </select>
                                <div className="form-grid">
                                    {formData.hpType==='Rented'&&( 
                                        <>
                                            <input placeholder="Rent Received" name="rentReceived" value={formData.rentReceived} onChange={handleChange}/>
                                            <input placeholder="Municipal Taxes" name="municipalTaxes" value={formData.municipalTaxes} onChange={handleChange}/>
                                        </>
                                    )}
                                    <input placeholder="Interest on Loan" name="interestPaid" value={formData.interestPaid} onChange={handleChange}/>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* STEP 5: OTHER INCOME */}
                {step === 5 && (
                    <div className="fade-in">
                        <h3>💰 Other Income</h3>
                        <div className="toggle-wrapper">
                            <label>Other income?</label>
                            <div className="btn-group">
                                <button className={formData.otherEnabled?'active':''} onClick={()=>setFormData({...formData,otherEnabled:true})}>Yes</button>
                                <button className={!formData.otherEnabled?'active':''} onClick={()=>setFormData({...formData,otherEnabled:false})}>No</button>
                            </div>
                        </div>
                        {formData.otherEnabled&&( 
                            <div>
                                {formData.otherSources.map((source,index)=>( 
                                    <div key={index} className="form-grid" style={{marginBottom:'10px'}}>
                                        <input placeholder="Name" name="name" value={source.name} onChange={(e)=>handleOtherIncomeChange(index,e)}/>
                                        <input placeholder="Amount" name="amount" value={source.amount} onChange={(e)=>handleOtherIncomeChange(index,e)}/>
                                        <input placeholder="Expenses" name="expenses" value={source.expenses} onChange={(e)=>handleOtherIncomeChange(index,e)}/>
                                        {index>0&&<button className="btn-danger-small" onClick={()=>removeOtherIncomeRow(index)}>X</button>}
                                    </div>
                                ))}
                                <button className="btn-secondary" onClick={addOtherIncomeRow}>+ Add Line</button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 6: CAPITAL GAINS */}
                {step === 6 && (
                    <div className="fade-in">
                        <h3>📈 Capital Gains</h3>
                        <CapitalGainsCalculator initialData={formData.capitalGains} onDataChange={(data) => setFormData({ ...formData, capitalGains: data })}/>
                    </div>
                )}

                {/* STEP 7: DEDUCTIONS */}
                {step === 7 && (
                    <div className="fade-in">
                        <h3>🛡️ Deductions (Chapter VI-A)</h3>
                        <DeductionsCalculator initialData={formData.deductions} onDataChange={(data) => setFormData({ ...formData, deductions: data })}/>
                    </div>
                )}

                {/* STEP 8: TAXES PAID */}
                {step === 8 && (
                    <div className="fade-in">
                        <h3>💸 Taxes Paid</h3>
                        <div className="form-grid">
                            <div className="input-group"><label>TDS Deducted</label><input name="tds" value={formData.tds} onChange={handleChange}/></div>
                            <div className="input-group"><label>Advance Tax</label><input name="advanceTax" value={formData.advanceTax} onChange={handleChange}/></div>
                            <div className="input-group"><label>Self Assessment</label><input name="selfAssessment" value={formData.selfAssessment} onChange={handleChange}/></div>
                        </div>
                    </div>
                )}

                {/* STEP 9: RESULT DASHBOARD */}
                {step === 9 && result && (
                    <div className="fade-in">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}><h3>🎉 Calculation Summary</h3><button className="btn-secondary" onClick={()=>setStep(1)}>✏️ Edit Inputs</button></div>
                        
                        <div className="result-container" style={{display:'flex', gap:'20px', marginBottom:'30px'}}>
                            <div className="result-card" style={{flex:1, padding:'20px', background:'#f8f9fa', borderRadius:'15px', border:'1px solid #ddd'}}><h4 style={{color:'#666'}}>Total Income</h4><h2 style={{fontSize:'28px'}}>₹{(result.grossTotalIncome/100000).toFixed(2)} Lakhs</h2></div>
                            <div className="result-card" style={{flex:1, padding:'20px', background:'#e8f5e9', borderRadius:'15px', border:'2px solid #28a745'}}><h4 style={{color:'#2e7d32'}}>Net Tax Payable</h4><h2 style={{fontSize:'28px', color:'#2e7d32'}}>₹{result.netPayable.toLocaleString()}</h2></div>
                        </div>

                        {/* Regime Comparison */}
                        <div className="comparison-box" style={{background:'white', padding:'20px', borderRadius:'15px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', marginBottom:'30px'}}>
                            <h4 style={{marginBottom:'15px'}}>Regime Comparison</h4>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                                <div style={{padding:'15px', background: result.recommendation === "Old Regime" ? '#d4edda' : '#f8f9fa', borderRadius:'10px', border:'1px solid #ddd'}}><strong>Old Regime</strong><div style={{fontSize:'24px', marginTop:'5px'}}>₹{result.oldRegimeTax.toLocaleString()}</div></div>
                                <div style={{padding:'15px', background: result.recommendation === "New Regime" ? '#d4edda' : '#f8f9fa', borderRadius:'10px', border:'1px solid #ddd'}}><strong>New Regime</strong><div style={{fontSize:'24px', marginTop:'5px'}}>₹{result.newRegimeTax.toLocaleString()}</div></div>
                            </div>
                            <div style={{marginTop:'15px', textAlign:'center', color:'#28a745', fontWeight:'bold'}}>💡 Suggested: {result.recommendation}</div>
                        </div>
                        
                        <div style={{display:'flex', gap:'15px', marginTop:'20px'}}>
                             <button onClick={handleDownloadPDF} className="btn-success" style={{flex:1, padding:'15px', fontSize:'16px'}}>📄 PDF Report</button>
                             {isGuest ? (
                                 <button onClick={()=>navigate('/login')} className="btn-primary" style={{flex:1, padding:'15px', fontSize:'16px', background:'#6c757d', borderColor:'#6c757d'}}>🔒 Login to Save & Email</button>
                             ) : (
                                 <>
                                     <button id="emailBtn" onClick={handleEmailReport} className="btn-primary" style={{flex:1, padding:'15px', fontSize:'16px', background: '#17a2b8', borderColor: '#17a2b8'}}>📧 Email Report</button>
                                     <button onClick={()=>navigate('/dashboard')} className="btn-primary" style={{flex:1, padding:'15px', fontSize:'16px'}}>Save & Close</button>
                                 </>
                             )}
                        </div>
                    </div>
                )}
            </div>

            <div className="wizard-footer">
                {step > 1 && step < 9 && <button className="btn-secondary" onClick={handleBack}>Back</button>}
                {step < 8 && <button className="btn-primary" onClick={handleNext}>Next</button>}
                {step === 8 && <button className="btn-success" onClick={calculateTax}>{loading ? 'Calculating...' : 'Submit'}</button>}
            </div>
            
            <AITaxAdvisor userProfile={user} calculationData={result} />
        </div>
    );
};

export default TaxCalculator;