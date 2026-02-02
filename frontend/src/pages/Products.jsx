import React, { useMemo, useState, useEffect } from "react";
import { useStore } from "../store/StoreContext";
import VoiceProductAssistant from "../components/VoiceProductAssistant";

export default function Products() {
  const { products, addProduct, deleteProduct, updateStock } = useStore();

  const [form, setForm] = useState({
    name: "",
    category: "",
    hsn: "",
    costPrice: "",
    price: "",
    stock: "",
    lowStockThreshold: 5,
  });

  // Auto Theme Logic
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("login_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("login_theme", theme);
    document.body.className = theme; // Body pe class lagana zaroori hai background ke liye
  }, [theme]);

  // Logic same
  const totalInventoryValue = useMemo(() => {
    return products.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
      0
    );
  }, [products]);

  // Calculate total profit margin
  const totalProfitMargin = useMemo(() => {
    let totalCost = 0;
    let totalSelling = 0;
    products.forEach(p => {
      totalCost += Number(p.costPrice || 0) * Number(p.stock || 0);
      totalSelling += Number(p.price || 0) * Number(p.stock || 0);
    });
    if (totalSelling === 0) return 0;
    return (((totalSelling - totalCost) / totalSelling) * 100).toFixed(1);
  }, [products]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.category) return alert("Enter product name & category");

    addProduct({
      name: form.name,
      category: form.category,
      hsn: form.hsn,
      costPrice: Number(form.costPrice),
      price: Number(form.price),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
    });

    setForm({
      name: "",
      category: "",
      hsn: "",
      costPrice: "",
      price: "",
      stock: "",
      lowStockThreshold: 5,
    });
  };

  return (
    <div className={`dashboard-wrapper ${theme}`}>
      {/* HEADER */}
      <div className="dash-header">
        <div className="dash-title-box">
          <h1>Products Inventory</h1>
          <p className="muted">Manage stock, pricing, and catalog</p>
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

      <VoiceProductAssistant />

      {/* SUMMARY CARDS */}
      <div className="stats-grid" style={{ marginBottom: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="stat-card stock-card">
          <div className="stat-content">
            <span className="stat-label">Total Items</span>
            <div className="stat-value">{products.length}</div>
            <span className="stat-hint">Unique Products</span>
          </div>
        </div>

        <div className="stat-card invoice-card">
          <div className="stat-content">
            <span className="stat-label">Inventory Value</span>
            <div className="stat-value">₹{Math.round(totalInventoryValue).toLocaleString()}</div>
            <span className="stat-hint">Selling Price × Stock</span>
          </div>
        </div>

        <div className="stat-card best-card">
          <div className="stat-content">
            <span className="stat-label">Profit Margin</span>
            <div className="stat-value" style={{ color: totalProfitMargin > 0 ? '#10b981' : '#ef4444' }}>
              {totalProfitMargin}%
            </div>
            <span className="stat-hint">Overall Margin</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="stats-grid" style={{ gridTemplateColumns: "1fr 2fr" }}>

        {/* LEFT: ADD PRODUCT FORM (Navy Card) */}
        <div className="glass-card navy-card form-card-height">
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--card-title)" }}>Add Product</h3>
            <p className="muted" style={{ fontSize: "0.85rem" }}>Add new item to inventory</p>
          </div>

          <div style={{ padding: "1.5rem" }}>
            <form className="styled-form" onSubmit={handleAdd}>
              <div className="input-group">
                <label>Product Name</label>
                <input
                  placeholder="e.g. Wireless Mouse"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <input
                  placeholder="e.g. Electronics"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>

              <div className="grid-split-2">
                <div className="input-group">
                  <label>HSN Code</label>
                  <input
                    placeholder="1234"
                    value={form.hsn}
                    onChange={(e) => setForm({ ...form, hsn: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Cost Price (₹)</label>
                  <input
                    placeholder="0.00"
                    type="number"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-split-2">
                <div className="input-group">
                  <label>Selling Price (₹)</label>
                  <input
                    placeholder="0.00"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Initial Stock</label>
                  <input
                    placeholder="0"
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Low Stock Alert</label>
                <input
                  placeholder="5"
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                />
              </div>

              <button className="submit-btn" style={{ marginTop: "1rem" }}>
                + Add Product
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: PRODUCT LIST TABLE (Navy Card) */}
        <div className="glass-card navy-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "fit-content" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--card-title)" }}>All Products</h3>
            <p className="muted" style={{ fontSize: "0.9rem" }}>Manage prices and live stock</p>
          </div>

          <div className="custom-table-wrapper" style={{ flex: 1, overflowY: "auto" }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Cost</th>
                  <th>Selling</th>
                  <th>Margin</th>
                  <th>Stock</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map((p) => {
                  const margin = p.price > 0 ? (((p.price - (p.costPrice || 0)) / p.price) * 100).toFixed(1) : 0;
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-pill" style={{ fontSize: '0.75rem', background: 'var(--card-hover-bg)', color: 'var(--text-main)' }}>
                          {p.category}
                        </span>
                      </td>
                      <td className="muted">₹{p.costPrice || 0}</td>
                      <td style={{ fontWeight: "700" }}>₹{p.price}</td>
                      <td>
                        <span style={{
                          color: margin > 20 ? '#10b981' : margin > 10 ? '#f59e0b' : '#ef4444',
                          fontWeight: 700
                        }}>
                          {margin}%
                        </span>
                      </td>
                      <td>
                        <input
                          className="stock-input-modern"
                          type="number"
                          value={p.stock}
                          onChange={(e) => updateStock(p._id, e.target.value)}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button className="action-btn-danger" onClick={() => deleteProduct(p._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                      No products found in inventory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}