import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/rb_logo.png';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
            {/* Navbar */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logo} alt="Artha Logo" style={{ height: '40px' }} />
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>Artha</span>
                </div>
                <div>
                    <Link to="/login" style={{ textDecoration: 'none', color: '#666', marginRight: '20px', fontWeight: '500' }}>Login</Link>
                    <Link to="/register" style={{ padding: '10px 25px', background: '#2c3e50', color: 'white', textDecoration: 'none', borderRadius: '25px', fontWeight: 'bold' }}>Sign Up</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px', paddingRight: '40px' }}>
                    <h1 style={{ fontSize: '48px', color: '#2c3e50', marginBottom: '20px', lineHeight: '1.2' }}>
                        Master Your Taxes <br />
                        <span style={{ color: '#7ed957' }}>With AI Precision</span>
                    </h1>
                    <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
                        Calculate your income tax under the Old vs. New Regime instantly. 
                        Get AI-driven insights, detailed reports, and tax-saving suggestions.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button 
                            onClick={() => navigate('/guest-calculator')} 
                            style={{ padding: '15px 35px', fontSize: '16px', background: '#7ed957', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(126, 217, 87, 0.4)' }}
                        >
                            Try Guest Mode 🚀
                        </button>
                        <button 
                            onClick={() => navigate('/login')} 
                            style={{ padding: '15px 35px', fontSize: '16px', background: 'white', color: '#2c3e50', border: '2px solid #2c3e50', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Login to Save
                        </button>
                    </div>

                    <div style={{ marginTop: '30px', fontSize: '14px', color: '#888' }}>
                        ✅ No Login Required for Basic Calculation <br/>
                        ✅ Instant PDF Export <br/>
                        ✅ 100% Data Privacy
                    </div>
                </div>

                {/* Hero Image / Graphic */}
                <div style={{ flex: '1', minWidth: '300px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '450px', height: '350px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {/* Abstract UI Mockup */}
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                            <div style={{width:'40%', height:'10px', background:'#eee', borderRadius:'5px'}}></div>
                            <div style={{width:'20%', height:'10px', background:'#eee', borderRadius:'5px'}}></div>
                        </div>
                        <div style={{height:'150px', background:'#f8f9fa', borderRadius:'10px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <span style={{fontSize:'40px'}}>📊</span>
                        </div>
                        <div style={{width:'100%', height:'40px', background:'#2c3e50', borderRadius:'8px'}}></div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div style={{ background: 'white', padding: '80px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '50px', color: '#2c3e50' }}>Why Choose Artha?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
                        <FeatureCard icon="⚡" title="Instant Calculation" desc="Real-time comparison between Old and New Tax Regimes." />
                        <FeatureCard icon="🤖" title="AI Advisor" desc="Get smart suggestions on how to save more tax." />
                        <FeatureCard icon="📄" title="Detailed Reports" desc="Download professional PDF reports of your computation." />
                        <FeatureCard icon="🔒" title="Secure & Private" desc="Your financial data is encrypted and secure." />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div style={{ padding: '30px', borderRadius: '15px', background: '#f8f9fa', textAlign: 'center', transition: 'transform 0.3s' }}>
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>{desc}</p>
    </div>
);

export default LandingPage;