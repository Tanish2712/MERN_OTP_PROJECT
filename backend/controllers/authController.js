const bcrypt = require("bcryptjs");

const User = require("../models/User");

const generateOTP   = require("../utils/generateOTP");
const sendOTPEmail  = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");


// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check existing user
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ==========================================
// SEND OTP
// ==========================================

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check verification
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // OTP expires after 5 minutes
        const otpExpiry = new Date(
            Date.now() + 5 * 60 * 1000
        );

        // Save OTP
        user.otp = otp;
        user.otpExpiry = otpExpiry;

        await user.save();

        // Send email
        await sendOTPEmail(
            normalizedEmail,
            otp
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("Send OTP error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send OTP"
        });
    }
};


// ==========================================
// VERIFY OTP
// ==========================================

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // OTP exists?
        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP"
            });
        }

        // OTP expired?
        if (new Date() > user.otpExpiry) {

            user.otp = null;
            user.otpExpiry = null;

            await user.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP"
            });
        }

        // OTP incorrect?
        if (user.otp !== otp.toString()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Verify email
        user.isVerified = true;

        // Remove OTP
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        console.error("Verify OTP error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP"
        });
    }
};

// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }

        // Normalize email
        const normalizedEmail = email
            .toLowerCase()
            .trim();

        // Find user
        const user = await User.findOne({
            email: normalizedEmail
        });

        // User not found
        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // Check email verification
        if (!user.isVerified) {

            return res.status(403).json({
                success: false,
                message: "Please verify your email first"
            });

        }

        // Compare password
        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );

        // Wrong password
        if (!isPasswordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // Generate JWT
        const token = generateToken(user._id);

        // Send response
        return res.status(200).json({

            success: true,

            message: "Login successful",

            data: {

                token: token,

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified
                }

            }

        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};

// ==========================================
// GET PROFILE
// ==========================================

const getProfile = async (req, res) => {

    try {

        return res.status(200).json({

            success: true,

            message: "Profile fetched successfully",

            data: {
                user: req.user
            }

        });

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }
};


module.exports = {
    registerUser,
    sendOTP,
    verifyOTP,
    loginUser,
    getProfile
};