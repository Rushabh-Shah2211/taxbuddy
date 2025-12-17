// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,                 // Changed from 465 to 587
        secure: false,             // Must be false for port 587
        requireTLS: true,          // Force TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Your 16-char App Password
        },
        tls: {
            ciphers: 'SSLv3',      // Helps with some node version compatibility
            rejectUnauthorized: false // Bypasses some strict SSL checks
        }
    });

    const mailOptions = {
        from: `"Artha Tax App" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error("Transporter Error:", error);
        throw error; // Rethrow so the controller catches it
    }
};

module.exports = sendEmail;