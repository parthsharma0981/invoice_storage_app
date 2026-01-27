const cron = require("node-cron");
const Due = require("../models/Due");
const Customer = require("../models/Customer");
const Company = require("../models/Company");
const sendMail = require("../utils/sendMail");
const { dueCustomerMail } = require("../utils/emailTemplates");

const shouldSendReminder = (due) => {
  if (due.status === "PAID") return false;

  const intervalDays = due.reminderIntervalDays || 7;

  // first time reminder
  if (!due.lastReminderSentAt) return true;

  const diffMs = Date.now() - new Date(due.lastReminderSentAt).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= intervalDays;
};

const startDueReminderCron = () => {
  // ✅ Every day at 10:00 AM
  cron.schedule("0 10 * * *", async () => {
    try {
      console.log("⏳ Running Due Reminder Cron...");

      const dues = await Due.find({ status: "PENDING" });

      for (let due of dues) {
        // get customer email (Due me stored nahi hai to customer se lelo)
        let customerEmail = due.customerEmail;

        if (!customerEmail) {
          const customer = await Customer.findById(due.customerId);
          customerEmail = customer?.email || "";
        }

        if (!customerEmail) continue;

        if (!shouldSendReminder(due)) continue;

        const company = await Company.findOne({ adminId: due.adminId });

        await sendMail({
          to: customerEmail,
          subject: `Payment Due Reminder - ₹${due.amount}`,
          html: dueCustomerMail({
            customerName: due.customerName,
            companyName: company?.name || "Company",
            amount: due.amount,
            notes: due.notes,
          }),
        });

        // ✅ update reminder date
        due.lastReminderSentAt = new Date();
        await due.save();

        console.log(`✅ Reminder sent to ${customerEmail}`);
      }
    } catch (err) {
      console.log("❌ Due Reminder Cron Error:", err.message);
    }
  });

  console.log("✅ Due Reminder Cron Started (Daily 10AM)");
};

module.exports = startDueReminderCron;
