const axios = require('axios');

const sendEmail = async (options) => {
    const url = 'https://api.brevo.com/v3/smtp/email';

    // Base Email Object
    let emailData = {
        sender: { name: "Artha by RB", email: process.env.SENDER_EMAIL },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent: options.message
    };

    // Add Attachment if present
    if (options.attachment) {
        emailData.attachment = [
            {
                content: options.attachment, // Base64 string
                name: "Artha_Tax_Report.pdf"
            }
        ];
    }

    try {
        await axios.post(url, emailData, {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
        });
        console.log(`✅ Email sent to ${options.email}`);
    } catch (error) {
        console.error("❌ Brevo API Error:", error.response?.data || error.message);
        throw new Error("Email API Error");
    }
};

module.exports = sendEmail;