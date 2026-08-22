require("dotenv").config();
const dns = require('dns');                     
dns.setDefaultResultOrder('ipv4first');
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");
const { GoogleGenAI } = require("@google/genai"); 
const pool = require("../config/db");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { requireAuth, requireRole } = require("../utils/middleWare");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



// STEP 1: Upload to Cloudinary
router.post("/upload-image", requireAuth, requireRole("student"), upload.single("registration_form"), async (req, res, next) => {
    try {

        if (!req.file) {
            return res.status(400).json({ error: "No image file provided by Multer." });
        }

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
            folder: "semester_registrations",
        });

        console.log("4. Cloudinary Success!");
        res.status(200).json({ success: true, imageUrl: cloudinaryResponse.secure_url });
        
    } catch (error) {
        
        console.error(error);

        res.status(500).json({ 
            success: false, 
            message: "Upload crashed. Check backend terminal.",
            rawError: error
        });
    }
});


// STEP 2: Extract Data via Gemini OCR (SDK)
router.post("/extract-data", requireAuth, requireRole("student"), wrapAsync(async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) throw new ExpressError(400, "Image URL is required.");

    const imageResp = await fetch(imageUrl);
    const imageBuffer = await imageResp.arrayBuffer();
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const prompt = `
        Analyze this IIEST Shibpur Semester Registration Form. 
        Extract the handwritten or typed text and return ONLY a strict JSON object. 
        
        CRITICAL RULES:
        1. "semester" MUST be an Integer (e.g., 5). Strip away "th" or "V".
        2. "enrolment_no" MUST be exactly 10 characters (e.g., "2024CSB086"). Remove spaces.
        3. EXACT EXTRACTION: You MUST extract the "subject_code" exactly as it is handwritten. Do NOT auto-correct course codes.
        4. "subject_type": Look at the table headers. If the subject is in the Theory table, set this to "Theory". If in the Practical/Laboratory table, set to "Practical".
        5. "subject_category": Extract "Core" or "Elective" if written. The Practical table does NOT have this column, so set it to null.
        
        Required JSON Structure:
        {
            "name": "String",
            "department": "String",
            "programme": "String",
            "semester": Number,
            "enrolment_no": "String",
            "g_suite_id": "String",
            "mobile_no": "String",
            "subjects": [
                { 
                  "subject_code": "String", 
                  "subject_name": "String", 
                  "subject_type": "String",
                  "subject_category": "String" | null, 
                  "credit": Number 
                }
            ]
        }
    `;

    
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
            prompt,
            { inlineData: { data: Buffer.from(imageBuffer).toString("base64"), mimeType: mimeType } }
        ]
    });

    const cleanJsonString = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
    const extractedData = JSON.parse(cleanJsonString);

    res.status(200).json({ success: true, extractedData });
}));



