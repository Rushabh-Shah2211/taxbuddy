// client/src/components/TaxCalculator.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // added useNavigate
import './TaxCalculator.css';

const TaxCalculator = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Hook for navigation

    const [formData, setFormData] = useState({
        basic: '',
        hra: '',
        specialAllowance: '',
        bonus: '',
        section80C: '',
        section80D: '',
        entityType: 'Individual'
    });
    const [result, setResult] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTax = async (e) => {
        e.preventDefault();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: user ? `Bearer ${user.token}` : ''
            }
        };

        try {
            // FIX: Ensure structure matches backend schema perfectly and handle empty strings
            const payload = {
                userId: user ? user._id : null, 
                entityType: formData.entityType,
                income: {
                    salary: {
                        basic: Number(formData.basic) || 0,
                        hra: Number(formData.hra) || 0,
                        specialAllowance: Number(formData.specialAllowance) || 0,
                        bonus: Number(formData.bonus) || 0
                    },
                    otherSources: {}, 
                    capitalGains: { stcg: 0 } 
                },
                deductions: {
                    section80C: Number(formData.section80C) || 0,
                    section80D: Number(formData.section80D) || 0
                }
            };

            const response = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/calculate', payload, config);
            setResult(response.data);

        } catch (error) {
            console.error("Error calculating tax:", error);
            alert("Calculation failed. Ensure Backend Server is running.");
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        setResult(null);
        navigate('/'); // Redirect to login
    };

    return (
        <div className="calculator-container">
            {/* Header / Nav Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Tax Planner</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {user && (
                        <>
                            <Link to="/dashboard" style={{ fontSize: '14px', textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>
                                📊 History
                            </Link>
                            <span style={{ fontSize: '14px', color: '#666' }}>| {user.name}</span>
                            <button onClick={logout} style={{ padding: '5px 10px', fontSize: '12px', cursor: 'pointer', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                                Logout
                            </button>
                        </>
                    )}
                    {!user && <Link to="/" style={{ fontSize: '14px' }}>Login</Link>}
                </div>
            </div>
            
            <form onSubmit={calculateTax} className="tax-form">
                <div className="form-group">
                    <label>Entity Type:</label>
                    <select name="entityType" value={formData.entityType} onChange={handleChange}>
                        <option value="Individual">Individual</option>
                        <option value="Company">Company</option>
                    </select>
                </div>

                <h3>Income Details</h3>
                <div className="form-row">
                    <input type="number" name="basic" placeholder="Basic Salary" value={formData.basic} onChange={handleChange} required />
                    <input type="number" name="hra" placeholder="HRA" value={formData.hra} onChange={handleChange} />
                </div>
                <div className="form-row">
                    <input type="number" name="specialAllowance" placeholder="Special Allowance" value={formData.specialAllowance} onChange={handleChange} />
                    <input type="number" name="bonus" placeholder="Bonus" value={formData.bonus} onChange={handleChange} />
                </div>

                <h3>Deductions (Old Regime)</h3>
                <div className="form-row">
                    <input type="number" name="section80C" placeholder="80C (LIC/PF)" value={formData.section80C} onChange={handleChange} />
                    <input type="number" name="section80D" placeholder="80D (Health Ins)" value={formData.section80D} onChange={handleChange} />
                </div>

                <button type="submit" className="calculate-btn">Calculate & Save</button>
            </form>

            {/* RESULT SECTION */}
            {result && (
                <div className="result-card">
                    <h3>Comparison Result</h3>
                    <div className="comparison-box">
                        <div className={`regime-card ${result.recommendation === "Old Regime" ? "winner" : ""}`}>
                            <h4>Old Regime</h4>
                            <p>Taxable Income: ₹{result.oldRegime.taxableIncome}</p>
                            <p className="tax-amount">Tax: ₹{result.oldRegime.tax}</p>
                        </div>

                        <div className={`regime-card ${result.recommendation === "New Regime" ? "winner" : ""}`}>
                            <h4>New Regime</h4>
                            <p>Taxable Income: ₹{result.newRegime.taxableIncome}</p>
                            <p className="tax-amount">Tax: ₹{result.newRegime.tax}</p>
                        </div>
                    </div>
                    
                    <div className="recommendation-banner">
                        Suggested: <strong>{result.recommendation}</strong>
                        {result.savings > 0 && <span> (Save ₹{result.savings})</span>}
                    </div>

                    {/* NEW: Smart Tax Tips Section */}
                    {result.suggestions && result.suggestions.length > 0 && (
                        <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '5px', textAlign: 'left' }}>
                            <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>💡 Smart Tax Saving Tips</h4>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                {result.suggestions.map((tip, index) => (
                                    <li key={index} style={{ color: '#856404', marginBottom: '5px' }}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Advance Tax Schedule */}
                    {result.advanceTax && result.advanceTax.applicable && (
                        <div className="advance-tax-container" style={{ marginTop: '25px', textAlign: 'left' }}>
                            <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '5px' }}>📅 Advance Tax Schedule</h3>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                Your tax liability exceeds ₹10,000. You must pay in installments.
                            </p>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                                <thead>
                                    <tr style={{ background: '#f2f2f2', textAlign: 'left' }}>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Due Date</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>% Due</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Amount (₹)</th>
                                        <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Cumulative</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.advanceTax.schedule.map((row, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.dueDate}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{row.percentage}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>₹{row.amountDue}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>₹{row.cumulative}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TDS Section */}
                    {result.payroll && (
                        <div className="tds-container" style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#0d47a1' }}>💰 Salary TDS Estimation</h4>
                            <p style={{ margin: 0, color: '#1565c0' }}>
                                Based on this projection, your employer should deduct approx <strong>₹{result.payroll.monthlyTDS}</strong> per month.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaxCalculator;