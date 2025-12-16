import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) setShow(true);
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShow(false);
    };

    const rejectCookies = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setShow(false);
        // Optional: Implement cookie rejection logic here
        // e.g., remove non-essential cookies
    };

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            width: '100%', 
            background: '#2c3e50', 
            color: 'white', 
            padding: '15px 20px', 
            display: 'flex', 
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center',
            gap: window.innerWidth <= 768 ? '15px' : '0',
            zIndex: 9999, 
            fontSize: '14px', 
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            boxSizing: 'border-box'
        }}>
            <div style={{
                maxWidth: window.innerWidth <= 768 ? '100%' : '70%',
                flex: window.innerWidth <= 768 ? '0 0 auto' : '1'
            }}>
                🍪 <strong>We use cookies</strong> to ensure you get the best experience on Artha. 
                By continuing, you agree to our <a href="/legal" style={{color: '#7ed957', textDecoration: 'underline'}}>Privacy Policy</a>.
                <div style={{fontSize: '12px', marginTop: '5px', opacity: 0.8}}>
                    You can manage your preferences anytime in Settings.
                </div>
            </div>
            
            <div style={{
                display: 'flex',
                flexDirection: window.innerWidth <= 768 ? 'row' : 'row',
                gap: '10px',
                justifyContent: window.innerWidth <= 768 ? 'flex-start' : 'flex-end',
                width: window.innerWidth <= 768 ? '100%' : 'auto'
            }}>
                <button 
                    onClick={rejectCookies}
                    style={{
                        background: 'transparent',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '8px 16px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Reject
                </button>
                <button 
                    onClick={acceptCookies}
                    style={{
                        background: '#7ed957',
                        color: 'white',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Accept All
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;