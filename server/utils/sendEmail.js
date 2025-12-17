const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Built-in service for Gmail
        // If using another provider (Outlook, Yahoo), comment out 'service' and use 'host'/'port' below:
        // host: process.env.EMAIL_HOST, 
        // port: process.env.EMAIL_PORT, // 587 for TLS, 465 for SSL
        // secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false // Helps avoid some certificate errors on cloud servers
        }
    });

    // 2. Define Email Options
    const mailOptions = {
        from: `"Artha Tax App" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    // 3. Send Email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;