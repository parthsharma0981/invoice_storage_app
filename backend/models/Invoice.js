const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    invoiceNo: { type: String, required: true },

    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, required: true },

    items: [
      {
        productId: String,
        name: String,
        price: Number,
        qty: Number,
        hsn: String,
        unit: { type: String, default: "Pcs." },
      },
    ],

    subtotal: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },

    discount: { type: Number, default: 0 },
    roundedOff: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    transportMethod: { type: String, default: "self" },
    vehicleNo: { type: String, default: "" },
    placeOfSupply: { type: String, default: "Chandigarh" },
    hasEwayBill: { type: String, default: "no" },
    ewayBillNo: { type: String, default: "" },

    // ✅ Payment tracking for partial payments
    paidAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid"
    },
    payments: [{
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      method: { type: String, default: "cash" }, // cash, upi, bank, card
      notes: { type: String, default: "" }
    }],

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
