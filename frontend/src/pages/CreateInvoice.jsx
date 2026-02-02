import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/StoreContext";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { customers, products, createInvoice } = useStore();

  // Customer
  const [customerId, setCustomerId] = useState(customers[0]?._id || "");

  // Items
  const [items, setItems] = useState([
    {
      productId: products[0]?._id || "",
      qty: 1,
    },
  ]);

  // GST
  const [gstPercent, setGstPercent] = useState(18);

  // Transport
  const [transportMethod, setTransportMethod] = useState("self"); // self | vehicle
  const [vehicleNo, setVehicleNo] = useState("");

  // ✅ E-Way Bill
  const [hasEwayBill, setHasEwayBill] = useState("no"); // yes | no
  const [ewayBillNo, setEwayBillNo] = useState("");

  // Build invoice items with product details
  const invoiceItems = useMemo(() => {
    return items.map((it) => {
      const p = products.find((x) => x._id === it.productId);
      return {
        productId: it.productId,
        name: p?.name || "",
        category: p?.category || "",
        hsn: p?.hsn || "",
        qty: Number(it.qty || 0),
        unit: "Pcs.",
        price: Number(p?.price || 0),
      };
    });
  }, [items, products]);

  const subtotal = useMemo(() => {
    return invoiceItems.reduce((sum, it) => sum + it.qty * it.price, 0);
  }, [invoiceItems]);

  const gstAmount = useMemo(() => {
    return (subtotal * Number(gstPercent || 0)) / 100;
  }, [subtotal, gstPercent]);

  const grandTotal = useMemo(() => {
    return Math.round(subtotal + gstAmount);
  }, [subtotal, gstAmount]);

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      { productId: products[0]?._id || "", qty: 1 },
    ]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, key, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [key]: value } : it))
    );
  };

  const handleCreate = async () => {
    if (!customerId) return alert("Select customer first!");
    if (!invoiceItems.length) return alert("Add at least 1 item!");

    // Transport validation
    if (transportMethod === "vehicle" && !vehicleNo.trim()) {
      return alert("Vehicle number is required!");
    }

    // ✅ E-Way validation
    if (hasEwayBill === "yes" && !ewayBillNo.trim()) {
      return alert("E-Way Bill Number is required!");
    }

    // ✅ Stock validation - check if any product has insufficient stock
    for (const item of invoiceItems) {
      const product = products.find((p) => p._id === item.productId);
      if (!product) {
        return alert(`Product not found: ${item.name}`);
      }
      if (product.stock <= 0) {
        return alert(`"${product.name}" is out of stock! Please remove it from the invoice.`);
      }
      if (item.qty > product.stock) {
        return alert(`"${product.name}" has only ${product.stock} units in stock. You are trying to add ${item.qty} units.`);
      }
    }

    const res = await createInvoice({
      customerId,
      items: invoiceItems,
      gstPercent: Number(gstPercent || 0),

      // Transport
      transportMethod,
      transport: transportMethod === "self" ? "Self" : "Vehicle",
      vehicleNo: transportMethod === "vehicle" ? vehicleNo.trim() : "",

      // ✅ E-Way Bill
      hasEwayBill,
      ewayBillNo: hasEwayBill === "yes" ? ewayBillNo.trim() : "",
    });

    if (!res.ok) return alert(res.msg || "Invoice create failed");

    alert("Invoice Created Successfully!");

    // ✅ FIXED REDIRECT (Print route is under /app)
    navigate(`/app/invoice/${res.invoice._id}/print`);
  };

  return (
    <div>
      <div className="page-title">
        <h1>Create Invoice</h1>
        <p className="muted">Create a new invoice (Admin + Staff)</p>
      </div>

      <div className="card">
        <div className="grid two">
          <div>
            <div className="label">Customer</div>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="label">GST (%)</div>
            <input
              type="number"
              value={gstPercent}
              onChange={(e) => setGstPercent(e.target.value)}
            />
          </div>
        </div>

        <hr className="hr" />

        {/* Transport + E-Way Bill */}
        <div className="grid two">
          <div>
            <div className="label">Transport Method</div>
            <select
              value={transportMethod}
              onChange={(e) => {
                setTransportMethod(e.target.value);
                if (e.target.value === "self") setVehicleNo("");
              }}
            >
              <option value="self">Self</option>
              <option value="vehicle">Vehicle</option>
            </select>

            {transportMethod === "vehicle" && (
              <div style={{ marginTop: 10 }}>
                <div className="label">Vehicle No.</div>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  placeholder="HR12AB1234"
                />
              </div>
            )}
          </div>

          <div>
            <div className="label">E-Way Bill?</div>
            <select
              value={hasEwayBill}
              onChange={(e) => {
                setHasEwayBill(e.target.value);
                if (e.target.value === "no") setEwayBillNo("");
              }}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>

            {hasEwayBill === "yes" && (
              <div style={{ marginTop: 10 }}>
                <div className="label">E-Way Bill No.</div>
                <input
                  type="text"
                  value={ewayBillNo}
                  onChange={(e) => setEwayBillNo(e.target.value)}
                  placeholder="Enter E-Way Bill No"
                />
              </div>
            )}
          </div>
        </div>

        <hr className="hr" />

        {/* Items */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Items</h2>
          <button className="btn" onClick={addItemRow}>
            + Add Item
          </button>
        </div>

        {items.map((it, index) => {
          const p = products.find((x) => x._id === it.productId);
          const price = Number(p?.price || 0);
          const qty = Number(it.qty || 0);
          const amount = price * qty;

          return (
            <div className="item-row" key={index}>
              <select
                value={it.productId}
                onChange={(e) => updateItem(index, "productId", e.target.value)}
              >
                {products.map((prod) => {
                  const isOutOfStock = prod.stock <= 0;
                  return (
                    <option
                      key={prod._id}
                      value={prod._id}
                      disabled={isOutOfStock}
                      style={isOutOfStock ? { color: '#999', fontStyle: 'italic' } : {}}
                    >
                      {prod.name} {isOutOfStock ? '(Out of Stock)' : `(Stock: ${prod.stock})`}
                    </option>
                  );
                })}
              </select>

              {/* Warning if selected product is out of stock */}
              {p && p.stock <= 0 && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>
                  ⚠️ This product is out of stock!
                </div>
              )}
              {p && p.stock > 0 && qty > p.stock && (
                <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: 4 }}>
                  ⚠️ Only {p.stock} units available
                </div>
              )}

              <input
                className="qty"
                type="number"
                min="1"
                value={it.qty}
                onChange={(e) => updateItem(index, "qty", e.target.value)}
              />

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>₹{amount}</div>
                <button
                  className="btn danger"
                  onClick={() => removeItemRow(index)}
                  disabled={items.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}

        <hr className="hr" />

        {/* Summary */}
        <div className="summary">
          <div>
            Subtotal: <b>₹{subtotal}</b>
          </div>
          <div>
            GST: <b>₹{Math.round(gstAmount)}</b>
          </div>
          <div className="grand">
            Grand Total: <b>₹{grandTotal}</b>
          </div>
        </div>

        <button className="btn primary" onClick={handleCreate}>
          Create Invoice
        </button>
      </div>
    </div>
  );
}
