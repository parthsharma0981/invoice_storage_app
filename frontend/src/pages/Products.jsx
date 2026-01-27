import React, { useMemo, useState } from "react";
import { useStore } from "../store/StoreContext";
import VoiceProductAssistant from "../components/VoiceProductAssistant";

export default function Products() {
  const { products, addProduct, deleteProduct, updateStock } = useStore();

  const [form, setForm] = useState({
    name: "",
    category: "",
    hsn: "",
    price: "",
    stock: "",
    lowStockThreshold: 5,
  });

  // Calculate total inventory value using p._id consistency
  const totalInventoryValue = useMemo(() => {
    return products.reduce(
      (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
      0
    );
  }, [products]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.category) return alert("Enter product name & category");

    addProduct({
      name: form.name,
      category: form.category,
      hsn: form.hsn,
      price: Number(form.price),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
    });

    // Form reset
    setForm({
      name: "",
      category: "",
      hsn: "",
      price: "",
      stock: "",
      lowStockThreshold: 5,
    });
  };

  return (
    <div>
      <div className="page-title">
        <h1>Products</h1>
        <p className="muted">Manage inventory items</p>
      </div>
      
      <VoiceProductAssistant />

      {/* Summary Cards */}
      <div className="grid cards" style={{ marginBottom: 12 }}>
        <div className="mini-card">
          <div className="mini-title">Total Products</div>
          <div className="mini-value">{products.length}</div>
        </div>

        <div className="mini-card">
          <div className="mini-title">Total Inventory Value</div>
          <div className="mini-value">₹{Math.round(totalInventoryValue)}</div>
          <div className="muted">Price × Stock of all products</div>
        </div>
      </div>

      <div className="grid two">
        {/* Add Product Section */}
        <div className="card">
          <h2>Add Product</h2>
          <form className="form" onSubmit={handleAdd}>
            <input
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              placeholder="HSN Code"
              value={form.hsn}
              onChange={(e) => setForm({ ...form, hsn: e.target.value })}
            />
            <input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              placeholder="Stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <input
              placeholder="Low Stock Threshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={(e) =>
                setForm({ ...form, lowStockThreshold: e.target.value })
              }
            />
            <button className="btn primary">Add Product</button>
          </form>
        </div>

        {/* Product List Section */}
        <div className="card">
          <h2>All Products</h2>
          <div className="table">
            <div className="thead">
              <div>Name</div>
              <div>Category</div>
              <div>HSN</div>
              <div>Price</div>
              <div>Stock</div>
              <div>Action</div>
            </div>

            {products.map((p) => (
              // ✅ FIXED: Using p._id for MongoDB compatibility
              <div className="trow" key={p._id}> 
                <div>{p.name}</div>
                <div>{p.category}</div>
                <div>{p.hsn || "-"}</div>
                <div>₹{p.price}</div>
                <div>
                  <input
                    className="stock-input"
                    type="number"
                    value={p.stock}
                    // ✅ FIXED: Update stock uses p._id
                    onChange={(e) => updateStock(p._id, e.target.value)}
                  />
                </div>
                <div>
                  {/* ✅ FIXED: Delete uses p._id */}
                  <button className="btn danger" onClick={() => deleteProduct(p._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {products.length === 0 && <p className="muted">No products found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}