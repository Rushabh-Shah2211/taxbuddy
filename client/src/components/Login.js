// client/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/rb_logo.png';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/calculator');
        } catch (error) {
            console.error(error);
            alert('Invalid Credentials. Please try again.');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="logo-section">
                    {/* Larger Logo */}
                    <img src={logo} alt="Artha by RB" className="auth-logo" />
                    
                    {/* Name and Tagline Removed. Replaced with Welcome Message */}
                    <h2>Welcome Back</h2>
                    <p>Login to manage your taxes efficiently.</p>
                </div>
                
                <form onSubmit={handleLogin}>
                    <div className="input-group-auth">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
                    </div>
                    <div className="input-group-auth">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
                    </div>
                    
                    <div style={{textAlign: 'right', marginBottom: '15px'}}>
                        <Link to="/forgot-password" style={{fontSize: '13px', color: '#667eea', textDecoration: 'none', fontWeight: '500'}}>
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="auth-btn">Login Securely</button>
                </form>
                
                <div className="auth-footer">
                    New here? <Link to="/register">Create an account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;