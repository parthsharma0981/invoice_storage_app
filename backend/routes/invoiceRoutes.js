const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Company = require("../models/Company");
const auth = require("../middleware/auth");

const sendMail = require("../utils/sendMail");
const { invoiceCreatedCompanyMail, invoiceCreatedCustomerMail } = require("../utils/emailTemplates");

// Get invoices (isolated)
router.get("/", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ adminId: req.user.adminId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ msg: "Invoices load error" });
  }
});

// Create invoice
router.post("/", auth, async (req, res) => {
  try {
    const data = req.body;

    data.gstPercent = Number(data.gstPercent || 0);
    data.subtotal = Number(data.subtotal || 0);
    data.gstAmount = Number(data.gstAmount || 0);
    data.grandTotal = Number(data.grandTotal || 0);

    const newInvoice = new Invoice({ ...data, adminId: req.user.adminId });
    const savedInvoice = await newInvoice.save();

    const company = await Company.findOne({ adminId: req.user.adminId });

    // Mail to company
    if (company?.email) {
      await sendMail({
        to: company.email,
        subject: `Invoice Created - ${savedInvoice.invoiceNo}`,
        text: `Invoice created: ${savedInvoice.invoiceNo}`,
        html: invoiceCreatedCompanyMail({
          companyName: company.name || "Company",
          invoice: savedInvoice,
        }),
      });
    }

    // Mail to customer
    const customer = await Customer.findOne({
      _id: savedInvoice.customerId,
      adminId: req.user.adminId,
    });

    if (customer?.email) {
      await sendMail({
        to: customer.email,
        subject: `Invoice Generated - ${savedInvoice.invoiceNo}`,
        text: `Hello ${customer.name}, invoice created: ${savedInvoice.invoiceNo}`,
        html: invoiceCreatedCustomerMail({
          customerName: customer.name,
          invoice: savedInvoice,
          companyName: company?.name || "Company",
        }),
      });
    }

    res.status(201).json({ ok: true, invoice: savedInvoice });
  } catch (err) {
    console.error("Invoice Save Error:", err);
    res.status(500).json({ msg: "Invoice save nahi ho payi" });
  }
});

// Delete invoice
router.delete("/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, adminId: req.user.adminId });
    if (!invoice) return res.status(404).json({ msg: "Invoice not found" });

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ msg: "Invoice deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error during delete" });
  }
});

module.exports = router;
