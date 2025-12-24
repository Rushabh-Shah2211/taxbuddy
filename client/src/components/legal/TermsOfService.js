import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
    return (
        <div style={{ 
            maxWidth: '1000px', 
            margin: '40px auto', 
            padding: '30px', 
            background: 'white', 
            borderRadius: '12px', 
            lineHeight: '1.7',
            boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            fontSize: '15px',
            fontFamily: "'Poppins', sans-serif"
        }}>
            <Link to="/" style={{ 
                color: '#2e7d32', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '30px'
            }}>
                ← Back to Home
            </Link>

            <h1 style={{ 
                color: '#2c3e50', 
                marginTop: '10px',
                marginBottom: '10px',
                fontSize: '28px',
                borderBottom: '2px solid #7ed957',
                paddingBottom: '10px'
            }}>
                Terms of Service
            </h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
                <strong>Last Updated:</strong> December 2025 | <strong>Effective Date:</strong> December 1, 2025
            </p>

            <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #ffc107', color: '#856404' }}>
                <strong>⚠️ IMPORTANT DISCLAIMER:</strong> Artha by RB is a tax estimation and financial planning tool. We are <strong>not</strong> a substitute for professional advice from certified Chartered Accountants, tax professionals, or financial advisors. Use these results for planning purposes only, and consult a qualified professional before making any financial decisions or tax filings.
            </div>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>1. Acceptance of Terms</h2>
            <p>By accessing, browsing, or using "Artha by RB" (the "Service", "Platform", "we", "us", or "our"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</p>
            <p>If you disagree with any part of these Terms, you may not access or use the Service. Your continued use of the Service constitutes acceptance of any revisions to these Terms.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>2. Eligibility</h2>
            <p>To use the Service, you must:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>Have the legal capacity to enter into a binding contract</li>
                <li>Provide accurate and complete registration information</li>
                <li>Not be barred from receiving services under applicable law</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>3. Account Registration and Security</h2>
            <h3>3.1 Account Creation</h3>
            <p>Certain features of the Service require registration. You agree to:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your information</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Not share your account credentials with third parties</li>
            </ul>

            <h3>3.2 Account Types</h3>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li><strong>Free Tier:</strong> Basic tax calculation features with limited functionality</li>
                <li><strong>Premium Tier:</strong> Advanced features, detailed reporting, and priority support (subject to subscription fees)</li>
                <li><strong>Professional Tier:</strong> Features designed for tax professionals (additional terms apply)</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li>Violate any applicable law, regulation, or third-party rights</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Attempt to gain unauthorized access to systems or data</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated systems (bots, scrapers, etc.) to access the Service without permission</li>
                <li>Impersonate any person or entity</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>5. Service Description and Limitations</h2>
            <h3>5.1 Nature of Service</h3>
            <p>Artha by RB provides automated tax calculation and financial planning tools based on:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Current tax laws and regulations as of the calculation date</li>
                <li>User-provided financial information</li>
                <li>Publicly available tax schedules and rates</li>
            </ul>

            <h3>5.2 Accuracy Disclaimer</h3>
            <p>While we strive for accuracy:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li>Tax laws are complex and subject to change, interpretation, and jurisdictional variations</li>
                <li>We cannot guarantee 100% accuracy of calculations</li>
                <li>We are not responsible for errors in user-input data</li>
                <li>Calculations do not constitute legal or financial advice</li>
                <li>You assume full responsibility for verifying results with qualified professionals</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>6. Fees and Payments</h2>
            <h3>6.1 Subscription Fees</h3>
            <p>Certain features require payment of subscription fees. By subscribing, you agree to:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Pay all applicable fees in advance</li>
                <li>Provide accurate billing information</li>
                <li>Authorize us to charge your chosen payment method</li>
            </ul>

            <h3>6.2 Billing Cycle</h3>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li><strong>Monthly Subscriptions:</strong> Automatically renew each month</li>
                <li><strong>Annual Subscriptions:</strong> Automatically renew each year</li>
                <li><strong>Cancellation:</strong> You may cancel anytime, but no refunds for partial periods</li>
                <li><strong>Price Changes:</strong> We will provide 30 days notice of price increases</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>7. Intellectual Property Rights</h2>
            <h3>7.1 Our Intellectual Property</h3>
            <p>The Service and its original content, features, functionality, trademarks, logos, and trade dress are owned by Artha by RB and its licensors and are protected by copyright, trademark, and other intellectual property laws.</p>

            <h3>7.2 Your Content</h3>
            <p>You retain ownership of any financial data and information you submit to the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li>Use, process, and store your User Content to provide the Service</li>
                <li>Generate aggregated, anonymized insights that do not identify you</li>
                <li>Improve our algorithms and services</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>8. Privacy and Data Protection</h2>
            <p>Your privacy is important to us. Our collection, use, and disclosure of your personal information is governed by our <Link to="/privacy-policy" style={{ color: '#2e7d32' }}>Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>9. Limitation of Liability</h2>
            <h3>9.1 Disclaimer of Warranties</h3>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>

            <h3>9.2 Limitation of Damages</h3>
            <p>IN NO EVENT SHALL ARTHA BY RB, ITS DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
                <li>DAMAGES RESULTING FROM TAX PENALTIES, INTEREST, OR LEGAL FEES</li>
                <li>DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS</li>
                <li>DAMAGES RESULTING FROM ANY INTERRUPTION OR CESSATION OF THE SERVICE</li>
            </ul>

            <h3>9.3 Maximum Liability</h3>
            <p>OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU HAVE PAID US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM, OR $100, WHICHEVER IS GREATER.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>10. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless Artha by RB and its affiliates from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting fees, arising out of or in any way connected with:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Your access to or use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party right, including intellectual property or privacy rights</li>
                <li>Any tax filings or financial decisions made based on our calculations</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>11. Termination</h2>
            <h3>11.1 By You</h3>
            <p>You may terminate your account at any time by contacting us or using the account deletion feature in your settings.</p>

            <h3>11.2 By Us</h3>
            <p>We may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including if you:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li>Breach these Terms</li>
                <li>Use the Service in an illegal or fraudulent manner</li>
                <li>Cause harm to other users or the Service</li>
                <li>Fail to pay applicable fees</li>
            </ul>

            <h3>11.3 Effect of Termination</h3>
            <p>Upon termination:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Your right to use the Service will immediately cease</li>
                <li>We will retain your data as specified in our Privacy Policy</li>
                <li>All provisions of these Terms which by their nature should survive termination shall survive</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>12. Dispute Resolution</h2>
            <h3>12.1 Governing Law</h3>
            <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>

            <h3>12.2 Arbitration</h3>
            <p>Any dispute arising from these Terms shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in [City, State], India, in English.</p>

            <h3>12.3 Class Action Waiver</h3>
            <p>You agree to resolve disputes on an individual basis and waive any right to participate in class actions, class arbitrations, or representative actions.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>13. General Provisions</h2>
            <h3>13.1 Entire Agreement</h3>
            <p>These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and Artha by RB regarding the Service.</p>

            <h3>13.2 Severability</h3>
            <p>If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect.</p>

            <h3>13.3 Waiver</h3>
            <p>Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>

            <h3>13.4 Assignment</h3>
            <p>You may not assign your rights under these Terms without our prior written consent. We may assign our rights to any affiliate or successor.</p>

            <h3>13.5 Force Majeure</h3>
            <p>We shall not be liable for any failure to perform due to causes beyond our reasonable control.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>14. Changes to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>15. Contact Information</h2>
            <div style={{ marginTop: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '10px' }}>
                <h3 style={{ marginTop: '0', color: '#2c3e50' }}>Questions About These Terms?</h3>
                <p>If you have any questions about these Terms of Service, please contact us at:</p>
                <p><strong>Email:</strong> legal@artha.com</p>
                <p><strong>Address:</strong> [Your Company Address]</p>
                <p><strong>Response Time:</strong> We aim to respond to legal inquiries within 7-10 business days.</p>
                
                <h4 style={{ marginTop: '20px', color: '#2c3e50' }}>Related Documents</h4>
                <p>Please also review our:</p>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    <li><Link to="/privacy-policy" style={{ color: '#2e7d32' }}>Privacy Policy</Link></li>
                    <li><Link to="/cookie-policy" style={{ color: '#2e7d32' }}>Cookie Policy</Link></li>
                    <li><Link to="/data-processing-agreement" style={{ color: '#2e7d32' }}>Data Processing Agreement</Link> (for business users)</li>
                </ul>
            </div>
        </div>
    );
};

export default TermsOfService;