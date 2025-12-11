import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import logo from '../assets/rb_logo.png';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [latestCalc, setLatestCalc] = useState(null);
    const [chartData, setChartData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            fetchHistory(parsedUser._id);
        } else {
            navigate('/');
        }
    }, [navigate]);

    const fetchHistory = async (userId) => {
        try {
            const { data } = await axios.get(`https://taxbuddy-o5wu.onrender.com/api/tax/history?userId=${userId}`);
            setHistory(data);
            
            if (data.length > 0) {
                const latest = data[0];
                setLatestCalc(latest);
                
                // Prepare Chart Data
                const tax = latest.computedTax.netTaxPayable || 0;
                // Simple logic: Income - Tax = Take Home (ignoring deductions for simple visual)
                const income = latest.grossTotalIncome || 0;
                const takeHome = Math.max(0, income - tax);

                setChartData({
                    labels: ['Tax Payable', 'Take Home Income'],
                    datasets: [{
                        data: [tax, takeHome],
                        backgroundColor: ['#ffffff', 'rgba(255,255,255,0.3)'], // White theme for Green card? No, let's keep separate chart
                        backgroundColor: ['#ef4444', '#7ed957'],
                        borderWidth: 0,
                    }],
                });
            }
        } catch (error) {
            console.error("Error fetching history");
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    // Get time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="dashboard-container">
            
            {/* 1. HEADER */}
            <header className="dashboard-header">
                <div className="welcome-text">
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'5px'}}>
                        <img src={logo} alt="Artha" style={{height:'30px'}}/>
                        <span style={{fontWeight:'bold', color:'#7ed957'}}>Artha</span>
                    </div>
                    <h1>{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p>Here is your financial overview.</p>
                </div>
                <div className="header-actions">
                    <button onClick={logout}>Logout</button>
                </div>
            </header>

            {/* 2. HERO SECTION (Latest Snapshot) */}
            <div className="hero-card">
                <div className="hero-stats">
                    <div className="hero-label">LATEST INCOME COMPUTATION</div>
                    <div className="hero-value">
                        ₹{latestCalc ? (latestCalc.grossTotalIncome / 100000).toFixed(2) : '0'} Lakhs
                    </div>
                    <div className="hero-sub">
                        Tax Liability: ₹{latestCalc ? latestCalc.computedTax.netTaxPayable.toLocaleString() : '0'}
                    </div>
                </div>
                <div className="hero-actions">
                    <Link to="/calculator" className="btn-light">Start New +</Link>
                    {latestCalc && (
                        <Link to="/calculator" state={{ recordToEdit: latestCalc }} className="btn-outline">View Details</Link>
                    )}
                </div>
            </div>

            <div className="dashboard-grid">
                
                {/* 3. LEFT COLUMN (Content) */}
                <div className="main-content">
                    
                    {/* Quick Actions */}
                    <div className="dash-card">
                        <h3>⚡ Quick Actions</h3>
                        <div className="actions-grid">
                            <Link to="/calculator" className="action-tile">
                                <span className="tile-icon">🧮</span>
                                <span className="tile-text">New Tax Calc</span>
                            </Link>
                            <Link to="/profile" className="action-tile">
                                <span className="tile-icon">👤</span>
                                <span className="tile-text">Edit Profile</span>
                            </Link>
                            <div className="action-tile" onClick={() => alert("Coming Soon!")}>
                                <span className="tile-icon">📄</span>
                                <span className="tile-text">Docs Vault</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent History Table */}
                    <div className="dash-card">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:'15px', marginBottom:'20px'}}>
                            <h3 style={{border:0, margin:0, padding:0}}>🕒 Recent Calculations</h3>
                            <Link to="/calculator" style={{fontSize:'13px', color:'#7ed957', textDecoration:'none', fontWeight:'600'}}>View All</Link>
                        </div>
                        
                        {history.length === 0 ? <p style={{color:'#999'}}>No calculations yet.</p> : (
                            <table className="mini-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>FY</th>
                                        <th>Income</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.slice(0, 3).map((rec) => (
                                        <tr key={rec._id}>
                                            <td>{new Date(rec.createdAt).toLocaleDateString()}</td>
                                            <td>{rec.financialYear}</td>
                                            <td>₹{(rec.grossTotalIncome/1000).toFixed(0)}k</td>
                                            <td><span className="status-badge">Done</span></td>
                                            <td>
                                                <Link to="/calculator" state={{ recordToEdit: rec }} style={{textDecoration:'none', fontSize:'18px'}}>✏️</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* 4. RIGHT COLUMN (Sidebar Stats) */}
                <div className="sidebar">
                    
                    {/* Tax Breakdown Chart */}
                    {chartData && (
                        <div className="dash-card" style={{textAlign:'center'}}>
                            <h3>📊 Financial Health</h3>
                            <div style={{height:'180px', display:'flex', justifyContent:'center'}}>
                                <Doughnut data={chartData} options={{maintainAspectRatio:false, plugins:{legend:{display:false}}}} />
                            </div>
                            <div style={{marginTop:'15px', fontSize:'12px', color:'#666'}}>
                                <span style={{color:'#ef4444'}}>●</span> Tax &nbsp; 
                                <span style={{color:'#7ed957'}}>●</span> Take Home
                            </div>
                        </div>
                    )}

                    {/* Tax Calendar Widget */}
                    <div className="dash-card calendar-widget">
                        <h3>📅 Tax Calendar</h3>
                        <div className="cal-date">15</div>
                        <div className="cal-month">DECEMBER</div>
                        <div className="cal-event">
                            ⚠️ Advance Tax Installment (75%)
                        </div>
                        <p style={{fontSize:'12px', color:'#999', marginTop:'10px'}}>Mark your calendar!</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;