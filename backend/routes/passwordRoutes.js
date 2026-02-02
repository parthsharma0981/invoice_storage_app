const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

// 🔑 FORGOT PASSWORD
router.post("/forgot-password", passwordController.forgotPassword);

// 🔑 RESET PASSWORD
router.post("/reset-password", passwordController.resetPassword);

module.exports = router;
