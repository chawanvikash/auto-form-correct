const jwt = require('jsonwebtoken');
const ExpressError = require('../utils/ExpressError');



// 1. Authentication Middleware (Verifies JWT)

const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ExpressError(401, "Access Denied. Please log in."));
        }
        
        const token = authHeader.split(' ')[1];      
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);        
        
        req.user = decodedPayload;  
        next();

    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return next(new ExpressError(401, "Invalid or expired token. Please log in again."));
    }
};


// 2. Role Verification Middleware (Checks User Role)

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure the user object exists (meaning requireAuth ran successfully first)
        if (!req.user || !req.user.role) {
            return next(new ExpressError(401, "Unauthorized. User role not found."));
        }

        // Check if the user's role is in the list of allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ExpressError(403, "Forbidden. You do not have permission to access this resource."));
        }

        // If they pass, allow the request to proceed
        next();
    };
};

module.exports = { requireAuth, requireRole };