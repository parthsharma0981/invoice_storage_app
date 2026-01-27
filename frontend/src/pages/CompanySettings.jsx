import React, { useState, useEffect } from "react";
import { useStore } from "../store/StoreContext";

export default function CompanySettings() {
  // ✅ FIX 1: 'updateCompany' ko context se extract karna zaroori hai
  const { company, updateCompany } = useStore();
  
  // Local state for the form
  const [form, setForm] = useState(company);

  // ✅ FIX 2: Jab database se details load hon, toh form update hona chahiye
  useEffect(() => {
    setForm(company);
  }, [company]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // ✅ FIX 3: 'tempData' ki jagah 'form' use karein
    const res = await updateCompany(form); 
    
    if (res.ok) {
      alert("Company Details Saved in MongoDB!");
    } else {
      alert(res.msg);
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>Company Settings</h1>
        <p className="muted">Set company name & invoice header details</p>
      </div>

      <div className="card">
        <form className="form" onSubmit={handleSave}>
          <div className="label">Company Name</div>
          <input
            placeholder="Company Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="label">GSTIN</div>
          <input
            placeholder="GSTIN"
            value={form.gstin}
            onChange={(e) => setForm({ ...form, gstin: e.target.value })}
          />

          <div className="label">Address</div>
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <div className="label">Phone 1</div>
          <input
            placeholder="Phone 1"
            value={form.phone1}
            onChange={(e) => setForm({ ...form, phone1: e.target.value })}
          />

          <div className="label">Phone 2</div>
          <input
            placeholder="Phone 2"
            value={form.phone2}
            onChange={(e) => setForm({ ...form, phone2: e.target.value })}
          />

          <div className="label">Email</div>
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        
<div className="label">Bank Account Number</div>
<input
  placeholder="Account Number"
  value={form.bankAccNo || ""}
  onChange={(e) => setForm({ ...form, bankAccNo: e.target.value })}
/>

<div className="label">IFSC Code</div>
<input
  placeholder="IFSC Code"
  value={form.ifscCode || ""}
  onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
/>

          <button type="submit" className="btn primary">
            Save Company Details
          </button>
        </form>
      </div>
    </div>
  );
}