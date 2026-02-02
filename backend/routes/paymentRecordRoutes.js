const express = require("express");
const router = express.Router();
const paymentRecordController = require("../controllers/paymentRecordController");
const auth = require("../middleware/auth");

// ✅ Record a payment
router.post("/:id/payment", auth, paymentRecordController.recordPayment);

// ✅ Get payment history
router.get("/:id/payments", auth, paymentRecordController.getPaymentHistory);

module.exports = router;
