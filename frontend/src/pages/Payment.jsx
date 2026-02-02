import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Plan pricing configuration
  const PLAN_PRICING = {
    starter: { monthly: 299, yearly: 2999 },
    pro: { monthly: 499, yearly: 4999 },
    enterprise: { monthly: 999, yearly: 9999 },
  };

  const planName = data?.planName || "starter";
  const billingCycle = data?.billingCycle || "monthly";
  const AMOUNT = PLAN_PRICING[planName]?.[billingCycle] || 299;

  const handlePay = async () => {
    try {
      setLoading(true);
      setMsg("");

      // ✅ 1) Create Razorpay Order
      const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: AMOUNT }),
      });

      const orderJson = await orderRes.json();

      if (!orderRes.ok) {
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
        description: "Monthly Subscription",
        order_id: order.id,

        handler: async (response) => {
          try {
            // ✅ IMPORTANT: Purana login hata do (existing admin issue fix)
            localStorage.removeItem("inv_token");
            localStorage.removeItem("inv_auth");

            // ✅ 3) Verify Payment + Register
            const verifyRes = await fetch(
              "http://localhost:5000/api/payment/verify-and-register",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  companyName: data.companyName,
                  ownerName: data.ownerName,
                  email: data.email,
                  planName: planName,
                  billingCycle: billingCycle,
                }),
              }
            );

            const verifyJson = await verifyRes.json();

            if (!verifyRes.ok) {
              alert(verifyJson.msg || "Verification failed");
              return;
            }

            alert("Payment Success ✅ Account created & password sent to email!");

            // ✅ OPTION 1 (BEST): Redirect to login with username auto-fill
            setTimeout(() => {
              navigate("/login", {
                replace: true,
                state: { username: data.email }, // ya username jo tum use karte ho
              });
            }, 300);

            // ✅ OPTION 2: Agar backend token bhej raha hai toh direct app open
            // if (verifyJson.token) {
            //   localStorage.setItem("inv_token", verifyJson.token);
            //   localStorage.setItem("inv_auth", JSON.stringify({ username: verifyJson.user?.username, role: verifyJson.user?.role }));
            //   setTimeout(() => navigate("/app", { replace: true }), 300);
            // }

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
          color: "#0b0f19",
        },
      };

      const rzp = new window.Razorpay(options);

      // ❌ user closes popup
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
      <div className="center-page">
        <div className="card">
          <h2>Invalid Access</h2>
          <p className="muted">Please register first.</p>
          <button className="btn primary" onClick={() => navigate("/register")}>
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="center-page">
      <div className="card">
        <h1>Complete Payment</h1>

        <p className="muted">
          Company: <b>{data.companyName}</b> <br />
          Email: <b>{data.email}</b>
        </p>

        <div style={{ marginTop: 12 }}>
          <h3>Plan: {planName.charAt(0).toUpperCase() + planName.slice(1)} ({billingCycle})</h3>
          <p className="muted">₹ {AMOUNT} / {billingCycle === "monthly" ? "month" : "year"}</p>
        </div>

        {msg && <div className="error">{msg}</div>}

        <button className="btn primary" onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>
      </div>
    </div>
  );
}
