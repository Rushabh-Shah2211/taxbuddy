import React from 'react';
import { Link } from 'react-router-dom';

const Legal = () => {
    return (
        <div style={{ 
            maxWidth: '1000px', 
            margin: '40px auto', 
            padding: '30px', 
            background: 'white', 
            borderRadius: '12px', 
            lineHeight: '1.7',
            boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
            fontSize: '15px'
        }}>
            <Link to="/dashboard" style={{ 
                color: '#2e7d32', 
                textDecoration: 'none', 
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '30px'
            }}>
                ← Back to Dashboard
            </Link>
            
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
            <p style={{ 
                color: '#666', 
                fontSize: '14px',
                marginBottom: '30px'
            }}>
                <strong>Last Updated:</strong> December 2025 | <strong>Version:</strong> 2.0
            </p>

            <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px',
                borderLeft: '4px solid #7ed957'
            }}>
                <strong>📋 Executive Summary:</strong> This document outlines how Artha collects, uses, stores, and protects your personal and financial data in compliance with global privacy regulations including GDPR and India's Digital Personal Data Protection Act, 2023.
            </div>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>1. Privacy Policy</h2>
            
            <h3>1.1 Information We Collect</h3>
            <p><strong>Artha by RB</strong> ("we", "our", "us") collects the following categories of personal data:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Identification Data:</strong> Full name, email address, user ID, profile picture (optional)</li>
                <li><strong>Financial Data:</strong> Income details, tax information, investment records, expense data</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system</li>
                <li><strong>Usage Data:</strong> Feature usage patterns, session duration, interaction metrics</li>
                <li><strong>Cookies & Tracking Data:</strong> As detailed in Section 2</li>
            </ul>

            <h3>1.2 How We Use Your Data</h3>
            <p>We process your personal data for the following lawful bases:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0', fontSize: '14px' }}>
                <thead>
                    <tr style={{ background: '#e9f5e9' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Purpose</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Legal Basis</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Data Type</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Tax Calculation & Financial Analysis</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Contractual Necessity</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Financial Data</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Account Management & Authentication</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Legitimate Interest</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Identification Data</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Service Improvement</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Legitimate Interest</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Usage Data</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Legal Compliance</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Legal Obligation</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>All Relevant Data</td>
                    </tr>
                </tbody>
            </table>

            <h3>1.3 Data Sharing & Third Parties</h3>
            <p>We do <strong>not</strong> sell, rent, or trade your personal data. We may share data with:</p>
            <ul>
                <li><strong>Service Providers:</strong> Cloud hosting (AWS/Google Cloud), payment processors (Stripe/Razorpay), analytics tools (Google Analytics)</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our legal rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
            </ul>
            <p>All third-party processors are GDPR/DPDPA compliant and bound by Data Processing Agreements.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>2. Cookie Policy</h2>
            
            <h3>2.1 Types of Cookies Used</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', margin: '20px 0' }}>
                <div style={{ background: '#e8f4fd', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ marginTop: '0', color: '#1976d2' }}>Essential Cookies</h4>
                    <p><strong>Purpose:</strong> Required for basic functionality</p>
                    <p><strong>Examples:</strong> Session management, authentication, security</p>
                    <p><strong>Duration:</strong> Session or up to 24 hours</p>
                    <p><strong>Opt-out:</strong> Not possible (site won't function without these)</p>
                </div>
                <div style={{ background: '#f0f8e8', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ marginTop: '0', color: '#388e3c' }}>Functional Cookies</h4>
                    <p><strong>Purpose:</strong> Remember preferences and settings</p>
                    <p><strong>Examples:</strong> Language selection, calculator inputs, theme preferences</p>
                    <p><strong>Duration:</strong> Up to 30 days</p>
                    <p><strong>Opt-out:</strong> Available via browser settings</p>
                </div>
                <div style={{ background: '#fff8e1', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ marginTop: '0', color: '#f57c00' }}>Analytical Cookies</h4>
                    <p><strong>Purpose:</strong> Improve user experience</p>
                    <p><strong>Examples:</strong> Google Analytics, heatmaps, performance metrics</p>
                    <p><strong>Duration:</strong> Up to 2 years</p>
                    <p><strong>Opt-out:</strong> Available via cookie banner</p>
                </div>
            </div>

            <h3>2.2 Cookie Management</h3>
            <p>You can manage cookie preferences through:</p>
            <ol>
                <li>Initial cookie banner (Accept/Reject options)</li>
                <li>Browser settings (Chrome: Settings → Privacy → Cookies)</li>
                <li>Profile Settings within Artha application</li>
                <li>Using private/incognito browsing mode</li>
            </ol>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>3. GDPR & DPDPA (India) Compliance</h2>
            
            <h3>3.1 Your Data Rights</h3>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '15px',
                margin: '20px 0'
            }}>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                    <h4 style={{ marginTop: '0', color: '#2c3e50' }}>Right to Access</h4>
                    <p>View all your stored data in the <strong>History tab</strong> or request complete data export.</p>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                    <h4 style={{ marginTop: '0', color: '#2c3e50' }}>Right to Rectification</h4>
                    <p>Update profile details anytime in <strong>Profile Settings</strong>.</p>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                    <h4 style={{ marginTop: '0', color: '#2c3e50' }}>Right to Erasure</h4>
                    <p>Permanently delete account and all data via <strong>Profile → Delete Account</strong>.</p>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                    <h4 style={{ marginTop: '0', color: '#2c3e50' }}>Right to Data Portability</h4>
                    <p>Export your data in CSV/JSON format for transfer to another service.</p>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                    <h4 style={{ marginTop: '0', color: '#2c3e50' }}>Right to Restrict Processing</h4>
                    <p>Temporarily pause data processing via support request.</p>
                </div>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px' }}>
                    <h4 style={{ marginTop: '0', color: '#2c3e50' }}>Right to Object</h4>
                    <p>Opt-out of marketing communications and certain data processing.</p>
                </div>
            </div>

            <h3>3.2 Data Processing Principles</h3>
            <p>We adhere to the following principles under GDPR and India's DPDPA:</p>
            <ul>
                <li><strong>Lawfulness, Fairness & Transparency:</strong> Clear communication about data usage</li>
                <li><strong>Purpose Limitation:</strong> Data collected only for specified purposes</li>
                <li><strong>Data Minimization:</strong> Collect only necessary data</li>
                <li><strong>Accuracy:</strong> Maintain accurate and up-to-date data</li>
                <li><strong>Storage Limitation:</strong> Retain data only as long as necessary</li>
                <li><strong>Integrity & Confidentiality:</strong> Implement appropriate security measures</li>
                <li><strong>Accountability:</strong> Maintain records of data processing activities</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>4. Data Security & Retention</h2>
            
            <h3>4.1 Security Measures</h3>
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
                <p><strong>Encryption:</strong> AES-256 for data at rest, TLS 1.3 for data in transit</p>
                <p><strong>Authentication:</strong> BCrypt password hashing, optional 2FA</p>
                <p><strong>Access Control:</strong> Role-based access, principle of least privilege</p>
                <p><strong>Network Security:</strong> Firewalls, DDoS protection, intrusion detection</p>
                <p><strong>Regular Audits:</strong> Quarterly security assessments and penetration testing</p>
            </div>

            <h3>4.2 Data Retention Schedule</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0', fontSize: '14px' }}>
                <thead>
                    <tr style={{ background: '#e9f5e9' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Data Type</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Retention Period</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Active User Data</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Duration of account + 30 days</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Service provision</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Inactive Accounts</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>2 years of inactivity</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>User reactivation option</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Financial Records</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>7 years (legal requirement)</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Tax compliance</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Server Logs</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>90 days</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>Security monitoring</td>
                    </tr>
                </tbody>
            </table>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>5. International Data Transfers</h2>
            <p>Artha operates primarily within India but uses global cloud infrastructure. When data is transferred outside India/EU, we ensure:</p>
            <ul>
                <li>Standard Contractual Clauses (SCCs) are in place</li>
                <li>Adequate data protection measures are implemented</li>
                <li>Transfers only to countries with adequate data protection laws</li>
                <li>Regular review of third-party compliance</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>6. Policy Updates & Contact</h2>
            <p>We may update this policy periodically. Significant changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance.</p>

            <div style={{ 
                marginTop: '40px', 
                padding: '25px', 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                borderRadius: '10px',
                border: '1px solid #dee2e6'
            }}>
                <h3 style={{ marginTop: '0', color: '#2c3e50' }}>Contact Information</h3>
                <p><strong>Data Protection Officer:</strong> dpo@artha.com</p>
                <p><strong>General Privacy Inquiries:</strong> privacy@artha.com</p>
                <p><strong>Security Reports:</strong> security@artha.com</p>
                <p><strong>Physical Address:</strong> [Your Company Address]</p>
                <p><strong>Response Time:</strong> We aim to respond to all data requests within 30 days as required by law.</p>
                
                <div style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
                    <strong>Grievance Officer (India):</strong> As required under IT Act, 2000 and DPDPA, 2023<br/>
                    Name: [Officer Name] | Email: grievance@artha.com | Phone: [Contact Number]
                </div>
            </div>
            
            <div style={{ 
                marginTop: '30px', 
                padding: '15px', 
                background: '#e8f5e9', 
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px'
            }}>
                <strong>Need Immediate Assistance?</strong> For urgent data deletion requests or security concerns, contact us immediately at the emails above.
            </div>
        </div>
    );
};

export default Legal;