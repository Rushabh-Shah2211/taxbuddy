import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import './AdminLogin.css'; // Uncomment if you have styles

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // ✅ CORRECTED URL: Points to /api/tax/admin/login
            const { data } = await axios.post('https://taxbuddy-o5wu.onrender.com/api/tax/admin/login', formData);
            
            if (data.token) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminName', data.name || 'Admin');
                navigate('/admin/dashboard');
            }
        } catch (err) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || "Connection failed. Please check your network.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f6f8'
        }}>
            <div style={{
                width: '100%', maxWidth: '400px', padding: '40px', background: 'white', 
                borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{textAlign: 'center', color: '#1a1a1a', marginBottom: '30px'}}>Admin Portal</h2>
                
                {error && (
                    <div style={{
                        background: '#ffebee', color: '#c62828', padding: '12px', 
                        borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={onSubmit}>
                    <div style={{marginBottom: '20px'}}>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555'}}>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            placeholder="admin@artha.com"
                            style={{
                                width: '100%', padding: '12px', borderRadius: '6px', 
                                border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    
                    <div style={{marginBottom: '30px'}}>
                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555'}}>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            placeholder="••••••••"
                            style={{
                                width: '100%', padding: '12px', borderRadius: '6px', 
                                border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px', background: '#212529', color: 'white', 
                            border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', 
                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Verifying...' : 'Login Securely'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;