const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Company = require("../models/Company");
const auth = require("../middleware/auth");
const { allowRoles } = require("../middleware/role");
const sendMail = require("../utils/sendMail");
const { productAddedMail } = require("../utils/emailTemplates");

// Get products (isolated)
router.get("/", auth, async (req, res) => {
  try {
    const products = await Product.find({ adminId: req.user.adminId }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Add product (admin only)
router.post("/", auth, allowRoles(["admin"]), async (req, res) => {
  try {
    const newProduct = new Product({ ...req.body, adminId: req.user.adminId });
    await newProduct.save();

    const productsCount = await Product.countDocuments({
      adminId: req.user.adminId,
    });

    const company = await Company.findOne({ adminId: req.user.adminId });
    if (company?.email) {
      await sendMail({
        to: company.email,
        subject: "New Product Added",
        text: `New product added: ${newProduct.name}`,
        html: productAddedMail({
          companyName: company.name || "Company",
          product: newProduct,
          productsCount,
        }),
      });
    }

    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ msg: "Error adding product" });
  }
});

// Update stock
router.put("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      adminId: req.user.adminId,
    });
    if (!product) return res.status(404).json({ msg: "Product not found" });

    product.stock = req.body.stock;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Error updating stock" });
  }
});

// Delete product (admin only)
router.delete("/:id", auth, allowRoles(["admin"]), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      adminId: req.user.adminId,
    });
    if (!product) return res.status(404).json({ msg: "Product not found" });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error during delete" });
  }
});

module.exports = router;
