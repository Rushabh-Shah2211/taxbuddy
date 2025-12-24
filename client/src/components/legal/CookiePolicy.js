import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
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
                <Link to="/privacy-policy" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
                    View Privacy Policy
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
                Cookie Policy
            </h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
                <strong>Last Updated:</strong> December 2025
            </p>

            <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #7ed957' }}>
                <strong>🍪 Cookie Consent Manager:</strong> You can manage your cookie preferences at any time by clicking the "Cookie Settings" link in our website footer or by adjusting your browser settings.
            </div>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>1. What Are Cookies?</h2>
            <p>Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit our website. They help us provide you with a better experience by:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Remembering your preferences and settings</li>
                <li>Understanding how you use our website</li>
                <li>Providing personalized content and advertisements</li>
                <li>Improving the security and performance of our website</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>2. Types of Cookies We Use</h2>
            
            <h3>2.1 Essential Cookies (Strictly Necessary)</h3>
            <p>These cookies are necessary for the website to function and cannot be switched off in our systems.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', background: '#f9f9f9', borderRadius: '6px', overflow: 'hidden' }}>
                <thead style={{ background: '#7ed957', color: '#2c3e50' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Cookie Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Purpose</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>auth_session</td>
                        <td style={{ padding: '12px' }}>Maintains your login session</td>
                        <td style={{ padding: '12px' }}>Session</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>csrf_token</td>
                        <td style={{ padding: '12px' }}>Protects against cross-site request forgery attacks</td>
                        <td style={{ padding: '12px' }}>Session</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>cookie_consent</td>
                        <td style={{ padding: '12px' }}>Remembers your cookie preferences</td>
                        <td style={{ padding: '12px' }}>1 year</td>
                    </tr>
                </tbody>
            </table>

            <h3>2.2 Functional Cookies</h3>
            <p>These cookies enable the website to provide enhanced functionality and personalization.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', background: '#f9f9f9', borderRadius: '6px', overflow: 'hidden' }}>
                <thead style={{ background: '#4caf50', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Cookie Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Purpose</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>preferences</td>
                        <td style={{ padding: '12px' }}>Stores your language and display preferences</td>
                        <td style={{ padding: '12px' }}>6 months</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>currency</td>
                        <td style={{ padding: '12px' }}>Remembers your preferred currency</td>
                        <td style={{ padding: '12px' }}>6 months</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>calculator_state</td>
                        <td style={{ padding: '12px' }}>Saves your tax calculator inputs</td>
                        <td style={{ padding: '12px' }}>24 hours</td>
                    </tr>
                </tbody>
            </table>

            <h3>2.3 Analytics Cookies</h3>
            <p>These cookies help us understand how visitors interact with our website.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', background: '#f9f9f9', borderRadius: '6px', overflow: 'hidden' }}>
                <thead style={{ background: '#2196f3', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Cookie Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Purpose</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>_ga</td>
                        <td style={{ padding: '12px' }}>Google Analytics - Distinguishes users</td>
                        <td style={{ padding: '12px' }}>2 years</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>_gid</td>
                        <td style={{ padding: '12px' }}>Google Analytics - Distinguishes users</td>
                        <td style={{ padding: '12px' }}>24 hours</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>_gat</td>
                        <td style={{ padding: '12px' }}>Google Analytics - Throttles request rate</td>
                        <td style={{ padding: '12px' }}>1 minute</td>
                    </tr>
                </tbody>
            </table>

            <h3>2.4 Marketing Cookies</h3>
            <p>These cookies are used to track visitors across websites to display relevant advertisements.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', background: '#f9f9f9', borderRadius: '6px', overflow: 'hidden' }}>
                <thead style={{ background: '#ff9800', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Cookie Name</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Purpose</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>_fbp</td>
                        <td style={{ padding: '12px' }}>Facebook Pixel - Delivers targeted ads</td>
                        <td style={{ padding: '12px' }}>3 months</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>_gcl_au</td>
                        <td style={{ padding: '12px' }}>Google Ads - Conversion tracking</td>
                        <td style={{ padding: '12px' }}>3 months</td>
                    </tr>
                </tbody>
            </table>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>3. Third-Party Cookies</h2>
            <p>We use services from third parties that may set cookies on your device:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Google Analytics:</strong> For website analytics and performance measurement</li>
                <li><strong>Hotjar:</strong> For user behavior analysis and heatmaps</li>
                <li><strong>Stripe:</strong> For payment processing and fraud prevention</li>
                <li><strong>Intercom:</strong> For customer support and chat functionality</li>
                <li><strong>Cloudflare:</strong> For security and performance optimization</li>
            </ul>
            <p>These third parties have their own privacy policies and cookie practices. We recommend reviewing their policies for more information.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>4. Managing Your Cookie Preferences</h2>
            
            <h3>4.1 Browser Settings</h3>
            <p>Most web browsers allow you to control cookies through their settings. Here's how to manage cookies in popular browsers:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', margin: '20px 0' }}>
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px' }}>
                    <strong>Google Chrome</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Settings → Privacy and security → Cookies and other site data</p>
                </div>
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px' }}>
                    <strong>Mozilla Firefox</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Options → Privacy & Security → Cookies and Site Data</p>
                </div>
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px' }}>
                    <strong>Safari</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Preferences → Privacy → Cookies and website data</p>
                </div>
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px' }}>
                    <strong>Microsoft Edge</strong>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Settings → Cookies and site permissions → Cookies and site data</p>
                </div>
            </div>

            <h3>4.2 Our Cookie Consent Tool</h3>
            <p>When you first visit our website, you'll see a cookie banner that allows you to:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Accept All:</strong> Accept all cookies (essential, functional, analytics, and marketing)</li>
                <li><strong>Customize:</strong> Choose which categories of cookies to accept</li>
                <li><strong>Reject All:</strong> Reject all non-essential cookies</li>
            </ul>
            <p>You can change your preferences at any time by clicking the "Cookie Settings" link in our website footer.</p>

            <h3>4.3 Opt-Out Tools</h3>
            <p>For third-party advertising cookies, you can use these industry opt-out tools:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#2e7d32' }}>Google Analytics Opt-out Browser Add-on</a></li>
                <li><strong>Network Advertising Initiative:</strong> <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2e7d32' }}>NAI Opt-Out Tool</a></li>
                <li><strong>Digital Advertising Alliance:</strong> <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" style={{ color: '#2e7d32' }}>DAA Consumer Choice Page</a></li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>5. Do Not Track Signals</h2>
            <p>Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no uniform standard for how to interpret DNT signals. Our website does not currently respond to DNT signals, but you can control tracking through our cookie consent tool and your browser settings.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>6. Local Storage and Similar Technologies</h2>
            <p>In addition to cookies, we may use other local storage technologies:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Local Storage:</strong> Stores larger amounts of data on your device (e.g., tax calculation drafts)</li>
                <li><strong>Session Storage:</strong> Temporary storage that clears when you close your browser</li>
                <li><strong>IndexedDB:</strong> For storing complex financial data locally</li>
                <li><strong>Web Beacons:</strong> Tiny graphics that help us understand user behavior</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>7. Changes to This Cookie Policy</h2>
            <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Updating the "Last Updated" date at the top of this page</li>
                <li>Displaying a prominent notice on our website</li>
                <li>Requesting renewed consent for non-essential cookies</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '40px' }}>8. Contact Information</h2>
            <div style={{ marginTop: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #dee2e6' }}>
                <h3 style={{ marginTop: '0', color: '#2c3e50' }}>Questions About Cookies?</h3>
                <p>If you have any questions about our use of cookies or this Cookie Policy, please contact us at:</p>
                <p><strong>Email:</strong> privacy@artha.com</p>
                <p><strong>Subject Line:</strong> "Cookie Policy Inquiry"</p>
                
                <h4 style={{ marginTop: '20px', color: '#2c3e50' }}>Related Documents</h4>
                <p>For more information about how we handle your personal data, please review our:</p>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    <li><Link to="/privacy-policy" style={{ color: '#2e7d32' }}>Privacy Policy</Link></li>
                    <li><Link to="/terms-of-service" style={{ color: '#2e7d32' }}>Terms of Service</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default CookiePolicy;