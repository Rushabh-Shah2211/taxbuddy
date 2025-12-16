import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; // Imported Axios as requested
import './TaxBotStyles.css'; // Ensure you have the CSS file from the previous step

const AITaxAdvisor = ({ userProfile, calculationData }) => {
    // State Management
    const [chatHistory, setChatHistory] = useState([]);
    const [userQuestion, setUserQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [viewState, setViewState] = useState('welcome'); // 'welcome', 'category', 'chat'
    const [activeCategory, setActiveCategory] = useState(null);
    const chatEndRef = useRef(null);

    // 1. PERSISTENCE: Load chat history from LocalStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('tax_chat_history');
        if (savedHistory) {
            setChatHistory(JSON.parse(savedHistory));
        }
    }, []);

    // 2. PERSISTENCE: Save chat history whenever it updates
    useEffect(() => {
        localStorage.setItem('tax_chat_history', JSON.stringify(chatHistory));
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, showChat, viewState]);

    // ===================== EXHAUSTIVE MASTER DATABASE =====================
    const questionDatabase = {
        "Basics & Login": [
            {
                question: "Which ITR form applies to me?",
                answer: "**Choosing the Right ITR Form (FY 2024-25):**\n\n\n\n• **ITR-1 (Sahaj):** For Residents with Salary, One House Property, and Interest income (Total Income < ₹50 Lakhs).\n• **ITR-2:** For Capital Gains (Stocks/Mutual Funds), >1 House Property, or Foreign Assets.\n• **ITR-3:** For Business or Professional income (including Intraday Trading).\n• **ITR-4 (Sugam):** For Presumptive Business Income (Section 44AD/ADA) up to ₹50 Lakhs.",
                keywords: ["itr", "form", "sahaj", "sugam", "filing"]
            },
            {
                question: "Link PAN with Aadhaar",
                answer: "**Mandatory PAN-Aadhaar Linking:**\n\nSince the deadline has passed, your PAN may be **inoperative**.\n\n**Steps to Link Now:**\n1. Login to the e-Filing Portal.\n2. Click 'Link Aadhaar' in the profile section.\n3. You must pay a **penalty of ₹1,000** via Challan No. ITNS 280 (Minor Head 500).\n4. Submit the linking request 4-5 days after payment.",
                keywords: ["pan", "aadhaar", "link", "penalty"]
            },
            {
                question: "Old vs New Regime differences?",
                answer: "**Old vs New Tax Regime (FY 2025-26):**\n\n\n\n**New Regime (Default):**\n• **Pros:** Lower tax rates, Standard Deduction (₹75,000).\n• **Cons:** NO deductions allowed (No 80C, HRA, LTA, or Home Loan Interest).\n\n**Old Regime:**\n• **Pros:** Allows all deductions (Section 80C, 80D, HRA).\n• **Cons:** Higher tax slab rates.\n\n*Rule of Thumb: If your total deductions exceed ₹3.75 Lakhs, stick to the Old Regime.*",
                keywords: ["regime", "old", "new", "difference", "better"]
            }
        ],
        "Salary & HRA": [
            {
                question: "How is HRA calculated?",
                answer: "**HRA Exemption Calculation:**\n\n\n\nThe exemption is the **lowest** of these three:\n1. Actual HRA received from employer.\n2. 50% of Basic Salary (for Metro cities) OR 40% (Non-Metro).\n3. Actual Rent Paid minus 10% of Basic Salary.\n\n*Note: You cannot claim HRA if you live in your own house or with a spouse.*",
                keywords: ["hra", "rent", "allowance", "calculation"]
            },
            {
                question: "I didn't receive Form 16 yet",
                answer: "**Filing Without Form 16:**\n\nIt is possible but requires care. You can reconstruct your Form 16 using:\n1. **Payslips:** Sum up your Basic, HRA, and allowances.\n2. **Form 26AS:** Check the exact TDS deducted by your employer.\n3. **AIS (Annual Information Statement):** Verify the gross salary reported to the govt.",
                keywords: ["form 16", "employer", "payslip", "missing"]
            }
        ],
        "Deductions (80C/80D)": [
            {
                question: "Section 80C Limit & Options",
                answer: "**Section 80C Explained:**\n\n**Maximum Deduction:** ₹1.5 Lakhs (Old Regime Only).\n\n**Best Investment Options:**\n• **ELSS Mutual Funds:** Shortest lock-in (3 years), high returns potential.\n• **PPF (Public Provident Fund):** Safe, 15-year lock-in, tax-free interest.\n• **LIC/Life Insurance:** Premium paid for self, spouse, or kids.\n• **Home Loan Principal:** The principal component of your EMI.",
                keywords: ["80c", "limit", "invest", "elss", "ppf"]
            },
            {
                question: "Medical Insurance (80D)",
                answer: "**Section 80D (Health Insurance):**\n\nYou can claim this **over and above** the 1.5 Lakh limit of 80C.\n\n• **For Self & Family:** Up to ₹25,000.\n• **For Parents (Senior Citizens):** Additional ₹50,000.\n• **Preventive Health Checkup:** Up to ₹5,000.",
                keywords: ["80d", "medical", "insurance", "health"]
            }
        ],
        "Capital Gains": [
            {
                question: "Tax on Stock Market Gains",
                answer: "**Capital Gains Tax Rates (Updated 2024):**\n\n\n\n• **Short Term (STCG):** Stocks sold before 12 months. Taxed at **20%**.\n• **Long Term (LTCG):** Stocks sold after 12 months. Taxed at **12.5%**.\n\n**Exemption:** LTCG profit up to **₹1.25 Lakhs** in a financial year is tax-free.",
                keywords: ["stock", "market", "capital", "gain", "ltcg", "stcg"]
            }
        ],
        "Refunds & Status": [
            {
                question: "Check Refund Status",
                answer: "**Where is my Refund?**\n\n Refunds typically take **20-45 days** after you e-Verify your return.\n\n**Steps to Check:**\n1. Login to Income Tax Portal.\n2. Go to 'e-File' > 'Income Tax Returns' > 'View Filed Returns'.\n\n**Common Reasons for Delay:**\n• Bank Account not 'Pre-validated'.\n• Name mismatch between PAN and Bank.",
                keywords: ["refund", "status", "money", "delay"]
            }
        ]
    };

    // ===================== LOGIC HANDLERS =====================

    // Helper: Find best matching answer from local DB
    const findBestAnswer = (query) => {
        const qLower = query.toLowerCase();
        let bestMatch = null;
        
        Object.keys(questionDatabase).forEach(category => {
            questionDatabase[category].forEach(qa => {
                const matchCount = qa.keywords.filter(k => qLower.includes(k)).length;
                if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.score)) {
                    bestMatch = { ...qa, score: matchCount, category };
                }
            });
        });

        return bestMatch ? bestMatch.answer : null;
    };

    // Helper: Save chat to backend (Axios integration)
    const saveChatToBackend = async (question, answer) => {
        if (userProfile && userProfile._id) {
            try {
                await axios.post('https://taxbuddy-o5wu.onrender.com/api/admin/save-chat', {
                    userId: userProfile._id,
                    question: question,
                    answer: answer
                });
                console.log("Chat saved to backend");
            } catch (err) {
                console.error("Failed to save chat history:", err);
            }
        }
    };

    const handleAskQuestion = async (text, isPredefined = false) => {
        setUserQuestion('');
        setLoading(true);
        setViewState('chat'); 

        // Add User Message
        const newHistory = [...chatHistory, { role: 'user', text }];
        setChatHistory(newHistory);

        setTimeout(async () => {
            let answer = '';
            
            // 1. Check Local Database first
            const localAnswer = findBestAnswer(text);

            if (localAnswer) {
                answer = localAnswer;
            } else {
                // 2. Fallback to API if no local match
                try {
                    // Note: Ensure this endpoint matches your specific AI backend if distinct from the logging endpoint
                    const response = await fetch('https://taxbuddy-o5wu.onrender.com/api/tax/ai-advisor', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question: text, userProfile, chatHistory: newHistory })
                    });
                    const data = await response.json();
                    answer = data.response;
                } catch (error) {
                    answer = "**Network Error:** I'm having trouble connecting to the server. Please check your connection.";
                }
            }

            // 3. Update Chat State
            setChatHistory(prev => [...prev, { role: 'assistant', text: answer }]);
            setLoading(false);

            // 4. Save to Backend (Merged Feature)
            await saveChatToBackend(text, answer);

        }, 500);
    };

    const clearHistory = () => {
        if (window.confirm("Are you sure you want to clear your chat history?")) {
            setChatHistory([]);
            localStorage.removeItem('tax_chat_history');
            setViewState('welcome');
        }
    };

    // Helper to render formatting
    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => {
            if (line.includes('[Image of')) {
                const imgQuery = line.match(/\/)[1];
                return (
                    <div key={i} className="bot-diagram-placeholder">
                        📊 Diagram: {imgQuery}
                    </div>
                );
            }
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={i} style={{ minHeight: line.trim() === '' ? '8px' : 'auto' }}>
                    {parts.map((part, j) => 
                        part.startsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
                    )}
                </div>
            );
        });
    };

    // ===================== UI RENDER =====================
    return (
        <div className="tax-bot-container">
            {/* 1. Floating Trigger Button */}
            {!showChat && (
                <button className="tax-bot-trigger" onClick={() => setShowChat(true)}>
                    💬
                </button>
            )}

            {/* 2. Chat Window */}
            {showChat && (
                <div className="tax-bot-window">
                    
                    {/* Header */}
                    <div className="tax-bot-header">
                        <div className="header-title">
                            <h3>Tax Assistant</h3>
                            <span className="online-status">● Online</span>
                        </div>
                        <div className="header-actions">
                            <button onClick={() => setViewState(viewState === 'chat' ? 'welcome' : 'chat')} title="Main Menu" className="icon-btn">🏠</button>
                            <button onClick={clearHistory} title="Clear Chat" className="icon-btn">🗑️</button>
                            <button onClick={() => setShowChat(false)} className="icon-btn close-btn">✕</button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="tax-bot-body">
                        
                        {/* VIEW 1: WELCOME / MAIN MENU */}
                        {viewState === 'welcome' && (
                            <div className="welcome-view">
                                <div className="welcome-hero">
                                    <div className="bot-avatar-lg">🤖</div>
                                    <h4>Hello! How can I help you?</h4>
                                    <p>Select a topic or type your question below.</p>
                                </div>
                                <div className="category-grid">
                                    {Object.keys(questionDatabase).map((cat, i) => (
                                        <button 
                                            key={i} 
                                            className="category-card"
                                            onClick={() => {
                                                setActiveCategory(cat);
                                                setViewState('category');
                                            }}
                                        >
                                            {cat} <span className="arrow">→</span>
                                        </button>
                                    ))}
                                </div>
                                {chatHistory.length > 0 && (
                                    <button className="resume-chat-btn" onClick={() => setViewState('chat')}>
                                        Resume active chat ({chatHistory.length} messages)
                                    </button>
                                )}
                            </div>
                        )}

                        {/* VIEW 2: SUB-CATEGORY QUESTIONS */}
                        {viewState === 'category' && activeCategory && (
                            <div className="category-view">
                                <button className="back-link" onClick={() => setViewState('welcome')}>← Back to Menu</button>
                                <h4>{activeCategory}</h4>
                                <div className="question-list">
                                    {questionDatabase[activeCategory].map((q, i) => (
                                        <button 
                                            key={i} 
                                            className="predefined-question-btn"
                                            onClick={() => handleAskQuestion(q.question, true)}
                                        >
                                            {q.question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* VIEW 3: ACTIVE CHAT HISTORY */}
                        {viewState === 'chat' && (
                            <div className="chat-history-view">
                                {chatHistory.length === 0 ? (
                                    <div className="empty-chat-state">
                                        <p>No messages yet. Ask a question!</p>
                                        <button onClick={() => setViewState('welcome')}>Go to Menu</button>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, i) => (
                                        <div key={i} className={`message-row ${msg.role}`}>
                                            {msg.role === 'assistant' && <div className="bot-avatar">🤖</div>}
                                            <div className={`message-bubble ${msg.role}`}>
                                                {msg.role === 'assistant' ? formatMessage(msg.text) : msg.text}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {loading && (
                                    <div className="message-row assistant">
                                        <div className="bot-avatar">🤖</div>
                                        <div className="typing-indicator"><span>•</span><span>•</span><span>•</span></div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer Input Area */}
                    <div className="tax-bot-footer">
                        <input
                            type="text"
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion(userQuestion)}
                            placeholder={viewState === 'chat' ? "Type your question..." : "Select a topic..."}
                            disabled={loading}
                        />
                        <button onClick={() => handleAskQuestion(userQuestion)} disabled={loading || !userQuestion.trim()}>➤</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AITaxAdvisor;