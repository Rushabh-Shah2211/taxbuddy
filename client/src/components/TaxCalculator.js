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
    const location = useLocation(); // To get data from Dashboard

    // NEW: User Category State
    const [userCategory, setUserCategory] = useState('Salaried');
    
    // NEW: Edit Mode State
    const [editModeId, setEditModeId] = useState(null);

    const [formData, setFormData] = useState({
        basic: '', hra: '', specialAllowance: '', bonus: '',
        section80C: '', section80D: ''
    });
    const [result, setResult] = useState(null);

    // 1. Load User & Check for Edit Data
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) setUser(JSON.parse(userInfo));

        // Did we come from the "Edit" button?
        if (location.state && location.state.recordToEdit) {
            const record = location.state.recordToEdit;
            setEditModeId(record._id); // We are in Edit Mode
            setUserCategory(record.userCategory || 'Salaried');
            
            // Pre-fill form
            setFormData({
                basic: record.income.salary.basic,
                hra: record.income.salary.hra,
                specialAllowance: record.income.salary.specialAllowance,
                bonus: record.income.salary.bonus,
                section80C: record.deductions.section80C,
                section80D: record.deductions.section80D,
            });
            
            // Pre-show results
            setResult({
                ...record.computedTax,
                grossTotalIncome: record.income.salary.basic + record.income.salary.hra + record.income.salary.specialAllowance, // Approx
                oldRegime: { taxableIncome: 0, tax: record.computedTax.oldRegimeTax },
                newRegime: { taxableIncome: 0, tax: record.computedTax.newRegimeTax },
                recommendation: record.computedTax.regimeSelected,
                savings: 0 // Simplification for edit view
            });
        }
    }, [location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const calculateTax = async (e) => {
        e.preventDefault();
        
        // Use Cloud URL
        const apiUrl = 'https://taxbuddy-o5wu.onrender.com/api/tax/calculate'; 

        // If Editing, we might want a different API, but for now, 
        // we usually calculate fresh to see updates.
        
        const config = {
            headers: { 'Content-Type': 'application/json', Authorization: user ? `Bearer ${user.token}` : '' }
        };

        const payload = {
            userId: user ? user._id : null, 
            userCategory, // NEW field
            income: {
                salary: {
                    basic: Number(formData.basic) || 0,
                    hra: Number(formData.hra) || 0,
                    specialAllowance: Number(formData.specialAllowance) || 0,
                    bonus: Number(formData.bonus) || 0
                },
                otherSources: {}, capitalGains: { stcg: 0 } 
            },
            deductions: {
                section80C: Number(formData.section80C) || 0,
                section80D: Number(formData.section80D) || 0
            }
        };

        try {
            const response = await axios.post(apiUrl, payload, config);
            setResult(response.data);
            if(editModeId) alert("Calculation Updated! (Note: Saved as new record for history)");
        } catch (error) {
            alert("Calculation failed.");
        }
    };

    // PDF Generator (Same as before, abbreviated for brevity)
    const downloadPDF = () => { /* ... use your previous PDF code ... */ };
    const handlePayment = () => { /* ... use your previous Payment code ... */ };

    return (
        <div className="calculator-container">
            {/* Header */}
            <div className="header-actions">
                <div>
                    <h2 style={{margin: 0}}>Tax Planner {editModeId ? '(Editing Mode)' : ''}</h2>
                    <small>Professional Tool for {userCategory}</small>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                    <Link to="/dashboard" style={{textDecoration:'none', color:'#007bff'}}>View History</Link>
                </div>
            </div>

            {/* NEW: Business vs Salaried Toggle */}
            <div className="user-type-toggle">
                <button 
                    type="button" 
                    className={`toggle-btn ${userCategory === 'Salaried' ? 'active' : ''}`}
                    onClick={() => setUserCategory('Salaried')}
                >
                    👨‍💼 Salaried Individual
                </button>
                <button 
                    type="button" 
                    className={`toggle-btn ${userCategory === 'Business' ? 'active' : ''}`}
                    onClick={() => setUserCategory('Business')}
                >
                    🏢 Business / Freelancer
                </button>
            </div>
            
            <form onSubmit={calculateTax}>
                <div className="section-card">
                    <div className="section-title">Income Details</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Basic Salary / Gross Receipts</label>
                            <input type="number" name="basic" value={formData.basic} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>HRA / Expenses</label>
                            <input type="number" name="hra" value={formData.hra} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Special Allowance</label>
                            <input type="number" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Bonus / Other</label>
                            <input type="number" name="bonus" value={formData.bonus} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <div className="section-title">Deductions (Old Regime)</div>
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Section 80C (LIC/PPF)</label>
                            <input type="number" name="section80C" value={formData.section80C} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Section 80D (Health Ins)</label>
                            <input type="number" name="section80D" value={formData.section80D} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn-primary">Calculate Tax</button>
            </form>

            {/* RESULT SECTION - Keeping simple structure but using new classes */}
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
                    
                    {/* Re-add your Pay/PDF Buttons here from previous code */}
                     <button 
                        onClick={handlePayment} 
                        style={{marginTop: '20px', padding: '15px', background: '#ffc107', width: '100%', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'}}
                    >
                        🔒 Pay ₹49 to Download Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaxCalculator;