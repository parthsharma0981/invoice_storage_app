import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    email: "",
  });

  const [msg, setMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.companyName || !form.ownerName || !form.email) {
      setMsg("All fields are required!");
      return;
    }

    // ✅ Redirect to payment with data
    navigate("/payment", { state: form });
  };

  return (
    <div className="center-page">
      <div className="card" style={{ maxWidth: 520 }}>
        <h1>Register Company</h1>
        <p className="muted">Complete payment to create admin account</p>

        {msg && <div className="error">{msg}</div>}

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: 12 }}>
          <div className="label">Company Name</div>
          <input
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            placeholder="Enter company name"
          />

          <div className="label">Owner Name</div>
          <input
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            placeholder="Enter owner name"
          />

          <div className="label">Email</div>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Enter email"
          />

          <button className="btn primary" type="submit">
            Continue to Payment →
          </button>
        </form>
      </div>
    </div>
  );
}
