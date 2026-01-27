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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", CompanySchema);
