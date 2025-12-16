import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) setShow(true);
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookieConsent', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 0, left: 0, width: '100%', 
            background: '#2c3e50', color: 'white', padding: '15px', 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            zIndex: 9999, fontSize: '14px', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }}>
            <div style={{maxWidth: '80%'}}>
                🍪 <strong>We use cookies</strong> to ensure you get the best experience on Artha. 
                By continuing, you agree to our <a href="/legal" style={{color: '#7ed957'}}>Privacy Policy</a>.
            </div>
            <button onClick={acceptCookies} style={{
                background: '#7ed957', color: 'white', border: 'none', 
                padding: '8px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
            }}>
                Accept
            </button>
        </div>
    );
};

export default CookieBanner;