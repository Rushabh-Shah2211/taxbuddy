// client/src/components/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you would make an API call here to send the email.
        setSubmitted(true);
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="logo-section">
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive instructions</p>
                </div>
                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group-auth">
                            <label>Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="auth-btn">Send Reset Link</button>
                    </form>
                ) : (
                    <div style={{textAlign: 'center', padding: '20px'}}>
                        <h3 style={{color: 'green'}}>✓ Check your Email</h3>
                        <p>We have sent a password reset link to <strong>{email}</strong>.</p>
                        <Link to="/" className="auth-btn" style={{display:'inline-block', textDecoration:'none', marginTop:'15px'}}>Back to Login</Link>
                    </div>
                )}
                {!submitted && (
                    <div className="auth-footer">
                        <Link to="/">Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;