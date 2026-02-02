import React, { useEffect, useState } from "react";
import {
  fetchReorderAPI,
  fetchBestSellingAPI,
  fetchLowDemandAPI,
  fetchMonthlyReportAPI,
  fetchProfitAnalysisAPI,
  fetchTopCustomersAPI,
  fetchBestSellingRangeAPI,
  fetchDeadStockAPI,
  fetchSmartReorderAPI,
} from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import "./Insights.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

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

  // =========================
  // FETCH ALL INSIGHTS
  // =========================
  const fetchAllInsights = async () => {
    try {
      setLoading(true);

      // Parallel Fetching
      const [
        reorderRes,
        bestRes,
        lowRes,
        reportRes,
        profitRes,
        topCustRes,
        bestMonthRes,
        bestWeekRes,
        deadRes,
        smartReorderRes,
      ] = await Promise.all([
        fetchReorderAPI(),
        fetchBestSellingAPI(30),
        fetchLowDemandAPI(30),
        fetchMonthlyReportAPI(),
        fetchProfitAnalysisAPI(30),
        fetchTopCustomersAPI(30),
        fetchBestSellingRangeAPI("month", 10),
        fetchBestSellingRangeAPI("week", 10),
        fetchDeadStockAPI(90),
        fetchSmartReorderAPI(30),
      ]);

      setReorder(reorderRes.data || []);
      setBestSelling(bestRes.data || { topProducts: [], topCategories: [], topRevenueProducts: [] });
      setLowDemand(lowRes.data || []);
      setMonthlyReport(reportRes.data || null);
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
      <div className="insights-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="loader"></div>
        <h2 style={{ marginLeft: "10px" }}>Analyzing Data...</h2>
      </div>
    );
  }

  return (
    <div className="insights-container">
      {/* --- HEADER --- */}
      <div className="insights-header">
        <div className="header-left">
          <button className="icon-btn" onClick={() => window.history.back()}>
            ⬅ Back
          </button>
          <h2 className="insights-title">📊 Business Intelligence</h2>
        </div>
        <div className="header-right">
          <button className="icon-btn primary" onClick={fetchAllInsights}>
            🔄 Refresh Data
          </button>
          <button className="icon-btn" onClick={() => alert("Report Export feature coming soon!")}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* --- KEY METRICS GRID --- */}
      <div className="insights-grid grid-cols-3">

        {/* 1. MONTHLY REPORT */}
        <div className="insight-card report-card full-width">
          <div className="card-header">
            <span className="card-title">🗓️ Monthly Executive Summary</span>
          </div>
          <div className="report-text">
            {monthlyReport?.summary || "No adequate data for this month yet."}
          </div>
        </div>

        {/* 2. PROFIT CARD */}
        {profitAnalysis && (
          <div className="insight-card profit-card">
            <div className="card-header" style={{ borderBottomColor: "rgba(255,255,255,0.2)" }}>
              <span className="card-title">💰 Net Profit (30 Days)</span>
            </div>
            <div style={{ textAlign: "center", margin: "1rem 0" }}>
              <span className="profit-value">₹{profitAnalysis.profit.toLocaleString()}</span>
              <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>Net Profit Margin: {profitAnalysis.profitPercent}%</span>
            </div>
            <div className="profit-stats">
              <div className="profit-stat-item">
                <small>Revenue</small>
                <div style={{ fontWeight: "bold" }}>₹{profitAnalysis.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="profit-stat-item">
                <small>Cost</small>
                <div style={{ fontWeight: "bold" }}>₹{profitAnalysis.totalCost.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. CATEGORY CHART */}
        <div className="insight-card">
          <div className="card-header">
            <span className="card-title">🥧 Sales by Category</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bestSelling.topCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalQtySold"
                  nameKey="category"
                  label
                >
                  {bestSelling.topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. BEST SELLING CHART */}
        <div className="insight-card full-width">
          <div className="card-header">
            <span className="card-title">� Top Selling Products (Qty)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSelling.topProducts.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalQtySold" fill="#3b82f6" name="Quantity Sold" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* --- DETAILED LISTS GRID --- */}
      <div className="insights-grid">

        {/* SMART REORDER */}
        <div className="insight-card">
          <div className="card-header">
            <span className="card-title">🚚 Smart Reorder (AI)</span>
          </div>
          <div className="list-container">
            {smartReorder.filter(x => x.suggestedReorderQty > 0).length === 0 ? (
              <p className="text-muted">No reorder needed right now.</p>
            ) : (
              smartReorder.filter(x => x.suggestedReorderQty > 0).slice(0, 5).map((p, i) => (
                <div key={i} className="list-item urgent-item">
                  <span className="item-rank">!</span>
                  <div className="item-info">
                    <span className="item-name">{p.name}</span>
                    <span className="item-meta">Stock: {p.stock} | Lead Time: {p.leadTimeDays}d</span>
                  </div>
                  <div className="text-right">
                    <span className="tag warning">Order {p.suggestedReorderQty}</span>
                  </div>
                </div>
              ))
            )}
            {smartReorder.filter(x => x.suggestedReorderQty > 0).length > 5 && (
              <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--primary)" }}>+ {smartReorder.length - 5} more items</p>
            )}
          </div>
        </div>

        {/* DEAD STOCK */}
        <div className="insight-card">
          <div className="card-header">
            <span className="card-title">🧊 Dead Stock (90 Days)</span>
          </div>
          <div className="list-container">
            {deadStock.length === 0 ? (
              <p className="text-muted">✅ Inventory is healthy.</p>
            ) : (
              deadStock.slice(0, 5).map((p, i) => (
                <div key={i} className="list-item">
                  <span className="item-rank" style={{ color: "#ef4444" }}>{i + 1}</span>
                  <div className="item-info">
                    <span className="item-name">{p.name}</span>
                    <span className="item-meta">Stock: {p.stock}</span>
                  </div>
                  <span className="tag danger">Clear</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TOP CUSTOMERS */}
        <div className="insight-card">
          <div className="card-header">
            <span className="card-title">👑 Top Customers</span>
          </div>
          {topCustomers.slice(0, 5).map((c, i) => (
            <div key={i} className="list-item">
              <span className="item-rank">#{i + 1}</span>
              <div className="item-info">
                <span className="item-name">{c.name}</span>
                <span className="item-meta">{c.invoiceCount} Orders</span>
              </div>
              <span className="item-value">₹{c.totalSpent.toLocaleString()}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
