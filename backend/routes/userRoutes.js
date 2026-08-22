const express = require("express");
const router = express.Router();
const pool = require('../config/db');
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { requireAuth } = require("../utils/middleWare"); 


router.get("/profile", requireAuth, wrapAsync(async (req, res) => {
    const { userId, role } = req.user;
    
    let query = "";
    
    if (role === 'student') {
        query = `
            SELECT s.full_name, s.enrolment_no, u.email, s.phone_no, s.department, s.programme, s.semester
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.user_id = $1
        `;
    } else {
        query = `
            SELECT f.full_name, f.employee_id, u.email, f.phone_no, f.department
            FROM faculty f
            JOIN users u ON f.user_id = u.user_id
            WHERE f.user_id = $1
        `;
    }
    
    const result = await pool.query(query, [userId]); 

    if (result.rows.length === 0) {
        throw new ExpressError(404, "Profile not found.");
    }

    res.status(200).json({ success: true, profile: result.rows[0] });
}));

module.exports = router;