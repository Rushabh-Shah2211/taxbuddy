// client/src/components/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; // Reusing the clean Auth styles

const Profile = () => {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setUser(parsed);
            setName(parsed.name);
            setEmail(parsed.email);
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.put(
                'https://taxbuddy-o5wu.onrender.com/api/auth/profile',
                { _id: user._id, name, email, password },
                config
            );
            localStorage.setItem('userInfo', JSON.stringify(data));
            alert("Profile Updated Successfully!");
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            alert("Update Failed");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card" style={{maxWidth: '500px'}}>
                <div className="logo-section">
                    <h2>Edit Profile</h2>
                    <p>Update your personal details</p>
                </div>
                <form onSubmit={handleUpdate}>
                    <div className="input-group-auth">
                        <label>Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="input-group-auth">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #eee'}}/>
                    <div className="input-group-auth">
                        <label>New Password (Leave blank to keep same)</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" />
                    </div>
                    <div className="input-group-auth">
                        <label>Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />
                    </div>
                    
                    <button type="submit" className="auth-btn">Save Changes</button>
                    <button type="button" onClick={() => navigate('/dashboard')} style={{marginTop: '10px', background: 'transparent', color: '#666', border: 'none', cursor: 'pointer', width:'100%'}}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default Profile;