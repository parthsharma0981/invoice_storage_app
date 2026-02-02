const Invoice = require("../models/Invoice");

// ✅ Record a payment against an invoice
exports.recordPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, method, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: "Valid payment amount is required" });
        }

        const invoice = await Invoice.findOne({
            _id: id,
            adminId: req.user.adminId
        });

        if (!invoice) {
            return res.status(404).json({ msg: "Invoice not found" });
        }

        const remainingAmount = invoice.grandTotal - invoice.paidAmount;

        if (amount > remainingAmount) {
            return res.status(400).json({
                msg: `Payment exceeds remaining balance. Only ₹${remainingAmount} is due.`
            });
        }

        // Add payment to history
        invoice.payments.push({
            amount: Number(amount),
            method: method || "cash",
            notes: notes || "",
            date: new Date()
        });

        // Update paid amount
        invoice.paidAmount = (invoice.paidAmount || 0) + Number(amount);

        // Update payment status
        if (invoice.paidAmount >= invoice.grandTotal) {
            invoice.paymentStatus = "paid";
        } else if (invoice.paidAmount > 0) {
            invoice.paymentStatus = "partial";
        }

        await invoice.save();

        res.json({
            ok: true,
            msg: "Payment recorded successfully",
            invoice
        });
    } catch (err) {
        console.error("Record Payment Error:", err);
        res.status(500).json({ msg: "Server error recording payment" });
    }
};

// ✅ Get payment history for an invoice
exports.getPaymentHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findOne({
            _id: id,
            adminId: req.user.adminId
        }).select("invoiceNo customerName grandTotal paidAmount paymentStatus payments");

        if (!invoice) {
            return res.status(404).json({ msg: "Invoice not found" });
        }

        res.json({
            invoiceNo: invoice.invoiceNo,
            customerName: invoice.customerName,
            grandTotal: invoice.grandTotal,
            paidAmount: invoice.paidAmount,
            remaining: invoice.grandTotal - invoice.paidAmount,
            paymentStatus: invoice.paymentStatus,
            payments: invoice.payments
        });
    } catch (err) {
        console.error("Get Payment History Error:", err);
        res.status(500).json({ msg: "Server error" });
    }
};
