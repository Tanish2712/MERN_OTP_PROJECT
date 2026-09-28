const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    registerUser,
    sendOTP,
    verifyOTP,
    loginUser,
    getProfile
} = require("../controllers/authController");

const router = express.Router();


// Register
router.post("/register", registerUser);

// Get Profile
router.get("/profile", authMiddleware, getProfile);

// Send OTP
router.post("/send-otp", sendOTP);


// Verify OTP
router.post("/verify-otp", verifyOTP);


// Login
router.post("/login", loginUser);


module.exports = router;