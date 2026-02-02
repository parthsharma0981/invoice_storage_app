const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const auth = require("../middleware/auth");

// Get customers (isolated)
router.get("/", auth, customerController.getCustomers);

// Add customer
router.post("/", auth, customerController.addCustomer);

// Delete customer
router.delete("/:id", auth, customerController.deleteCustomer);

module.exports = router;
