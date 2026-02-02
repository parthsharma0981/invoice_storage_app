import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store/StoreContext";
// Note: Koi CSS import nahi chahiye kyunki hum index.css use kar rahe hain

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

  // ✅ Redirect logic
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

    if (res?.token) {
      localStorage.setItem("inv_token", res.token);
      localStorage.setItem("token", res.token);
    }
  };

  return (
    <div className={`login-container ${theme}`}>
      {/* Background Shapes for Luxury Feel */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="login-glass-card">
        {/* LEFT SIDE: Brand & Features */}
        <div className="login-left-panel">
          <div className="brand-header">
            <div className="logo-icon"></div>
            <h2>InvoicePro</h2>
          </div>

          <div className="hero-content">
            <h3>Manage Business<br />Like a Pro.</h3>
            <p>Smart Billing • Inventory • Analytics</p>

            <div className="feature-list">
              <div className="feature-item">
                <span className="icon">🛡️</span> Multi-Company Security
              </div>
              <div className="feature-item">
                <span className="icon">👥</span> Staff Role Control
              </div>
              <div className="feature-item">
                <span className="icon">🧾</span> GST & Invoice Print
              </div>
              <div className="feature-item">
                <span className="icon">🔔</span> Auto Email Alerts
              </div>
            </div>
          </div>

          {/* Optional: Hero Image Area */}
          <div className="hero-illustration">
            {/* Agar image nahi hai toh ye empty rahega ya placeholder dikhayega */}
            <div className="glass-placeholder"></div>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="login-right-panel">
          <div className="top-nav">
            <button className="nav-link" onClick={goHome}>
              ← Home
            </button>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>

          <div className="form-wrapper">
            <div className="form-header">
              <h1>Welcome Back</h1>
              <p>Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="styled-form">
              <div className="input-group">
                <label>Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </div>

              {msg && <div className="error-message-box">⚠️ {msg}</div>}

              <button className="submit-btn" type="submit">
                Sign In
              </button>
            </form>

            <div className="form-footer">
              <span className="link-text" onClick={() => navigate("/forgot-password")}>
                Forgot Password?
              </span>
            </div>

            <div className="form-footer">
              <span className="text-muted">New Company?</span>
              <span className="link-text" onClick={() => navigate("/register")}>
                Register Now →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}