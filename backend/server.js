const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const insightsAdvancedRoutes = require("./routes/insightsAdvancedRoutes");

// ✅ NEW: Due Reminder Cron
const startDueReminderCron = require("./cron/dueReminderCron");
const startLowStockCron = require("./cron/lowStockCron");

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to MongoDB
connectDB();

const app = express();

// ✅ 3. Global Middlewares (CORS FIRST)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// 4. Routes Integration
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/insights-advanced", insightsAdvancedRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/auth", require("./routes/passwordRoutes")); // Password reset
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/invoices", require("./routes/paymentRecordRoutes")); // Partial payments
app.use("/api/invoices", require("./routes/pdfRoutes")); // PDF generation
app.use("/api/dues", require("./routes/dueRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));

// ✅ Insights Routes
const insightsRoutes = require("./routes/insightsRoutes");
app.use("/api/insights", insightsRoutes);

// Root Route for testing
app.get("/", (req, res) => {
  res.send("Vani Board SaaS Backend is Running...");
});

// 5. Port Configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);

  // ✅ START DUE REMINDER CRON (every day check, sends reminder every 7 days)
  startDueReminderCron();

  // ✅ START LOW STOCK ALERT CRON (daily 9AM)
  startLowStockCron();
});
