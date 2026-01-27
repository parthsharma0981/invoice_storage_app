import React, { useState } from "react";
import { useStore } from "../store/StoreContext";

export default function Customers() {
  const { customers, addCustomer, deleteCustomer } = useStore();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return alert("Enter name & phone");
    addCustomer(form);
    setForm({ name: "", phone: "", email: "", address: "" });
  };

  return (
    <div>
      <div className="page-title">
        <h1>Customers</h1>
        <p className="muted">Manage customer records</p>
      </div>

      <div className="grid two">
        <div className="card">
          <h2>Add Customer</h2>
          <form className="form" onSubmit={handleAdd}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <button className="btn primary">Add Customer</button>
          </form>
        </div>

        <div className="card">
          <h2>All Customers</h2>
          <div className="table">
            <div className="thead">
              <div>Name</div>
              <div>Phone</div>
              <div>Email</div>
              <div>Action</div>
            </div>

            {customers.map((c) => (
              <div className="trow" key={c._id}>
                <div>{c.name}</div>
                <div>{c.phone}</div>
                <div>{c.email || "-"}</div>
                <div>
                  <button className="btn danger" onClick={() => deleteCustomer(c._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {customers.length === 0 && <p className="muted">No customers found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
