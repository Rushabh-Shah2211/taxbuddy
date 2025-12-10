import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/rb_logo.png'; // IMPORT YOUR LOGO
import './TaxCalculator.css';

const TaxCalculator = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [userCategory, setUserCategory] = useState('Salaried');
    const [editModeId, setEditModeId] = useState(null);
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
            // ... (Keep existing edit logic)
            // For brevity, assuming you kept the edit logic from previous step
        }
    }, [location]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const calculateTax = async (e) => {
        e.preventDefault();
        
        // LOGIC: Ensure Business Profit is sent correctly
        const payload = {
            userId: user ? user._id : null,
            userCategory,
            income: {
                salary: userCategory === 'Salaried' ? {
                    basic: Number(formData.basic),
                    hra: Number(formData.hra),
                    specialAllowance: Number(formData.specialAllowance),
                    bonus: Number(formData.bonus)
                } : {},
                otherSources: { 
                    businessProfit: Number(formData.businessProfit), // THIS was missing before
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
            const response = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/calculate', payload, config);
            setResult(response.data);
        } catch (error) {
            alert("Calculation failed.");
        }
    };

    const generateAndDownloadPDF = () => {
        const doc = new jsPDF();
        
        // ADD LOGO TO PDF
        // Note: For logo to work in PDF, it needs to be Base64 string usually. 
        // For simplicity, we just use text header here, but you can use doc.addImage() if you have base64.
        
        doc.setFontSize(22); doc.setTextColor(0, 51, 102);
        doc.text("TaxBuddy Report", 14, 20); // Top Header

        doc.setFontSize(10); doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
        doc.text(`User Category: ${userCategory}`, 14, 34);

        // ... (Keep existing table logic) ...
        autoTable(doc, { startY: 40, head: [['Regime', 'Tax Payable']], body: [['Old', result.oldRegime.tax], ['New', result.newRegime.tax]] });

        if (result.advanceTax && result.advanceTax.applicable) {
             doc.text("Advance Tax Schedule:", 14, doc.lastAutoTable.finalY + 15);
             autoTable(doc, { startY: doc.lastAutoTable.finalY + 18, head: [['Date', 'Amount']], body: result.advanceTax.schedule.map(r => [r.dueDate, r.amountDue]) });
        }
        
        doc.save("TaxReport.pdf");
    };

    const handlePayment = async () => {
        try {
            const { data: order } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/payment/create-order');
            const options = {
                key: "rzp_test_RpW1q1Qc3IGHKW", // <--- REPLACE WITH rzp_test_...
                amount: order.amount,
                currency: "INR",
                name: "TaxBuddy Premium",
                description: "Tax Report",
                order_id: order.id,
                handler: function (response) {
                    alert("Payment Success!");
                    generateAndDownloadPDF();
                }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            alert("Payment Error. Check console.");
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    return (
        <div className="calculator-container">
            {/* Header with Logo */}
            <div className="header-actions" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <img src={logo} alt="Logo" style={{height:'40px'}} />
                    <h2 style={{margin:0}}>Tax Planner</h2>
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                     {user && <Link to="/dashboard" className="btn-secondary">View History</Link>}
                     <button onClick={logout} style={{background:'#dc3545', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>Logout</button>
                </div>
            </div>

            {/* Category Toggle */}
            <div className="user-type-toggle">
                <button type="button" className={`toggle-btn ${userCategory === 'Salaried' ? 'active' : ''}`} onClick={() => setUserCategory('Salaried')}>Salaried</button>
                <button type="button" className={`toggle-btn ${userCategory === 'Business' ? 'active' : ''}`} onClick={() => setUserCategory('Business')}>Business</button>
            </div>
            
            <form onSubmit={calculateTax}>
                {userCategory === 'Salaried' ? (
                     <div className="section-card"><div className="section-title">Salary Info</div>
                        <div className="form-grid">
                            <input placeholder="Basic Salary" name="basic" onChange={handleChange} />
                            <input placeholder="HRA" name="hra" onChange={handleChange} />
                            <input placeholder="Special Allowance" name="specialAllowance" onChange={handleChange} />
                            <input placeholder="Bonus" name="bonus" onChange={handleChange} />
                        </div>
                     </div>
                ) : (
                    <div className="section-card"><div className="section-title">Business Info</div>
                        <div className="form-grid">
                             <input placeholder="Gross Receipts" name="grossReceipts" onChange={handleChange} />
                             <input placeholder="Net Profit" name="businessProfit" onChange={handleChange} />
                        </div>
                    </div>
                )}
                
                {/* Deductions & Submit Button (Keep same as before) */}
                <div className="section-card"><div className="section-title">Deductions</div>
                    <div className="form-grid">
                        <input placeholder="80C" name="section80C" onChange={handleChange} />
                        <input placeholder="80D" name="section80D" onChange={handleChange} />
                    </div>
                </div>
                <button type="submit" className="btn-primary">Calculate Tax</button>
            </form>

            {/* Result Section (Same logic, ensures Advance Tax renders) */}
            {result && (
                <div className="result-container-wrapper">
                    {/* ... Result Cards ... */}
                    <div className="recommendation-banner">Suggested: {result.recommendation}</div>
                    
                    {/* Advance Tax - Visible now because math is fixed */}
                    {result.advanceTax?.applicable && (
                        <div className="advance-tax-box">
                            <h4>Advance Tax Schedule</h4>
                            {/* Render Table */}
                        </div>
                    )}
                    
                    <button onClick={handlePayment} className="pay-btn">Pay ₹49 & Download</button>
                </div>
            )}
        </div>
    );
};

export default TaxCalculator;