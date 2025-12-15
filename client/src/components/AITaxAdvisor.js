import React, { useState, useRef, useEffect } from 'react';

const AITaxAdvisor = ({ userProfile, calculationData }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [userQuestion, setUserQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const chatEndRef = useRef(null);

    // Scroll to bottom on new message
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, showChat, activeCategory]);

    // Exhaustive Question Database mapped to Categories
    const questionCategories = {
        "Basics & Login": [
            "Which ITR form applies to me?",
            "I forgot my password, how do I reset it?",
            "How do I link PAN with Aadhaar?",
            "What is the difference between Old and New Regime?",
            "Can I file a return after the due date?"
        ],
        "Salary & HRA": [
            "How is HRA calculated?",
            "My employer hasn't given me Form 16 yet.",
            "Can I claim LTA for international travel?",
            "Is standard deduction available in New Regime?",
            "Can I claim HRA if I live with parents?"
        ],
        "Deductions (80C/80D)": [
            "What is the limit for Section 80C?",
            "Does term insurance come under 80C?",
            "Can I claim 80D for my parents?",
            "Is interest from Savings Account taxable (80TTA)?",
            "What is the extra deduction for NPS?"
        ],
        "Business & Freelance": [
            "What is Presumptive Taxation (44ADA)?",
            "Can a YouTuber file under 44ADA?",
            "Do I need to maintain books of accounts?",
            "Can I deduct my laptop cost as an expense?",
            "What is the due date for Tax Audit?"
        ],
        "Capital Gains": [
            "What is the tax rate for Short Term Capital Gains?",
            "How is the sale of Gold jewelry taxed?",
            "Can I save tax by buying a new house (Sec 54)?",
            "What is the 1 Lakh exemption on LTCG?",
            "How to report loss in Intraday trading?"
        ],
        "Crypto & VDA": [
            "Is Bitcoin legal in India?",
            "Is it flat 30% tax on crypto?",
            "Can I set off Crypto loss against Salary?",
            "What is 1% TDS on Crypto (Sec 194S)?",
            "How to report P2P transactions?"
        ],
        "Refunds & Filing": [
            "Where is my tax refund?",
            "My refund failed. What should I do?",
            "How do I e-verify my return?",
            "What is a Defective Return notice?",
            "Can I revise my return after filing?"
        ]
    };

    // Feature: Log unanswered or failed questions for future training
    const logUnansweredQuestion = async (question, errorType) => {
        try {
            console.log(`[Missed Query Logged]: ${question} (Reason: ${errorType})`);
            // In a real app, send this to your backend
            await fetch('https://taxbuddy-o5wu.onrender.com/api/tax/log-unanswered', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question,
                    errorType,
                    timestamp: new Date().toISOString(),
                    userContext: userProfile // Optional: helps debug specific user issues
                })
            });
        } catch (err) {
            // Fail silently so user UX isn't affected
            console.warn("Failed to log unanswered question to server");
        }
    };

    const askAI = async (question) => {
        setLoading(true);
        setActiveCategory(null); // Close category menu on ask
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

            // Detect vague/fallback answers to log them
            const fallbackPhrases = ["I'm not sure", "I cannot answer", "consult a professional", "I don't know"];
            const isFallback = fallbackPhrases.some(phrase => data.response.toLowerCase().includes(phrase.toLowerCase()));

            if (!response.ok || isFallback) {
                logUnansweredQuestion(question, isFallback ? "Low Confidence" : "API Error");
            }

            setChatHistory([...newChat, { role: 'assistant', text: data.response }]);
        } catch (error) {
            logUnansweredQuestion(question, "Network/Server Exception");
            setChatHistory([...newChat, { 
                role: 'assistant', 
                text: 'Sorry, I encountered an error connecting to the server. Please try again later.' 
            }]);
        }
        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userQuestion.trim()) askAI(userQuestion);
    };

    // Helper to format bot responses (Bold, Line breaks)
    const formatMessage = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} style={{ minHeight: line.trim() === '' ? '10px' : 'auto' }}>
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </div>
            );
        });
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {/* Floating Trigger Button */}
            {!showChat && (
                <button
                    onClick={() => setShowChat(true)}
                    style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                        border: 'none', color: 'white', fontSize: '28px',
                        cursor: 'pointer', boxShadow: '0 4px 15px rgba(13, 71, 161, 0.4)',
                        transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    🤖
                </button>
            )}

            {/* Chat Window */}
            {showChat && (
                <div style={{
                    width: '380px', height: '600px', background: 'white',
                    borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                        padding: '20px', color: 'white', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Tax Assistant</h3>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.85 }}>
                                Experts powered by AI
                            </p>
                        </div>
                        <button
                            onClick={() => setShowChat(false)}
                            style={{
                                background: 'rgba(255,255,255,0.2)', border: 'none',
                                color: 'white', fontSize: '18px', cursor: 'pointer',
                                borderRadius: '50%', width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '20px',
                        background: '#f4f6f8', display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Welcome / Main Menu State */}
                        {chatHistory.length === 0 && !activeCategory && (
                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>👋</div>
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>How can I help you today?</h4>
                                <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
                                    Select a topic below:
                                </p>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                    {Object.keys(questionCategories).map((category, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveCategory(category)}
                                            style={{
                                                padding: '8px 12px', background: 'white',
                                                border: '1px solid #dae1e7', borderRadius: '20px',
                                                cursor: 'pointer', fontSize: '12px', color: '#1a237e',
                                                fontWeight: '500', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sub-Category Question List State */}
                        {chatHistory.length === 0 && activeCategory && (
                            <div style={{ marginTop: '5px' }}>
                                {/* GO BACK BUTTON */}
                                <button 
                                    onClick={() => setActiveCategory(null)}
                                    style={{
                                        background: 'none', border: 'none', color: '#0d47a1',
                                        fontSize: '14px', cursor: 'pointer', marginBottom: '15px',
                                        display: 'flex', alignItems: 'center', fontWeight: '500',
                                        padding: '5px 0'
                                    }}
                                >
                                    ← Back to Topics
                                </button>

                                <h4 style={{ margin: '0 0 15px 0', color: '#1a237e' }}>{activeCategory}</h4>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {questionCategories[activeCategory].map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => askAI(q)}
                                            style={{
                                                padding: '12px', background: 'white',
                                                border: '1px solid #dae1e7', borderRadius: '10px',
                                                cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                                                color: '#333', boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.borderColor = '#1a237e';
                                                e.currentTarget.style.color = '#1a237e';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.borderColor = '#dae1e7';
                                                e.currentTarget.style.color = '#333';
                                            }}
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message History */}
                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '12px 16px',
                                    borderRadius: msg.role === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
                                    background: msg.role === 'user' ? '#1a237e' : 'white',
                                    color: msg.role === 'user' ? 'white' : '#333',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    wordWrap: 'break-word'
                                }}>
                                    {msg.role === 'assistant' ? formatMessage(msg.text) : msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Loading State */}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                                <div style={{
                                    background: 'white', padding: '12px 16px', borderRadius: '15px 15px 15px 0',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#90a4ae', animation: 'bounce 0.6s infinite' }}></div>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#90a4ae', animation: 'bounce 0.6s infinite 0.2s' }}></div>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#90a4ae', animation: 'bounce 0.6s infinite 0.4s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div style={{
                        padding: '15px', borderTop: '1px solid #e0e0e0',
                        background: 'white', display: 'flex', gap: '10px'
                    }}>
                        <input
                            type="text"
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                            placeholder="Ask me anything..."
                            style={{
                                flex: 1, padding: '12px', border: '1px solid #e0e0e0',
                                borderRadius: '10px', fontSize: '14px', outline: 'none',
                                background: '#f8f9fa'
                            }}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !userQuestion.trim()}
                            style={{
                                padding: '12px 20px',
                                background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                                border: 'none', borderRadius: '10px', color: 'white',
                                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px',
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
                    50% { transform: translateY(-5px); }
                }
                div::-webkit-scrollbar { width: 6px; }
                div::-webkit-scrollbar-track { background: #f1f1f1; }
                div::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
                div::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
            `}</style>
        </div>
    );
};

export default AITaxAdvisor;