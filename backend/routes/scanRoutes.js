const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
// const pool = require("../config/db");
//const { requireAuth } = require("../utils/middleWare");

const upload = multer({ storage });

// Temporarily removing requireAuth for easy testing, add it back later!
router.post("/upload-and-verify", upload.single("document"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No document provided." });
        }

        const cloudImageUrl = req.file.path; 
        console.log("✅ File securely uploaded to Cloudinary!");
    
        const mockAiData = {
            student_name: "Rahul Das",
            registration_no: "510419093", 
            semester: 6,
            subjects: ["CS3201", "CS3202", "CS3203", "CS3204", "CS3224"] 
        };

        res.json({ 
            success: true, 
            message: "Upload and Mock Verification Complete!", 
            document_url: cloudImageUrl,
            verified_data: mockAiData
        });

    } catch (error) {
        console.error("Upload/Verification Error:", error);
        res.status(500).json({ success: false, error: "Server error during processing." });
    }
});

module.exports = router;