import React, { useState, useMemo } from "react";
import { useStore } from "../store/StoreContext";

export default function ManageDues() {
  const { customers, addDue, dues, deleteDue } = useStore(); 
  const [form, setForm] = useState({ customerId: "", amount: "", notes: "" });
  const [searchTerm, setSearchTerm] = useState(""); // ✅ For searching

  // Filter dues based on search
  const filteredDues = useMemo(() => {
    return dues.filter(d => d.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [dues, searchTerm]);

  // Calculate total pending market dues
  const totalMarketDues = useMemo(() => {
    return dues.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  }, [dues]);

  const handleSave = async (e) => {
    e.preventDefault();
    const customer = customers.find(c => c._id === form.customerId);
    if(!customer || !form.amount) return alert("Select customer and amount!");

    const res = await addDue({ ...form, customerName: customer.name });
    if(res.ok) {
       alert("Due saved successfully!");
       setForm({ customerId: "", amount: "", notes: "" });
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>Manage Customer Dues</h1>
        <p className="muted">Track pending payments from customers</p>
      </div>

      {/* Summary Card */}
      <div className="mini-card" style={{ marginBottom: 20, borderLeft: "5px solid red" }}>
        <div className="mini-title">Total Market Dues</div>
        <div className="mini-value" style={{ color: "red" }}>₹{totalMarketDues}</div>
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Add New Due</h2>
          <form onSubmit={handleSave} className="form">
            <div className="label">Select Customer</div>
            <select value={form.customerId} onChange={(e)=>setForm({...form, customerId: e.target.value})}>
              <option value="">-- Select --</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <div className="label">Due Amount (₹)</div>
            <input type="number" value={form.amount} onChange={(e)=>setForm({...form, amount: e.target.value})} />
            <div className="label">Notes / Remarks</div>
            <input type="text" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} />
            <button type="submit" className="btn primary">Save Due Record</button>
          </form>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Recent Dues</h2>
            <input 
              placeholder="Search customer..." 
              style={{ width: "150px", padding: "5px" }} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table">
            <div className="thead">
              <div>Customer</div>
              <div>Amount</div>
              <div>Date</div>
              <div>Action</div>
            </div>
            {filteredDues.map((d) => (
              <div className="trow" key={d._id}>
                <div style={{ fontWeight: "bold" }}>{d.customerName}</div>
                <div style={{ color: "red" }}>₹{d.amount}</div>
                <div className="muted">{d.createdAt?.slice(0, 10)}</div>
                <div>
                  {/* Safety confirmation added */}
                  <button className="btn danger" onClick={() => {
                    if(window.confirm("Bhai, kya aap sach mein ye due clear karna chahte hain?")) {
                      deleteDue(d._id);
                    }
                  }}>Clear</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}