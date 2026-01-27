import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Insights() {
  const [loading, setLoading] = useState(true);

  // =========================
  // BASIC INSIGHTS
  // =========================
  const [reorder, setReorder] = useState([]);
  const [bestSelling, setBestSelling] = useState({
    topProducts: [],
    topCategories: [],
    topRevenueProducts: [],
  });
  const [lowDemand, setLowDemand] = useState([]);
  const [monthlyReport, setMonthlyReport] = useState(null);

  // =========================
  // ADVANCED INSIGHTS
  // =========================
  const [profitAnalysis, setProfitAnalysis] = useState(null);

  const [topCustomers, setTopCustomers] = useState([]);
  const [repeatCustomers, setRepeatCustomers] = useState([]);

  const [bestSellingTrends, setBestSellingTrends] = useState({
    weekly: [],
    monthly: [],
  });

  const [deadStock, setDeadStock] = useState([]);
  const [smartReorder, setSmartReorder] = useState([]);

  const API_BASE = "http://localhost:5000";

  // =========================
  // FETCH ALL INSIGHTS
  // =========================
  const fetchAllInsights = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("inv_token");

      if (!token) {
        alert("Token missing! Please logout and login again.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        reorderRes,
        bestRes,
        lowRes,
        reportRes,

        // ADVANCED
        profitRes,
        topCustRes,
        bestMonthRes,
        bestWeekRes,
        deadRes,
        smartReorderRes,
      ] = await Promise.all([
        // =========================
        // BASIC ROUTES
        // =========================
        axios.get(`${API_BASE}/api/insights/reorder`, { headers }),
        axios.get(`${API_BASE}/api/insights/best-selling?days=30`, { headers }),
        axios.get(`${API_BASE}/api/insights/low-demand?days=30`, { headers }),
        axios.get(`${API_BASE}/api/insights/monthly-report`, { headers }),

        // =========================
        // ADVANCED ROUTES (FIXED BASE)
        // =========================
        axios.get(`${API_BASE}/api/insights-advanced/profit?days=30`, { headers }),
        axios.get(`${API_BASE}/api/insights-advanced/top-customers?days=30`, { headers }),

        // Best selling trends
        axios.get(
          `${API_BASE}/api/insights-advanced/best-selling-range?range=month&limit=10`,
          { headers }
        ),
        axios.get(
          `${API_BASE}/api/insights-advanced/best-selling-range?range=week&limit=10`,
          { headers }
        ),

        // Dead stock (90 days = 3 months)
        axios.get(`${API_BASE}/api/insights-advanced/dead-stock?days=90`, { headers }),

        // Smart reorder
        axios.get(`${API_BASE}/api/insights-advanced/smart-reorder?days=30`, { headers }),
      ]);

      // =========================
      // BASIC SETTERS
      // =========================
      setReorder(reorderRes.data || []);
      setBestSelling(
        bestRes.data || { topProducts: [], topCategories: [], topRevenueProducts: [] }
      );
      setLowDemand(lowRes.data || []);
      setMonthlyReport(reportRes.data || null);

      // =========================
      // ADVANCED SETTERS
      // =========================
      setProfitAnalysis(profitRes.data || null);

      setTopCustomers(topCustRes.data?.topCustomers || []);
      setRepeatCustomers(topCustRes.data?.repeatCustomers || []);

      setBestSellingTrends({
        monthly: bestMonthRes.data?.topProducts || [],
        weekly: bestWeekRes.data?.topProducts || [],
      });

      setDeadStock(deadRes.data || []);
      setSmartReorder(smartReorderRes.data || []);
    } catch (err) {
      console.log("Insights Error:", err?.response?.data || err.message);
      alert("Insights load nahi ho paya. Backend issue ho sakta hai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInsights();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>📊 Insights</h2>
        <p>Loading insights...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* =========================
          NAVBAR
      ========================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          background: "#fff",
          position: "sticky",
          top: "10px",
          zIndex: 10,
          boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              background: "#f7f7f7",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ⬅ Back
          </button>

          <h2 style={{ margin: 0 }}>📊 AI Insights Dashboard</h2>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={fetchAllInsights}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              cursor: "pointer",
              fontWeight: "600",
              background: "#f7f7f7",
            }}
          >
            🔄 Refresh
          </button>

          <button
            onClick={() => alert("Coming Soon: Export PDF Report")}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              cursor: "pointer",
              fontWeight: "600",
              background: "#f7f7f7",
            }}
          >
            📄 Export
          </button>
        </div>
      </div>

      {/* =========================
          MONTHLY REPORT
      ========================= */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          background: "#fafafa",
        }}
      >
        <h3 style={{ marginTop: 0 }}>🗓️ Monthly Report</h3>
        {monthlyReport?.summary ? (
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{monthlyReport.summary}</pre>
        ) : (
          <p>No report available</p>
        )}
      </div>

      {/* =========================
          PROFIT ANALYSIS
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>💰 Profit Analysis (Last 30 Days)</h3>

        {!profitAnalysis ? (
          <p>No profit data</p>
        ) : (
          <div
            style={{
              border: "1px solid #ddd",
              padding: "12px",
              borderRadius: "10px",
              background: "#f0fff4",
            }}
          >
            <p style={{ margin: "6px 0" }}>Revenue: ₹{profitAnalysis.totalRevenue}</p>
            <p style={{ margin: "6px 0" }}>Cost: ₹{profitAnalysis.totalCost}</p>
            <p style={{ margin: "6px 0", fontWeight: "bold" }}>
              Profit: ₹{profitAnalysis.profit}
            </p>
            <p style={{ margin: "6px 0" }}>
              Profit %: {profitAnalysis.profitPercent}%
            </p>
          </div>
        )}
      </div>

      {/* =========================
          TOP CUSTOMERS
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>👑 Top Customers (Last 30 Days)</h3>

        {topCustomers.length === 0 ? (
          <p>No top customers</p>
        ) : (
          topCustomers.map((c, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
                background: "#eef2ff",
              }}
            >
              <h4 style={{ margin: "0 0 6px 0" }}>
                {i + 1}. {c.name}
              </h4>
              <p style={{ margin: "4px 0" }}>Total Invoices: {c.invoiceCount}</p>
              <p style={{ margin: "4px 0" }}>Total Spent: ₹{c.totalSpent}</p>
            </div>
          ))
        )}
      </div>

      {/* =========================
          REPEAT CUSTOMERS
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>🔁 Repeat Customers</h3>

        {repeatCustomers.length === 0 ? (
          <p>No repeat customers</p>
        ) : (
          repeatCustomers.map((c, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
                background: "#fff7ed",
              }}
            >
              <h4 style={{ margin: "0 0 6px 0" }}>
                {i + 1}. {c.name}
              </h4>
              <p style={{ margin: "4px 0" }}>Invoices: {c.invoiceCount}</p>
              <p style={{ margin: "4px 0" }}>Total Spent: ₹{c.totalSpent}</p>
            </div>
          ))
        )}
      </div>

      {/* =========================
          BEST SELLING TRENDS
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>📈 Best Selling Trends</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          {/* MONTHLY */}
          <div style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "10px" }}>
            <h4 style={{ marginTop: 0 }}>📅 Monthly Top Products</h4>

            {bestSellingTrends.monthly.length === 0 ? (
              <p>No monthly trend data</p>
            ) : (
              bestSellingTrends.monthly.map((p, i) => (
                <p key={i} style={{ margin: "6px 0" }}>
                  {i + 1}. {p.name} — <b>{p.totalQtySold}</b> sold (₹{p.revenue})
                </p>
              ))
            )}
          </div>

          {/* WEEKLY */}
          <div style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "10px" }}>
            <h4 style={{ marginTop: 0 }}>🗓️ Weekly Top Products</h4>

            {bestSellingTrends.weekly.length === 0 ? (
              <p>No weekly trend data</p>
            ) : (
              bestSellingTrends.weekly.map((p, i) => (
                <p key={i} style={{ margin: "6px 0" }}>
                  {i + 1}. {p.name} — <b>{p.totalQtySold}</b> sold (₹{p.revenue})
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =========================
          DEAD STOCK
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>🧊 Dead Stock (No Sale 90 Days)</h3>

        {deadStock.length === 0 ? (
          <p>✅ No dead stock found</p>
        ) : (
          deadStock.slice(0, 15).map((p, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
                background: "#fff1f2",
              }}
            >
              <h4 style={{ margin: "0 0 6px 0" }}>{p.name}</h4>
              <p style={{ margin: "4px 0" }}>Category: {p.category || "-"}</p>
              <p style={{ margin: "4px 0" }}>Stock: {p.stock}</p>
              <p style={{ margin: "4px 0", fontWeight: "bold" }}>
                Suggestion: {p.suggestion}
              </p>
            </div>
          ))
        )}
      </div>

      {/* =========================
          SMART REORDER (ADVANCED)
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>🚚 Smart Reorder (Lead Time Included)</h3>

        {smartReorder.length === 0 ? (
          <p>No smart reorder suggestions</p>
        ) : (
          smartReorder
            .filter((x) => x.suggestedReorderQty > 0)
            .slice(0, 15)
            .map((p, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid #ddd",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  background: "#ecfeff",
                }}
              >
                <h4 style={{ margin: "0 0 6px 0" }}>{p.name}</h4>
                <p style={{ margin: "4px 0" }}>Supplier: {p.supplier || "Unknown"}</p>
                <p style={{ margin: "4px 0" }}>Stock: {p.stock}</p>
                <p style={{ margin: "4px 0" }}>Avg Daily Sales: {p.avgDailySales}</p>
                <p style={{ margin: "4px 0" }}>Lead Time Days: {p.leadTimeDays}</p>
                <p style={{ margin: "4px 0", fontWeight: "bold" }}>
                  Suggested Reorder Qty: {p.suggestedReorderQty}
                </p>
                <p style={{ margin: "4px 0", fontWeight: "bold" }}>
                  Status: {p.status}
                </p>
              </div>
            ))
        )}
      </div>

      {/* =========================
          BASIC REORDER (OLD)
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>📦 Smart Reorder Suggestions (Basic)</h3>

        {reorder.length === 0 ? (
          <p>No reorder suggestions</p>
        ) : (
          reorder.slice(0, 10).map((p) => (
            <div
              key={p.productId}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
                background: p.status === "URGENT" ? "#fff3f3" : "#fff",
              }}
            >
              <h4 style={{ margin: "0 0 6px 0" }}>
                {p.name}{" "}
                <span style={{ fontSize: "12px", color: "#555" }}>
                  ({p.category || "No Category"})
                </span>
              </h4>

              <p style={{ margin: "4px 0" }}>📌 Stock: {p.currentStock}</p>
              <p style={{ margin: "4px 0" }}>📈 Avg Daily Sales: {p.avgDailySales}</p>
              <p style={{ margin: "4px 0" }}>
                ⏳ Days Left: {p.daysLeft === null ? "No Sales Data" : p.daysLeft}
              </p>
              <p style={{ margin: "4px 0" }}>
                🛒 Suggested Reorder Qty: {p.suggestedReorderQty}
              </p>
              <p style={{ margin: "4px 0", fontWeight: "bold" }}>🚨 Status: {p.status}</p>
            </div>
          ))
        )}
      </div>

      {/* =========================
          BEST SELLING (BASIC)
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>🏆 Best Selling Insights (Basic)</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "10px" }}>
            <h4 style={{ marginTop: 0 }}>🔥 Top Products (Qty)</h4>
            {bestSelling.topProducts.length === 0 ? (
              <p>No data</p>
            ) : (
              bestSelling.topProducts.map((x, i) => (
                <p key={i} style={{ margin: "6px 0" }}>
                  {i + 1}. {x._id} — <b>{x.totalQtySold}</b> sold
                </p>
              ))
            )}
          </div>

          <div style={{ border: "1px solid #ddd", padding: "12px", borderRadius: "10px" }}>
            <h4 style={{ marginTop: 0 }}>📌 Top Categories</h4>
            {bestSelling.topCategories.length === 0 ? (
              <p>No data</p>
            ) : (
              bestSelling.topCategories.map((x, i) => (
                <p key={i} style={{ margin: "6px 0" }}>
                  {i + 1}. {x.category} — <b>{x.totalQtySold}</b> sold
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* =========================
          LOW DEMAND
      ========================= */}
      <div style={{ marginTop: "30px" }}>
        <h3>🐢 Low Demand Products (Avoid Buying)</h3>

        {lowDemand.length === 0 ? (
          <p>✅ No low demand products found</p>
        ) : (
          lowDemand.map((p) => (
            <div
              key={p.productId}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "10px",
                background: "#fffbe6",
              }}
            >
              <h4 style={{ margin: "0 0 6px 0" }}>
                {p.name}{" "}
                <span style={{ fontSize: "12px", color: "#555" }}>
                  ({p.category || "No Category"})
                </span>
              </h4>
              <p style={{ margin: "4px 0" }}>📦 Stock: {p.stock}</p>
              <p style={{ margin: "4px 0" }}>📉 Sold Last 30 Days: {p.soldLastDays}</p>
              <p style={{ margin: "4px 0", fontWeight: "bold" }}>💡 {p.suggestion}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
