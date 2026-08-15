const nodemailer = require("nodemailer");

const getTransporter = () => {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("CRITICAL ERROR: GMAIL_USER or GMAIL_APP_PASSWORD is missing from the .env file.");
    }
    
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
};

const sendVerificationEmail = async (email, otp) => {
    try {
        const transporter = getTransporter(); 
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Ink2Data: Verify Your Official Email",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #1b3f6e; margin-bottom: 20px;">Welcome to Ink2Data</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                    Please verify your official IIEST email address to complete your registration.
                    Here is your 6-digit verification code:
                </p>
                <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 5px;">${otp}</span>
                </div>
                <p style="color: #475569; font-size: 14px;">
                    <strong>Note:</strong> This code will expire in 15 minutes.
                </p>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Registration OTP sent successfully to ${email}`);
    } catch (error) {
        console.error("Failed to send Registration OTP:", error);
        throw new Error("Failed to send email");
    }
};

const sendPasswordResetEmail = async (email, otp) => {
    try {
        const transporter = getTransporter(); 
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Ink2Data: Password Reset Code",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #1b3f6e; margin-bottom: 20px;">Password Reset Request</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                    We received a request to reset your password for your Ink2Data Academic Portal account. 
                    Please enter the following 6-digit verification code to proceed:
                </p>
                <div style="background-color: #f8fafc; border: 2px dashed #2563eb; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">${otp}</span>
                </div>
                <p style="color: #475569; font-size: 14px;">
                    <strong>Note:</strong> This code will expire in 15 minutes. If you did not request a password reset, please ignore this email.
                </p>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Password Reset OTP sent successfully to ${email}`);
    } catch (error) {
        console.error("Failed to send Password Reset OTP:", error);
        throw new Error("Failed to send email");
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};