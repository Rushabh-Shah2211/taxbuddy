import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; 
import './TaxBotStyles.css'; 

const AITaxAdvisor = ({ userProfile, calculationData }) => {
    // State Management
    const [chatHistory, setChatHistory] = useState([]);
    const [userQuestion, setUserQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [viewState, setViewState] = useState('welcome'); // 'welcome', 'category', 'chat'
    const [activeCategory, setActiveCategory] = useState(null);
    const chatEndRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');

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
                keywords: ["itr", "form", "sahaj", "sugam", "filing", "which", "apply"]
            },
            {
                question: "Link PAN with Aadhaar",
                answer: "**Mandatory PAN-Aadhaar Linking:**\n\nSince the deadline has passed, your PAN may be **inoperative**.\n\n**Steps to Link Now:**\n1. Login to the e-Filing Portal.\n2. Click 'Link Aadhaar' in the profile section.\n3. You must pay a **penalty of ₹1,000** via Challan No. ITNS 280 (Minor Head 500).\n4. Submit the linking request 4-5 days after payment.",
                keywords: ["pan", "aadhaar", "link", "penalty", "inoperative"]
            },
            {
                question: "Old vs New Regime differences?",
                answer: "**Old vs New Tax Regime (FY 2025-26):**\n\n\n\n**New Regime (Default):**\n• **Pros:** Lower tax rates, Standard Deduction (₹75,000).\n• **Cons:** NO deductions allowed (No 80C, HRA, LTA, or Home Loan Interest).\n\n**Old Regime:**\n• **Pros:** Allows all deductions (Section 80C, 80D, HRA).\n• **Cons:** Higher tax slab rates.\n\n*Rule of Thumb: If your total deductions exceed ₹3.75 Lakhs, stick to the Old Regime.*",
                keywords: ["regime", "old", "new", "difference", "better", "which", "choose"]
            },
            {
                question: "What is Form 26AS?",
                answer: "**Form 26AS - Your Tax Credit Statement:**\n\nThis is a consolidated tax statement showing:\n1. TDS deducted by employers/banks\n2. Tax payments made by you\n3. Advance tax/self-assessment tax\n4. High-value transactions reported\n\n**How to Access:** Login to Income Tax Portal → e-File → Income Tax Returns → View Form 26AS",
                keywords: ["form 26as", "tds", "tax credit", "statement"]
            },
            {
                question: "What is AIS?",
                answer: "**Annual Information Statement (AIS):**\n\nA comprehensive view of your financial transactions reported by banks, mutual funds, employers etc. Includes:\n• Salary\n• Interest income\n• Dividend income\n• Stock transactions\n• Foreign remittances\n\n**Difference from 26AS:** AIS shows all reported transactions, 26AS only shows TDS.",
                keywords: ["ais", "annual information statement", "transaction", "report"]
            }
        ],
        "Salary & HRA": [
            {
                question: "How is HRA calculated?",
                answer: "**HRA Exemption Calculation:**\n\n\n\nThe exemption is the **lowest** of these three:\n1. Actual HRA received from employer.\n2. 50% of Basic Salary (for Metro cities) OR 40% (Non-Metro).\n3. Actual Rent Paid minus 10% of Basic Salary.\n\n*Note: You cannot claim HRA if you live in your own house or with a spouse.*",
                keywords: ["hra", "rent", "allowance", "calculation", "house rent"]
            },
            {
                question: "I didn't receive Form 16 yet",
                answer: "**Filing Without Form 16:**\n\nIt is possible but requires care. You can reconstruct your Form 16 using:\n1. **Payslips:** Sum up your Basic, HRA, and allowances.\n2. **Form 26AS:** Check the exact TDS deducted by your employer.\n3. **AIS (Annual Information Statement):** Verify the gross salary reported to the govt.",
                keywords: ["form 16", "employer", "payslip", "missing", "not received"]
            },
            {
                question: "Standard Deduction for Salaried",
                answer: "**Standard Deduction (FY 2025-26):**\n\n• **New Regime:** ₹75,000 (or 50% of salary, whichever is lower)\n• **Old Regime:** ₹50,000\n\nThis deduction is **automatic** - you don't need to submit any proofs. It's available to all salaried individuals.",
                keywords: ["standard deduction", "salaried", "employee", "deduction"]
            },
            {
                question: "LTA (Leave Travel Allowance)",
                answer: "**LTA Claim Rules:**\n\n• Can claim for **two journeys** in a block of four years\n• Current block: 2022-2025\n• Covers travel expenses (air/train/bus) for self and family\n• Must submit actual tickets as proof\n• Only for **shortest route** economy class\n• Cannot claim if you don't travel",
                keywords: ["lta", "leave travel allowance", "travel", "vacation"]
            }
        ],
        "Deductions (80C/80D)": [
            {
                question: "Section 80C Limit & Options",
                answer: "**Section 80C Explained:**\n\n**Maximum Deduction:** ₹1.5 Lakhs (Old Regime Only).\n\n**Best Investment Options:**\n• **ELSS Mutual Funds:** Shortest lock-in (3 years), high returns potential.\n• **PPF (Public Provident Fund):** Safe, 15-year lock-in, tax-free interest.\n• **LIC/Life Insurance:** Premium paid for self, spouse, or kids.\n• **Home Loan Principal:** The principal component of your EMI.\n• **NPS Tier-1 Account:** Additional ₹50,000 under 80CCD(1B)",
                keywords: ["80c", "limit", "invest", "elss", "ppf", "insurance"]
            },
            {
                question: "Medical Insurance (80D)",
                answer: "**Section 80D (Health Insurance):**\n\nYou can claim this **over and above** the 1.5 Lakh limit of 80C.\n\n• **For Self & Family:** Up to ₹25,000.\n• **For Parents (Senior Citizens):** Additional ₹50,000.\n• **Preventive Health Checkup:** Up to ₹5,000 (within overall limit).\n• **Maximum possible:** ₹1,00,000 if you, spouse, and both parents are senior citizens.",
                keywords: ["80d", "medical", "insurance", "health", "parents"]
            },
            {
                question: "Home Loan Interest (24b)",
                answer: "**Home Loan Interest Deduction:**\n\n• **Section 24(b):** Up to ₹2 Lakhs interest deduction on self-occupied property\n• **Section 80EEA:** Additional ₹1.5 Lakhs for first-time home buyers (loan sanctioned 2019-2022)\n• **Section 80C:** Principal repayment up to ₹1.5 Lakhs\n• Let-out property: No limit on interest deduction",
                keywords: ["home loan", "interest", "24b", "80eea", "housing"]
            },
            {
                question: "NPS Tax Benefits",
                answer: "**NPS Tax Benefits (Old Regime):**\n\n1. **Section 80CCD(1):** Up to ₹1.5 Lakhs (part of 80C limit)\n2. **Section 80CCD(1B):** Additional ₹50,000 (exclusive)\n3. **Section 80CCD(2):** Employer contribution up to 10% of salary (no limit)\n\n**Total possible deduction:** ₹2 Lakhs + employer contribution",
                keywords: ["nps", "pension", "80ccd", "retirement"]
            },
            {
                question: "Education Loan (80E)",
                answer: "**Section 80E - Education Loan Interest:**\n\n• Deduction for interest paid on education loan\n• **No upper limit** - full interest is deductible\n• Available for 8 years from repayment start\n• For higher education (self, spouse, children)\n• Covers studies in India or abroad",
                keywords: ["education loan", "80e", "student", "study"]
            }
        ],
        "Capital Gains": [
            {
                question: "Tax on Stock Market Gains",
                answer: "**Capital Gains Tax Rates (Updated 2024):**\n\n\n\n• **Short Term (STCG):** Stocks sold before 12 months. Taxed at **20%**.\n• **Long Term (LTCG):** Stocks sold after 12 months. Taxed at **12.5%**.\n\n**Exemption:** LTCG profit up to **₹1.25 Lakhs** in a financial year is tax-free.",
                keywords: ["stock", "market", "capital", "gain", "ltcg", "stcg", "shares"]
            },
            {
                question: "Mutual Funds Taxation",
                answer: "**Mutual Fund Taxation:**\n\n• **Equity Funds:** Same as stocks (STCG: 20%, LTCG: 12.5% with ₹1.25L exemption)\n• **Debt Funds:** LTCG after 3 years, taxed at 20% with indexation\n• **Hybrid Funds:** Depends on equity exposure (>65% equity = equity taxation)\n• **SIP:** Each installment has separate holding period",
                keywords: ["mutual fund", "mf", "sip", "equity", "debt"]
            },
            {
                question: "Indexation Benefit",
                answer: "**Indexation for Capital Gains:**\n\n• Adjusts purchase price for inflation using CII (Cost Inflation Index)\n• Available for LTCG on debt funds, real estate, gold (holding >3 years)\n• Reduces taxable gain significantly\n• **Not available** for equity investments",
                keywords: ["indexation", "inflation", "ci", "long term", "real estate"]
            },
            {
                question: "Crypto Currency Tax",
                answer: "**Cryptocurrency Taxation (India):**\n\n1. **30% Tax** on all crypto profits (no deduction except cost)\n2. **1% TDS** on every transaction above ₹10,000\n3. **No loss set-off** against other income\n4. **No indexation** benefit\n5. **Gifts** in crypto also taxable for receiver",
                keywords: ["crypto", "bitcoin", "virtual", "digital", "currency"]
            }
        ],
        "Refunds & Status": [
            {
                question: "Check Refund Status",
                answer: "**Where is my Refund?**\n\n Refunds typically take **20-45 days** after you e-Verify your return.\n\n**Steps to Check:**\n1. Login to Income Tax Portal.\n2. Go to 'e-File' > 'Income Tax Returns' > 'View Filed Returns'.\n\n**Common Reasons for Delay:**\n• Bank Account not 'Pre-validated'.\n• Name mismatch between PAN and Bank.\n• Return selected for scrutiny",
                keywords: ["refund", "status", "money", "delay", "pending"]
            },
            {
                question: "E-Verify Return",
                answer: "**How to E-Verify Your Return:**\n\n**Methods:**\n1. **Aadhaar OTP** (easiest and instant)\n2. **Net Banking**\n3. **Bank Account Number**\n4. **Demographic verification**\n\n**Deadline:** 30 days from filing date\n\n**Without e-Verification:** Return considered invalid, no refund processed",
                keywords: ["e-verify", "verify", "aadhaar", "otp", "return"]
            },
            {
                question: "Refund Delay Reasons",
                answer: "**Why Refund is Delayed?**\n\n1. **Bank Account Issues:** Not pre-validated, name mismatch\n2. **Processing Delay:** High volume during peak season\n3. **Scrutiny:** Return selected for review\n4. **Defective Return:** Errors in filing\n5. **Outstanding Demand:** Previous tax dues\n\n**Solution:** Check CPC portal for specific status",
                keywords: ["refund delay", "why", "reason", "not received"]
            }
        ],
        "NRI Taxation": [
            {
                question: "NRI Tax Slabs",
                answer: "**NRI Taxation Basics:**\n\n• NRIs taxed only on **India-sourced income**\n• Same tax slabs as residents\n• Must file ITR if India income exceeds ₹2.5 Lakhs\n• **Special Rates:**\n  - Interest: 30% + cess (no slab benefit)\n  - Capital Gains: Same as residents\n• DTAA benefits may apply",
                keywords: ["nri", "non resident", "foreign", "expat"]
            },
            {
                question: "NRI Double Taxation",
                answer: "**Avoiding Double Taxation:**\n\n1. **DTAA:** India has treaties with 90+ countries\n2. **Tax Credit:** Pay tax in one country, claim credit in another\n3. **Form 67:** For claiming foreign tax credit in India\n4. **TRC:** Tax Residency Certificate from foreign country\n\n**Note:** NRIs can choose to be taxed under DTAA or domestic law (whichever beneficial)",
                keywords: ["double taxation", "dtaa", "foreign tax", "credit"]
            }
        ],
        "Advanced Topics": [
            {
                question: "Tax Saving for Freelancers",
                answer: "**Freelancer Tax Planning:**\n\n1. **Presumptive Taxation (44ADA):**\n   - 50% deemed as profit (for professionals)\n   - No need to maintain books\n   - Turnover limit: ₹50 Lakhs\n\n2. **Deductions Available:**\n   - Home office expenses\n   - Professional equipment\n   - Internet/phone bills\n   - Business travel\n\n3. **GST Registration:** Required if turnover > ₹20 Lakhs",
                keywords: ["freelancer", "consultant", "self employed", "44ada"]
            },
            {
                question: "Tax on Rental Income",
                answer: "**Rental Income Taxation:**\n\n**For Let-Out Property:**\n• Gross Rent minus Municipal Taxes = Net Annual Value\n• Minus 30% Standard Deduction\n• Minus Home Loan Interest (no limit)\n• Minus Principal (under 80C)\n\n**For Self-Occupied:**\n• Deemed rental income: NIL\n• Can claim interest deduction up to ₹2 Lakhs",
                keywords: ["rental", "house property", "let out", "tenant"]
            },
            {
                question: "Clubbing of Income",
                answer: "**Income Clubbing Rules:**\n\nIncome transferred to certain relatives may be clubbed with yours:\n• **Spouse:** If assets transferred without adequate consideration\n• **Minor Child:** All income clubbed with parent having higher income\n• **Exceptions:** Income from skill/effort of spouse\n• **Age:** Clubbing stops when child becomes major (18 years)",
                keywords: ["clubbing", "minor", "spouse", "income transfer"]
            }
        ]
    };

    // ===================== CONVERSATIONAL RESPONSES =====================
    const conversationalResponses = {
        greetings: [
            {
                pattern: /^(hi|hello|hey|greetings)$/i,
                response: `Hi${userProfile?.name ? ` ${userProfile.name}` : ''}! 👋 I'm your Tax Assistant. How can I help you with taxes today?`
            },
            {
                pattern: /^how are you$/i,
                response: `I'm doing great${userProfile?.name ? ` ${userProfile.name}` : ''}! Ready to help you with all your tax questions. What would you like to know?`
            },
            {
                pattern: /^(what can you do|your capabilities|help)$/i,
                response: `I can help you with:\n• **Tax Filing:** ITR forms, deadlines, procedures\n• **Deductions:** 80C, 80D, HRA, Home Loan\n• **Investments:** Tax-saving options\n• **Capital Gains:** Stocks, mutual funds, property\n• **Refunds & Status:** Check refund, e-verification\n• **NRI Taxation:** Special rules for NRIs\n\nJust ask me anything!`
            },
            {
                pattern: /^thank you|thanks$/i,
                response: `You're welcome${userProfile?.name ? ` ${userProfile.name}` : ''}! 😊 Let me know if you have any other tax questions.`
            },
            {
                pattern: /^bye|goodbye$/i,
                response: `Goodbye${userProfile?.name ? ` ${userProfile.name}` : ''}! 👋 Remember to file your taxes on time. Feel free to come back anytime!`
            },
            {
                pattern: /^your name$/i,
                response: `I'm Tax Buddy, your AI Tax Assistant! 🤖 I'm here to make taxes simple for you.`
            }
        ]
    };

    // ===================== HELPER FUNCTIONS =====================
    const findBestAnswer = (query) => {
        const qLower = query.toLowerCase().trim();
        
        // First check conversational responses
        for (const greet of conversationalResponses.greetings) {
            if (greet.pattern.test(qLower)) {
                return greet.response;
            }
        }

        // Then check database
        let bestMatch = null;
        let highestScore = 0;
        
        Object.keys(questionDatabase).forEach(category => {
            questionDatabase[category].forEach(qa => {
                let score = 0;
                qa.keywords.forEach(keyword => {
                    if (qLower.includes(keyword)) {
                        score += 2; // Base score for keyword match
                    }
                });
                
                // Bonus for exact question match
                if (qa.question.toLowerCase().includes(qLower) || qLower.includes(qa.question.toLowerCase())) {
                    score += 10;
                }
                
                // Bonus for question starting with query
                if (qa.question.toLowerCase().startsWith(qLower)) {
                    score += 5;
                }
                
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = { ...qa, score, category };
                }
            });
        });

        return bestMatch && highestScore > 1 ? bestMatch.answer : null;
    };

    // Search functionality for questions
    const searchQuestions = () => {
        if (!searchQuery.trim()) return [];
        
        const results = [];
        const query = searchQuery.toLowerCase();
        
        Object.keys(questionDatabase).forEach(category => {
            questionDatabase[category].forEach(qa => {
                if (qa.question.toLowerCase().includes(query) || 
                    qa.keywords.some(kw => kw.includes(query))) {
                    results.push({ ...qa, category });
                }
            });
        });
        
        return results.slice(0, 10); // Limit to 10 results
    };

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
        if (!text.trim()) return;
        
        setUserQuestion('');
        setLoading(true);
        setViewState('chat'); 
        setSearchQuery('');

        const newHistory = [...chatHistory, { role: 'user', text }];
        setChatHistory(newHistory);

        setTimeout(async () => {
            let answer = '';
            
            const localAnswer = findBestAnswer(text);

            if (localAnswer) {
                answer = localAnswer;
            } else {
                try {
                    const response = await fetch('https://taxbuddy-o5wu.onrender.com/api/tax/ai-advisor', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question: text, userProfile, chatHistory: newHistory })
                    });
                    const data = await response.json();
                    answer = data.response || "I'm sorry, I couldn't find a specific answer for that. Could you rephrase your question or try asking about a specific tax topic?";
                } catch (error) {
                    answer = "**Network Error:** I'm having trouble connecting to the server. Please check your connection. Meanwhile, you can try asking about common tax topics like ITR forms, deductions, or capital gains.";
                }
            }

            setChatHistory(prev => [...prev, { role: 'assistant', text: answer }]);
            setLoading(false);

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

    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => {
            // FIXED REGEX HERE
            if (line.includes('[Image of')) {
                const match = line.match(/\[Image of (.*)\]/);
                const imgQuery = match ? match[1] : 'Diagram';
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

    // Get filtered questions for current category
    const getFilteredQuestions = () => {
        if (!activeCategory) return [];
        if (!searchQuery.trim()) return questionDatabase[activeCategory];
        
        return questionDatabase[activeCategory].filter(qa =>
            qa.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            qa.keywords.some(kw => kw.includes(searchQuery.toLowerCase()))
        );
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
                                    <h4>Hello{userProfile?.name ? ` ${userProfile.name}` : ''}! How can I help you?</h4>
                                    <p>Select a topic or type your question below.</p>
                                    
                                    {/* Search Bar in Welcome View */}
                                    <div className="search-container">
                                        <input
                                            type="text"
                                            placeholder="Search all tax questions..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="search-input"
                                        />
                                        {searchQuery && (
                                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Search Results */}
                                    {searchQuery && (
                                        <div className="search-results">
                                            <h5>Search Results:</h5>
                                            {searchQuestions().length > 0 ? (
                                                searchQuestions().map((result, i) => (
                                                    <button
                                                        key={i}
                                                        className="search-result-item"
                                                        onClick={() => handleAskQuestion(result.question, true)}
                                                    >
                                                        <span className="result-question">{result.question}</span>
                                                        <span className="result-category">{result.category}</span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="no-results">No questions found. Try different keywords.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Categories Grid */}
                                {!searchQuery && (
                                    <>
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
                                                    <div className="category-icon">
                                                        {cat.includes('Basics') ? '📋' :
                                                         cat.includes('Salary') ? '💰' :
                                                         cat.includes('Deductions') ? '📊' :
                                                         cat.includes('Capital') ? '📈' :
                                                         cat.includes('Refund') ? '🔄' :
                                                         cat.includes('NRI') ? '🌍' : '⚙️'}
                                                    </div>
                                                    <span className="category-name">{cat}</span>
                                                    <span className="question-count">
                                                        {questionDatabase[cat].length} Qs
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {chatHistory.length > 0 && (
                                            <button className="resume-chat-btn" onClick={() => setViewState('chat')}>
                                                ↺ Resume active chat ({chatHistory.length} messages)
                                            </button>
                                        )}
                                        
                                        {/* Quick Action Buttons */}
                                        <div className="quick-actions">
                                            <button className="quick-btn" onClick={() => handleAskQuestion("Hi")}>
                                                👋 Say Hi
                                            </button>
                                            <button className="quick-btn" onClick={() => handleAskQuestion("What can you do?")}>
                                                ❓ Capabilities
                                            </button>
                                            <button className="quick-btn" onClick={() => handleAskQuestion("Old vs New Regime?")}>
                                                ⚖️ Tax Regime
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* VIEW 2: SUB-CATEGORY QUESTIONS */}
                        {viewState === 'category' && activeCategory && (
                            <div className="category-view">
                                <button className="back-link" onClick={() => {
                                    setViewState('welcome');
                                    setSearchQuery('');
                                }}>
                                    ← Back to Menu
                                </button>
                                <div className="category-header">
                                    <h4>
                                        <span className="category-icon">
                                            {activeCategory.includes('Basics') ? '📋' :
                                             activeCategory.includes('Salary') ? '💰' :
                                             activeCategory.includes('Deductions') ? '📊' :
                                             activeCategory.includes('Capital') ? '📈' :
                                             activeCategory.includes('Refund') ? '🔄' :
                                             activeCategory.includes('NRI') ? '🌍' : '⚙️'}
                                        </span>
                                        {activeCategory}
                                        <span className="category-count">
                                            ({questionDatabase[activeCategory].length} questions)
                                        </span>
                                    </h4>
                                    
                                    {/* Search within category */}
                                    <div className="search-container">
                                        <input
                                            type="text"
                                            placeholder={`Search in ${activeCategory}...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="search-input"
                                        />
                                        {searchQuery && (
                                            <button className="clear-search" onClick={() => setSearchQuery('')}>
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="question-list">
                                    {getFilteredQuestions().length > 0 ? (
                                        getFilteredQuestions().map((q, i) => (
                                            <button 
                                                key={i} 
                                                className="predefined-question-btn"
                                                onClick={() => handleAskQuestion(q.question, true)}
                                            >
                                                <span className="question-text">{q.question}</span>
                                                <span className="question-hint">Tap to ask →</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="no-questions">
                                            <p>No questions found for "{searchQuery}"</p>
                                            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                                                Clear Search
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* VIEW 3: ACTIVE CHAT HISTORY */}
                        {viewState === 'chat' && (
                            <div className="chat-history-view">
                                {chatHistory.length === 0 ? (
                                    <div className="empty-chat-state">
                                        <div className="bot-avatar-lg">🤖</div>
                                        <h4>No messages yet</h4>
                                        <p>Start by asking a tax question or selecting from the menu.</p>
                                        <button className="menu-btn" onClick={() => setViewState('welcome')}>
                                            Browse Questions
                                        </button>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, i) => (
                                        <div key={i} className={`message-row ${msg.role}`}>
                                            {msg.role === 'assistant' && <div className="bot-avatar">🤖</div>}
                                            <div className={`message-bubble ${msg.role}`}>
                                                {msg.role === 'assistant' ? formatMessage(msg.text) : msg.text}
                                            </div>
                                            {msg.role === 'user' && <div className="user-avatar">👤</div>}
                                        </div>
                                    ))
                                )}
                                {loading && (
                                    <div className="message-row assistant">
                                        <div className="bot-avatar">🤖</div>
                                        <div className="typing-indicator">
                                            <span>•</span>
                                            <span>•</span>
                                            <span>•</span>
                                        </div>
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
                            placeholder={
                                viewState === 'chat' ? "Type your tax question..." :
                                viewState === 'category' ? `Ask about ${activeCategory}...` :
                                "Ask any tax question..."
                            }
                            disabled={loading}
                        />
                        <button 
                            onClick={() => handleAskQuestion(userQuestion)} 
                            disabled={loading || !userQuestion.trim()}
                            className="send-btn"
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