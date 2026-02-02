const Product = require("../models/Product");
const Company = require("../models/Company");
const sendMail = require("../utils/sendMail");
const { productAddedMail } = require("../utils/emailTemplates");

// Get products (isolated)
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ adminId: req.user.adminId }).sort({
            createdAt: -1,
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// Add product (admin only) - Merges duplicate products by adding stock
exports.addProduct = async (req, res) => {
    try {
        const { name, category, price, costPrice, stock, hsn, lowStockThreshold } = req.body;

        // Check if product with same name AND category already exists
        const existingProduct = await Product.findOne({
            adminId: req.user.adminId,
            name: { $regex: new RegExp(`^${name}$`, 'i') }, // case-insensitive match
            category: { $regex: new RegExp(`^${category || 'General'}$`, 'i') }
        });

        let product;
        let isNewProduct = false;

        if (existingProduct) {
            // ✅ Product exists - add stock quantity
            existingProduct.stock = (existingProduct.stock || 0) + Number(stock || 0);

            // Update price/cost if provided (use latest values)
            if (price) existingProduct.price = Number(price);
            if (costPrice) existingProduct.costPrice = Number(costPrice);
            if (hsn) existingProduct.hsn = hsn;
            if (lowStockThreshold) existingProduct.lowStockThreshold = Number(lowStockThreshold);

            await existingProduct.save();
            product = existingProduct;
        } else {
            // ✅ New product - create it
            const newProduct = new Product({ ...req.body, adminId: req.user.adminId });
            await newProduct.save();
            product = newProduct;
            isNewProduct = true;
        }

        // Send email only for new products
        if (isNewProduct) {
            const productsCount = await Product.countDocuments({
                adminId: req.user.adminId,
            });

            const company = await Company.findOne({ adminId: req.user.adminId });
            if (company?.email) {
                await sendMail({
                    to: company.email,
                    subject: "New Product Added",
                    text: `New product added: ${product.name}`,
                    html: productAddedMail({
                        companyName: company.name || "Company",
                        product: product,
                        productsCount,
                    }),
                });
            }
        }

        res.json({
            ...product.toObject(),
            merged: !isNewProduct,
            message: isNewProduct ? "Product added" : `Stock added to existing "${product.name}"`
        });
    } catch (err) {
        console.error("Add Product Error:", err);
        res.status(500).json({ msg: "Error adding product" });
    }
};

// Update stock
exports.updateStock = async (req, res) => {
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
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
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
};
