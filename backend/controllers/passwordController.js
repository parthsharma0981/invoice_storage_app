const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Company = require("../models/Company");
const sendMail = require("../utils/sendMail");
const { passwordResetMail } = require("../utils/emailTemplates");

// Generate random token
function generateToken() {
    return crypto.randomBytes(32).toString("hex");
}

// 🔑 FORGOT PASSWORD - Send reset email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }

        // Find user by username (email)
        const user = await User.findOne({ username: email });
        if (!user) {
            // Don't reveal if user exists or not (security)
            return res.json({ ok: true, msg: "If this email exists, a reset link has been sent." });
        }

        // Generate reset token
        const resetToken = generateToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save to user
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Get company name for email
        const company = await Company.findOne({ adminId: user.role === "admin" ? user._id : user.adminId });

        // Build reset URL (uses env variable for production)
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        // Send email
        await sendMail({
            to: email,
            subject: "Password Reset Request - InvoicePro",
            html: passwordResetMail({
                userName: email,
                companyName: company?.name || "InvoicePro",
                resetUrl,
            }),
        });

        res.json({ ok: true, msg: "If this email exists, a reset link has been sent." });
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};

// 🔑 RESET PASSWORD - Update password with token
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ msg: "Token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        // Find user with valid token
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired reset token" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear token
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ ok: true, msg: "Password reset successfully. Please login with your new password." });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
