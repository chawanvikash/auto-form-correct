const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); 
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email.js');
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const crypto = require("crypto");

router.post("/register", wrapAsync(async (req, res) => {
    // Note: Accepting 'identifier' which handles both enrolment_no and employee_id
    const { 
        email, password, identifier, enrolment_no, employee_id, full_name, 
        semester, programme, department, phone_no, role 
    } = req.body;

    const actualIdentifier = identifier || enrolment_no || employee_id;
    let finalRole = role === 'faculty' ? 'faculty' : 'student';
    
    if (role === 'admin') {
        const authorizedAdmins = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim());
        if (!authorizedAdmins.includes(email)) {
            throw new ExpressError(403, "Unauthorized: This email is not approved for Admin registration.");
        }
        finalRole = 'admin';
    } else {
        const officialDomain = ".iiests.ac.in";    
        if (!email.endsWith(officialDomain)) {  
            throw new ExpressError(400, "Registration denied. You must use an official IIEST email address.");
        }
    }

    // Check if user exists across all profile tables
    const existingUser = await pool.query(
        `SELECT u.email FROM users u 
         LEFT JOIN students s ON u.user_id = s.user_id 
         LEFT JOIN faculty f ON u.user_id = f.user_id 
         WHERE u.email = $1 OR s.enrolment_no = $2 OR f.employee_id = $2`, 
        [email, actualIdentifier]
    );

    if (existingUser.rows.length > 0) {
        throw new ExpressError(400, "An active account with this Email or Identifier already exists. Please log in.");
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60000); 

    // Nullify academic fields if faculty
    const finalSemester = finalRole === 'student' ? semester : null;
    const finalProgramme = finalRole === 'student' ? programme : null;
    
    await pool.query(
        `INSERT INTO pending_registrations 
        (email, identifier, full_name, password_hash, semester, programme, department, phone_no, role, otp_code, otp_expires) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO UPDATE SET 
            identifier = EXCLUDED.identifier, 
            full_name = EXCLUDED.full_name, 
            password_hash = EXCLUDED.password_hash, 
            semester = EXCLUDED.semester, 
            programme = EXCLUDED.programme, 
            department = EXCLUDED.department, 
            phone_no = EXCLUDED.phone_no, 
            role = EXCLUDED.role, 
            otp_code = EXCLUDED.otp_code, 
            otp_expires = EXCLUDED.otp_expires`,
        [email, actualIdentifier, full_name, hashedPassword, finalSemester, finalProgramme, department, phone_no, finalRole, otp, otpExpires]
    );
  
    await sendVerificationEmail(email, otp);

    res.status(201).json({ 
        success: true, 
        message: "OTP sent to your official IIEST email. Please verify to complete registration." 
    });
}));


router.post("/verify-otp", wrapAsync(async (req, res) => {
    const { email, otp } = req.body;

    const pendingResult = await pool.query("SELECT * FROM pending_registrations WHERE email = $1", [email]);
    const pendingUser = pendingResult.rows[0];

    if (!pendingUser) {
        throw new ExpressError(404, "Registration session not found. Please register again.");
    }
    if (pendingUser.otp_code !== otp) {
        throw new ExpressError(400, "Invalid OTP code.");
    }
    if (new Date() > new Date(pendingUser.otp_expires)) {
        throw new ExpressError(400, "OTP has expired. Please register again.");
    }

    let newUserId;

    try {
        await pool.query("BEGIN");

        // 1. Insert into centralized auth vault
        const newUserResult = await pool.query(
            `INSERT INTO users (email, password_hash, role, is_verified) 
             VALUES ($1, $2, $3, $4) RETURNING user_id`,
            [pendingUser.email, pendingUser.password_hash, pendingUser.role, true]
        );
        newUserId = newUserResult.rows[0].user_id;

        // 2. Insert into the correct profile table based on role
        if (pendingUser.role === 'student') {
            await pool.query(
                `INSERT INTO students (enrolment_no, user_id, full_name, semester, programme, department, phone_no) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [pendingUser.identifier, newUserId, pendingUser.full_name, pendingUser.semester, pendingUser.programme, pendingUser.department, pendingUser.phone_no]
            );
        } else if (pendingUser.role === 'faculty') {
            await pool.query(
                `INSERT INTO faculty (employee_id, user_id, full_name, department, phone_no) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [pendingUser.identifier, newUserId, pendingUser.full_name, pendingUser.department, pendingUser.phone_no]
            );
        }

        await pool.query("DELETE FROM pending_registrations WHERE email = $1", [email]);
        await pool.query("COMMIT");
    } catch (err) {
        await pool.query("ROLLBACK");
        console.error("Transaction Error:", err);
        throw new ExpressError(500, "Failed to create official account. Please contact support.");
    }

    const token = jwt.sign(
        { userId: newUserId, role: pendingUser.role, identifier: pendingUser.identifier },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(200).json({ 
        success: true, 
        message: "Email verified successfully! Logging you in...",
        token,
        user: {
            id: newUserId,
            name: pendingUser.full_name,
            email: pendingUser.email,
            role: pendingUser.role,
            identifier: pendingUser.identifier,
            department: pendingUser.department,
            semester: pendingUser.semester || null,
            programme: pendingUser.programme || null

        }
    });
}));

router.post("/login", wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    // Join with both profile tables using user_id
    const userResult = await pool.query(
        `SELECT u.user_id, u.email, u.password_hash, u.role, u.is_verified,
                s.full_name AS student_name, s.enrolment_no, s.semester, s.programme, s.department AS student_dept,
                f.full_name AS faculty_name, f.employee_id, f.department AS faculty_dept
         FROM users u 
         LEFT JOIN students s ON u.user_id = s.user_id 
         LEFT JOIN faculty f ON u.user_id = f.user_id 
         WHERE u.email = $1`, 
        [email]
    );
    const user = userResult.rows[0];

    if (!user) throw new ExpressError(401, "Invalid Credentials");

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new ExpressError(401, "Invalid Credentials");

    const identifier = user.role === 'student' ? user.enrolment_no : user.employee_id;
    const name = user.role === 'student' ? user.student_name : user.faculty_name;
    const department = user.role === 'student' ? user.student_dept : user.faculty_dept;

    const token = jwt.sign(
        { userId: user.user_id, role: user.role, identifier },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        success: true,
        token,
        user: {
            id: user.user_id,
            name,
            email: user.email,
            role: user.role,
            identifier,
            department,
            semester: user.semester || null,
            programme: user.programme || null
        }
    });
}));


