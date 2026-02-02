const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const auth = require("../middleware/auth");

// Get invoices (isolated)
router.get("/", auth, invoiceController.getInvoices);

// Create invoice
router.post("/", auth, invoiceController.createInvoice);

// Delete invoice
router.delete("/:id", auth, invoiceController.deleteInvoice);

module.exports = router;
