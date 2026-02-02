const Customer = require("../models/Customer");
const Company = require("../models/Company");
const sendMail = require("../utils/sendMail");
const { customerGreetingMail, customerAddedCompanyMail } = require("../utils/emailTemplates");

// Get customers (isolated)
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ adminId: req.user.adminId }).sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ msg: "Database Error" });
    }
};

// Add customer
exports.addCustomer = async (req, res) => {
    try {
        const newCustomer = new Customer({ ...req.body, adminId: req.user.adminId });
        const savedCustomer = await newCustomer.save();

        const company = await Company.findOne({ adminId: req.user.adminId });

        // Greeting mail to customer
        if (savedCustomer.email) {
            await sendMail({
                to: savedCustomer.email,
                subject: `Welcome to ${company?.name || "Our Store"} 🎉`,
                text: `Hello ${savedCustomer.name}, welcome!`,
                html: customerGreetingMail({
                    customerName: savedCustomer.name,
                    companyName: company?.name || "Company",
                }),
            });
        }

        // Mail to company
        if (company?.email) {
            await sendMail({
                to: company.email,
                subject: "New Customer Added",
                text: `New customer added: ${savedCustomer.name}`,
                html: customerAddedCompanyMail({
                    customerName: savedCustomer.name,
                    customerEmail: savedCustomer.email,
                    companyName: company.name || "Company",
                }),
            });
        }

        res.json(savedCustomer);
    } catch (err) {
        res.status(500).json({ msg: "Failed to add customer" });
    }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, adminId: req.user.adminId });
        if (!customer) return res.status(404).json({ msg: "Customer not found" });

        await Customer.findByIdAndDelete(req.params.id);
        res.json({ msg: "Customer deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error during customer delete" });
    }
};
