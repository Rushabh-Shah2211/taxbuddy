// client/src/components/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/rb_logo.png';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulation: In a real app, axios.post('/api/auth/forgot-password') would go here
        setSubmitted(true);
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="logo-section">
                    <img src={logo} alt="Logo" className="auth-logo" style={{width: '60px'}} />
                    <h2>Reset Password</h2>
                    {!submitted ? 
                        <p>Enter your email to receive instructions</p> : 
                        <p>Check your inbox!</p>
                    }
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group-auth">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="name@example.com"
                            />
                        </div>
                        <button type="submit" className="auth-btn">Send Reset Link</button>
                    </form>
                ) : (
                    <div style={{textAlign: 'center', padding: '10px'}}>
                        <div style={{fontSize: '40px', marginBottom: '10px'}}>✅</div>
                        <h3 style={{color: 'green', margin: '10px 0'}}>Link Sent</h3>
                        <p style={{fontSize: '14px', color: '#555'}}>We have sent a password reset link to <br/><strong>{email}</strong></p>
                    </div>
                )}

                <div className="auth-footer">
                    <Link to="/">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;