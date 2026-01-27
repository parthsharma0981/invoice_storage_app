const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  getReorderSuggestions,
  getBestSellingInsights,
  getLowDemandProducts,
  getPricingSuggestions,
  getGrowthIdeas,
  getMonthlyReport,
} = require("../controllers/insightsController");

router.get("/reorder", auth, getReorderSuggestions);
router.get("/best-selling", auth, getBestSellingInsights);
router.get("/low-demand", auth, getLowDemandProducts);
router.get("/pricing", auth, getPricingSuggestions);
router.get("/growth-ideas", auth, getGrowthIdeas);
router.get("/monthly-report", auth, getMonthlyReport);

module.exports = router;
