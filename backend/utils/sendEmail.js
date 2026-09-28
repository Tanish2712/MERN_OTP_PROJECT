const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        const error = new Error(
            "Email credentials are missing. Please set EMAIL_USER and EMAIL_PASS in backend/.env"
        );
        error.code = "EMAIL_CONFIG_MISSING";
        throw error;
    }

    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass
    },
    tls: {
        rejectUnauthorized: false
    }
});

    const mailOptions = {
        from: `"OTP Verification" <${emailUser}>`,
        to: email,
        subject: "Email Verification OTP",
        text: `Your verification OTP is ${otp}. This OTP is valid for 5 minutes.`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        const message = error?.code === "EAUTH"
            ? "Gmail authentication failed. Use a valid Gmail App Password in EMAIL_PASS."
            : error?.message || "Unknown email sending error";

        const wrappedError = new Error(`Failed to send OTP email: ${message}`);
        wrappedError.originalError = error;
        throw wrappedError;
    }
};

module.exports = sendOTPEmail;