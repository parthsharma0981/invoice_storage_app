const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Company = require("../models/Company");
const Product = require("../models/Product");
const sendMail = require("../utils/sendMail");
const { invoiceCreatedCompanyMail, invoiceCreatedCustomerMail } = require("../utils/emailTemplates");

// Get invoices (isolated)
exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ adminId: req.user.adminId }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ msg: "Invoices load error" });
    }
};

// Create invoice
exports.createInvoice = async (req, res) => {
    try {
        const data = req.body;

        data.gstPercent = Number(data.gstPercent || 0);
        data.subtotal = Number(data.subtotal || 0);
        data.gstAmount = Number(data.gstAmount || 0);
        data.grandTotal = Number(data.grandTotal || 0);

        // ✅ Stock validation - check all items before creating invoice
        const items = data.items || [];
        for (const item of items) {
            const product = await Product.findOne({
                _id: item.productId,
                adminId: req.user.adminId
            });

            if (!product) {
                return res.status(400).json({
                    msg: `Product "${item.name}" not found`
                });
            }

            if (product.stock <= 0) {
                return res.status(400).json({
                    msg: `"${product.name}" is out of stock!`
                });
            }

            if (item.qty > product.stock) {
                return res.status(400).json({
                    msg: `"${product.name}" has only ${product.stock} units. You tried to add ${item.qty}.`
                });
            }
        }

        const newInvoice = new Invoice({ ...data, adminId: req.user.adminId });
        const savedInvoice = await newInvoice.save();

        // ✅ Deduct stock after invoice is saved
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.qty }
            });
        }

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
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ _id: req.params.id, adminId: req.user.adminId });
        if (!invoice) return res.status(404).json({ msg: "Invoice not found" });

        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ msg: "Invoice deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error during delete" });
    }
};
