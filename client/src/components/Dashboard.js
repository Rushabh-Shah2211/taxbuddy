// client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import logo from '../assets/rb_logo.png';
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
            if (data.length > 0) updateChart(data[0]);
        } catch (error) { console.error("Error fetching history"); }
    };

    const updateChart = (latest) => {
        const income = (latest.income.salary?.basic || 0) + (latest.income.otherSources?.businessProfit || 0);
        const tax = latest.computedTax.taxPayable;
        const invest = (latest.deductions?.section80C || 0) + (latest.deductions?.section80D || 0);
        setChartData({
            labels: ['Tax', 'Investments', 'Net Income'],
            datasets: [{ data: [tax, invest, Math.max(0, income - tax - invest)], backgroundColor: ['#dc3545', '#007bff', '#28a745'] }]
        });
    };

    // --- DELETE FUNCTION ---
    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await axios.delete(`https://taxbuddy-o5wu.onrender.com/api/tax/${id}`);
            const updatedHistory = history.filter(rec => rec._id !== id);
            setHistory(updatedHistory);
            if (updatedHistory.length > 0) updateChart(updatedHistory[0]);
            else setChartData(null);
        } catch (error) { alert("Delete failed"); }
    };

    return (
        <div className="calculator-container" style={{maxWidth: '1000px'}}>
             <div className="header-actions">
                <div>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <img src={logo} alt="Logo" style={{height:'35px'}} />
                        <h2 style={{margin:0}}>Artha by RB</h2>
                    </div>
                    <small>Dashboard</small>
                </div>
                <div>
                     <Link to="/calculator" className="toggle-btn" style={{textDecoration:'none', background:'#28a745', color:'white'}}>+ New Calculation</Link>
                </div>
            </div>

            {chartData && (
                <div style={{background:'white', padding:'20px', borderRadius:'10px', border:'1px solid #ddd', marginBottom:'30px', display:'flex', justifyContent:'center'}}>
                    <div style={{height:'200px'}}><Pie data={chartData} options={{maintainAspectRatio:false}} /></div>
                </div>
            )}

            <h3>Calculation History</h3>
            {history.length === 0 ? <p>No records found.</p> : (
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px', background:'white'}}>
                        <thead style={{background: '#343a40', color: 'white'}}>
                            <tr>
                                <th style={{padding: '12px'}}>Date</th>
                                <th style={{padding: '12px'}}>FY</th>
                                <th style={{padding: '12px'}}>Income</th>
                                <th style={{padding: '12px'}}>Tax</th>
                                <th style={{padding: '12px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record._id} style={{borderBottom: '1px solid #eee', textAlign: 'center'}}>
                                    <td style={{padding: '12px'}}>{new Date(record.createdAt).toLocaleDateString()}</td>
                                    <td style={{padding: '12px'}}>{record.financialYear || '2024-25'}</td>
                                    <td style={{padding: '12px'}}>₹{((record.income.salary?.basic||0) + (record.income.otherSources?.businessProfit||0)).toLocaleString()}</td>
                                    <td style={{padding: '12px', fontWeight:'bold', color:'#dc3545'}}>₹{record.computedTax.taxPayable.toLocaleString()}</td>
                                    <td style={{padding: '12px', display:'flex', gap:'10px', justifyContent:'center'}}>
                                        <Link to="/calculator" state={{ recordToEdit: record }} style={{textDecoration:'none', background:'#ffc107', color:'black', padding:'5px 10px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold'}}>Edit</Link>
                                        <button onClick={() => handleDelete(record._id)} style={{background:'#dc3545', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'12px'}}>🗑</button>
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