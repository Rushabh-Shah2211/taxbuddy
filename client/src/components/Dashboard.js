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
        <div className="calculator-container" style={{maxWidth: '1200px'}}>
             {/* Use same navbar code as Calculator if you want consistency */}
             
             <h3>Calculation History</h3>
             {history.length === 0 ? <p>No records found.</p> : (
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '13px', background:'white'}}>
                        <thead style={{background: '#343a40', color: 'white'}}>
                            <tr>
                                <th style={{padding: '12px'}}>Date</th>
                                <th style={{padding: '12px'}}>FY</th>
                                <th style={{padding: '12px'}}>Salary</th>
                                <th style={{padding: '12px'}}>Business</th>
                                <th style={{padding: '12px'}}>House Prop</th>
                                <th style={{padding: '12px'}}>Total Tax</th>
                                <th style={{padding: '12px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record._id} style={{borderBottom: '1px solid #eee', textAlign: 'center'}}>
                                    <td style={{padding: '10px'}}>{new Date(record.createdAt).toLocaleDateString()}</td>
                                    <td style={{padding: '10px'}}>{record.financialYear}</td>
                                    
                                    {/* BREAKDOWN COLUMNS */}
                                    <td style={{padding: '10px'}}>₹{record.income?.salary?.basic ? (record.income.salary.basic + record.income.salary.hra).toLocaleString() : '0'}</td>
                                    <td style={{padding: '10px'}}>₹{record.income?.business?.profit ? record.income.business.profit.toLocaleString() : '0'}</td>
                                    <td style={{padding: '10px'}}>₹{record.income?.houseProperty?.rentReceived ? record.income.houseProperty.rentReceived.toLocaleString() : '0'}</td>
                                    
                                    <td style={{padding: '10px', fontWeight:'bold', color:'#dc3545'}}>₹{record.computedTax.taxPayable.toLocaleString()}</td>
                                    <td style={{padding: '10px'}}>
                                        {/* Actions */}
                                        <button onClick={() => handleDelete(record._id)}>🗑</button>
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