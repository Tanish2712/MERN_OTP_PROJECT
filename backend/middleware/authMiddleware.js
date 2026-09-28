const jwt = require("jsonwebtoken");

const User = require("../models/User");

const authMiddleware = async (req, res, next) => {

    try {

        // Get Authorization header
        const authHeader =
            req.headers.authorization;

        // Check header
        if (!authHeader) {

            return res.status(401).json({
                success: false,
                message: "Authorization token is required"
            });

        }

        // Check Bearer
        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });

        }

        // Get token
        const token =
            authHeader.split(" ")[1];

        // Verify token
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        // Find user
        const user = await User.findById(
            decoded.userId
        ).select("-password");

        // User doesn't exist
        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User not found"
            });

        }

        // Attach user to request
        req.user = user;

        // Continue
        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }
};

module.exports = authMiddleware;