import React, { useMemo } from "react";
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

  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStr = new Date().toISOString().slice(0, 7);

  // ✅ Previous 7 days sales list (Today hover)
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

  // ✅ Last 6 months sales list (Month hover)
  const last6MonthsSales = useMemo(() => {
    const arr = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);

      const key = d.toISOString().slice(0, 7); // YYYY-MM
      const label = d.toLocaleString("en-IN", {
        month: "short",
        year: "numeric",
      });

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

  // ✅ Low Stock Products
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => Number(p.stock || 0) <= 5)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
  }, [products]);

  const lowStockCount = lowStockProducts.length;

  // ✅ Best selling + Top 5 selling list
  const topSellingProducts = useMemo(() => {
    const map = new Map();

    invoices.forEach((inv) => {
      inv.items?.forEach((it) => {
        const name = it.name || "Unknown";
        map.set(name, (map.get(name) || 0) + Number(it.qty || 0));
      });
    });

    const arr = Array.from(map.entries()).map(([name, qty]) => ({
      name,
      qty,
    }));

    arr.sort((a, b) => b.qty - a.qty);
    return arr.slice(0, 5);
  }, [invoices]);

  const bestSelling = topSellingProducts[0] || { name: "N/A", qty: 0 };

  // ✅ Sales per day chart
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

  // ✅ Category wise sales pie (Product category mapping FIX)
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

    return Array.from(catMap.entries()).map(([category, sales]) => ({
      category,
      sales,
    }));
  }, [invoices, products]);

  // ✅ Last 10 invoices list for hover
  const last10Invoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  }, [invoices]);

  // ✅ FIXED route
  const handlePrint = (id) => {
    navigate(`/app/invoice/${id}/print`);
  };

  const last10Customers = useMemo(() => {
    return [...customers].slice(0, 10);
  }, [customers]);

  return (
    <div>
      <div className="page-title">
        <h1>Dashboard</h1>
        <p className="muted">Live overview of sales & inventory</p>
      </div>

      {/* Company Card */}
      <div className="card" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Company: {company?.name || "Not Set"}</h2>
        <p className="muted" style={{ marginTop: 6 }}>
          GSTIN: {company?.gstin || "-"}
        </p>
      </div>

      {/* Cards */}
      <div className="grid cards">
        {/* TODAY SALES */}
        <div className="mini-card todaySalesCard">
          <div className="mini-title">Total Sales Today</div>
          <div className="mini-value">{formatINR(totalSalesToday)}</div>

          <div className="todaySalesSlide">
            <div className="todaySalesHead">
              <b>Previous 7 Days Sales</b>
              <span className="muted">(before today)</span>
            </div>

            <div className="todaySalesList">
              {previousSalesList.map((d) => (
                <div key={d.date} className="todaySalesItem">
                  <div className="todaySalesDate">{d.label}</div>
                  <div className="todaySalesAmt">{formatINR(d.sales)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MONTH SALES */}
        <div className="mini-card monthSalesCard">
          <div className="mini-title">Total Sales This Month</div>
          <div className="mini-value">{formatINR(totalSalesMonth)}</div>

          <div className="monthSalesSlide">
            <div className="monthSalesHead">
              <b>Last 6 Months Sales</b>
              <span className="muted">(including current)</span>
            </div>

            <div className="monthSalesList">
              {last6MonthsSales.map((m) => (
                <div key={m.key} className="monthSalesItem">
                  <div className="monthSalesDate">{m.label}</div>
                  <div className="monthSalesAmt">{formatINR(m.sales)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOTAL INVOICES */}
        <div className="mini-card invoicesCard">
          <div className="mini-title">Total Invoices</div>
          <div className="mini-value">{invoices.length}</div>

          <div className="invoicesSlide">
            <div className="invoicesHead">
              <b>Last 10 Invoices</b>
              <span className="muted">(recent)</span>
            </div>

            {last10Invoices.length === 0 ? (
              <p className="muted" style={{ marginTop: 10 }}>
                No invoices found.
              </p>
            ) : (
              <div className="invoicesList">
                {last10Invoices.map((inv) => (
                  <div key={inv._id} className="invoicesItem">
                    <div>
                      <div className="invNo">{inv.invoiceNo}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {inv.customerName || "-"} | {inv.createdAt?.slice(0, 10)}
                      </div>
                      <div style={{ fontWeight: 900, marginTop: 2 }}>
                        {formatINR(inv.grandTotal || 0)}
                      </div>
                    </div>

                    <button
                      className="btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(inv._id);
                      }}
                    >
                      Print
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TOTAL CUSTOMERS */}
        <div className="mini-card customersCard">
          <div className="mini-title">Total Customers</div>
          <div className="mini-value">{customers.length}</div>

          <div className="customersSlide">
            <div className="customersHead">
              <b>Last 10 Customers</b>
              <button
                className="btn primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/app/customers"); // ✅ FIXED
                }}
              >
                + Add Customer
              </button>
            </div>

            {last10Customers.length === 0 ? (
              <p className="muted" style={{ marginTop: 10 }}>
                No customers found.
              </p>
            ) : (
              <div className="customersList">
                {last10Customers.map((c) => (
                  <div key={c._id} className="customersItem">
                    <div>
                      <div className="custName">{c.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Phone: {c.phone || "-"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="mini-card lowStockCard">
          <div className="mini-title">Low Stock Items</div>
          <div className="mini-value">{lowStockCount}</div>

          <div className="lowStockSlide">
            <div className="lowStockHead">
              <b>Low Stock Products ({lowStockProducts.length})</b>
              <span className="muted">(≤ 5)</span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="muted" style={{ marginTop: 10 }}>
                ✅ No low stock items
              </p>
            ) : (
              <div className="lowStockList">
                {lowStockProducts.map((p) => (
                  <div key={p._id} className="lowStockItem">
                    <div>
                      <div className="lowStockName">{p.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Category: {p.category || "-"}
                      </div>
                    </div>
                    <div className="lowStockQty">Stock: {p.stock}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BEST SELLING */}
        <div className="mini-card bestSellingCard">
          <div className="mini-title">Best Selling Product</div>
          <div className="mini-value">{bestSelling.name}</div>
          <div className="muted">Qty Sold: {bestSelling.qty}</div>

          <div className="bestSellingSlide">
            <div className="bestSellingHead">
              <b>Top 5 Selling Products</b>
              <span className="muted">(by qty)</span>
            </div>

            {topSellingProducts.length === 0 ? (
              <p className="muted" style={{ marginTop: 10 }}>
                No sales yet.
              </p>
            ) : (
              <div className="bestSellingList">
                {topSellingProducts.map((p, idx) => (
                  <div key={p.name} className="bestSellingItem">
                    <div style={{ fontWeight: 900 }}>
                      #{idx + 1} {p.name}
                    </div>
                    <div className="bestSellingQty">Qty: {p.qty}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid charts" style={{ marginTop: 12 }}>
        <div className="card">
          <h2>Sales Per Day (Last 7 Days)</h2>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesPerDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2>Category Wise Sales</h2>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySales}
                  dataKey="sales"
                  nameKey="category"
                  outerRadius={95}
                  label
                >
                  {categorySales.map((_, idx) => (
                    <Cell key={idx} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
