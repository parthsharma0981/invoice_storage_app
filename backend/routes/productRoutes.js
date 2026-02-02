const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");

// Get products (isolated)
router.get("/", auth, productController.getProducts);

// Add product (admin only)
router.post("/", auth, allowRoles(["admin"]), productController.addProduct);

// Update stock
router.put("/:id", auth, productController.updateStock);

// Delete product (admin only)
router.delete("/:id", auth, allowRoles(["admin"]), productController.deleteProduct);

module.exports = router;
