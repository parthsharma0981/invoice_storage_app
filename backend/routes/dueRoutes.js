const express = require("express");
const router = express.Router();
const dueController = require("../controllers/dueController");
const auth = require("../middleware/auth");

// ✅ Get dues (isolated)
router.get("/", auth, dueController.getDues);

// ✅ Add/Update due + AUTO MAIL
router.post("/", auth, dueController.upsertDue);

// ✅ Delete/Clear due
router.delete("/:id", auth, dueController.deleteDue);

// ✅ Admin Send Reminder (manual)
router.post("/:id/remind", auth, dueController.sendBinder);

module.exports = router;
