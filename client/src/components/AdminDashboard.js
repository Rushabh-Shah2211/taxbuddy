import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/rb_logo.png';
import SEO from './SEO'; // SEO for Admin

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, calculations: 0, visitors: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Assuming admin token is stored
                const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
                if (!adminInfo) { navigate('/admin'); return; }

                const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
                const { data } = await axios.get('https://taxbuddy-o5wu.onrender.com/api/admin/stats', config);
                setStats(data);
            } catch (error) {
                console.error("Admin stats error", error);
                // Handle unauthorized access
                if(error.response && error.response.status === 401) navigate('/admin');
            }
        };

        fetchStats();
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem('adminInfo');
        navigate('/admin');
    };

    return (
        <div style={{ padding: '40px', background: '#f5f7fa', minHeight: '100vh' }}>
            <SEO title="Admin Dashboard" description="Admin Analytics" />
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src={logo} alt="Admin" style={{ height: '50px' }} />
                        <h1 style={{ margin: 0, color: '#2c3e50' }}>Admin Dashboard</h1>
                    </div>
                    <button onClick={logout} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {/* Visitor Stats Card */}
                    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #7ed957' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Visitors</h3>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>{stats.visitors?.toLocaleString() || 0}</div>
                        <div style={{ fontSize: '12px', color: '#7ed957', marginTop: '5px' }}>Unique page views</div>
                    </div>

                    {/* Other Stats */}
                    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #2196f3' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Registered Users</h3>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>{stats.users?.toLocaleString() || 0}</div>
                    </div>

                    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #ff9800' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Calculations Run</h3>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>{stats.calculations?.toLocaleString() || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;