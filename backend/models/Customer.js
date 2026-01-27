const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: String,
    phone: String,
    email: String,
    address: String,
    gstin: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
