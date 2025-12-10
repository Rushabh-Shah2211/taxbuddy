import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/rb_logo.png'; // Ensure you put your logo file here!
import './Auth.css'; // New CSS file
import { Link } from 'react-router-dom';

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
            alert('Invalid Credentials');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="logo-section">
                    <img src={logo} alt="RB TaxBuddy" className="auth-logo" />
                    <h2>Welcome Back</h2>
                    <p>Login to manage your taxes efficiently</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="input-group-auth">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group-auth">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div style={{textAlign: 'right', marginBottom: '15px'}}>
                        <Link to="/forgot-password" style={{fontSize: '12px', color: '#667eea', textDecoration: 'none'}}>Forgot Password?</Link>
                    </div>
                    <button type="submit" className="auth-btn">Login Securely</button>
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