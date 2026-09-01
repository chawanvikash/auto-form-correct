const { BrevoClient } = require('@getbrevo/brevo');

// 1. Initialize the new modern BrevoClient
const brevo = new BrevoClient({ 
    apiKey: process.env.BREVO_API_KEY 
});

const sendVerificationEmail = async (email, otp) => {
    try {
        // 2. Use the new sendTransacEmail method
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: "Ink2Data: Verify Your Official Email",
            htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #1b3f6e; margin-bottom: 20px;">Welcome to Ink2Data</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                    Please verify your official email address to complete your registration.
                    Here is your 6-digit verification code:
                </p>
                <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 5px;">${otp}</span>
                </div>
                <p style="color: #475569; font-size: 14px;">
                    <strong>Note:</strong> This code will expire in 15 minutes.
                </p>
            </div>
            `,
            sender: { name: "Ink2Data Portal", email: process.env.GMAIL_USER },
            to: [{ email: email }]
        });
        
        console.log(`📧 Registration OTP sent successfully! Message ID: ${result.messageId}`);
    } catch (error) {
        console.error("Brevo API Error (Registration):", error);
        throw new Error("Failed to send email via Brevo API.");
    }
};

const sendPasswordResetEmail = async (email, otp) => {
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: "Ink2Data: Password Reset Code",
            htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #1b3f6e; margin-bottom: 20px;">Password Reset Request</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                    We received a request to reset your password for your Ink2Data account. 
                    Please enter the following 6-digit verification code to proceed:
                </p>
                <div style="background-color: #f8fafc; border: 2px dashed #2563eb; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">${otp}</span>
                </div>
                <p style="color: #475569; font-size: 14px;">
                    <strong>Note:</strong> This code will expire in 15 minutes. If you did not request a password reset, please ignore this email.
                </p>
            </div>
            `,
            sender: { name: "Ink2Data Portal", email: process.env.GMAIL_USER },
            to: [{ email: email }]
        });

        console.log(`📧 Password Reset OTP sent successfully! Message ID: ${result.messageId}`);
    } catch (error) {
        console.error("Brevo API Error (Reset):", error);
        throw new Error("Failed to send email via Brevo API.");
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};