const Due = require("../models/Due");
const Customer = require("../models/Customer");
const Company = require("../models/Company");
const sendMail = require("../utils/sendMail");
const { dueCustomerMail, dueCompanyMail } = require("../utils/emailTemplates");

// ✅ Get dues (isolated)
exports.getDues = async (req, res) => {
    try {
        const dues = await Due.find({ adminId: req.user.adminId }).sort({
            createdAt: -1,
        });
        res.json(dues);
    } catch (err) {
        res.status(500).json({ msg: "Dues load nahi ho paye" });
    }
};

// ✅ Add/Update due + AUTO MAIL
exports.upsertDue = async (req, res) => {
    try {
        const { customerId, customerName, amount, notes } = req.body;

        if (!customerId) return res.status(400).json({ msg: "customerId required" });
        if (!amount) return res.status(400).json({ msg: "amount required" });

        // ✅ Upsert due (same customer + same admin => update amount)
        const updatedDue = await Due.findOneAndUpdate(
            { customerId, adminId: req.user.adminId },
            {
                $inc: { amount: Number(amount) },
                $set: {
                    customerName,
                    notes,
                    date: Date.now(),
                    adminId: req.user.adminId,
                },
            },
            { upsert: true, new: true }
        );

        // ✅ Fetch customer + company for emails
        const customer = await Customer.findOne({
            _id: customerId,
            adminId: req.user.adminId,
        });

        const company = await Company.findOne({ adminId: req.user.adminId });

        // ✅ Send Due Mail to Customer (AUTO)
        if (customer?.email) {
            await sendMail({
                to: customer.email,
                subject: `Due Updated: ₹${updatedDue.amount} | ${company?.name || "Company"}`,
                text: `Hello ${customer.name}, your due amount is ₹${updatedDue.amount}`,
                html: dueCustomerMail({
                    customerName: customer.name,
                    companyName: company?.name || "Company",
                    amount: updatedDue.amount,
                    notes: updatedDue.notes || "",
                }),
            });
        }

        // ✅ Send Due Mail to Company (AUTO)
        if (company?.email) {
            await sendMail({
                to: company.email,
                subject: `Customer Due Updated - ${customer?.name || customerName}`,
                text: `Due updated for ${customer?.name || customerName}, total ₹${updatedDue.amount}`,
                html: dueCompanyMail({
                    companyName: company?.name || "Company",
                    customerName: customer?.name || customerName,
                    amount: updatedDue.amount,
                }),
            });
        }

        res.status(201).json({ ok: true, due: updatedDue });
    } catch (err) {
        console.error("Due update error:", err);
        res.status(500).json({ msg: "Due update error" });
    }
};

// ✅ Delete/Clear due
exports.deleteDue = async (req, res) => {
    try {
        const due = await Due.findOne({
            _id: req.params.id,
            adminId: req.user.adminId,
        });
        if (!due) return res.status(404).json({ msg: "Due record nahi mila" });

        await Due.findByIdAndDelete(req.params.id);
        res.json({ ok: true, msg: "Due cleared successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error during clearing due" });
    }
};

// ✅ Admin Send Reminder (manual)
exports.sendBinder = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ msg: "Only Admin can send reminders" });
        }

        const due = await Due.findOne({
            _id: req.params.id,
            adminId: req.user.adminId,
        });
        if (!due) return res.status(404).json({ msg: "Due record not found" });

        const company = await Company.findOne({ adminId: req.user.adminId });

        const customer = await Customer.findOne({
            _id: due.customerId,
            adminId: req.user.adminId,
        });

        if (!customer?.email) {
            return res.status(400).json({ msg: "Customer email not available" });
        }

        // Customer mail
        await sendMail({
            to: customer.email,
            subject: `Reminder: Pending Due ₹${due.amount} | ${company?.name || "Company"}`,
            text: `Hello ${customer.name}, your due amount is ₹${due.amount}`,
            html: dueCustomerMail({
                customerName: customer.name,
                companyName: company?.name || "Company",
                amount: due.amount,
                notes: due.notes || "",
            }),
        });

        // Company mail
        if (company?.email) {
            await sendMail({
                to: company.email,
                subject: `Reminder Sent to Customer - ${customer.name}`,
                text: `Reminder sent to ${customer.name} for ₹${due.amount}`,
                html: dueCompanyMail({
                    companyName: company.name || "Company",
                    customerName: customer.name,
                    amount: due.amount,
                }),
            });
        }

        res.json({ ok: true, msg: "Reminder sent successfully" });
    } catch (err) {
        console.error("Reminder Error:", err);
        res.status(500).json({ msg: "Server error while sending reminder" });
    }
};
