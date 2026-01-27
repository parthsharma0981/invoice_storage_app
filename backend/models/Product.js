const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true },
    category: { type: String, default: "General" },

    price: { type: Number, required: true }, // selling price
    costPrice: { type: Number, default: 0 }, // ✅ NEW (purchase price)

    stock: { type: Number, default: 0 },

    supplier: { type: String, default: "" }, // ✅ NEW
    leadTimeDays: { type: Number, default: 7 }, // ✅ NEW (supplier delivery time)

    hsn: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
