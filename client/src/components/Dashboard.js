// client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './TaxCalculator.css';

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

            if (data.length > 0) {
                const latest = data[0];
                // Safe parsing to handle both Salaried and Business structures
                const salaryIncome = (latest.income.salary?.basic || 0) + (latest.income.salary?.hra || 0) + (latest.income.salary?.specialAllowance || 0);
                const businessIncome = latest.income.otherSources?.businessProfit || 0;
                const totalIncome = salaryIncome + businessIncome;
                
                const tax = latest.computedTax.taxPayable;
                const investments = (latest.deductions.section80C || 0) + (latest.deductions.section80D || 0);
                const takeHome = Math.max(0, totalIncome - tax - investments);

                setChartData({
                    labels: ['Tax', 'Investments', 'Net Income'],
                    datasets: [{
                        data: [tax, investments, takeHome],
                        backgroundColor: ['#dc3545', '#007bff', '#28a745'],
                    }],
                });
            }
        } catch (error) {
            console.error("Error fetching history");
        }
    };

    return (
        <div className="calculator-container" style={{maxWidth: '1000px'}}>
             <div className="header-actions">
                <div><h2>📊 Dashboard</h2></div>
                <div style={{display:'flex', gap:'10px'}}>
                     <Link to="/calculator" className="toggle-btn" style={{textDecoration:'none', background:'#28a745', color:'white'}}>+ New Calculation</Link>
                </div>
            </div>

            {/* Chart Section */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px'}}>
                <div style={{flex: 1, background: 'white', padding: '20px', borderRadius: '10px', border:'1px solid #ddd'}}>
                    <h4 style={{textAlign:'center'}}>Latest Financial Split</h4>
                    {chartData ? <div style={{height: '200px', display:'flex', justifyContent:'center'}}><Pie data={chartData} options={{maintainAspectRatio:false}} /></div> : <p style={{textAlign:'center'}}>No data.</p>}
                </div>
            </div>

            <h3>Calculation History</h3>
            {history.length === 0 ? <p>No records found.</p> : (
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px', background:'white'}}>
                        <thead style={{background: '#343a40', color: 'white'}}>
                            <tr>
                                {/* FIXED HEADERS */}
                                <th style={{padding: '12px'}}>Date</th>
                                <th style={{padding: '12px'}}>Category</th>
                                <th style={{padding: '12px'}}>Total Income</th>
                                <th style={{padding: '12px'}}>Regime</th>
                                <th style={{padding: '12px'}}>Tax</th>
                                <th style={{padding: '12px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record._id} style={{borderBottom: '1px solid #eee', textAlign: 'center'}}>
                                    {/* FIXED CELLS */}
                                    <td style={{padding: '12px'}}>{new Date(record.createdAt).toLocaleDateString()}</td>
                                    
                                    <td style={{padding: '12px'}}>
                                        <span style={{padding:'4px 8px', borderRadius:'10px', fontSize:'12px', background: record.userCategory === 'Business' ? '#e2e6ea' : '#d1ecf1'}}>
                                            {record.userCategory || 'Salaried'}
                                        </span>
                                    </td>
                                    
                                    <td style={{padding: '12px'}}>
                                        ₹{((record.income.salary?.basic||0) + (record.income.salary?.hra||0) + (record.income.salary?.specialAllowance||0) + (record.income.otherSources?.businessProfit||0)).toLocaleString()}
                                    </td>
                                    
                                    <td style={{padding: '12px'}}>{record.computedTax.regimeSelected}</td>
                                    
                                    <td style={{padding: '12px', fontWeight:'bold', color:'#dc3545'}}>₹{record.computedTax.taxPayable.toLocaleString()}</td>
                                    
                                    <td style={{padding: '12px'}}>
                                        <Link to="/calculator" state={{ recordToEdit: record }} style={{textDecoration:'none', background:'#ffc107', color:'black', padding:'5px 10px', borderRadius:'4px', fontSize:'11px', fontWeight:'bold'}}>
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