// client/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './TaxCalculator.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', entityType: 'Individual' });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://taxbuddy-o5wu.onrender.com/api/auth/register', formData);
            alert('Registration Successful! Please Login.');
            navigate('/');
        } catch (error) {
            alert('Error registering user');
        }
    };

    return (
        <div className="calculator-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister} className="tax-form">
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <select name="entityType" onChange={handleChange}>
                    <option value="Individual">Individual</option>
                    <option value="Company">Company</option>
                    <option value="HUF">HUF</option>
                </select>
                <button type="submit" className="calculate-btn">Sign Up</button>
            </form>
            <p style={{marginTop: '10px'}}>
                Already have an account? <Link to="/">Login</Link>
            </p>
        </div>
    );
};

export default Register;