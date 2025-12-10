// client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './TaxCalculator.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [user, setUser] = useState(null);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            fetchHistory(parsedUser._id);
        }
    }, []);

    const fetchHistory = async (userId) => {
        try {
            const { data } = await axios.get(`https://taxbuddy-o5wu.onrender.com/api/tax/history?userId=${userId}`);
            setHistory(data);

            // Prepare Data for the Chart (Using the latest record)
            if (data.length > 0) {
                const latest = data[0]; // First item is the newest
                
                const income = latest.income.salary.basic + latest.income.salary.hra + latest.income.salary.specialAllowance + latest.income.salary.bonus;
                const tax = latest.computedTax.taxPayable;
                const investments = latest.deductions.section80C + latest.deductions.section80D;
                const takeHome = income - tax - investments;

                setChartData({
                    labels: ['Tax Payable', 'Investments', 'Take Home Income'],
                    datasets: [
                        {
                            label: 'Amount (₹)',
                            data: [tax, investments, takeHome],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)', // Red for Tax
                                'rgba(54, 162, 235, 0.6)', // Blue for Investments
                                'rgba(75, 192, 192, 0.6)', // Green for Take Home
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(75, 192, 192, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
            }
        } catch (error) {
            console.error("Error fetching history");
        }
    };

    return (
        <div className="calculator-container" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>📊 Financial Dashboard</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link to="/calculator" className="calculate-btn" style={{ textDecoration: 'none', background: '#28a745' }}>
                        + New Calculation
                    </Link>
                    {user && (
                        <Link to="/" onClick={() => localStorage.removeItem('userInfo')} className="calculate-btn" style={{ textDecoration: 'none', background: '#dc3545' }}>
                            Logout
                        </Link>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '40px' }}>
                {/* CHART SECTION */}
                <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ textAlign: 'center', margin: '0 0 15px 0' }}>Where your money goes (Latest)</h4>
                    {chartData ? (
                        <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#888' }}>No data to visualize yet.</p>
                    )}
                </div>

                {/* SUMMARY CARDS */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '10px', borderLeft: '5px solid #2196f3' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#1565c0' }}>Total Calculations</h3>
                        <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>{history.length}</p>
                    </div>
                    {history.length > 0 && (
                        <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '10px', borderLeft: '5px solid #4caf50' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#2e7d32' }}>Last Tax Calculated</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>₹{history[0].computedTax.taxPayable.toLocaleString()}</p>
                            <small>Regime: {history[0].computedTax.regimeSelected}</small>
                        </div>
                    )}
                </div>
            </div>

            {/* HISTORY TABLE */}
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📜 Calculation History</h3>
            {history.length === 0 ? (
                <p>No records found. Start by calculating your tax!</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#343a40', color: 'white' }}>
                                <th style={{ padding: '12px' }}>Date</th>
                                <th style={{ padding: '12px' }}>Gross Income</th>
                                <th style={{ padding: '12px' }}>Deductions</th>
                                <th style={{ padding: '12px' }}>Regime</th>
                                <th style={{ padding: '12px' }}>Tax Payable</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record._id} style={{ borderBottom: '1px solid #eee', textAlign: 'center', background: 'white' }}>
                                    <td style={{ padding: '12px' }}>
                                        {new Date(record.createdAt).toLocaleDateString()}
                                        <br/>
                                        <small style={{color: '#888'}}>{new Date(record.createdAt).toLocaleTimeString()}</small>
                                    </td>
                                    <td style={{ padding: '12px' }}>{record.userCategory || 'Salaried'}</td>
                                    <td style={{ padding: '12px' }}>₹{record.computedTax.taxPayable.toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        {/* NEW: Edit Button */}
                                        <Link 
                                            to="/calculator" 
                                            state={{ recordToEdit: record }} // Pass the data to calculator
                                            style={{
                                                textDecoration: 'none',
                                                background: '#ffc107',
                                                color: 'black',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            ✏️ Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;