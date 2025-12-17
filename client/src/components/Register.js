// client/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/rb_logo.png'; 
import './Auth.css'; // Uses the Green Theme

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Use your Render Backend URL
            const { data } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/auth/register', {
                name,
                email,
                password
            });

            // Save and Redirect
            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            navigate('/calculator');

        } catch (error) {
            console.error(error);
            setLoading(false);
            alert('Registration Failed. Email might be in use.');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* --- LOGO SECTION --- */}
                <div className="logo-section">
                    <img src={logo} alt="Artha by RB" className="auth-logo" />
                    <h2>Create Account</h2>
                    <p>Join Artha to simplify your taxes.</p>
                </div>

                {/* --- FORM SECTION --- */}
                <form onSubmit={handleRegister}>
                    <div className="input-group-auth">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            placeholder="Ex. Rahul Sharma"
                        />
                    </div>

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

                    <div className="input-group-auth">
                        <label>Set Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Create a strong password"
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up Free'}
                    </button>
                </form>

                {/* --- FOOTER --- */}
                <div className="auth-footer">
                    Already have an account? <Link to="/Login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;    