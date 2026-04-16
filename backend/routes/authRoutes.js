const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); 
const {sendVerificationEmail}  = require('../utils/email.js');
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");


router.post("/register", wrapAsync(async (req, res) => {
    const { 
        email, password, enrolment_no, full_name, 
        semester, programme, department, phone_no, role 
    } = req.body;

    let finalRole = 'student';
    
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
    const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1 OR enrolment_no = $2", 
        [email, enrolment_no]
    );
    if (existingUser.rows.length > 0) {
        throw new ExpressError(400, "An active, verified account with this Email or Enrolment Number already exists. Please log in.");
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60000); 

    
    await pool.query(
        `INSERT INTO pending_registrations 
        (email, enrolment_no, full_name, password_hash, semester, programme, department, phone_no, role, otp_code, otp_expires) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (email) DO UPDATE SET 
            enrolment_no = EXCLUDED.enrolment_no, 
            full_name = EXCLUDED.full_name, 
            password_hash = EXCLUDED.password_hash, 
            semester = EXCLUDED.semester, 
            programme = EXCLUDED.programme, 
            department = EXCLUDED.department, 
            phone_no = EXCLUDED.phone_no, 
            role = EXCLUDED.role, 
            otp_code = EXCLUDED.otp_code, 
            otp_expires = EXCLUDED.otp_expires`,
        [email, enrolment_no, full_name, hashedPassword, semester, programme, department, phone_no, finalRole, otp, otpExpires]
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

        await pool.query(
            `INSERT INTO students (enrolment_no, full_name, semester, programme, department, phone_no) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [pendingUser.enrolment_no, pendingUser.full_name, pendingUser.semester, pendingUser.programme, pendingUser.department, pendingUser.phone_no]
        );

        const newUserResult = await pool.query(
            `INSERT INTO users (email, password_hash, enrolment_no, role,is_verified) 
             VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
            [pendingUser.email, pendingUser.password_hash, pendingUser.enrolment_no, pendingUser.role,true]
        );
        newUserId = newUserResult.rows[0].user_id;

        await pool.query("DELETE FROM pending_registrations WHERE email = $1", [email]);

        await pool.query("COMMIT");
    } catch (err) {
        await pool.query("ROLLBACK");
        console.error("Transaction Error:", err);
        throw new ExpressError(500, "Failed to create official account. Please contact support.");
    }

    const token = jwt.sign(
        { userId: newUserId, role: pendingUser.role, enrolment_no: pendingUser.enrolment_no },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.status(200).json({ 
        success: true, 
        message: "Email verified successfully! Logging you in...",
        token,
        user: {
            name: pendingUser.full_name,
            email: pendingUser.email,
            role: pendingUser.role,
            enrolment_no: pendingUser.enrolment_no,
            semester: pendingUser.semester,
            programme: pendingUser.programme,
            department: pendingUser.department
        }
    });
}));

router.post("/login", wrapAsync(async (req, res) => {
    const { email, password } = req.body;

    const userResult = await pool.query(
    `SELECT u.*, s.full_name, s.semester, s.programme, s.department
     FROM users u 
     JOIN students s ON u.enrolment_no = s.enrolment_no 
     WHERE u.email = $1`, 
    [email]
);
    const user = userResult.rows[0];

    if (!user) {
        throw new ExpressError(401, "Invalid Credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new ExpressError(401, "Invalid Credentials");
    }

    const token = jwt.sign(
        { userId: user.user_id, role: user.role, enrolment_no: user.enrolment_no },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({
        success: true,
        token,
        user: {
            name: user.full_name,
            email: user.email,
            role: user.role,
            enrolment_no: user.enrolment_no,
            semester: user.semester,
            programme: user.programme,
            department: user.department
        }
    });
}));


router.post("/logout", (req, res) => {
    res.json({ 
        success: true, 
        message: "Logged out successfully from server." 
    });
});

module.exports = router;