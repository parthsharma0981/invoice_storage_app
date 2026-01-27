import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useStore } from "../store/StoreContext";

export default function Layout() {
  const { auth, logout } = useStore();
  const navigate = useNavigate();

  // ✅ Safety: if auth missing redirect to login
  useEffect(() => {
    if (!auth?.isLoggedIn) {
      navigate("/login");
    }
  }, [auth, navigate]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem("inv_session"); // ✅ clear session
    navigate("/login");
  };

  // ✅ STEP: Auto logout when tab/browser closes
  useEffect(() => {
    // ✅ session mark when app open
    sessionStorage.setItem("inv_session", "active");

    const handleBeforeUnload = () => {
      // ⚡ tab close pe sessionStorage delete ho jayega automatically
      // but safe ke liye token bhi remove kar dete hain
      localStorage.removeItem("inv_token");
      localStorage.removeItem("inv_auth");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // ✅ If session missing => force logout
  useEffect(() => {
    const session = sessionStorage.getItem("inv_session");

    if (!session && auth?.isLoggedIn) {
      logout();
      navigate("/login");
    }
  }, [auth, logout, navigate]);

  const linkStyle = ({ isActive }) => ({
    padding: "10px 12px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 700,
    color: isActive ? "#111827" : "#6b7280",
    background: isActive ? "#eef2ff" : "transparent",
  });

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div
          className="brand"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/app")}
        >
          <div className="brand-title">InvoicePro</div>
          <div className="brand-sub">Admin Panel</div>
        </div>

        <nav className="nav">
          {/* ✅ Admin Only */}
          {auth?.role === "admin" && (
            <NavLink to="/app" style={linkStyle} end>
              Dashboard
            </NavLink>
          )}

          {auth?.role === "admin" && (
            <NavLink to="/app/users" style={linkStyle}>
              Users
            </NavLink>
          )}

          {auth?.role === "admin" && (
            <NavLink to="/app/products" style={linkStyle}>
              Products
            </NavLink>
          )}

          {/* ✅ Admin Only - Insights */}
          {auth?.role === "admin" && (
            <NavLink to="/app/insights" style={linkStyle}>
              Insights
            </NavLink>
          )}

          {/* ✅ Admin + Staff */}
          <NavLink to="/app/customers" style={linkStyle}>
            Customers
          </NavLink>

          <NavLink to="/app/create-invoice" style={linkStyle}>
            Create Invoice
          </NavLink>

          <NavLink to="/app/invoices" style={linkStyle}>
            Invoices
          </NavLink>

          <NavLink to="/app/manage-dues" style={linkStyle}>
            Manage Dues
          </NavLink>

          {auth?.role === "admin" && (
            <NavLink to="/app/company" style={linkStyle}>
              Company
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="userbox">
            <div className="user-title">Logged in:</div>
            <div className="user-name">
              {auth?.username} ({auth?.role})
            </div>
          </div>

          <button className="btn danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
