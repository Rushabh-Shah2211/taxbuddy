// client/src/components/AdminLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Re-use your nice Auth styles

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/admin/login', { email, password });
            localStorage.setItem('adminToken', data.token);
            navigate('/admin/dashboard');
        } catch (error) {
            alert('Invalid Admin Credentials');
        }
    };

    return (
        <div className="auth-wrapper" style={{background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'}}>
            <div className="auth-card">
                <h2>🛡️ Admin Console</h2>
                <p>Restricted Access</p>
                <form onSubmit={handleLogin}>
                    <div className="input-group-auth">
                        <label>Admin ID</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group-auth">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="auth-btn" style={{background:'#1e3c72'}}>Login to Console</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;