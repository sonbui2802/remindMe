import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized: Missing or invalid token format" });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }

        // Verify the token using the same secret from authService
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // authService payload used 'userId', but our controllers expect 'user_id'
        // We map it here to ensure compatibility without changing existing code.
        req.user = {
            user_id: decoded.userId,
            role: decoded.role,
            gmail: decoded.gmail
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

export default authMiddleware;