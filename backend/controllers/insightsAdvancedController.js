const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const getDateNDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

// ===================================
// 1) PROFIT ANALYSIS (LAST X DAYS)
// ===================================
exports.getProfitAnalysis = async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const days = parseInt(req.query.days || "30");
    const fromDate = getDateNDaysAgo(days);

    const invoices = await Invoice.find({
      adminId: new mongoose.Types.ObjectId(adminId),
      createdAt: { $gte: fromDate },
    });

    const products = await Product.find({ adminId });

    let totalRevenue = 0;
    let totalCost = 0;

    invoices.forEach((inv) => {
      inv.items?.forEach((it) => {
        const prod = products.find((p) => String(p._id) === String(it.productId));
        const selling = Number(it.price || 0);
        const cost = Number(prod?.costPrice || 0);
        const qty = Number(it.qty || 0);

        totalRevenue += selling * qty;
        totalCost += cost * qty;
      });
    });

    const profit = totalRevenue - totalCost;
    const profitPercent =
      totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

    res.json({
      days,
      totalRevenue: Math.round(totalRevenue),
      totalCost: Math.round(totalCost),
      profit: Math.round(profit),
      profitPercent: Number(profitPercent),
    });
  } catch (err) {
    console.error("getProfitAnalysis error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================================
// 2) TOP CUSTOMERS + REPEAT CUSTOMERS
// ===================================
exports.getTopCustomers = async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const days = parseInt(req.query.days || "30");
    const fromDate = getDateNDaysAgo(days);

    const data = await Invoice.aggregate([
      {
        $match: {
          adminId: new mongoose.Types.ObjectId(adminId),
          createdAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: "$customerName",
          totalSpent: { $sum: "$grandTotal" },
          invoiceCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);

    const repeatCustomers = data.filter((c) => c.invoiceCount >= 2);

    res.json({
      topCustomers: data.map((x) => ({
        name: x._id || "Unknown",
        totalSpent: Math.round(x.totalSpent || 0),
        invoiceCount: x.invoiceCount || 0,
      })),
      repeatCustomers: repeatCustomers.map((x) => ({
        name: x._id || "Unknown",
        totalSpent: Math.round(x.totalSpent || 0),
        invoiceCount: x.invoiceCount || 0,
      })),
    });
  } catch (err) {
    console.error("getTopCustomers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================================
// 3) BEST SELLING BY MONTH/WEEK
// ===================================
exports.getBestSellingByRange = async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const range = req.query.range || "month"; // "week" or "month"
    const limit = parseInt(req.query.limit || "10");

    const days = range === "week" ? 7 : 30;
    const fromDate = getDateNDaysAgo(days);

    const topProducts = await Invoice.aggregate([
      {
        $match: {
          adminId: new mongoose.Types.ObjectId(adminId),
          createdAt: { $gte: fromDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQtySold: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { totalQtySold: -1 } },
      { $limit: limit },
    ]);

    res.json({
      range,
      days,
      topProducts: topProducts.map((p) => ({
        name: p._id,
        totalQtySold: p.totalQtySold,
        revenue: Math.round(p.revenue || 0),
      })),
    });
  } catch (err) {
    console.error("getBestSellingByRange error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================================
// 4) DEAD STOCK (NO SALE IN X DAYS)
// ===================================
exports.getDeadStock = async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const days = parseInt(req.query.days || "90");
    const fromDate = getDateNDaysAgo(days);

    const sales = await Invoice.aggregate([
      {
        $match: {
          adminId: new mongoose.Types.ObjectId(adminId),
          createdAt: { $gte: fromDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQtySold: { $sum: "$items.qty" },
        },
      },
    ]);

    const products = await Product.find({ adminId });

    const deadStock = products
      .map((p) => {
        const sold = sales.find((s) => s._id === p.name);
        const soldQty = sold ? sold.totalQtySold : 0;

        return {
          productId: p._id,
          name: p.name,
          category: p.category,
          stock: p.stock,
          soldLastDays: soldQty,
          suggestion:
            soldQty === 0 && p.stock > 0
              ? "Dead Stock: Give discount / bundle / clear stock"
              : "OK",
        };
      })
      .filter((x) => x.soldLastDays === 0 && x.stock > 0);

    res.json(deadStock);
  } catch (err) {
    console.error("getDeadStock error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================================
// 5) SMART REORDER (SUPPLIER + LEAD TIME)
// ===================================
exports.getSmartReorderWithLeadTime = async (req, res) => {
  try {
    const adminId = req.user.adminId;

    const days = parseInt(req.query.days || "30");
    const fromDate = getDateNDaysAgo(days);

    const sales = await Invoice.aggregate([
      {
        $match: {
          adminId: new mongoose.Types.ObjectId(adminId),
          createdAt: { $gte: fromDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQtySold: { $sum: "$items.qty" },
        },
      },
    ]);

    const products = await Product.find({ adminId });

    const result = products.map((p) => {
      const sold = sales.find((s) => s._id === p.name);
      const totalQtySold = sold ? sold.totalQtySold : 0;

      const avgDailySales = totalQtySold / days;

      const leadTimeDays = Number(p.leadTimeDays || 7);
      const requiredStockForLead = Math.ceil(avgDailySales * leadTimeDays);

      const suggestedReorderQty = Math.max(
        0,
        requiredStockForLead - Number(p.stock || 0)
      );

      let status = "OK";
      if (suggestedReorderQty > 0) status = "REORDER";

      return {
        productId: p._id,
        name: p.name,
        supplier: p.supplier || "Unknown",
        leadTimeDays,
        stock: p.stock,
        avgDailySales: Number(avgDailySales.toFixed(2)),
        requiredStockForLead,
        suggestedReorderQty,
        status,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("getSmartReorderWithLeadTime error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
