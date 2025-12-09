// client/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './TaxCalculator.css'; // Reusing CSS for simplicity

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/auth/login', { email, password });
            
            // Save the user info and token to local storage (browser memory)
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            alert('Login Successful!');
            navigate('/calculator'); // Go to calculator after login
        } catch (error) {
            alert('Invalid Credentials');
        }
    };

    return (
        <div className="calculator-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin} className="tax-form">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" className="calculate-btn">Login</button>
            </form>
            <p style={{marginTop: '10px'}}>
                New here? <Link to="/register">Register</Link>
            </p>
        </div>
    );
};

export default Login;