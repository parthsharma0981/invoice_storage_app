import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Note: CSS import ki zaroorat nahi, index.css global hai

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get selected plan from Pricing page
  const selectedPlan = location.state?.selectedPlan || "Starter";
  const billingCycle = location.state?.billingCycle || "monthly";

  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    email: "",
  });

  const [msg, setMsg] = useState("");

  // ✅ Theme Logic (Login jaisa same logic)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("login_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("login_theme", theme);
  }, [theme]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.companyName || !form.ownerName || !form.email) {
      setMsg("All fields are required!");
      return;
    }

    // Redirect to payment with data and plan info
    navigate("/payment", {
      state: {
        ...form,
        planName: selectedPlan.toLowerCase(),
        billingCycle
      }
    });
  };

  return (
    // 'login-container' class use kar rahe hain taaki same background mile
    <div className={`login-container register-page ${theme}`}>

      {/* Background Shapes (Wahi same shapes) */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="login-glass-card register-card">

        {/* LEFT SIDE: Steps Indicator & Branding */}
        <div className="login-left-panel">
          <div className="brand-header">
            <div className="logo-icon"></div>
            <h2>InvoicePro</h2>
          </div>

          <div className="hero-content">
            <h3>Start Your <br />Journey.</h3>
            <p>Join thousands of businesses managing invoices smartly.</p>

            {/* ✅ Steps Indicator (Sirf Register page ke liye) */}
            <div className="steps-wrapper">
              <div className="step-item active">
                <div className="step-circle">1</div>
                <span>Details</span>
              </div>
              <div className="step-line"></div>
              <div className="step-item">
                <div className="step-circle">2</div>
                <span>Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="login-right-panel">
          <div className="top-nav">
            {/* Login page wala 'Home' button */}
            <button className="nav-link" onClick={() => navigate("/")} style={{ marginRight: 'auto' }}>
              ← Login
            </button>

            {/* Theme Toggle Button */}
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>

          <div className="form-wrapper">
            <div className="form-header">
              <h1>Create Account</h1>
              <p>Enter your company details to get started.</p>
            </div>

            {msg && <div className="error-message-box">⚠️ {msg}</div>}

            <form onSubmit={handleSubmit} className="styled-form">
              <div className="input-group">
                <label>Company Name</label>
                <input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Acme Industries"
                  required
                />
              </div>

              <div className="input-group">
                <label>Owner Name</label>
                <input
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                  required
                />
              </div>

              <button className="submit-btn" type="submit">
                Continue to Payment →
              </button>
            </form>

            <div className="form-footer">
              <span className="text-muted">Already have an account?</span>
              <span className="link-text" onClick={() => navigate("/")}>
                Sign In
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}