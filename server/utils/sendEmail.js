// server/utils/sendEmail.js
const axios = require('axios');

const sendEmail = async (options) => {
    // Brevo API Endpoint
    const url = 'https://api.brevo.com/v3/smtp/email';

    // 1. Prepare Data
    const emailData = {
        sender: { 
            name: "Artha Tax App", 
            email: process.env.SENDER_EMAIL // Must be verified in Brevo
        },
        to: [
            { email: options.email }
        ],
        subject: options.subject,
        htmlContent: options.message
    };

    // 2. Send Request via HTTP (Port 443 - Never Blocked)
    try {
        await axios.post(url, emailData, {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
        });
        console.log(`✅ Email sent to ${options.email} via Brevo API`);
    } catch (error) {
        console.error("❌ Brevo API Error:", error.response ? error.response.data : error.message);
        throw new Error("Email could not be sent due to API error.");
    }
};

module.exports = sendEmail;