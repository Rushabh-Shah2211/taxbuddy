// client/src/components/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '../assets/rb_logo.png';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('https://taxbuddy-o5wu.onrender.com/api/auth/forgot-password', { email });
            setSubmitted(true);
        } catch (err) {
            setError('Email not found or server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="logo-section">
                    <img src={logo} alt="Logo" className="auth-logo" style={{width: '60px'}} />
                    <h2>Reset Password</h2>
                    {!submitted ? <p>Enter your email to receive instructions</p> : null}
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        {error && <div style={{color:'red', marginBottom:'10px', fontSize:'13px'}}>{error}</div>}
                        <div className="input-group-auth">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div style={{textAlign: 'center', padding: '10px'}}>
                        <div style={{fontSize: '40px', marginBottom: '10px'}}>✅</div>
                        <h3 style={{color: '#4da037', margin: '10px 0'}}>Link Sent</h3>
                        <p style={{fontSize: '14px', color: '#555'}}>Check your email: <strong>{email}</strong></p>
                    </div>
                )}

                <div className="auth-footer">
                    <Link to="/Login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;