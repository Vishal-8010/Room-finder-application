const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];


        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        // Development-only debug logging to help diagnose admin access issues
        if (process.env.NODE_ENV === 'development') {
            console.log(`Auth: userId=${req.userId}, userRole=${req.userRole}`);
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

const adminOnlyMiddleware = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
    next();
};

module.exports = { authMiddleware, adminOnlyMiddleware };