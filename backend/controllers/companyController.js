const Company = require("../models/Company");

// GET own company
exports.getCompany = async (req, res) => {
    try {
        const company = await Company.findOne({ adminId: req.user.adminId });
        res.json(company);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// SAVE/UPDATE own company
exports.updateCompany = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Admin only" });

    try {
        let company = await Company.findOne({ adminId: req.user.adminId });

        if (company) {
            company = await Company.findByIdAndUpdate(
                company._id,
                { ...req.body, adminId: req.user.adminId },
                { new: true }
            );
        } else {
            company = new Company({ ...req.body, adminId: req.user.adminId });
            await company.save();
        }

        res.json(company);
    } catch (err) {
        res.status(500).json({ msg: "Failed to save company details" });
    }
};
