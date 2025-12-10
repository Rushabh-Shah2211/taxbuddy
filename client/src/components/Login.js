// client/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/rb_logo.png'; // Make sure rb_logo.png is in client/src/assets/
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Use your Render Backend URL
            const { data } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/auth/login', { email, password });
            
            // Save token and user info
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            // Redirect to Calculator
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
                    <img src={logo} alt="Artha by RB" className="auth-logo" />
                    <h2>Artha by RB</h2>
                    <p>Taxes. Refined. Redefined.</p>
                </div>
                
                <form onSubmit={handleLogin}>
                    <div className="input-group-auth">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="input-group-auth">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    {/* Forgot Password Link */}
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