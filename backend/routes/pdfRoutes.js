const express = require("express");
const router = express.Router();
const pdfController = require("../controllers/pdfController");
const auth = require("../middleware/auth");

// ✅ Generate PDF for invoice
router.get("/:id/pdf", auth, pdfController.generateInvoicePDF);

module.exports = router;
