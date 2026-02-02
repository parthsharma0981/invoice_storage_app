import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";

export default function Invoices() {
  const { invoices, deleteInvoice, refreshAllData } = useStore();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const filteredInvoices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices || [];

    return (invoices || []).filter((inv) => {
      const invoiceNo = (inv?.invoiceNo || "").toLowerCase();
      const customer = (inv?.customerName || "").toLowerCase();
      return invoiceNo.includes(q) || customer.includes(q);
    });
  }, [invoices, search]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this invoice?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteInvoice(id);
      alert("Invoice Deleted Successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete invoice. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const openPaymentModal = (inv) => {
    setPaymentModal(inv);
    setPaymentAmount("");
    setPaymentMethod("cash");
    setPaymentNotes("");
  };

  const closePaymentModal = () => {
    setPaymentModal(null);
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setPaymentLoading(true);

    try {
      const token = localStorage.getItem("inv_token");
      const res = await fetch(`http://localhost:5000/api/invoices/${paymentModal._id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          method: paymentMethod,
          notes: paymentNotes
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Payment recorded successfully!");
        closePaymentModal();
        refreshAllData(); // Reload invoices
      } else {
        alert(data.msg || "Failed to record payment");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusBadge = (inv) => {
    const status = inv.paymentStatus || "unpaid";
    const paid = inv.paidAmount || 0;
    const total = inv.grandTotal || 0;

    const styles = {
      unpaid: { background: "#fee2e2", color: "#dc2626" },
      partial: { background: "#fef3c7", color: "#d97706" },
      paid: { background: "#dcfce7", color: "#16a34a" }
    };

    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "600",
        ...styles[status]
      }}>
        {status === "paid" ? "✓ Paid" : status === "partial" ? `Partial (₹${paid})` : "Unpaid"}
      </span>
    );
  };

  const getRemaining = (inv) => {
    return (inv.grandTotal || 0) - (inv.paidAmount || 0);
  };

  // PDF Download function
  const handleDownloadPDF = async (inv) => {
    try {
      const token = localStorage.getItem("inv_token");
      const res = await fetch(`http://localhost:5000/api/invoices/${inv._id}/pdf`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        alert("Failed to generate PDF");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${inv.invoiceNo || inv._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error downloading PDF");
    }
  };

  return (
    <div>
      <div className="page-title">
        <h1>Invoices</h1>
        <p className="muted">View and manage invoices</p>
      </div>

      {/* ✅ Search Bar */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Invoice No or Customer..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              outline: "none",
            }}
          />
          <button
            className="btn"
            type="button"
            onClick={() => setSearch("")}
            disabled={!search}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="card">
        {!filteredInvoices || filteredInvoices.length === 0 ? (
          <div style={{ padding: "10px 4px" }}>
            <p className="muted" style={{ margin: 0 }}>
              No invoices found. Create your first invoice!
            </p>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((inv) => {
                  if (!inv?._id) return null;

                  const dateText = inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString()
                    : "-";

                  const remaining = getRemaining(inv);

                  return (
                    <tr key={inv._id}>
                      <td style={{ fontWeight: "600" }}>
                        {inv.invoiceNo || "-"}
                      </td>
                      <td>{inv.customerName || "-"}</td>
                      <td>{dateText}</td>
                      <td style={{ fontWeight: "700" }}>
                        ₹{Number(inv.grandTotal || 0).toLocaleString("en-IN")}
                      </td>
                      <td>{getStatusBadge(inv)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <Link
                            className="btn"
                            to={`/app/invoice/${inv._id}/print`}
                            style={{ fontSize: "0.8rem", padding: "6px 10px" }}
                          >
                            🖨 Print
                          </Link>

                          <button
                            className="btn"
                            onClick={() => handleDownloadPDF(inv)}
                            style={{ fontSize: "0.8rem", padding: "6px 10px" }}
                          >
                            📄 PDF
                          </button>

                          {remaining > 0 && (
                            <button
                              className="btn primary"
                              onClick={() => openPaymentModal(inv)}
                              style={{ fontSize: "0.8rem", padding: "6px 10px" }}
                            >
                              💰 Pay
                            </button>
                          )}

                          <button
                            className="btn danger"
                            onClick={() => handleDelete(inv._id)}
                            disabled={deletingId === inv._id}
                            style={{
                              fontSize: "0.8rem",
                              padding: "6px 10px",
                              opacity: deletingId === inv._id ? 0.6 : 1,
                            }}
                          >
                            {deletingId === inv._id ? "..." : "🗑"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ✅ Footer Count */}
            <div style={{ marginTop: "10px" }}>
              <p className="muted" style={{ margin: 0 }}>
                Showing <b>{filteredInvoices.length}</b> invoice(s)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Payment Modal */}
      {paymentModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            width: "90%",
            maxWidth: "400px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ margin: "0 0 8px" }}>Record Payment</h3>
            <p className="muted" style={{ margin: "0 0 16px" }}>
              Invoice: <b>{paymentModal.invoiceNo}</b><br />
              Remaining: <b>₹{getRemaining(paymentModal).toLocaleString()}</b>
            </p>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                Amount (₹)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                max={getRemaining(paymentModal)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "500" }}>
                Notes (optional)
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. Cheque No."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ddd"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn"
                onClick={closePaymentModal}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={handleRecordPayment}
                disabled={paymentLoading}
                style={{ flex: 1 }}
              >
                {paymentLoading ? "Saving..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
