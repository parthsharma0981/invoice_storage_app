const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

const getDateNDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

// ============================
// 1) SMART REORDER SUGGESTIONS
// ============================
exports.getReorderSuggestions = async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const days = parseInt(req.query.days || "30");
    const bufferDays = parseInt(req.query.bufferDays || "15");
    const lowStockDays = parseInt(req.query.lowStockDays || "5");

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
          _id: "$items.productId", // ✅ FIX: group by productId
          totalQtySold: { $sum: "$items.qty" },
          totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { totalQtySold: -1 } },
    ]);

    const products = await Product.find({ adminId });

    const suggestions = products.map((p) => {
      const sold = sales.find((s) => s._id?.toString() === p._id.toString());
      const totalQtySold = sold ? sold.totalQtySold : 0;

      const avgDailySales = totalQtySold / days;
      const daysLeft =
        avgDailySales > 0 ? Math.round(p.stock / avgDailySales) : null;

      const suggestedReorderQty =
        avgDailySales > 0
          ? Math.max(0, Math.ceil(avgDailySales * bufferDays - p.stock))
          : 0;

      let status = "OK";
      if (avgDailySales > 0 && daysLeft !== null && daysLeft <= lowStockDays)
        status = "URGENT";
      if (avgDailySales === 0 && p.stock > 0) status = "NO_DEMAND";

      return {
        productId: p._id,
        name: p.name,
        category: p.category,
        currentStock: p.stock,
        avgDailySales: Number(avgDailySales.toFixed(2)),
        daysLeft,
        suggestedReorderQty,
        status,
      };
    });

    suggestions.sort((a, b) => {
      const order = { URGENT: 1, OK: 2, NO_DEMAND: 3 };
      return order[a.status] - order[b.status];
    });

    res.json(suggestions);
  } catch (err) {
    console.error("getReorderSuggestions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// 2) BEST SELLING INSIGHTS
// ============================
exports.getBestSellingInsights = async (req, res) => {
  try {
    const adminId = req.user.adminId;
    const days = parseInt(req.query.days || "30");
    const fromDate = getDateNDaysAgo(days);

    const topProductsRaw = await Invoice.aggregate([
      {
        $match: {
          adminId: new mongoose.Types.ObjectId(adminId),
          createdAt: { $gte: fromDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId", // ✅ FIX: group by productId
          totalQtySold: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { totalQtySold: -1 } },
      { $limit: 10 },
    ]);

    // ✅ Fetch products to map names/categories
    const products = await Product.find(
      { adminId },
      { name: 1, category: 1 }
    );

    // ✅ Attach name/category to topProducts
    const topProducts = topProductsRaw.map((p) => {
      const prod = products.find((x) => x._id.toString() === p._id.toString());
      return {
        productId: p._id,
        name: prod?.name || "Unknown Product",
        category: prod?.category || "Unknown",
        totalQtySold: p.totalQtySold,
        revenue: Math.round(p.revenue || 0),
      };
    });

    // ✅ Category Map
    const categoryMap = {};
    topProducts.forEach((p) => {
      const cat = p.category || "Unknown";
      if (!categoryMap[cat]) categoryMap[cat] = { qty: 0, revenue: 0 };
      categoryMap[cat].qty += p.totalQtySold;
      categoryMap[cat].revenue += p.revenue;
    });

    const topCategories = Object.keys(categoryMap)
      .map((cat) => ({
        category: cat,
        totalQtySold: categoryMap[cat].qty,
        revenue: Math.round(categoryMap[cat].revenue),
      }))
      .sort((a, b) => b.totalQtySold - a.totalQtySold)
      .slice(0, 10);

    const topRevenueProducts = [...topProducts]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({ topProducts, topCategories, topRevenueProducts });
  } catch (err) {
    console.error("getBestSellingInsights error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// 3) LOW DEMAND PRODUCTS
// ============================
exports.getLowDemandProducts = async (req, res) => {
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
          _id: "$items.productId", // ✅ FIX: group by productId
          totalQtySold: { $sum: "$items.qty" },
        },
      },
    ]);

    const products = await Product.find({ adminId });

    const lowDemand = products
      .map((p) => {
        const sold = sales.find((s) => s._id?.toString() === p._id.toString());
        const soldLast = sold ? sold.totalQtySold : 0;

        return {
          productId: p._id,
          name: p.name,
          category: p.category,
          stock: p.stock,
          soldLastDays: soldLast,
          suggestion:
            soldLast === 0 && p.stock > 0
              ? "Avoid buying / give discount / clear stock"
              : "OK",
        };
      })
      .filter((x) => x.soldLastDays === 0 && x.stock > 0);

    res.json(lowDemand);
  } catch (err) {
    console.error("getLowDemandProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// 4) PRICE OPTIMIZATION
// ============================
exports.getPricingSuggestions = async (req, res) => {
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
          _id: "$items.productId", // ✅ FIX
          totalQtySold: { $sum: "$items.qty" },
        },
      },
      { $sort: { totalQtySold: -1 } },
    ]);

    const products = await Product.find({ adminId });

    const suggestions = products
      .map((p) => {
        const sold = sales.find((s) => s._id?.toString() === p._id.toString());
        const totalQtySold = sold ? sold.totalQtySold : 0;

        if (totalQtySold >= 30 && p.stock <= 10) {
          return {
            productId: p._id,
            name: p.name,
            currentPrice: p.price,
            suggestion: `Increase price by ₹${Math.max(
              5,
              Math.round(p.price * 0.05)
            )}`,
            reason: "Fast-selling + low stock",
          };
        }

        if (totalQtySold <= 2 && p.stock >= 20) {
          return {
            productId: p._id,
            name: p.name,
            currentPrice: p.price,
            suggestion: `Discount by ₹${Math.max(
              5,
              Math.round(p.price * 0.1)
            )}`,
            reason: "Slow-moving + high stock",
          };
        }

        return null;
      })
      .filter(Boolean);

    res.json(suggestions);
  } catch (err) {
    console.error("getPricingSuggestions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// 5) GROWTH IDEAS (Bundles)
// ============================
exports.getGrowthIdeas = async (req, res) => {
  try {
    const ideas = [
      {
        type: "bundle",
        title: "Mobile + Tempered Glass Combo",
        reason: "Mobile buyers often need screen protection",
      },
      {
        type: "bundle",
        title: "Charger + Cable Combo",
        reason: "Common cross-sell for charging accessories",
      },
      {
        type: "category",
        title: "Add Bluetooth Earbuds Category",
        reason: "High demand product in electronics retail",
      },
      {
        type: "pricing",
        title: "Keep fast-selling items slightly higher margin",
        reason: "Demand stable -> better profit",
      },
    ];

    res.json(ideas);
  } catch (err) {
    console.error("getGrowthIdeas error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// 6) MONTHLY REPORT (Chat Style)
// ============================
exports.getMonthlyReport = async (req, res) => {
  try {
    const adminId = req.user.adminId;

    const last30 = getDateNDaysAgo(30);
    const last60 = getDateNDaysAgo(60);

    const thisMonth = await Invoice.find({
      adminId,
      createdAt: { $gte: last30 },
    });

    const prevMonth = await Invoice.find({
      adminId,
      createdAt: { $gte: last60, $lt: last30 },
    });

    const sum = (arr) => arr.reduce((acc, x) => acc + (x.grandTotal || 0), 0);

    const thisRevenue = sum(thisMonth);
    const prevRevenue = sum(prevMonth);

    const growth =
      prevRevenue > 0
        ? (((thisRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
        : null;

    let summary = `📊 Monthly Report:\n`;
    summary += `✅ Total Sales (Last 30 days): ₹${thisRevenue}\n`;
    summary +=
      growth !== null
        ? `📈 Growth vs previous month: ${growth}%\n`
        : `📈 Growth: Not enough previous data\n`;
    summary += `💡 Tip: Focus on restocking fast-moving items and clear slow stock.\n`;

    res.json({
      summary,
      thisRevenue,
      prevRevenue,
      growth,
      totalInvoicesLast30Days: thisMonth.length,
    });
  } catch (err) {
    console.error("getMonthlyReport error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
