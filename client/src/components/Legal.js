import React from 'react';
import { Link } from 'react-router-dom';

const Legal = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', background: 'white', borderRadius: '10px', lineHeight: '1.6' }}>
            <Link to="/dashboard" style={{ color: '#2e7d32', textDecoration: 'none', fontWeight: 'bold' }}>← Back to Dashboard</Link>
            
            <h1 style={{ color: '#2c3e50', marginTop: '20px' }}>Privacy & Data Policy</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>Last Updated: December 2025</p>

            <hr />

            <h3>1. Privacy Policy</h3>
            <p><strong>Artha by RB</strong> ("we", "our") respects your privacy. We collect only essential information (Name, Email, Financial Data) required to perform tax calculations. Your data is stored securely using encryption.</p>
            <p>We do <strong>not</strong> sell your data to third parties. Your financial data is used solely for the purpose of generating reports and providing insights within this application.</p>

            <h3>2. Cookie Policy</h3>
            <p>We use cookies to enhance your experience:</p>
            <ul>
                <li><strong>Essential Cookies:</strong> Required for login sessions and security.</li>
                <li><strong>Functional Cookies:</strong> To remember your preferences (e.g., calculator inputs).</li>
            </ul>
            <p>By using our app, you consent to the use of these cookies.</p>

            <h3>3. GDPR & IT Act (India) Compliance</h3>
            <p>In accordance with the Digital Personal Data Protection Act (India) and GDPR principles:</p>
            <ul>
                <li><strong>Right to Access:</strong> You can view all your stored data in the History tab.</li>
                <li><strong>Right to Rectification:</strong> You can update your profile details at any time.</li>
                <li><strong>Right to Erasure (Right to be Forgotten):</strong> You can permanently delete your account and all associated data via the Profile section.</li>
            </ul>

            <h3>4. Data Security</h3>
            <p>We use industry-standard encryption (BCrypt for passwords, HTTPS for transmission) to protect your data. However, no method of transmission over the internet is 100% secure.</p>

            <div style={{ marginTop: '40px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <strong>Contact Us:</strong><br/>
                For privacy concerns, email us at: privacy@artha.com
            </div>
        </div>
    );
};

export default Legal;