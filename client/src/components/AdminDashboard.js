// client/src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userData, setUserData] = useState({ taxHistory: [], chatHistory: [] });
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('adminToken')) navigate('/admin');
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        const { data } = await axios.get('https://taxbuddy-o5wu.onrender.com/api/admin/users');
        setUsers(data);
    };

    const viewUserDetails = async (user) => {
        setSelectedUser(user);
        const { data } = await axios.get(`https://taxbuddy-o5wu.onrender.com/api/admin/user-data/${user._id}`);
        setUserData(data);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#1e3c72' }}>🛡️ Admin Console</h1>
                <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin'); }} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* LEFT: User List */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    <h3>👥 User Registry ({users.length})</h3>
                    <div style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                        {users.map(u => (
                            <div key={u._id} onClick={() => viewUserDetails(u)} style={{ padding: '15px', borderBottom: '1px solid #eee', cursor: 'pointer', background: selectedUser?._id === u._id ? '#e3f2fd' : 'white' }}>
                                <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                                <div style={{ fontSize: '13px', color: '#666' }}>{u.email}</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Details Panel */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                    {!selectedUser ? (
                        <div style={{ textAlign: 'center', marginTop: '100px', color: '#999' }}>Select a user to view details</div>
                    ) : (
                        <>
                            <h2 style={{ borderBottom: '2px solid #1e3c72', paddingBottom: '10px' }}>{selectedUser.name}'s Profile</h2>
                            
                            {/* Contact Details */}
                            <div style={{ marginBottom: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                                <strong>📧 Email:</strong> {selectedUser.email}<br/>
                                <strong>🆔 User ID:</strong> {selectedUser._id}
                            </div>

                            {/* Tax History */}
                            <h3 style={{ color: '#2c3e50' }}>📄 Tax Calculations ({userData.taxHistory.length})</h3>
                            <div style={{ marginBottom: '30px', maxHeight: '300px', overflowY: 'auto' }}>
                                {userData.taxHistory.length === 0 ? <p>No records found.</p> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead style={{ background: '#eee' }}><tr><th style={{padding:'8px', textAlign:'left'}}>Date</th><th style={{padding:'8px', textAlign:'left'}}>Income</th><th style={{padding:'8px', textAlign:'left'}}>Tax</th></tr></thead>
                                        <tbody>
                                            {userData.taxHistory.map(rec => (
                                                <tr key={rec._id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{padding:'8px'}}>{new Date(rec.createdAt).toLocaleDateString()}</td>
                                                    <td style={{padding:'8px'}}>₹{rec.grossTotalIncome?.toLocaleString()}</td>
                                                    <td style={{padding:'8px', color: '#dc3545'}}>₹{rec.computedTax?.netTaxPayable?.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Chat History */}
                            <h3 style={{ color: '#667eea' }}>💬 Chatbot Logs ({userData.chatHistory.length})</h3>
                            <div style={{ maxHeight: '400px', overflowY: 'auto', background: '#f1f1f1', padding: '15px', borderRadius: '8px' }}>
                                {userData.chatHistory.length === 0 ? <p>No chat history.</p> : (
                                    userData.chatHistory.map(chat => (
                                        <div key={chat._id} style={{ marginBottom: '15px' }}>
                                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '3px' }}>{new Date(chat.timestamp).toLocaleString()}</div>
                                            <div style={{ background: 'white', padding: '8px', borderRadius: '5px', marginBottom: '5px' }}><strong>Q:</strong> {chat.question}</div>
                                            <div style={{ background: '#e8f5e9', padding: '8px', borderRadius: '5px' }}><strong>A:</strong> {chat.answer}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;