// STEP 3: Verify Data (Strict Normalized Matching)
router.post("/verify-data", requireAuth, requireRole("student"), wrapAsync(async (req, res) => {
    const { enrolment_no, extractedData, imageUrl } = req.body;

    // 1. Fetch Student Data
    const dbUserResult = await pool.query(
        `SELECT u.user_id, u.email, s.full_name, s.enrolment_no, s.semester, s.programme, s.department, s.phone_no 
         FROM users u JOIN students s ON u.user_id = s.user_id 
         WHERE s.enrolment_no = $1`,
        [enrolment_no]
    );
    const dbUser = dbUserResult.rows[0];
    if (!dbUser) throw new ExpressError(404, "Student record not found.");

    // 2. Strict Lowercase & Type Matching
    const cleanStr = (str) => (str || "").toString().toLowerCase().trim();
    
    const isNameMatch = cleanStr(extractedData.name).includes(cleanStr(dbUser.full_name)) || cleanStr(dbUser.full_name).includes(cleanStr(extractedData.name));
    const isDeptMatch = cleanStr(extractedData.department) === cleanStr(dbUser.department);
    const isProgMatch = cleanStr(extractedData.programme) === cleanStr(dbUser.programme);
    const isSemMatch = parseInt(extractedData.semester) === parseInt(dbUser.semester);
    
    const cleanEnrolment = (extractedData.enrolment_no || "").trim();
    const isEnrolmentMatch = cleanEnrolment.length === 10 && cleanEnrolment === dbUser.enrolment_no;
    const isEmailMatch = cleanStr(extractedData.g_suite_id) === cleanStr(dbUser.email);
    
    // Allow slight variations in phone number (e.g., +91 prefix)
    const isPhoneMatch = cleanStr(extractedData.mobile_no).slice(-10) === cleanStr(dbUser.phone_no).slice(-10);

    // 3. Subject Verification (Fetch ALL columns including subject_type)
    const offeredSubjectsResult = await pool.query(
        `SELECT subject_code, subject_name, subject_category, subject_type, credits FROM subjects_offrd 
         WHERE semester = $1 AND programme = $2 AND department = $3`,
        [dbUser.semester, dbUser.programme, dbUser.department]
    );
    const offeredSubjects = offeredSubjectsResult.rows;
    
    let subjectErrors = [];
    const extractedCodes = (extractedData.subjects || []).map(s => s.subject_code);

    // Rule A: Ensure all mandatory Core subjects were extracted
    const requiredCores = offeredSubjects.filter(s => s.subject_category.toLowerCase() === 'core');
    requiredCores.forEach(core => {
        if (!extractedCodes.includes(core.subject_code)) {
            subjectErrors.push(`Missing mandatory core subject: ${core.subject_code}`);
        }
    });

    // Rule B: Elective Validation (Exactly 1 Theory, Exactly 1 Practical)
    const extractedElectives = offeredSubjects.filter(s => 
        s.subject_category.toLowerCase() === 'elective' && 
        extractedCodes.includes(s.subject_code)
    );

    const extractedTheoryElectives = extractedElectives.filter(s => s.subject_type.toLowerCase() === 'theory');
    const extractedPracticalElectives = extractedElectives.filter(s => 
        s.subject_type.toLowerCase().includes('practical') || 
        s.subject_type.toLowerCase().includes('laboratory') ||
        s.subject_type.toLowerCase().includes('sessional')
    );

    if (extractedTheoryElectives.length !== 1) {
        subjectErrors.push(`Invalid Elective Selection: Exactly 1 Theory Elective required (Found: ${extractedTheoryElectives.length}).`);
    }
    if (extractedPracticalElectives.length !== 1) {
        subjectErrors.push(`Invalid Elective Selection: Exactly 1 Practical/Lab Elective required (Found: ${extractedPracticalElectives.length}).`);
    }

    // Rule C: Check if every extracted subject matches the DB exactly
    (extractedData.subjects || []).forEach(scannedSub => {
        const dbSub = offeredSubjects.find(s => s.subject_code === scannedSub.subject_code);
        
        if (!dbSub) {
            subjectErrors.push(`Invalid subject code detected: ${scannedSub.subject_code}`);
        } else {
            // 1. Check Credits
            if (parseInt(scannedSub.credit) !== parseInt(dbSub.credits)) {
                subjectErrors.push(`Credit mismatch for ${scannedSub.subject_code}`);
            }
            
            // 2. Only strictly check the category if the student actually provided it (Theory table)
            if (scannedSub.subject_category && cleanStr(scannedSub.subject_category) !== "n/a") {
                if (cleanStr(scannedSub.subject_category) !== cleanStr(dbSub.subject_category)) {
                    subjectErrors.push(`Category mismatch for ${scannedSub.subject_code}`);
                }
            }

            // This ensures the frontend displays "Core"/"Elective" and "Theory"/"Practical" properly instead of N/A
            scannedSub.subject_category = dbSub.subject_category;
            scannedSub.subject_type = dbSub.subject_type;
        }
    });

    const isOverallSuccess = isNameMatch && isDeptMatch && isProgMatch && isSemMatch && isEnrolmentMatch && isEmailMatch && isPhoneMatch && subjectErrors.length === 0;

    const payload = {
        scanned_data: extractedData,
        database_data: dbUser,
        database_subjects: offeredSubjects,
        subjectErrors
    };

    if (isOverallSuccess) {
        return res.status(200).json({
            success: true,
            message: "Verification successful.",
            ...payload
        });
    } else {
        return res.status(400).json({
            success: false,
            message: "Discrepancies found.",
            discrepancies: payload
        });
    }
}));


// STEP 4: Final Registration
router.post("/register-subjects", requireAuth, requireRole("student"), wrapAsync(async (req, res) => {

    const { enrolment_no, subjects, imageUrl } = req.body; 

    try {
        await pool.query("BEGIN");

        const userRes = await pool.query("SELECT user_id FROM students WHERE enrolment_no = $1", [enrolment_no]);
        if (userRes.rows.length === 0) throw new ExpressError(404, "Student not found.");
        const userId = userRes.rows[0].user_id;

        if (imageUrl) {
            await pool.query(
                "UPDATE students SET form_image_url = $1 WHERE user_id = $2",
                [imageUrl, userId]
            );
        }

        // Insert the subjects
        for (let sub of subjects) {
            await pool.query(
                `INSERT INTO subjects_regd (user_id, subject_code) 
                 VALUES ($1, $2)
                 ON CONFLICT (user_id, subject_code) DO NOTHING`,
                [userId, sub.subject_code]
            );
        }

        await pool.query("COMMIT");
        res.status(200).json({ success: true, message: "Registration officially completed." });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error(error);
        throw new ExpressError(500, "Failed to register subjects in database.");
    }
}));

module.exports = router;