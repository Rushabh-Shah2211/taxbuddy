// client/src/components/ResetPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/rb_logo.png';
import './Auth.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { resetToken } = useParams(); // Get token from URL
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return alert("Passwords do not match");

        try {
            await axios.put(`https://taxbuddy-o5wu.onrender.com/api/auth/reset-password/${resetToken}`, { password });
            alert("Password Reset Successful! Please Login.");
            navigate('/');
        } catch (error) {
            alert("Invalid or Expired Token");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <div className="logo-section">
                    <img src={logo} alt="Logo" className="auth-logo" />
                    <h2>Set New Password</h2>
                </div>
                <form onSubmit={handleReset}>
                    <div className="input-group-auth">
                        <label>New Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="input-group-auth">
                        <label>Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="auth-btn">Reset Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;