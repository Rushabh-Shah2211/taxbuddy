import React, { useState } from 'react';

const AITaxAdvisor = ({ userProfile, calculationData }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [userQuestion, setUserQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const quickQuestions = [
        "How can I reduce my tax liability?",
        "Should I choose Old or New regime?",
        "What investments are best for tax saving?",
        "How much should I invest in 80C?",
        "Can I claim HRA exemption?",
        "What are advance tax due dates?"
    ];

    const askAI = async (question) => {
        setLoading(true);
        const newChat = [...chatHistory, { role: 'user', text: question }];
        setChatHistory(newChat);
        setUserQuestion('');

        try {
            const response = await fetch('https://taxbuddy-o5wu.onrender.com/api/tax/ai-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    userProfile,
                    calculationData,
                    chatHistory: newChat
                })
            });

            const data = await response.json();
            setChatHistory([...newChat, { role: 'assistant', text: data.response }]);
        } catch (error) {
            setChatHistory([...newChat, { 
                role: 'assistant', 
                text: 'Sorry, I encountered an error. Please try again.' 
            }]);
        }
        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userQuestion.trim()) askAI(userQuestion);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000
        }}>
            {!showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    🤖
                </button>
            )}

            {showChat && (
                <div style={{
                    width: '380px',
                    height: '550px',
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '20px',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>🤖 AI Tax Advisor</h3>
                            <p style={{ margin: '5px 0 0', fontSize: '12px', opacity: 0.9 }}>
                                Powered by Gemini AI
                            </p>
                        </div>
                        <button
                            onClick={() => setShowChat(false)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                fontSize: '20px',
                                cursor: 'pointer',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                        background: '#f8f9fa'
                    }}>
                        {chatHistory.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                                    👋 Hi! I'm your AI tax advisor. Ask me anything about taxes!
                                </p>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {quickQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => askAI(q)}
                                            style={{
                                                padding: '12px',
                                                background: 'white',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                textAlign: 'left',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = '#667eea';
                                                e.currentTarget.style.color = 'white';
                                                e.currentTarget.style.borderColor = '#667eea';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'white';
                                                e.currentTarget.style.color = 'black';
                                                e.currentTarget.style.borderColor = '#e0e0e0';
                                            }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {chatHistory.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: '15px',
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        padding: '12px 16px',
                                        borderRadius: '15px',
                                        background: msg.role === 'user' ? '#667eea' : 'white',
                                        color: msg.role === 'user' ? 'white' : '#333',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div style={{ display: 'flex', gap: '5px', padding: '10px' }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: '#667eea',
                                    animation: 'bounce 0.6s infinite'
                                }}></div>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: '#667eea',
                                    animation: 'bounce 0.6s infinite 0.2s'
                                }}></div>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: '#667eea',
                                    animation: 'bounce 0.6s infinite 0.4s'
                                }}></div>
                            </div>
                        )}
                    </div>

                    <div style={{
                        padding: '15px',
                        borderTop: '1px solid #e0e0e0',
                        background: 'white',
                        display: 'flex',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !userQuestion.trim()}
                            style={{
                                padding: '12px 20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                opacity: loading || !userQuestion.trim() ? 0.5 : 1
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};

export default AITaxAdvisor;