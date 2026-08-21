require("dotenv").config();
const dns = require('dns');                     
dns.setDefaultResultOrder('ipv4first');
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { requireAuth, requireRole } = require("../utils/middleWare");


router.get("/my-subjects/:enrolment_no", requireAuth, requireRole("student"), wrapAsync(async (req, res) => {
    const { enrolment_no } = req.params;

    const query = `
        SELECT o.subject_code, o.subject_name, o.subject_category, o.credits, o.subject_type, o.semester
        FROM subjects_regd r
        JOIN subjects_offrd o ON r.subject_code = o.subject_code
        JOIN students s ON r.user_id = s.user_id
        WHERE s.enrolment_no = $1
    `;
    
    const result = await pool.query(query, [enrolment_no]);
    
    res.status(200).json({
        success: true,
        count: result.rows.length,
        subjects: result.rows
    });
}));
// PUT: Update Student Semester
router.put("/update-semester", requireAuth, requireRole("student"), wrapAsync(async (req, res) => {
    const { semester } = req.body;
    
    if (!semester) throw new ExpressError(400, "Semester is required.");

    // FIXED: Changed req.user.user_id to req.user.userId
    const result = await pool.query(
        "UPDATE students SET semester = $1 WHERE user_id = $2 RETURNING *",
        [semester, req.user.userId] 
    );

    if (result.rowCount === 0) {
        throw new ExpressError(404, "Student record not found to update.");
    }

    res.status(200).json({ success: true, message: "Semester updated successfully." });
}));

// GET: Fetch Complete Student Profile
router.get("/profile", requireAuth, requireRole("student"), wrapAsync(async (req, res) => {
    const query = `
        SELECT s.full_name, s.enrolment_no, u.email, s.phone_no, s.department, s.programme, s.semester
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        WHERE s.user_id = $1 
    `;
    
    // Remember to use req.user.userId based on our earlier fix!
    const result = await pool.query(query, [req.user.userId]); 

    if (result.rows.length === 0) {
        throw new ExpressError(404, "Student profile not found.");
    }

    res.status(200).json({ success: true, profile: result.rows[0] });
}));


module.exports = router;