const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Company = require("../models/Company");

const sendMail = require("../utils/sendMail");
const { baseTemplate } = require("../utils/emailTemplates");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 🔥 Random password generator
function generatePassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// ✅ 1) CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) return res.status(400).json({ msg: "Amount is required" });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json({ ok: true, order });
  } catch (err) {
    console.error("Order Create Error:", err);
    res.status(500).json({ msg: "Razorpay order create failed" });
  }
});

// ✅ 2) VERIFY PAYMENT + REGISTER COMPANY + CREATE ADMIN
router.post("/verify-and-register", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      companyName,
      ownerName,
      email,
      plan,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ msg: "Payment details missing" });
    }

    if (!companyName || !ownerName || !email) {
      return res.status(400).json({ msg: "Company details missing" });
    }

    // ✅ Step 1: Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed" });
    }

    // ✅ Step 2: Check existing admin by email
    const existingAdmin = await User.findOne({ username: email });
    if (existingAdmin) {
      return res.status(400).json({ msg: "Admin already exists with this email" });
    }

    // ✅ Step 3: Create Admin User
    const plainPassword = generatePassword(10);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const adminUser = new User({
      username: email,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();

    // ✅ Step 4: Create Company
    const company = new Company({
      adminId: adminUser._id,
      name: companyName,
      email: email,
      phone1: "",
      address: "",
      gstin: "",
    });

    await company.save();

    // ✅ Step 5: Send password mail
    await sendMail({
      to: email,
      subject: "Your InvoicePro Admin Account Password ✅",
      html: baseTemplate({
        title: "Welcome to InvoicePro 🎉",
        bodyHtml: `
          <p>Hello <b>${ownerName}</b>,</p>
          <p>Your company <b>${companyName}</b> has been registered successfully.</p>
          
          <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb;">
            <p style="margin:0;"><b>Login Username:</b> ${email}</p>
            <p style="margin:6px 0 0;"><b>Password:</b> ${plainPassword}</p>
            <p style="margin:6px 0 0;"><b>Plan:</b> ${plan || "monthly"}</p>
          </div>

          <p style="margin-top:12px;">
            Please login and update your company details inside settings.
          </p>
        `,
      }),
    });

    // ✅ Step 6: Generate token (optional auto-login)
    const token = jwt.sign(
      { id: adminUser._id, role: "admin", adminId: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      ok: true,
      msg: "Payment verified & company registered successfully",
      token,
      user: {
        username: adminUser.username,
        role: adminUser.role,
        adminId: adminUser._id,
      },
    });
  } catch (err) {
    console.error("Verify/Register Error:", err);
    res.status(500).json({ msg: "Server error in verify-and-register" });
  }
});

module.exports = router;
