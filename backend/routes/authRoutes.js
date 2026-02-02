const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// 🔑 LOGIN
router.post("/login", authController.login);

// 👥 GET USERS (Admin only + own staff)
router.get("/users", auth, authController.getUsers);

// ➕ ADD STAFF (Admin only)
router.post("/add-user", auth, authController.addUser);

// 🗑️ DELETE STAFF (Admin only + own staff)
router.delete("/user/:id", auth, authController.deleteUser);

module.exports = router;
