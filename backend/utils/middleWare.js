const jwt = require('jsonwebtoken');
const ExpressError = require('../utils/ExpressError');

const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ExpressError(401, "Access Denied. Please log in.");
        }
        const token = authHeader.split(' ')[1];      
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);        
        req.user = decodedPayload;  
        next();

    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        throw new ExpressError(401, "Invalid or expired token. Please log in again.");
    }
};

module.exports = { requireAuth };