import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/rb_logo.png';
import './TaxCalculator.css'; // Re-use calculator styles for table

const History = () => {
    const [history, setHistory] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setUser(parsed);
            axios.get(`https://taxbuddy-o5wu.onrender.com/api/tax/history?userId=${parsed._id}`)
                .then(res => setHistory(res.data))
                .catch(err => console.error(err));
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this record?")) return;
        try {
            await axios.delete(`https://taxbuddy-o5wu.onrender.com/api/tax/${id}`);
            setHistory(history.filter(h => h._id !== id));
        } catch (err) { alert("Failed to delete"); }
    };

    return (
        <div className="calculator-container">
            <div className="navbar">
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <img src={logo} alt="Logo" style={{height:'35px'}} />
                    <h2 style={{margin:0}}>Artha History</h2>
                </div>
                <div className="nav-links">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/calculator" className="btn-primary" style={{padding:'8px 15px', color:'white'}}>+ New Calc</Link>
                </div>
            </div>

            <div style={{marginTop:'30px'}}>
                {history.length === 0 ? <p style={{textAlign:'center', padding:'40px'}}>No records found.</p> : (
                    <div style={{overflowX: 'auto'}}>
                        <table className="summary-table" style={{width:'100%'}}>
                            <thead style={{background:'#f8f9fa'}}>
                                <tr>
                                    <th style={{padding:'15px', textAlign:'left'}}>Date</th>
                                    <th style={{padding:'15px', textAlign:'left'}}>FY</th>
                                    <th style={{padding:'15px', textAlign:'left'}}>Regime</th>
                                    <th style={{padding:'15px', textAlign:'right'}}>Tax Payable</th>
                                    <th style={{padding:'15px', textAlign:'center'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((rec) => (
                                    <tr key={rec._id} style={{borderBottom:'1px solid #eee'}}>
                                        <td style={{padding:'15px'}}>{new Date(rec.createdAt).toLocaleDateString()}</td>
                                        <td style={{padding:'15px'}}>{rec.financialYear}</td>
                                        <td style={{padding:'15px'}}>{rec.computedTax?.regimeSelected}</td>
                                        <td style={{padding:'15px', textAlign:'right', fontWeight:'bold', color:'#dc3545'}}>
                                            ₹{rec.computedTax?.netTaxPayable?.toLocaleString()}
                                        </td>
                                        <td style={{padding:'15px', textAlign:'center'}}>
                                            <Link to="/calculator" state={{ recordToEdit: rec }} style={{marginRight:'10px', textDecoration:'none'}}>✏️</Link>
                                            <button onClick={() => handleDelete(rec._id)} style={{border:'none', background:'none', cursor:'pointer'}}>🗑</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;