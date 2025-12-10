// server/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter (using Gmail for now)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can switch to SendGrid/Outlook later
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail
            pass: process.env.EMAIL_PASS  // Your Gmail App Password (Not real password)
        }
    });

    // Define email options
    const mailOptions = {
        from: `Artha Support <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message // We will send HTML emails
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;