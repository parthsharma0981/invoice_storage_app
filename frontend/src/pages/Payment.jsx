import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Theme Logic
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("login_theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("login_theme", theme);
    document.body.className = theme;
  }, [theme]);

  // Plan pricing configuration
  const PLAN_PRICING = {
    starter: { monthly: 299, yearly: 2999 },
    pro: { monthly: 499, yearly: 4999 },
    enterprise: { monthly: 999, yearly: 9999 },
  };

  // Plan features for display
  const PLAN_FEATURES = {
    starter: ["1 Admin User", "50 Invoices/month", "Basic Reports", "Email Support"],
    pro: ["3 Users", "Unlimited Invoices", "AI Insights", "Priority Support", "Inventory Tracking"],
    enterprise: ["Unlimited Users", "Unlimited Invoices", "Custom Branding", "API Access", "Dedicated Manager", "24/7 Support"],
  };

  const planName = data?.planName || "starter";
  const billingCycle = data?.billingCycle || "monthly";
  const AMOUNT = PLAN_PRICING[planName]?.[billingCycle] || 299;
  const features = PLAN_FEATURES[planName] || PLAN_FEATURES.starter;

  // Calculate savings for yearly
  const monthlyEquivalent = PLAN_PRICING[planName]?.monthly || 299;
  const yearlySavings = billingCycle === "yearly" ? (monthlyEquivalent * 12) - AMOUNT : 0;

  const handlePay = async () => {
    try {
      setLoading(true);
      setMsg("");

      // ✅ 1) Create Razorpay Order
      const orderRes = await API.post("/payment/create-order", { amount: AMOUNT });

      const orderJson = orderRes.data;

      if (!orderJson.order) {
        setMsg(orderJson.msg || "Order create failed");
        setLoading(false);
        return;
      }

      const order = orderJson.order;

      // ✅ 2) Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "VaniBoard SaaS",
        description: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan - ${billingCycle}`,
        order_id: order.id,

        handler: async (response) => {
          try {
            localStorage.removeItem("inv_token");
            localStorage.removeItem("inv_auth");

            const verifyRes = await API.post("/payment/verify-and-register", {
              ...response,
              companyName: data.companyName,
              ownerName: data.ownerName,
              email: data.email,
              planName: planName,
              billingCycle: billingCycle,
            });

            const verifyJson = verifyRes.data;

            if (!verifyJson.ok) {
              alert(verifyJson.msg || "Verification failed");
              return;
            }

            alert("Payment Success ✅ Account created & password sent to email!");

            setTimeout(() => {
              navigate("/login", {
                replace: true,
                state: { username: data.email },
              });
            }, 300);

          } catch (err) {
            console.error("Verify Error:", err);
            alert("Server error during verification");
          }
        },

        prefill: {
          name: data.ownerName,
          email: data.email,
        },

        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.log("Payment Failed:", response.error);
        setMsg("Payment Failed ❌ Please try again.");
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setMsg("Server error");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Payment direct open ho to block
  if (!data) {
    return (
      <div className={`login-container ${theme}`}>
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="payment-invalid-card glass-card">
          <div className="invalid-icon">🔒</div>
          <h2>Invalid Access</h2>
          <p className="muted">Please register first to continue.</p>
          <button className="submit-btn" onClick={() => navigate("/register")}>
            Go to Register →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`login-container payment-page ${theme}`}>
      {/* Background Shapes */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="payment-glass-card">
        {/* LEFT PANEL - Order Summary */}
        <div className="payment-left-panel">
          <div className="brand-header">
            <div className="logo-icon"></div>
            <h2>VaniBoard</h2>
          </div>

          <div className="order-summary">
            <h3>Order Summary</h3>

            <div className="plan-badge-box">
              <span className={`plan-badge ${planName}`}>
                {planName.charAt(0).toUpperCase() + planName.slice(1)} Plan
              </span>
              <span className="billing-badge">
                {billingCycle === "yearly" ? "Annual" : "Monthly"}
              </span>
            </div>

            <div className="features-list">
              <h4>What's Included:</h4>
              {features.map((feature, idx) => (
                <div key={idx} className="feature-item">
                  <span className="check-icon">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{AMOUNT}</span>
              </div>
              {yearlySavings > 0 && (
                <div className="price-row savings">
                  <span>You Save</span>
                  <span className="savings-amount">-₹{yearlySavings}</span>
                </div>
              )}
              <div className="divider"></div>
              <div className="price-row total">
                <span>Total</span>
                <span className="total-amount">₹{AMOUNT}</span>
              </div>
              <p className="billing-note">
                Billed {billingCycle === "yearly" ? "annually" : "monthly"}. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="steps-wrapper">
            <div className="step-item completed">
              <div className="step-circle">✓</div>
              <span>Details</span>
            </div>
            <div className="step-line active"></div>
            <div className="step-item active">
              <div className="step-circle">2</div>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Payment Form */}
        <div className="payment-right-panel">
          <div className="top-nav">
            <button className="nav-link" onClick={() => navigate("/register")}>
              ← Back
            </button>
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>

          <div className="payment-content">
            <div className="payment-header">
              <h1>Complete Payment</h1>
              <p>Secure checkout powered by Razorpay</p>
            </div>

            {/* Company Details Card */}
            <div className="company-details-card">
              <div className="detail-row">
                <span className="detail-label">Company</span>
                <span className="detail-value">{data.companyName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Owner</span>
                <span className="detail-value">{data.ownerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{data.email}</span>
              </div>
            </div>

            {/* Billing Summary */}
            <div className="billing-summary-card">
              <div className="summary-header">
                <span className="plan-name">{planName.charAt(0).toUpperCase() + planName.slice(1)} Plan</span>
                <span className="plan-price">₹{AMOUNT}</span>
              </div>
              <p className="summary-note">
                {billingCycle === "yearly"
                  ? `₹${Math.round(AMOUNT / 12)}/month billed annually`
                  : "Billed monthly"
                }
              </p>
            </div>

            {msg && (
              <div className="error-message-box">
                <span className="error-icon">⚠️</span>
                {msg}
              </div>
            )}

            {/* Pay Button */}
            <button
              className="pay-button"
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-state">
                  <span className="spinner"></span>
                  Processing...
                </span>
              ) : (
                <>
                  <span className="pay-icon">🔐</span>
                  Pay ₹{AMOUNT} Securely
                </>
              )}
            </button>

            {/* Security Badges */}
            <div className="security-section">
              <div className="security-badges">
                <div className="security-item">
                  <span className="sec-icon">🔒</span>
                  <span>SSL Encrypted</span>
                </div>
                <div className="security-item">
                  <span className="sec-icon">✓</span>
                  <span>PCI Compliant</span>
                </div>
                <div className="security-item">
                  <span className="sec-icon">🛡️</span>
                  <span>Secure Payment</span>
                </div>
              </div>
              <p className="powered-by">Powered by <strong>Razorpay</strong></p>
            </div>

            {/* Guarantee */}
            <div className="guarantee-box">
              <span className="guarantee-icon">💯</span>
              <div className="guarantee-text">
                <strong>30-Day Money Back Guarantee</strong>
                <p>Not satisfied? Get a full refund within 30 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
