const mongoose = require("mongoose");

const DueSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerName: { type: String, required: true },

    // ✅ customer email (reminder ke liye required)
    customerEmail: { type: String, default: "" },

    amount: { type: Number, required: true },
    notes: { type: String, default: "" },

    // ✅ Due status (PENDING / PAID)
    status: { type: String, default: "PENDING" },

    // ✅ Reminder system fields
    lastReminderSentAt: { type: Date, default: null },
    reminderIntervalDays: { type: Number, default: 7 },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate due entries for same customer in same company
DueSchema.index({ adminId: 1, customerId: 1 }, { unique: true });

module.exports = mongoose.model("Due", DueSchema);
