const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

const insightsAdvancedController = require("../controllers/insightsAdvancedController");

// 1) Profit Analysis
router.get("/profit", auth, allowRoles(["admin"]), insightsAdvancedController.getProfitAnalysis);

// 2) Top Customers + Repeat Customers
router.get("/top-customers", auth, allowRoles(["admin"]), insightsAdvancedController.getTopCustomers);

// 3) Best Selling By Range (week/month)
router.get("/best-selling-range", auth, allowRoles(["admin"]), insightsAdvancedController.getBestSellingByRange);

// 4) Dead Stock
router.get("/dead-stock", auth, allowRoles(["admin"]), insightsAdvancedController.getDeadStock);

// 5) Smart Reorder With Lead Time
router.get("/smart-reorder", auth, allowRoles(["admin"]), insightsAdvancedController.getSmartReorderWithLeadTime);

module.exports = router;
