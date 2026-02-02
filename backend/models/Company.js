const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true },
    address: String,
    phone1: String,
    phone2: String,
    email: String,
    gstin: String,
    bankAccNo: { type: String, default: "" },
    ifscCode: { type: String, default: "" },

    // Subscription fields
    plan: { type: String, enum: ["starter", "pro", "enterprise"], default: "enterprise" },
    billingCycle: { type: String, enum: ["monthly", "yearly", "lifetime"], default: "lifetime" },
    planStartDate: { type: Date, default: Date.now },
    planExpiryDate: { type: Date, default: null },
    isLifetime: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", CompanySchema);
