const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const auth = require("../middleware/auth");

// GET own company
router.get("/", auth, companyController.getCompany);

// SAVE/UPDATE own company
router.post("/", auth, companyController.updateCompany);

module.exports = router;
