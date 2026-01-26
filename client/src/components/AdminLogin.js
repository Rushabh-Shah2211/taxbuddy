import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css'; // Ensure you have this CSS file or remove this import

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            // <--- CRITICAL FIX: Added '/tax' to the URL --->
            const { data } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/admin/login', formData);
            
            if (data.token) {
                // Save admin token specifically
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminName', data.name);
                
                // Redirect to Admin Dashboard
                navigate('/admin/dashboard');
            }
        } catch (err) {
            console.error("Login Error:", err);
            // Show a friendly error message from the backend or a default one
            const msg = err.response?.data?.message || "Login failed. Check your network or credentials.";
            setError(msg);
        }
    };

    return (
        <div className="admin-login-container" style={{maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
            <h2 style={{textAlign: 'center', color: '#333'}}>Admin Login</h2>
            
            {error && <div style={{color: 'red', marginBottom: '15px', textAlign: 'center'}}>{error}</div>}
            
            <form onSubmit={onSubmit}>
                <div style={{marginBottom: '15px'}}>
                    <label style={{display: 'block', marginBottom: '5px'}}>Email</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}
                    />
                </div>
                
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '5px'}}>Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}
                    />
                </div>
                
                <button 
                    type="submit" 
                    style={{width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;