const express = require("express");
const router = express.Router();
const pool = require('../config/db');
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { requireAuth, requireRole } = require("../utils/middleWare");

router.get("/department-registrations", requireAuth, requireRole("admin"), wrapAsync(async (req, res) => {
    const adminQuery = await pool.query("SELECT department FROM faculty WHERE user_id = $1", [req.user.userId]);
    if (adminQuery.rows.length === 0) throw new ExpressError(404, "Admin profile not found.");
    
    const adminDepartment = adminQuery.rows[0].department;

    const registrationsQuery = `
        SELECT 
            s.user_id,
            s.enrolment_no, 
            s.full_name, 
            s.semester,
            COUNT(rs.subject_code)::integer AS subject_count,
            COALESCE(SUM(sub.credits), 0)::integer AS total_credits
        FROM students s
        JOIN subjects_regd rs ON s.user_id = rs.user_id 
        JOIN subjects_offrd sub ON rs.subject_code = sub.subject_code
        WHERE s.department = $1
        GROUP BY s.user_id, s.enrolment_no, s.full_name, s.semester
        ORDER BY s.semester DESC, s.enrolment_no ASC
    `;

    const result = await pool.query(registrationsQuery, [adminDepartment]);
    res.status(200).json({ success: true, data: result.rows });
}));

router.get("/student-details/:userId", requireAuth, requireRole("admin"), wrapAsync(async (req, res) => {
    const { userId } = req.params;

    // Fetch the list of subjects this student verified
    const subjectsQuery = await pool.query(`
        SELECT sr.subject_code, so.subject_name, so.credits
        FROM subjects_regd sr
        JOIN subjects_offrd so ON sr.subject_code = so.subject_code
        WHERE sr.user_id = $1
    `, [userId]);

    const studentQuery = await pool.query(`
        SELECT form_image_url FROM students WHERE user_id = $1
    `, [userId]);

    res.status(200).json({
        success: true,
        subjects: subjectsQuery.rows,
        imageUrl: studentQuery.rows[0]?.form_image_url || null
    });
}));

module.exports = router;