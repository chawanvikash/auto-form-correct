require('dotenv').config();
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER, 
                pass: process.env.GMAIL_APP_PASSWORD 
            }
        });

        const mailOptions = {
            from: `"IIEST Portal" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Verification Code - IIEST Portal",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; margin: 0 auto; border-radius: 8px;">
                    <h2 style="color: #333;">Welcome to the Department Portal!</h2>
                    <p style="color: #555; font-size: 16px;">To verify your email address, please use the following One-Time Password (OTP):</p>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #0d6efd; letter-spacing: 5px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #888; font-size: 14px;">This code expires in 15 minutes.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent successfully via Gmail! Message ID: ${info.messageId}`);

    } catch (error) {
        console.error("🚨 Nodemailer Error:", error);
        throw new Error("Failed to send verification email via Gmail.");
    }
};

module.exports = {
    sendVerificationEmail
};