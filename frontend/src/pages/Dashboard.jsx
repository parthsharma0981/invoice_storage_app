import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "../store/StoreContext";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Dashboard() {
  const { company, invoices, customers, products } = useStore();
  const navigate = useNavigate();

  // ✅ Theme Logic (Auto-detect from Login)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("login_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("login_theme", theme);
    // Body pe class lagayenge taaki scrollbar wagera dark ho jaye
    document.body.className = theme;
  }, [theme]);

  // Chart Colors based on Theme
  const CHART_COLORS = theme === "dark" 
    ? ["#60a5fa", "#c084fc", "#34d399", "#f472b6"] // Bright for Dark Mode
    : ["#4A7FA7", "#1A3D63", "#627D98", "#B3CFE5"]; // Professional Blue for Light Mode

  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStr = new Date().toISOString().slice(0, 7);

  // --- LOGIC SAME AS BEFORE ---
  const previousSalesList = useMemo(() => {
    const days = 7;
    const arr = [];
    for (let i = 1; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const sales = invoices
        .filter((inv) => inv.createdAt?.slice(0, 10) === key)
        .reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
      arr.push({ date: key, label: key.slice(5), sales });
    }
    return arr;
  }, [invoices]);

  const last6MonthsSales = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleString("en-IN", { month: "short", year: "numeric" });
      const sales = invoices
        .filter((inv) => inv.createdAt?.slice(0, 7) === key)
        .reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
      arr.push({ key, label, sales });
    }
    return arr;
  }, [invoices]);

  const totalSalesToday = useMemo(() => {
    return invoices
      .filter((i) => i.createdAt?.slice(0, 10) === todayStr)
      .reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);
  }, [invoices, todayStr]);

  const totalSalesMonth = useMemo(() => {
    return invoices
      .filter((i) => i.createdAt?.slice(0, 7) === monthStr)
      .reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);
  }, [invoices, monthStr]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => Number(p.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
  }, [products]);

  const lowStockCount = lowStockProducts.length;

  const topSellingProducts = useMemo(() => {
    const map = new Map();
    invoices.forEach((inv) => {
      inv.items?.forEach((it) => {
        const name = it.name || "Unknown";
        map.set(name, (map.get(name) || 0) + Number(it.qty || 0));
      });
    });
    const arr = Array.from(map.entries()).map(([name, qty]) => ({ name, qty }));
    arr.sort((a, b) => b.qty - a.qty);
    return arr.slice(0, 5);
  }, [invoices]);

  const bestSelling = topSellingProducts[0] || { name: "N/A", qty: 0 };

  const salesPerDay = useMemo(() => {
    const days = 7;
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const sales = invoices
        .filter((inv) => inv.createdAt?.slice(0, 10) === key)
        .reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0);
      arr.push({ date: key.slice(5), sales });
    }
    return arr;
  }, [invoices]);

  const categorySales = useMemo(() => {
    const catMap = new Map();
    invoices.forEach((inv) => {
      inv.items?.forEach((it) => {
        const product = products.find((p) => p._id === it.productId);
        const category = product?.category || "General";
        const sales = Number(it.qty || 0) * Number(it.price || 0);
        catMap.set(category, (catMap.get(category) || 0) + sales);
      });
    });
    return Array.from(catMap.entries()).map(([category, sales]) => ({ category, sales }));
  }, [invoices, products]);

  const last10Invoices = useMemo(() => {
    return [...invoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  }, [invoices]);

  const last10Customers = useMemo(() => {
    return [...customers].slice(0, 10);
  }, [customers]);

  const handlePrint = (id) => {
    navigate(`/app/invoice/${id}/print`);
  };

  return (
    <div className={`dashboard-wrapper ${theme}`}>
      {/* HEADER SECTION */}
      <div className="dash-header">
        <div className="dash-title-box">
          <h1>Dashboard Overview</h1>
          <p className="muted">Live overview of your business performance</p>
        </div>
        
        <div className="dash-actions">
           <button 
             className="theme-btn"
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
           >
             {theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode'}
           </button>
        </div>
      </div>

      {/* COMPANY GLASS BANNER */}
      <div className="company-banner glass-card">
        <div className="company-info">
          <h2>{company?.name || "Your Company"}</h2>
          <div className="badge-pill">GSTIN: {company?.gstin || "N/A"}</div>
        </div>
        <div className="company-decorative"></div>
      </div>

      {/* STATS GRID (Interactive Cards) */}
      <div className="stats-grid">
        
        {/* CARD 1: TODAY SALES */}
        <div className="stat-card today-card">
          <div className="stat-content">
            <span className="stat-label">Sales Today</span>
            <div className="stat-value">{formatINR(totalSalesToday)}</div>
            <span className="stat-hint">Hover for details →</span>
          </div>
          <div className="hover-slide">
            <h4>Previous 7 Days</h4>
            <div className="slide-list">
              {previousSalesList.map((d) => (
                <div key={d.date} className="slide-item">
                  <span>{d.label}</span>
                  <strong>{formatINR(d.sales)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: MONTH SALES */}
        <div className="stat-card month-card">
          <div className="stat-content">
            <span className="stat-label">This Month</span>
            <div className="stat-value">{formatINR(totalSalesMonth)}</div>
            <span className="stat-hint">Last 6 Months Trend →</span>
          </div>
          <div className="hover-slide">
            <h4>Monthly Trends</h4>
            <div className="slide-list">
              {last6MonthsSales.map((m) => (
                <div key={m.key} className="slide-item">
                  <span>{m.label}</span>
                  <strong>{formatINR(m.sales)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: INVOICES */}
        <div className="stat-card invoice-card">
          <div className="stat-content">
            <span className="stat-label">Total Invoices</span>
            <div className="stat-value">{invoices.length}</div>
            <span className="stat-hint">View Recent →</span>
          </div>
          <div className="hover-slide">
            <h4>Recent Invoices</h4>
            <div className="slide-list">
              {last10Invoices.length === 0 ? <p>No invoices yet.</p> : last10Invoices.map((inv) => (
                 <div key={inv._id} className="slide-item compact">
                    <div className="inv-info">
                      <span className="inv-no">{inv.invoiceNo}</span>
                      <span className="inv-amt">{formatINR(inv.grandTotal)}</span>
                    </div>
                    <button className="action-btn-sm" onClick={(e) => {
                      e.stopPropagation(); handlePrint(inv._id);
                    }}>Print</button>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 4: CUSTOMERS */}
        <div className="stat-card customer-card">
          <div className="stat-content">
            <span className="stat-label">Total Customers</span>
            <div className="stat-value">{customers.length}</div>
            <span className="stat-hint">Manage Customers →</span>
          </div>
          <div className="hover-slide">
            <div className="slide-head">
               <h4>Recent Customers</h4>
               <button className="action-btn-sm" onClick={(e) => {
                  e.stopPropagation(); navigate("/app/customers");
               }}>+ Add</button>
            </div>
            <div className="slide-list">
              {last10Customers.map((c) => (
                <div key={c._id} className="slide-item">
                  <span>{c.name}</span>
                  <small>{c.phone}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 5: LOW STOCK */}
        <div className={`stat-card stock-card ${lowStockCount > 0 ? 'alert' : ''}`}>
          <div className="stat-content">
            <span className="stat-label">Low Stock Items</span>
            <div className="stat-value">{lowStockCount}</div>
            <span className="stat-hint">{lowStockCount > 0 ? 'Needs Attention!' : 'Stock Healthy'}</span>
          </div>
          <div className="hover-slide">
            <h4>Low Stock Alerts</h4>
            <div className="slide-list">
              {lowStockProducts.length === 0 ? <div className="success-msg">✅ All Good!</div> : lowStockProducts.map((p) => (
                <div key={p._id} className="slide-item alert-item">
                  <span>{p.name}</span>
                  <span className="badge-red">{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 6: BEST SELLING */}
        <div className="stat-card best-card">
          <div className="stat-content">
            <span className="stat-label">Top Product</span>
            <div className="stat-value text-truncate">{bestSelling.name}</div>
            <span className="stat-hint">{bestSelling.qty} Units Sold</span>
          </div>
          <div className="hover-slide">
            <h4>Top 5 Products</h4>
            <div className="slide-list">
              {topSellingProducts.map((p, i) => (
                 <div key={p.name} className="slide-item">
                   <span>#{i+1} {p.name}</span>
                   <strong>{p.qty}</strong>
                 </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-grid">
        <div className="chart-card glass-card">
          <h3>Sales Trend (Last 7 Days)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                />
                <Line type="monotone" dataKey="sales" stroke={CHART_COLORS[0]} strokeWidth={3} dot={{r: 4, fill: CHART_COLORS[0]}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-card">
          <h3>Category Performance</h3>
          <div className="chart-wrapper">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySales}
                  dataKey="sales"
                  nameKey="category"
                  outerRadius={100}
                  innerRadius={60} // Donut Chart looks more premium
                  paddingAngle={5}
                >
                  {categorySales.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}