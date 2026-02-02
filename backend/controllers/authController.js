const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const sendMail = require("../utils/sendMail");
const { staffCreatedCompanyMail } = require("../utils/emailTemplates");
const { canAddUser, getPlanLimits } = require("../utils/planLimits");

// 🔑 LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: "Invalid User" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Password" });

        const adminId = user.role === "admin" ? user._id : user.adminId;

        // Get company plan info
        const company = await Company.findOne({ adminId });
        const planInfo = company ? {
            plan: company.plan || "enterprise",
            billingCycle: company.billingCycle || "lifetime",
            isLifetime: company.isLifetime !== false,
            planExpiryDate: company.planExpiryDate,
        } : { plan: "enterprise", billingCycle: "lifetime", isLifetime: true };

        const token = jwt.sign({ id: user._id, role: user.role, adminId }, process.env.JWT_SECRET);

        res.json({
            token,
            user: { username: user.username, role: user.role, adminId },
            plan: planInfo,
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// 👥 GET USERS (Admin only + own staff)
exports.getUsers = async (req, res) => {
    try {
        if (req.user.role !== "admin") return res.status(403).json({ msg: "Only Admin can view users" });

        const users = await User.find({
            $or: [{ _id: req.user.adminId }, { adminId: req.user.adminId }],
        }).select("-password");

        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// ➕ ADD STAFF (Admin only)
exports.addUser = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Only Admin can add staff" });

    try {
        const { username, password } = req.body;

        // Check plan limits for adding staff
        const company = await Company.findOne({ adminId: req.user.adminId });
        const plan = company?.plan || "enterprise";

        // Count current users (admin + staff)
        const currentUserCount = await User.countDocuments({
            $or: [{ _id: req.user.adminId }, { adminId: req.user.adminId }]
        });

        if (!canAddUser(plan, currentUserCount)) {
            const limits = getPlanLimits(plan);
            return res.status(403).json({
                msg: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan allows only ${limits.maxUsers} user(s). Please upgrade to add more staff.`,
                upgradeRequired: true
            });
        }

        let existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role: "staff",
            adminId: req.user.adminId,
        });

        await newUser.save();

        // Mail to company
        const staffCompany = await Company.findOne({ adminId: req.user.adminId });
        if (staffCompany?.email) {
            await sendMail({
                to: staffCompany.email,
                subject: "New Staff Created",
                text: `New staff created: ${username}`,
                html: staffCreatedCompanyMail({
                    staffUsername: username,
                    companyName: staffCompany.name || "Company",
                }),
            });
        }

        res.json({
            ok: true,
            msg: "Staff Created",
            user: { username: newUser.username, role: newUser.role },
        });
    } catch (err) {
        res.status(500).json({ msg: "Error creating user" });
    }
};

// 🗑️ DELETE STAFF (Admin only + own staff)
exports.deleteUser = async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Only Admin can delete users" });

    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ msg: "User not found" });

        if (userToDelete._id.toString() === req.user.id) {
            return res.status(400).json({ msg: "You cannot delete yourself!" });
        }

        if (userToDelete.adminId?.toString() !== req.user.adminId.toString()) {
            return res.status(403).json({ msg: "Not allowed" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ ok: true, msg: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error during user delete" });
    }
};
