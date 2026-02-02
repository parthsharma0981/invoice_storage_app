const cron = require("node-cron");
const Product = require("../models/Product");
const Company = require("../models/Company");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");
const { lowStockAlertMail } = require("../utils/emailTemplates");

const startLowStockCron = () => {
    // ✅ Every day at 9:00 AM
    cron.schedule("0 9 * * *", async () => {
        try {
            console.log("⏳ Running Low Stock Alert Cron...");

            // Get all admin users
            const admins = await User.find({ role: "admin" });

            for (let admin of admins) {
                const adminId = admin._id;

                // Find products with stock <= lowStockThreshold
                const lowStockProducts = await Product.find({
                    adminId,
                    $expr: { $lte: ["$stock", { $ifNull: ["$lowStockThreshold", 5] }] },
                });

                if (lowStockProducts.length === 0) continue;

                // Get company email
                const company = await Company.findOne({ adminId });
                const email = company?.email || admin.username;

                if (!email) continue;

                // Send alert email
                await sendMail({
                    to: email,
                    subject: `⚠️ Low Stock Alert - ${lowStockProducts.length} Products`,
                    html: lowStockAlertMail({
                        companyName: company?.name || "Your Company",
                        lowStockProducts,
                    }),
                });

                console.log(`✅ Low stock alert sent to ${email} (${lowStockProducts.length} products)`);
            }
        } catch (err) {
            console.log("❌ Low Stock Cron Error:", err.message);
        }
    });

    console.log("✅ Low Stock Alert Cron Started (Daily 9AM)");
};

module.exports = startLowStockCron;
