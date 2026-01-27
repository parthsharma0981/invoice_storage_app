const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const protect = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

// ---------- PRODUCT ROUTES ----------
router.get('/products', protect, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

router.post('/products', protect, adminOnly, async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.json(newProduct);
});

router.put('/products/:id/stock', protect, async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id, 
    { stock: req.body.stock }, 
    { new: true }
  );
  res.json(product);
});

router.delete('/products/:id', protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ msg: "Product Deleted" });
});

// ---------- CUSTOMER ROUTES ----------
router.get('/customers', protect, async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  res.json(customers);
});

router.post('/customers', protect, async (req, res) => {
  const newCustomer = new Customer(req.body);
  await newCustomer.save();
  res.json(newCustomer);
});

router.delete('/customers/:id', protect, adminOnly, async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ msg: "Customer Deleted" });
});

// ---------- INVOICE ROUTES ----------
router.get('/invoices', protect, async (req, res) => {
  const invoices = await Invoice.find().sort({ createdAt: -1 });
  res.json(invoices);
});

router.post('/invoices', protect, async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    await newInvoice.save();

    // Stock update logic on backend
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item.productId, { 
        $inc: { stock: -item.qty } 
      });
    }

    res.json({ ok: true, invoice: newInvoice });
  } catch (err) {
    res.status(500).json({ msg: "Invoice Error", error: err.message });
  }
});

router.delete('/invoices/:id', protect, adminOnly, async (req, res) => {
  await Invoice.findByIdAndDelete(req.params.id);
  res.json({ msg: "Invoice Deleted" });
});

module.exports = router;