import React, { useEffect, useState, useRef } from "react";
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

// PDF Export Helper Function
const exportToPDF = (data) => {
  const {
    monthlyReport,
    profitAnalysis,
    bestSelling,
    topCustomers,
    smartReorder,
    deadStock,
  } = data;

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Business Insights Report - ${today}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 40px; 
          color: #1e293b;
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        .header h1 { 
          font-size: 28px; 
          color: #1e293b;
          margin-bottom: 5px;
        }
        .header p { color: #64748b; font-size: 14px; }
        .section { 
          margin-bottom: 30px; 
          page-break-inside: avoid;
        }
        .section-title { 
          font-size: 18px; 
          font-weight: 700; 
          color: #3b82f6;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        .summary-box {
          background: #f8fafc;
          padding: 15px 20px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          margin-bottom: 20px;
        }
        .profit-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        .profit-box {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
        }
        .profit-box.revenue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .profit-box.cost { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .profit-box .label { font-size: 12px; opacity: 0.9; text-transform: uppercase; }
        .profit-box .value { font-size: 24px; font-weight: 800; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 10px;
        }
        th, td { 
          padding: 12px 15px; 
          text-align: left; 
          border-bottom: 1px solid #e2e8f0;
        }
        th { 
          background: #f1f5f9; 
          font-weight: 700;
          color: #475569;
          font-size: 12px;
          text-transform: uppercase;
        }
        tr:hover { background: #f8fafc; }
        .tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .tag.success { background: #d1fae5; color: #059669; }
        .tag.warning { background: #fef3c7; color: #d97706; }
        .tag.danger { background: #fee2e2; color: #dc2626; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Business Intelligence Report</h1>
        <p>Generated on ${today}</p>
      </div>

      <!-- Monthly Summary -->
      <div class="section">
        <div class="section-title">🗓️ Executive Summary</div>
        <div class="summary-box">
          ${monthlyReport?.summary || "No data available for this period."}
        </div>
      </div>

      <!-- Profit Analysis -->
      ${profitAnalysis ? `
      <div class="section">
        <div class="section-title">💰 Profit Analysis (Last 30 Days)</div>
        <div class="profit-grid">
          <div class="profit-box revenue">
            <div class="label">Total Revenue</div>
            <div class="value">₹${profitAnalysis.totalRevenue?.toLocaleString() || 0}</div>
          </div>
          <div class="profit-box cost">
            <div class="label">Total Cost</div>
            <div class="value">₹${profitAnalysis.totalCost?.toLocaleString() || 0}</div>
          </div>
          <div class="profit-box">
            <div class="label">Net Profit (${profitAnalysis.profitPercent || 0}%)</div>
            <div class="value">₹${profitAnalysis.profit?.toLocaleString() || 0}</div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Top Selling Products -->
      <div class="section">
        <div class="section-title">🔥 Top Selling Products</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${bestSelling.topProducts?.slice(0, 10).map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${p.name}</td>
                <td>${p.totalQtySold || 0}</td>
                <td>₹${(p.totalRevenue || 0).toLocaleString()}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No data available</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Top Customers -->
      <div class="section">
        <div class="section-title">👑 Top Customers</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer Name</th>
              <th>Orders</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            ${topCustomers?.slice(0, 10).map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${c.name}</td>
                <td>${c.invoiceCount || 0}</td>
                <td>₹${(c.totalSpent || 0).toLocaleString()}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">No data available</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Smart Reorder Suggestions -->
      ${smartReorder?.filter(x => x.suggestedReorderQty > 0).length > 0 ? `
      <div class="section">
        <div class="section-title">🚚 Reorder Recommendations</div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Lead Time</th>
              <th>Suggested Order</th>
            </tr>
          </thead>
          <tbody>
            ${smartReorder.filter(x => x.suggestedReorderQty > 0).slice(0, 10).map(p => `
              <tr>
                <td>${p.name}</td>
                <td>${p.stock}</td>
                <td>${p.leadTimeDays} days</td>
                <td><span class="tag warning">${p.suggestedReorderQty} units</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Dead Stock -->
      ${deadStock?.length > 0 ? `
      <div class="section">
        <div class="section-title">🧊 Dead Stock (No Sales in 90 Days)</div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${deadStock.slice(0, 10).map(p => `
              <tr>
                <td>${p.name}</td>
                <td>${p.stock}</td>
                <td><span class="tag danger">Clear Stock</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        <p>This report was auto-generated by VaniBoard Business Intelligence</p>
        <p>© ${new Date().getFullYear()} VaniBoard SaaS</p>
      </div>
    </body>
    </html>
  `;

  // Open new window and print
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = function () {
    printWindow.print();
  };
};

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
          <button className="icon-btn" onClick={() => exportToPDF({
            monthlyReport,
            profitAnalysis,
            bestSelling,
            topCustomers,
            smartReorder,
            deadStock,
          })}>
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
