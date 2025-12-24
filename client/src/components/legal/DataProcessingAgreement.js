import React from 'react';
import { Link } from 'react-router-dom';

const DataProcessingAgreement = () => {
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
                Data Processing Agreement
            </h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
                <strong>Last Updated:</strong> December 2025 | <strong>Version:</strong> 1.0
            </p>

            <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #ffc107', color: '#856404' }}>
                <strong>📝 IMPORTANT:</strong> This Data Processing Agreement ("DPA") supplements the Terms of Service and Privacy Policy when Artha by RB acts as a Data Processor on behalf of business users who are Data Controllers under GDPR, DPDPA, and other data protection laws.
            </div>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>1. Definitions</h2>
            <p>Capitalized terms used but not defined in this DPA shall have the meanings given to them in the Terms of Service:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>"Controller"</strong> means the entity which determines the purposes and means of the processing of Personal Data.</li>
                <li><strong>"Processor"</strong> means Artha by RB, which processes Personal Data on behalf of the Controller.</li>
                <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</li>
                <li><strong>"Processing"</strong> means any operation performed on Personal Data.</li>
                <li><strong>"Sub-processor"</strong> means any third party engaged by the Processor to process Personal Data.</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>2. Scope and Roles</h2>
            <h3>2.1 Roles of the Parties</h3>
            <p>The parties acknowledge and agree that with regard to the Processing of Personal Data:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Controller:</strong> The business user (you) is the Controller of Personal Data uploaded to the Service.</li>
                <li><strong>Processor:</strong> Artha by RB is the Processor that processes Personal Data on behalf of the Controller.</li>
                <li><strong>Data Subjects:</strong> The individuals whose Personal Data is processed (e.g., employees, customers).</li>
            </ul>

            <h3>2.2 Details of Processing</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', background: '#f9f9f9', borderRadius: '6px', overflow: 'hidden' }}>
                <thead style={{ background: '#7ed957', color: '#2c3e50' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Aspect</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Subject Matter</td>
                        <td style={{ padding: '12px' }}>Provision of tax calculation and financial planning services</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Duration</td>
                        <td style={{ padding: '12px' }}>Duration of the Service agreement plus retention period</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Nature and Purpose</td>
                        <td style={{ padding: '12px' }}>Processing for tax calculations, reporting, and analytics</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Types of Personal Data</td>
                        <td style={{ padding: '12px' }}>Employee data, financial information, tax details</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '12px' }}>Categories of Data Subjects</td>
                        <td style={{ padding: '12px' }}>Employees, contractors, clients (as provided by Controller)</td>
                    </tr>
                </tbody>
            </table>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>3. Processor Obligations</h2>
            <h3>3.1 Processing Instructions</h3>
            <p>Processor shall:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Process Personal Data only on documented instructions from Controller</li>
                <li>Inform Controller if Processor believes an instruction violates data protection laws</li>
                <li>Ensure persons authorized to process Personal Data have committed to confidentiality</li>
            </ul>

            <h3>3.2 Security of Processing</h3>
            <p>Processor shall implement appropriate technical and organizational measures including:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Pseudonymization and encryption of Personal Data</li>
                <li>Ability to ensure ongoing confidentiality, integrity, availability, and resilience</li>
                <li>Ability to restore availability and access to Personal Data in a timely manner</li>
                <li>Regular testing and evaluation of effectiveness of security measures</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>4. Sub-processing</h2>
            <h3>4.1 Authorized Sub-processors</h3>
            <p>Controller generally authorizes Processor to engage the following Sub-processors:</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', background: '#f9f9f9', borderRadius: '6px', overflow: 'hidden' }}>
                <thead style={{ background: '#4caf50', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Sub-processor</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Service</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Amazon Web Services</td>
                        <td style={{ padding: '12px' }}>Cloud hosting and infrastructure</td>
                        <td style={{ padding: '12px' }}>India / Singapore</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Stripe, Inc.</td>
                        <td style={{ padding: '12px' }}>Payment processing</td>
                        <td style={{ padding: '12px' }}>USA (with SCCs)</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '12px' }}>Google LLC</td>
                        <td style={{ padding: '12px' }}>Analytics and email services</td>
                        <td style={{ padding: '12px' }}>USA (with SCCs)</td>
                    </tr>
                </tbody>
            </table>

            <h3>4.2 Sub-processor Obligations</h3>
            <p>Processor shall:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Enter into written agreements with Sub-processors containing data protection obligations no less protective than this DPA</li>
                <li>Remain liable for Sub-processor's compliance with this DPA</li>
                <li>Notify Controller of any intended changes concerning addition or replacement of Sub-processors</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>5. Data Subject Rights</h2>
            <p>Processor shall, to the extent legally permitted, promptly notify Controller of any request from a Data Subject to exercise their rights under applicable data protection laws. Processor shall assist Controller by appropriate technical and organizational measures, insofar as possible, to fulfill Controller's obligation to respond to such requests.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>6. Security Breach Notification</h2>
            <h3>6.1 Processor Obligations</h3>
            <p>Upon becoming aware of a Personal Data breach, Processor shall:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Notify Controller without undue delay</li>
                <li>Provide timely information relating to the breach as it becomes known</li>
                <li>Assist Controller in meeting Controller's breach notification obligations</li>
                <li>Take reasonable steps to mitigate the effects of the breach</li>
            </ul>

            <h3>6.2 Notification Timeline</h3>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li><strong>Initial Notification:</strong> Within 24 hours of becoming aware</li>
                <li><strong>Detailed Report:</strong> Within 72 hours with all available details</li>
                <li><strong>Ongoing Updates:</strong> As additional information becomes available</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>7. Audit Rights</h2>
            <h3>7.1 Audit Procedures</h3>
            <p>Controller may, at its own expense, audit Processor's compliance with this DPA:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Audits may be conducted no more than once annually</li>
                <li>Controller must provide at least 30 days prior written notice</li>
                <li>Audits shall be conducted during normal business hours</li>
                <li>Audits shall not unreasonably interfere with Processor's business operations</li>
            </ul>

            <h3>7.2 Alternative to Audit</h3>
            <p>In lieu of an audit, Processor may provide:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Recent third-party audit reports (e.g., SOC 2 Type II)</li>
                <li>Certifications (e.g., ISO 27001)</li>
                <li>Written responses to security questionnaires</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>8. International Data Transfers</h2>
            <p>Where Personal Data is transferred outside the EEA, UK, or other jurisdictions with adequacy requirements, Processor shall ensure appropriate safeguards are in place, including:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Binding Corporate Rules where applicable</li>
                <li>Other approved transfer mechanisms under applicable law</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>9. Return or Deletion of Data</h2>
            <p>Upon termination of the Service, Processor shall, at Controller's choice:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Return all Personal Data to Controller in a structured, commonly used, machine-readable format</li>
                <li>Delete all Personal Data in Processor's possession</li>
                <li>Certify in writing that such deletion has occurred</li>
            </ul>
            <p>This requirement shall not apply to the extent Processor is required by applicable law to retain some or all of the Personal Data.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>10. Liability and Indemnification</h2>
            <h3>10.1 Liability Cap</h3>
            <p>Each party's liability arising out of or related to this DPA shall be subject to the limitations of liability in the Terms of Service.</p>

            <h3>10.2 Indemnification</h3>
            <p>Processor shall indemnify and hold Controller harmless against all claims, liabilities, costs, and expenses arising from:</p>
            <ul style={{ background: '#f9f9f9', padding: '15px 15px 15px 35px', borderRadius: '6px' }}>
                <li>Processor's material breach of this DPA</li>
                <li>Processor's negligent or willful misconduct in processing Personal Data</li>
                <li>Processor's failure to comply with applicable data protection laws</li>
            </ul>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>11. Governing Law and Jurisdiction</h2>
            <p>This DPA shall be governed by and construed in accordance with the laws specified in the Terms of Service. Any disputes arising from this DPA shall be resolved in accordance with the dispute resolution provisions of the Terms of Service.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>12. Duration and Termination</h2>
            <p>This DPA shall remain in effect as long as Processor processes Personal Data on behalf of Controller. Termination of the Terms of Service shall automatically terminate this DPA.</p>

            <h2 style={{ color: '#2c3e50', marginTop: '30px' }}>13. General Provisions</h2>
            <h3>13.1 Order of Precedence</h3>
            <p>In the event of any conflict or inconsistency between this DPA and the Terms of Service or Privacy Policy, the provisions of this DPA shall prevail with respect to data processing activities.</p>

            <h3>13.2 Amendments</h3>
            <p>This DPA may only be modified by a written amendment signed by both parties or by Processor posting an updated version on its website with notice to Controller.</p>

            <h3>13.3 Severability</h3>
            <p>If any provision of this DPA is found to be unenforceable, the remaining provisions will remain in full force and effect.</p>

            <div style={{ marginTop: '40px', padding: '25px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #dee2e6' }}>
                <h3 style={{ marginTop: '0', color: '#2c3e50' }}>Execution and Contact</h3>
                <p>This DPA is incorporated into and forms part of the Terms of Service. By using the Service for business purposes, you acknowledge that you have read, understood, and agree to be bound by this DPA.</p>
                
                <h4 style={{ marginTop: '20px', color: '#2c3e50' }}>Data Protection Officer</h4>
                <p>For DPA-related inquiries or to exercise your rights under this agreement:</p>
                <p><strong>Email:</strong> dpo@artha.com</p>
                <p><strong>Address:</strong> [Your Company Address]</p>
                
                <h4 style={{ marginTop: '20px', color: '#2c3e50' }}>Related Documents</h4>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                    <li><Link to="/terms-of-service" style={{ color: '#2e7d32' }}>Terms of Service</Link></li>
                    <li><Link to="/privacy-policy" style={{ color: '#2e7d32' }}>Privacy Policy</Link></li>
                    <li><Link to="/cookie-policy" style={{ color: '#2e7d32' }}>Cookie Policy</Link></li>
                </ul>
            </div>
        </div>
    );
};

export default DataProcessingAgreement;