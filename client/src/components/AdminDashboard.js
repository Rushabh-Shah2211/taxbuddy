import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import './AdminDashboard.css'; // Uncomment if you have a CSS file

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const adminName = localStorage.getItem('adminName') || 'Admin';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                navigate('/admin/login');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // ✅ CORRECTED URL: Points to /api/tax/admin/users
            const { data } = await axios.get('https://taxbuddy-o5wu.onrender.com/api/tax/admin/users', config);
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            if (error.response && error.response.status === 401) {
                logout(); // Logout if token is invalid
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            // ✅ CORRECTED URL for details
            const { data } = await axios.get(`https://taxbuddy-o5wu.onrender.com/api/tax/admin/user/${userId}`, config);
            setSelectedUser({ ...data, _id: userId });
        } catch (error) {
            console.error("Error fetching details:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        navigate('/admin/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', background: '#f4f7f6' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', background: '#fff', borderRight: '1px solid #ddd', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ color: '#007bff', marginBottom: '30px' }}>🛡️ Admin Console</h3>
                
                <div style={{ marginBottom: '20px', fontWeight: 'bold', color: '#555' }}>
                    👥 User Registry ({users.length})
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : users.length === 0 ? (
                        <p style={{ fontSize: '13px', color: '#888' }}>No registered users found.</p>
                    ) : (
                        users.map(user => (
                            <div 
                                key={user._id} 
                                onClick={() => fetchUserDetails(user._id)}
                                style={{
                                    padding: '10px', cursor: 'pointer', borderRadius: '5px', marginBottom: '5px',
                                    background: selectedUser?._id === user._id ? '#e3f2fd' : 'transparent',
                                    color: selectedUser?._id === user._id ? '#0d47a1' : '#333'
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>User Inspector</h2>
                    <button onClick={logout} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                </div>

                {selectedUser ? (
                    <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <h3>📂 Records for: <span style={{color: '#007bff'}}>{selectedUser._id}</span></h3>
                        
                        {selectedUser.taxHistory && selectedUser.taxHistory.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Date</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>FY</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Income</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Tax (Old)</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Tax (New)</th>
                                        <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Suggestion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedUser.taxHistory.map((rec) => (
                                        <tr key={rec._id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>{new Date(rec.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px' }}>{rec.financialYear}</td>
                                            <td style={{ padding: '10px' }}>₹{rec.grossTotalIncome?.toLocaleString()}</td>
                                            <td style={{ padding: '10px' }}>₹{rec.oldRegimeTax?.toLocaleString()}</td>
                                            <td style={{ padding: '10px' }}>₹{rec.newRegimeTax?.toLocaleString()}</td>
                                            <td style={{ padding: '10px', fontWeight: 'bold', color: rec.recommendation === 'New Regime' ? '#28a745' : '#007bff' }}>
                                                {rec.recommendation}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No tax records found for this user.</p>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#aaa', border: '2px dashed #ddd', borderRadius: '10px' }}>
                        Select a user from the left to view details
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;