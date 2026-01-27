const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // ✅ Always read from req.headers.authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id, role, adminId }
    req.user = decoded;

    // 🔥 Safety: adminId missing ho to DB se set kar do
    if (!req.user.adminId) {
      const dbUser = await User.findById(req.user.id);
      if (!dbUser) return res.status(401).json({ msg: "User not found" });

      req.user.adminId =
        dbUser.role === "admin"
          ? dbUser._id.toString()
          : dbUser.adminId?.toString();
    }

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
