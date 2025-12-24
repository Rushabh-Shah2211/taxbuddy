import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <nav style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ 
                    color: '#2e7d32', 
                    textDecoration: 'none', 
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                }}>
                    ← Back to Home
                </Link>
                <Link to="/login" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                    Already a member? Login
                </Link>
            </nav>
            
            <h1 style={{ 
                color: '#2c3e50', 
                marginTop: '10px',
                marginBottom: '10px',
                fontSize: '28px',
                borderBottom: '2px solid #7ed957',
                paddingBottom: '10px'
            }}>
                Privacy, Cookie & Data Protection Policy
            </h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
                <strong>Last Updated:</strong> December 2025 | <strong>Version:</strong> 2.0
            </p>

            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #7ed957' }}>
                <strong>📋 Executive Summary:</strong> This document outlines how Artha by RB collects, uses, stores, and protects your personal and financial data in compliance with global privacy regulations including GDPR, India's Digital Personal Data Protection Act, 2023, and other applicable data protection laws.
            </div>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>1. Scope and Application</h2>
            <p>This Privacy Policy applies to all users of the Artha by RB platform ("Service"), including visitors, registered users, and subscribers. By using our Service, you consent to the data practices described in this policy.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>2. Information We Collect</h2>
            <h3>2.1 Personal Information You Provide</h3>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li><strong>Account Information:</strong> Full name, email address, phone number, user ID, password (encrypted), date of birth.</li>
                <li><strong>Financial Information:</strong> Income details, tax filing history, investment records, expense data, bank account details (for payment processing), tax identification numbers.</li>
                <li><strong>Professional Information:</strong> Employment details, salary structure, deductions, employer information.</li>
                <li><strong>Communication Data:</strong> Support queries, feedback, survey responses.</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px', marginBottom: '20px' }}>
                <li><strong>Technical Data:</strong> IP address, browser type and version, device type, operating system, screen resolution.</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent on pages, features used, click patterns, navigation paths.</li>
                <li><strong>Location Data:</strong> General location (city/country level) based on IP address for tax jurisdiction purposes.</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <p>We may receive information about you from third-party services when you connect them to our Service, such as:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Authentication services (Google, Apple)</li>
                <li>Payment processors (Stripe, Razorpay)</li>
                <li>Financial institutions (with your explicit consent)</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>3. How We Use Your Information</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', background: '#f9f9f9', borderRadius: '6px', overflow: 'hidden' }}>
                <thead style={{ background: '#7ed957', color: '#2c3e50' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Purpose</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Legal Basis</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Provide and maintain the Service</td>
                        <td style={{ padding: '12px' }}>Contractual necessity</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Tax calculation and optimization</td>
                        <td style={{ padding: '12px' }}>Legitimate interest</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Personalized recommendations</td>
                        <td style={{ padding: '12px' }}>Consent</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Compliance with legal obligations</td>
                        <td style={{ padding: '12px' }}>Legal requirement</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '12px' }}>Service improvement and analytics</td>
                        <td style={{ padding: '12px' }}>Legitimate interest</td>
                    </tr>
                </tbody>
            </table>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>4. Data Sharing and Disclosure</h2>
            <p>We only share your personal information in the following circumstances:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>With Your Consent:</strong> When you explicitly authorize sharing with third parties.</li>
                <li><strong>Service Providers:</strong> Trusted partners who assist in operating our Service (payment processors, hosting providers, analytics services) under strict confidentiality agreements.</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request.</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                <li><strong>Aggregated Data:</strong> Non-personally identifiable information for research or marketing.</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>5. Data Retention</h2>
            <p>We retain your personal data only as long as necessary for the purposes outlined in this policy:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Active Accounts:</strong> Data retained while your account is active and for 7 years after deactivation for tax compliance purposes.</li>
                <li><strong>Financial Records:</strong> 10 years as required by financial regulations.</li>
                <li><strong>Inactive Accounts:</strong> Data anonymized after 3 years of inactivity.</li>
                <li><strong>Cookie Data:</strong> As specified in our Cookie Policy.</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>6. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Encryption:</strong> AES-256 encryption for data at rest, TLS 1.3 for data in transit.</li>
                <li><strong>Access Control:</strong> Role-based access, multi-factor authentication for sensitive operations.</li>
                <li><strong>Network Security:</strong> Firewalls, intrusion detection systems, DDoS protection.</li>
                <li><strong>Regular Audits:</strong> Security assessments, penetration testing, vulnerability scanning.</li>
                <li><strong>Data Minimization:</strong> Collecting only necessary data, regular data cleanup.</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>7. Your Data Rights</h2>
            <p>Under GDPR, DPDPA, and other data protection laws, you have the following rights:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', margin: '20px 0' }}>
                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '6px' }}>
                    <strong>Right to Access</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Request a copy of your personal data.</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '6px' }}>
                    <strong>Right to Rectification</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Correct inaccurate or incomplete data.</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '6px' }}>
                    <strong>Right to Erasure</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Request deletion of your data ("right to be forgotten").</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '6px' }}>
                    <strong>Right to Restriction</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Limit processing of your data.</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '6px' }}>
                    <strong>Right to Data Portability</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Receive your data in a structured, machine-readable format.</p>
                </div>
                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '6px' }}>
                    <strong>Right to Object</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Object to certain types of processing.</p>
                </div>
            </div>
            <p>To exercise these rights, visit your User Profile dashboard or contact us at <strong>privacy@artha.com</strong>.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>8. International Data Transfers</h2>
            <p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place through:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions for countries with equivalent data protection laws</li>
                <li>Binding Corporate Rules for intra-group transfers</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>9. Children's Privacy</h2>
            <p>Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will take steps to delete such information.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>10. Cookie Policy</h2>
            <p>For detailed information about the cookies we use, please refer to our dedicated <Link to="/cookie-policy" style={{ color: '#2e7d32' }}>Cookie Policy</Link>.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes by:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Posting the new policy on this page with an updated "Last Updated" date</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a notice within the Service</li>
            </ul>
            <p>We encourage you to review this Privacy Policy periodically for any changes.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>12. Contact Information</h2>
            <div style={{ marginTop: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #dee2e6' }}>
                <h3 style={{ marginTop: '0', color: '#2c3e50' }}>Data Protection Officer</h3>
                <p>For privacy concerns, data requests, or to exercise your data rights:</p>
                <p><strong>Email:</strong> privacy@artha.com</p>
                <p><strong>Address:</strong> [Your Company Address]</p>
                <p><strong>Response Time:</strong> We aim to respond to all data requests within 30 days as required by law.</p>
                
                <h4 style={{ marginTop: '20px', color: '#2c3e50' }}>Supervisory Authority</h4>
                <p>If you have concerns about our data practices, you have the right to lodge a complaint with your local data protection authority.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;