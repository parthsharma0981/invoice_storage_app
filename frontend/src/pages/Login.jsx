import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store/StoreContext";

export default function Login() {
  const { login, auth } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ Theme: light / dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("login_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("login_theme", theme);
  }, [theme]);

  // ✅ Payment page se username auto-fill
  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
    }
  }, [location.state]);

  // ✅ LOGIN SUCCESS ke baad redirect
  useEffect(() => {
    if (auth?.isLoggedIn) {
      if (auth?.role === "staff") {
        navigate("/app/customers", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    }
  }, [auth, navigate]);

  const goHome = () => navigate("/");

  // ✅ UPDATED SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const res = await login(username, password);

    if (!res?.ok) {
      setMsg(res?.msg || "Login failed");
      return;
    }

    // ✅ TOKEN FIX (Insights ke liye must)
    // Backend/storecontext inv_token use kar raha hai, but Insights.jsx token use kar raha tha
    // Isliye dono me save kar rahe hain
    if (res?.token) {
      localStorage.setItem("inv_token", res.token); // ✅ main token
      localStorage.setItem("token", res.token);     // ✅ fallback token (Insights.jsx old code)
    }

    // redirect useEffect karega
  };

  return (
    <div className={`login-wrap ${theme}`}>
      <div className="login-topbar">
        <button className="btn" type="button" onClick={goHome}>
          ← Home
        </button>

        <button
          className="btn"
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀ Light" : "🌙 Dark"}
        </button>
      </div>

      <div className="login-card">
        <div className="login-left">
          <div className="login-brand">
            <div className="logo-dot" />
            <h2>InvoicePro</h2>
          </div>

          <p className="login-sub">
            Smart Billing • Inventory • Customer Dues • Professional Invoices
          </p>

          <div className="login-hero">
            <img
              src="/images/login-hero.png"
              alt="InvoicePro Login"
              className="login-hero-img"
            />
          </div>

          <div className="login-features">
            <div className="feat">✅ Multi-Company Secure Data</div>
            <div className="feat">✅ Staff Accounts & Role Control</div>
            <div className="feat">✅ Invoice + GST + Print</div>
            <div className="feat">✅ Email Alerts & Reminders</div>
          </div>
        </div>

        <div className="login-right">
          <h1 className="login-title">Welcome Back 👋</h1>
          <p className="login-muted">Login with your Admin / Staff credentials</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                type="password"
                required
              />
            </div>

            {msg && <div className="login-error">{msg}</div>}

            <button className="btn primary login-btn" type="submit">
              Login
            </button>
          </form>

          <div className="login-bottom">
            <span className="muted">New company?</span>{" "}
            <span className="link" onClick={() => navigate("/register")}>
              Register Now →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