router.post("/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully from server." });
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userQuery.rows.length === 0) {
            return res.json({ success: true, message: "If that email exists, an OTP has been sent." });
        }
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        const tokenExpires = new Date(Date.now() + 15 * 60 * 1000);

        // Store safely in the newly expanded password_resets table
        await pool.query(
            `INSERT INTO password_resets (email, otp_code, otp_expires) 
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE SET otp_code = EXCLUDED.otp_code, otp_expires = EXCLUDED.otp_expires`,
            [email, hashedOtp, tokenExpires]
        );

        // FIX 1: Calling the correct Password Reset email template
        await sendPasswordResetEmail(email, otp);
        
        // FIX 2: Added Dev Mode log so you can see the OTP instantly
        console.log(`\n🔄 [DEV MODE] PASSWORD RESET OTP for ${email} is: ${otp}\n`);

        res.json({ success: true, message: "OTP sent successfully." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, error: "Server error." });
    }
});

router.post("/verify-reset-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
        
        const resetQuery = await pool.query(
            "SELECT * FROM password_resets WHERE email = $1 AND otp_code = $2 AND otp_expires > NOW()",
            [email, hashedOtp]
        );

        if (resetQuery.rows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid or expired OTP." });
        }
        
        // Generate a hex token, hash it, and overwrite the OTP code to act as the final reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const newExpires = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            "UPDATE password_resets SET otp_code = $1, otp_expires = $2 WHERE email = $3",
            [hashedResetToken, newExpires, email]
        );

        res.json({ success: true, resetToken: resetToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error." });
    }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", wrapAsync(async (req, res) => {
    const { email } = req.body;

    // 1. Ensure the user actually has a pending registration session
    const pendingResult = await pool.query("SELECT * FROM pending_registrations WHERE email = $1", [email]);
    
    if (pendingResult.rows.length === 0) {
        throw new ExpressError(404, "Registration session not found or already verified. Please register again.");
    }

    // 2. Generate a fresh OTP and expiration time
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpires = new Date(Date.now() + 15 * 60000); 

    // 3. Update the existing row in the database with the new OTP
    await pool.query(
        "UPDATE pending_registrations SET otp_code = $1, otp_expires = $2 WHERE email = $3",
        [newOtp, newOtpExpires, email]
    );

    // 4. Send the new email
    await sendVerificationEmail(email, newOtp);
    
    // (Optional for Dev mode) Print it to the terminal so you don't have to wait for the email
    console.log(`\n🔄 [DEV MODE] NEW RESENT OTP for ${email} is: ${newOtp}\n`);

    res.status(200).json({ 
        success: true, 
        message: "A new 6-digit code has been sent to your official email." 
    });
}));

router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword, email } = req.body; // Pass email from frontend to avoid token collision

    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        
        const resetQuery = await pool.query(
            "SELECT * FROM password_resets WHERE email = $1 AND otp_code = $2 AND otp_expires > NOW()",
            [email, hashedToken]
        );

        if (resetQuery.rows.length === 0) {
            return res.status(400).json({ success: false, error: "Token is invalid or expired." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 1. Update the password in users table
        await pool.query(
            "UPDATE users SET password_hash = $1 WHERE email = $2",
            [hashedPassword, email]
        );

        // 2. Clean up the used token from the password_resets table
        await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

        res.json({ success: true, message: "Password reset successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Server error." });
    }
});

module.exports = router;