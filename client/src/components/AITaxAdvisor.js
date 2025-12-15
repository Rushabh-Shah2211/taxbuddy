import React, { useState, useRef, useEffect } from 'react';
import './TaxBotStyles.css'; // We'll create this in Step 5

const AITaxAdvisor = ({ userProfile, calculationData }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [userQuestion, setUserQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [currentAnswerId, setCurrentAnswerId] = useState(null);
    const [improvementSuggestion, setImprovementSuggestion] = useState('');
    const chatEndRef = useRef(null);

    // Initialize logger
    const [logger] = useState(() => new QuestionLogger());

    // Scroll to bottom on new message
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, showChat, activeCategory, showFeedback]);

    // ===================== ENHANCED QUESTION DATABASE =====================
    const questionDatabase = {
        "Basics & Login": [
            {
                question: "Which ITR form applies to me?",
                answer: "**ITR Form depends on your income sources:**\n\n• ITR-1 (Sahaj): Salaried income up to ₹50L + one house property\n• ITR-2: Multiple house properties + capital gains + foreign assets\n• ITR-3: Business/professional income\n• ITR-4 (Sugam): Presumptive income up to ₹50L\n\n*Tip: Use our 'ITR Selector Tool' for precise form.*",
                keywords: ["itr", "form", "which itr", "sahaj", "sugam"]
            },
            {
                question: "I forgot my password, how do I reset it?",
                answer: "**Password Reset Steps:**\n\n1. Click 'Forgot Password' on login page\n2. Enter your registered email/mobile\n3. Check OTP sent to your registered contact\n4. Set new password (min 8 chars with special character)\n5. Login with new credentials\n\n*Security Tip: Don't share OTP with anyone.*",
                keywords: ["password", "forgot", "reset", "login", "otp"]
            },
            {
                question: "How do I link PAN with Aadhaar?",
                answer: "**Link PAN-Aadhaar (Mandatory):**\n\n**Online:**\n1. Login to Income Tax e-filing portal\n2. Go to 'Profile Settings' → 'Link Aadhaar'\n3. Verify details match exactly\n4. Pay ₹1000 penalty if late (after 30-Jun)\n\n**Offline:** Submit form to PAN service center\n\n*Deadline: 31st March each year*",
                keywords: ["pan", "aadhaar", "link", "penalty", "mandatory"]
            },
            {
                question: "What is the difference between Old and New Regime?",
                answer: "**Key Differences:**\n\n**Old Regime:**\n• Allows deductions (80C, 80D, HRA, LTA)\n• Standard Deduction: ₹50,000\n• Better if total deductions > ₹3.75L\n\n**New Regime (Default):**\n• Lower tax rates but NO deductions\n• Standard Deduction: ₹50,000 (available)\n• Better for minimal investments\n\n*Use 'Regime Calculator' to compare.*",
                keywords: ["regime", "old vs new", "tax regime", "which regime"]
            },
            {
                question: "Can I file a return after the due date?",
                answer: "**Late Filing Rules:**\n\n• **31st July**: Original due date (FY 2023-24)\n• **31st Dec**: Belated return deadline\n• **After 31st Dec**: Cannot file unless notice received\n\n**Penalties:**\n• ₹5000 if filed by 31st Dec\n• ₹10000 if filed after (₹1000 if income < ₹5L)\n\n*Recommendation: File before 31st July to avoid penalty*",
                keywords: ["late", "due date", "penalty", "belated", "deadline"]
            }
        ],
        "Salary & HRA": [
            {
                question: "How is HRA calculated?",
                answer: "**HRA Calculation (Minimum of):**\n\n1. Actual HRA received\n2. 50% of Basic (Metro) or 40% (Non-metro)\n3. Rent paid minus 10% of Basic Salary\n\n**Example:** Basic: ₹50,000, Metro, Rent: ₹20,000\n• 50% of Basic: ₹25,000\n• Rent - 10% Basic: ₹20,000 - ₹5,000 = ₹15,000\n• HRA Exempt: Minimum of above = ₹15,000\n\n*Documents needed: Rent receipts, PAN of landlord if rent > ₹1L/year*",
                keywords: ["hra", "house rent", "calculation", "exemption"]
            },
            {
                question: "My employer hasn't given me Form 16 yet.",
                answer: "**If Form 16 is delayed:**\n\n1. **Check Timeline:** Employers must issue by 15th June\n2. **Remind HR/Accounts** department in writing\n3. **Alternative:** Use salary slips + Form 26AS to file\n4. **Escalate:** Complaint to Assessing Officer if beyond July\n\n**Can file without Form 16?** Yes, using Form 26AS data\n\n*Pro Tip: File with estimated figures, revise when Form 16 received*",
                keywords: ["form 16", "employer", "not received", "t16"]
            },
            // Add more questions here...
        ],
        // Add other categories similarly...
    };

    // ===================== QUICK ANSWER LOOKUP =====================
    const quickAnswers = {
        "Which ITR form applies to me?": "**ITR Form depends on your income sources:**\n\n• ITR-1 (Sahaj): Salaried income up to ₹50L + one house property\n• ITR-2: Multiple house properties + capital gains + foreign assets\n• ITR-3: Business/professional income\n• ITR-4 (Sugam): Presumptive income up to ₹50L\n\n*Tip: Use our 'ITR Selector Tool' for precise form.*",
        "What is the difference between Old and New Regime?": "**Key Differences:**\n\n**Old Regime:**\n• Allows deductions (80C, 80D, HRA, LTA)\n• Standard Deduction: ₹50,000\n• Better if total deductions > ₹3.75L\n\n**New Regime (Default):**\n• Lower tax rates but NO deductions\n• Standard Deduction: ₹50,000 (available)\n• Better for minimal investments\n\n*Use 'Regime Calculator' to compare.*",
        "How is HRA calculated?": "**HRA Calculation (Minimum of):**\n\n1. Actual HRA received\n2. 50% of Basic (Metro) or 40% (Non-metro)\n3. Rent paid minus 10% of Basic Salary\n\n*Documents: Rent receipts, PAN of landlord if rent > ₹1L/year*",
        "What is the limit for Section 80C?": "**Section 80C Limit: ₹1,50,000 per year**\n\n**Popular Investments:**\n• PPF, EPF, NPS\n• ELSS Mutual Funds\n• 5-year Tax Saver FDs\n• Life Insurance Premiums\n• Home Loan Principal\n• Sukanya Samriddhi\n\n*Note: Includes tuition fees for 2 children*",
        "Is Bitcoin legal in India?": "**Crypto Status in India:**\n\n• **Legal:** Yes, holding/trading is legal\n• **Regulated:** Under PMLA for money laundering\n• **Tax:** 30% + 4% cess on profits\n• **TDS:** 1% on all transactions (Section 194S)\n• **Reporting:** Must disclose in Schedule VDA\n\n*Not legal tender, but not illegal to invest*",
    };

    // ===================== LOGGER CLASS =====================
    class QuestionLogger {
        constructor() {
            this.unansweredQuestions = [];
            this.performanceMetrics = [];
            this.loadFromLocalStorage();
        }

        logUnanswered(question, userContext, suggestedAnswer = null) {
            const logEntry = {
                id: Date.now() + Math.random(),
                question,
                timestamp: new Date().toISOString(),
                userContext: {
                    incomeRange: userProfile?.incomeRange || 'unknown',
                    regime: userProfile?.selectedRegime || 'unknown',
                    category: this.detectCategory(question)
                },
                suggestedAnswer: suggestedAnswer || 'No answer generated',
                confidence: this.calculateConfidence(question),
                status: 'unanswered'
            };

            this.unansweredQuestions.push(logEntry);
            this.saveToLocalStorage();
            
            // Export to file if we have 5+ unanswered questions
            if (this.unansweredQuestions.length >= 5) {
                this.exportToCSV();
            }
            
            // Sync with backend
            this.syncWithBackend(logEntry);
            
            return logEntry.id;
        }

        logAnswered(question, answer, userFeedback) {
            const logEntry = {
                id: Date.now(),
                question,
                answer,
                timestamp: new Date().toISOString(),
                userFeedback: userFeedback || 'no feedback',
                wasHelpful: userFeedback === 'helpful',
                category: this.detectCategory(question)
            };
            
            this.performanceMetrics.push(logEntry);
            this.saveToLocalStorage();
            
            // Send to backend for ML training
            this.sendToTraining(logEntry);
        }

        detectCategory(question) {
            const qLower = question.toLowerCase();
            for (const [category, questions] of Object.entries(questionDatabase)) {
                for (const qa of questions) {
                    if (qa.keywords.some(keyword => qLower.includes(keyword))) {
                        return category;
                    }
                }
            }
            return 'General';
        }

        calculateConfidence(question) {
            // Simple confidence calculation
            const qLower = question.toLowerCase();
            let confidence = 0;
            
            // Check quick answers
            if (quickAnswers[question]) confidence += 0.8;
            
            // Check keywords
            Object.values(questionDatabase).forEach(category => {
                category.forEach(qa => {
                    qa.keywords.forEach(keyword => {
                        if (qLower.includes(keyword)) confidence += 0.1;
                    });
                });
            });
            
            return Math.min(confidence, 1).toFixed(2);
        }

        exportToCSV() {
            if (this.unansweredQuestions.length === 0) return;
            
            const headers = ['ID', 'Question', 'Timestamp', 'Category', 'Confidence', 'Status', 'User Income', 'Regime'];
            const csvContent = [
                headers.join(','),
                ...this.unansweredQuestions.map(q => [
                    q.id,
                    `"${q.question.replace(/"/g, '""')}"`,
                    q.timestamp,
                    q.userContext.category,
                    q.confidence,
                    q.status,
                    q.userContext.incomeRange,
                    q.userContext.regime
                ].join(','))
            ].join('\n');

            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `unanswered_questions_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`Exported ${this.unansweredQuestions.length} unanswered questions to CSV`);
            
            // Clear after export (optional)
            // this.unansweredQuestions = [];
            // this.saveToLocalStorage();
        }

        saveToLocalStorage() {
            try {
                localStorage.setItem('taxbot_logs', JSON.stringify({
                    unanswered: this.unansweredQuestions.slice(-50), // Keep last 50
                    metrics: this.performanceMetrics.slice(-100) // Keep last 100
                }));
            } catch (e) {
                console.warn('Local storage full, consider exporting data');
            }
        }

        loadFromLocalStorage() {
            try {
                const saved = localStorage.getItem('taxbot_logs');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.unansweredQuestions = data.unanswered || [];
                    this.performanceMetrics = data.metrics || [];
                }
            } catch (e) {
                console.warn('Failed to load logs from localStorage');
            }
        }

        syncWithBackend(logEntry) {
            // Send to your backend
            fetch('https://taxbuddy-o5wu.onrender.com/api/tax/log-unanswered', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            })
            .catch(error => {
                console.warn('Failed to sync log, will retry later');
                // Store for retry
                this.queueForRetry(logEntry);
            });
        }

        sendToTraining(logEntry) {
            // Send feedback for ML training
            fetch('https://taxbuddy-o5wu.onrender.com/api/tax/train-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logEntry)
            })
            .catch(error => console.warn('Training sync failed'));
        }

        queueForRetry(logEntry) {
            // Simple retry queue
            const retryQueue = JSON.parse(localStorage.getItem('taxbot_retry_queue') || '[]');
            retryQueue.push(logEntry);
            localStorage.setItem('taxbot_retry_queue', JSON.stringify(retryQueue.slice(-20)));
        }
    }

    // ===================== INTELLIGENT MATCHING =====================
    const findBestMatch = (question) => {
        const qLower = question.toLowerCase().trim();
        
        // 1. Check exact match in quick answers
        if (quickAnswers[question]) {
            return {
                type: 'quick',
                answer: quickAnswers[question],
                confidence: 1.0
            };
        }
        
        // 2. Check question database
        let bestMatch = { confidence: 0, answer: null, source: null };
        
        Object.values(questionDatabase).forEach(category => {
            category.forEach(qa => {
                // Check exact question match
                if (qa.question.toLowerCase() === qLower) {
                    bestMatch = { confidence: 1.0, answer: qa.answer, source: 'exact' };
                    return;
                }
                
                // Check keyword matching
                let keywordScore = 0;
                qa.keywords.forEach(keyword => {
                    if (qLower.includes(keyword.toLowerCase())) {
                        keywordScore += 0.3;
                    }
                });
                
                if (keywordScore > bestMatch.confidence) {
                    bestMatch = { 
                        confidence: Math.min(keywordScore, 1), 
                        answer: qa.answer, 
                        source: 'keyword' 
                    };
                }
            });
        });
        
        // Return if confidence is high enough
        if (bestMatch.confidence > 0.6) {
            return bestMatch;
        }
        
        return null;
    };

    // ===================== MAIN AI FUNCTION =====================
    const askAI = async (question) => {
        setLoading(true);
        setActiveCategory(null);
        const newChat = [...chatHistory, { role: 'user', text: question, id: Date.now() }];
        setChatHistory(newChat);
        setUserQuestion('');

        // Step 1: Check local database first
        const localMatch = findBestMatch(question);
        
        if (localMatch && localMatch.confidence > 0.7) {
            // Use local answer
            setTimeout(() => {
                setChatHistory([...newChat, { 
                    role: 'assistant', 
                    text: localMatch.answer,
                    source: localMatch.source,
                    id: Date.now() + 1
                }]);
                setLoading(false);
                
                // Show feedback buttons after 1 second
                setTimeout(() => {
                    setCurrentAnswerId(Date.now() + 1);
                    setShowFeedback(true);
                }, 1000);
            }, 500); // Small delay for natural feel
            return;
        }

        // Step 2: If no good local match, call API
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

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const answerId = Date.now() + 1;
            
            // Check if it's a fallback answer
            const fallbackPhrases = ["I'm not sure", "I cannot answer", "consult a professional", "I don't know"];
            const isFallback = fallbackPhrases.some(phrase => 
                data.response.toLowerCase().includes(phrase.toLowerCase())
            );

            if (isFallback) {
                // Log unanswered question
                const logId = logger.logUnanswered(question, userProfile, data.response);
                setCurrentAnswerId(logId);
            } else {
                setCurrentAnswerId(answerId);
            }

            setChatHistory([...newChat, { 
                role: 'assistant', 
                text: data.response,
                source: 'ai',
                id: answerId
            }]);
            
            // Show feedback
            setTimeout(() => setShowFeedback(true), 1000);
            
        } catch (error) {
            // Log network error
            logger.logUnanswered(question, userProfile, 'Network error');
            
            setChatHistory([...newChat, { 
                role: 'assistant', 
                text: '⚠️ Network Issue\n\nI\'m having trouble connecting right now. Here are some things you can try:\n\n1. Check our FAQ section\n2. Use the category buttons below\n3. Try again in a few minutes\n\nYour question has been logged for later answer.',
                source: 'error',
                id: Date.now() + 1
            }]);
        }
        
        setLoading(false);
    };

    // ===================== FEEDBACK HANDLER =====================
    const handleFeedback = (isHelpful) => {
        if (chatHistory.length < 2) return;
        
        const lastQuestion = chatHistory[chatHistory.length - 2]?.text;
        const lastAnswer = chatHistory[chatHistory.length - 1]?.text;
        
        logger.logAnswered(lastQuestion, lastAnswer, isHelpful ? 'helpful' : 'not helpful');
        
        // Send improvement suggestion if provided
        if (improvementSuggestion.trim() && !isHelpful) {
            fetch('https://taxbuddy-o5wu.onrender.com/api/tax/suggestion', {
                method: 'POST',
                body: JSON.stringify({
                    question: lastQuestion,
                    currentAnswer: lastAnswer,
                    suggestion: improvementSuggestion
                })
            });
        }
        
        setShowFeedback(false);
        setImprovementSuggestion('');
        
        // Show thank you message
        setTimeout(() => {
            setChatHistory(prev => [...prev, {
                role: 'system',
                text: isHelpful ? '✅ Thanks for your feedback!' : '📝 Thanks, we\'ll improve this answer.',
                id: Date.now()
            }]);
        }, 300);
    };

    // ===================== HELPER FUNCTIONS =====================
    const handleSubmit = (e) => {
        e.preventDefault();
        if (userQuestion.trim()) {
            askAI(userQuestion);
        }
    };

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

    // ===================== RENDER =====================
    return (
        <div className="taxbot-container">
            {/* Floating Trigger Button */}
            {!showChat && (
                <button
                    className="taxbot-trigger"
                    onClick={() => setShowChat(true)}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    🤖
                    <span className="notification-badge">
                        {logger.unansweredQuestions.length > 0 ? '!' : ''}
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {showChat && (
                <div className="taxbot-window">
                    {/* Header */}
                    <div className="taxbot-header">
                        <div>
                            <h3>Tax Assistant</h3>
                            <p>Experts powered by AI</p>
                        </div>
                        <div className="header-buttons">
                            <button 
                                className="export-btn"
                                onClick={() => logger.exportToCSV()}
                                title="Export unanswered questions"
                            >
                                📊
                            </button>
                            <button 
                                className="close-btn"
                                onClick={() => setShowChat(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="taxbot-body">
                        {/* Welcome / Main Menu */}
                        {chatHistory.length === 0 && !activeCategory && (
                            <div className="welcome-screen">
                                <div className="welcome-icon">👋</div>
                                <h4>How can I help you today?</h4>
                                <p>Select a topic below:</p>
                                
                                <div className="category-buttons">
                                    {Object.keys(questionDatabase).map((category, i) => (
                                        <button
                                            key={i}
                                            className="category-btn"
                                            onClick={() => setActiveCategory(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Quick Stats */}
                                <div className="quick-stats">
                                    <small>
                                        💡 {Object.values(questionDatabase).flat().length} pre-written answers available
                                    </small>
                                </div>
                            </div>
                        )}

                        {/* Sub-Category Questions */}
                        {chatHistory.length === 0 && activeCategory && (
                            <div className="category-screen">
                                <button 
                                    className="back-btn"
                                    onClick={() => setActiveCategory(null)}
                                >
                                    ← Back to Topics
                                </button>

                                <h4>{activeCategory}</h4>
                                <div className="question-list">
                                    {questionDatabase[activeCategory].map((qa, i) => (
                                        <button
                                            key={i}
                                            className="question-btn"
                                            onClick={() => askAI(qa.question)}
                                            title="Click to ask this question"
                                        >
                                            {qa.question}
                                            <span className="question-tag">Pre-written</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message History */}
                        {chatHistory.map((msg, i) => (
                            <div key={msg.id || i} className={`message-wrapper ${msg.role}`}>
                                <div className={`message-bubble ${msg.role}`}>
                                    {msg.role === 'assistant' ? formatMessage(msg.text) : msg.text}
                                    {msg.role === 'assistant' && msg.source && (
                                        <small className="answer-source">
                                            Source: {msg.source}
                                        </small>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Feedback Section */}
                        {showFeedback && (
                            <div className="feedback-section">
                                <p className="feedback-question">Was this answer helpful?</p>
                                <div className="feedback-buttons">
                                    <button 
                                        className="feedback-btn yes"
                                        onClick={() => handleFeedback(true)}
                                    >
                                        👍 Yes
                                    </button>
                                    <button 
                                        className="feedback-btn no"
                                        onClick={() => handleFeedback(false)}
                                    >
                                        👎 No
                                    </button>
                                </div>
                                <textarea
                                    className="suggestion-box"
                                    placeholder="How can we improve this answer? (Optional)"
                                    value={improvementSuggestion}
                                    onChange={(e) => setImprovementSuggestion(e.target.value)}
                                    rows="2"
                                />
                            </div>
                        )}

                        {/* Loading Indicator */}
                        {loading && (
                            <div className="message-wrapper assistant">
                                <div className="message-bubble assistant">
                                    <div className="loading-dots">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={chatEndRef} />
                    </div>

                    {/* Footer Input */}
                    <div className="taxbot-footer">
                        <input
                            type="text"
                            className="chat-input"
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                            placeholder="Ask me anything about taxes..."
                            disabled={loading}
                        />
                        <button
                            className="send-btn"
                            onClick={handleSubmit}
                            disabled={loading || !userQuestion.trim()}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AITaxAdvisor;