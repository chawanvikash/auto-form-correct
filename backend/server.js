if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const authRoutes = require("./routes/authRoutes");
const modelRoutes=require("./routes/modelRoutes");
const studentRoutes = require("./routes/studentRoutes");
const pool = require("./config/db"); 
const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/model",modelRoutes);
app.use("/api/student",studentRoutes);


pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Database Connection Error:", err.message);
    } else {
        console.log("PostgreSQL Connected 🟢");
    }
});

app.get("/", (req, res) => {
    res.send("API is running - Auto-Form-Correct Portal");
});

// 404 Handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Endpoint not found!"));
});

// Global Error Handler
app.use((err, req, res, next) => {

    // Always log the route that failed and the short message
    console.error(`[ERROR] ${req.method} ${req.path} >> ${err.message}`);
    
    // Only print the massive wall of red text if we are running locally
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack); 
    }
    
    // 2. Default Error Setup
    let { statusCode = 500, message = "Internal Server Error" } = err;

    // 3. PostgreSQL Specific Errors
    if (err.code === '23505') { 
        // FIX: Updated message to reflect the new multi-role 'identifier' schema
        statusCode = 400;
        message = "An account with this Email or Identifier (Enrolment No / Employee ID) already exists.";
        
    } else if (err.code === '22P02') { 
        // Invalid text representation (e.g., sending letters to an integer column)
        statusCode = 400;
        message = "Invalid data format provided to the database.";
    }

    // 4. JWT & Authentication Specific Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = "Invalid authentication token. Please log in again.";
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = "Your session has expired. Please log in again.";
    }

    // 5. Express JSON parse errors (React sent bad data)
    if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = "Invalid JSON payload sent to the server.";
    }

    // 6. The Standardized Response to React
    res.status(statusCode).json({ 
        success: false, 
        error: message 
    });
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 API Gateway running on port ${port}`);
});