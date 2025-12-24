import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/rb_logo.png';

const LandingPage = () => {
    const navigate = useNavigate();
    const [salary, setSalary] = useState(1000000); // Default 10L
    const [deductions, setDeductions] = useState(150000); // Default 1.5L
    const [showResults, setShowResults] = useState(false);
    const [taxOld, setTaxOld] = useState(0);
    const [taxNew, setTaxNew] = useState(0);
    const [savings, setSavings] = useState(0);

    const calculateOldTax = (taxableIncome) => {
        let tax = 0;
        if (taxableIncome > 1000000) {
            tax += (taxableIncome - 1000000) * 0.30;
            taxableIncome = 1000000;
        }
        if (taxableIncome > 500000) {
            tax += (taxableIncome - 500000) * 0.20;
            taxableIncome = 500000;
        }
        if (taxableIncome > 250000) {
            tax += (taxableIncome - 250000) * 0.05;
        }
        // Rebate u/s 87A: up to Rs 12,500 if income <=5L
        if (taxableIncome <= 500000 && tax > 0) {
            tax = Math.min(tax, 12500);
        }
        // Cess 4%
        return tax * 1.04;
    };

    const calculateNewTax = (taxableIncome) => {
        let tax = 0;
        if (taxableIncome > 2400000) {
            tax += (taxableIncome - 2400000) * 0.30;
            taxableIncome = 2400000;
        }
        if (taxableIncome > 2000000) {
            tax += (taxableIncome - 2000000) * 0.25;
            taxableIncome = 2000000;
        }
        if (taxableIncome > 1600000) {
            tax += (taxableIncome - 1600000) * 0.20;
            taxableIncome = 1600000;
        }
        if (taxableIncome > 1200000) {
            tax += (taxableIncome - 1200000) * 0.15;
            taxableIncome = 1200000;
        }
        if (taxableIncome > 800000) {
            tax += (taxableIncome - 800000) * 0.10;
            taxableIncome = 800000;
        }
        if (taxableIncome > 400000) {
            tax += (taxableIncome - 400000) * 0.05;
        }
        // Rebate u/s 87A: up to Rs 60,000 if income <=12L
        if (taxableIncome <= 1200000 && tax > 0) {
            tax = Math.min(tax, 60000);
        }
        // Cess 4%
        return tax * 1.04;
    };

    const handleCalculate = () => {
        const taxableOld = Math.max(0, salary - deductions);
        const taxO = calculateOldTax(taxableOld);
        const taxN = calculateNewTax(salary);
        setTaxOld(taxO);
        setTaxNew(taxN);
        setSavings(taxO - taxN);
        setShowResults(true);
    };

    return (
        <div style={{ fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
            {/* Navbar */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logo} alt="Artha Logo" style={{ height: '40px' }} />
                </div>
                <div>
                    <Link to="/login" style={{ textDecoration: 'none', color: '#666', marginRight: '20px', fontWeight: '500' }}>Login</Link>
                    <Link to="/register" style={{ padding: '10px 25px', background: '#7ed957', color: 'white', textDecoration: 'none', borderRadius: '25px', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(126, 217, 87, 0.3)' }}>Sign Up Free</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px', paddingRight: '40px' }}>
                    <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', color: '#2c3e50', marginBottom: '20px', lineHeight: '1.2' }}>
                        Save Thousands on Taxes <br />
                        <span style={{ color: '#7ed957' }}>in Minutes—Without the Headache</span>
                    </h1>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
                        Ditch the spreadsheets. Compare Old vs. New Tax Regimes instantly with AI that spots hidden deductions and crafts your perfect strategy.
                    </p>
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '40px' }}>
                        <strong>Join 10K+ users saving 20% more on taxes.</strong> No jargon, just results.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => navigate('/guest-calculator')} 
                            style={{ 
                                padding: '15px 35px', fontSize: '16px', background: 'linear-gradient(135deg, #7ed957, #5cb85c)', color: 'white', border: 'none', 
                                borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(126, 217, 87, 0.4)', 
                                display: 'flex', alignItems: 'center', gap: '8px' 
                            }}
                        >
                            🚀 Start Full Calculator
                        </button>
                        <button 
                            onClick={() => navigate('/login')} 
                            style={{ padding: '15px 35px', fontSize: '16px', background: 'white', color: '#2c3e50', border: '2px solid #2c3e50', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Login & Unlock AI Tips
                        </button>
                    </div>

                    <div style={{ marginTop: '30px', fontSize: '14px', color: '#888', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        <span>✅ Instant Calculations</span>
                        <span>✅ Free PDF Exports</span>
                        <span>✅ 100% Secure</span>
                    </div>
                </div>

                {/* Tax Calculator Demo */}
                <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '450px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '30px', textAlign: 'center' }}>
                        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>Quick Demo: See Your Savings</h3>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>Enter your details (AY 2026-27 Slabs)</p>
                        
                        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#888', marginBottom: '5px' }}>Annual Salary (₹)</label>
                            <input 
                                type="number" 
                                value={salary} 
                                onChange={(e) => setSalary(Number(e.target.value))} 
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }} 
                            />
                        </div>
                        
                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#888', marginBottom: '5px' }}>Deductions (80C, etc.) (₹)</label>
                            <input 
                                type="number" 
                                value={deductions} 
                                onChange={(e) => setDeductions(Number(e.target.value))} 
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }} 
                            />
                        </div>
                        
                        <button 
                            onClick={handleCalculate}
                            style={{ 
                                width: '100%', padding: '12px', background: '#7ed957', color: 'white', border: 'none', 
                                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' 
                            }}
                        >
                            Calculate Taxes
                        </button>

                        {showResults && (
                            <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>Old Regime Tax:</span>
                                    <strong style={{ color: '#e74c3c' }}>₹{Math.round(taxOld).toLocaleString()}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span>New Regime Tax:</span>
                                    <strong style={{ color: '#7ed957' }}>₹{Math.round(taxNew).toLocaleString()}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: savings > 0 ? '#7ed957' : '#e74c3c' }}>
                                    <span>Savings with New:</span>
                                    <strong>₹{Math.round(savings).toLocaleString()}</strong>
                                </div>
                                <button 
                                    onClick={() => navigate('/guest-calculator')}
                                    style={{ 
                                        width: '100%', padding: '10px', background: 'linear-gradient(135deg, #7ed957, #5cb85c)', color: 'white', border: 'none', 
                                        borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' 
                                    }}
                                >
                                    Unlock Full AI Insights
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div style={{ background: '#f8f9fa', padding: '80px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '60px', color: '#2c3e50' }}>How Artha Saves You Time & Money</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>1️⃣</div>
                            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Enter Your Income</h3>
                            <p style={{ color: '#666', fontSize: '16px' }}>Just 3 fields—salary, deductions, investments. No endless forms.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>2️⃣</div>
                            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>AI Analyzes & Compares</h3>
                            <p style={{ color: '#666', fontSize: '16px' }}>Instant Old vs. New Regime breakdown with personalized savings tips.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>3️⃣</div>
                            <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>Export & Optimize</h3>
                            <p style={{ color: '#666', fontSize: '16px' }}>Get your PDF report and actionable plan. File confidently.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div style={{ background: 'white', padding: '80px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '50px', color: '#2c3e50' }}>Why Tax Pros & Salaried Folks Love Artha</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
                        <FeatureCard icon="⚡" title="Lightning-Fast Calc" desc="Real-time Old/New Regime showdown in seconds." />
                        <FeatureCard icon="🤖" title="AI Tax Guru" desc="Smart alerts for deductions you might miss." />
                        <FeatureCard icon="📄" title="Pro Reports" desc="Branded PDFs ready for your CA or filing." />
                        <FeatureCard icon="🔒" title="Fortress Security" desc="Bank-level encryption. Your data, your control." />
                        <FeatureCard icon="🔗" title="Seamless Sync" desc="Pull data from banks & apps effortlessly." />
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div style={{ background: '#2c3e50', color: 'white', padding: '60px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '40px', color: 'white' }}>What Users Are Saying</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ maxWidth: '250px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                            <p>"Saved me ₹15K I didn't know I could claim. Game-changer!"</p>
                            <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>- Priya S., Bangalore</p>
                        </div>
                        <div style={{ maxWidth: '250px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
                            <p>"Finally, taxes without tears. AI tips are spot-on."</p>
                            <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>- Raj K., Mumbai</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ background: '#1a252f', color: '#ccc', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <p>&copy; 2025 Artha by RB. All rights reserved. | 
                        <Link to="/privacy-policy">Privacy Policy</Link>
                        <Link to="/terms-of-service">Terms of Service</Link>
                        <Link to="/cookie-policy">Cookie Policy</Link>
                        <Link to="/data-processing-agreement">DPA</Link>
                    </p>            
                    <p style={{ marginTop: '10px', fontSize: '14px' }}>Ready to reclaim your tax season? <button onClick={() => navigate('/guest-calculator')} style={{ background: 'none', border: 'none', color: '#7ed957', cursor: 'pointer', fontWeight: 'bold' }}>Start Free Now</button></p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div style={{ 
        padding: '30px', borderRadius: '15px', background: '#f8f9fa', textAlign: 'center', 
        transition: 'all 0.3s ease', cursor: 'pointer'
    }}>
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

export default LandingPage;