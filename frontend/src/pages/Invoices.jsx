import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/StoreContext";

export default function Invoices() {
  const { invoices, deleteInvoice } = useStore();

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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
                  <th>Print</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((inv) => {
                  if (!inv?._id) return null;

                  const dateText = inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString()
                    : "-";

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

                      <td>
                        <Link
                          className="btn"
                          to={`/app/invoice/${inv._id}/print`}
                        >
                          🖨 Print
                        </Link>
                      </td>

                      <td>
                        <button
                          className="btn danger"
                          onClick={() => handleDelete(inv._id)}
                          disabled={deletingId === inv._id}
                          style={{
                            opacity: deletingId === inv._id ? 0.6 : 1,
                            cursor:
                              deletingId === inv._id ? "not-allowed" : "pointer",
                          }}
                        >
                          {deletingId === inv._id ? "Deleting..." : "Delete"}
                        </button>
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
    </div>
  );
}
