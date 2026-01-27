import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import { QRCodeCanvas } from "qrcode.react";

const money = (n) => "₹" + Number(n || 0).toFixed(2);

const amountInWords = (num) => {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if (n === 0) return "Zero";
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  };

  return inWords(Math.floor(num)) + " Only";
};

export default function InvoicePrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, company } = useStore();

  const invoice = useMemo(() => invoices.find((x) => x._id === id), [invoices, id]);

  // ✅ QR code url fixed (always correct path)
  const invoiceURL = `${window.location.origin}/app/invoice/${id}/print`;

  if (!invoice) {
    return (
      <div className="card">
        <h2>Invoice Not Found</h2>
        <p className="muted">Invoice data not loaded or invoice deleted.</p>

        <button className="btn" onClick={() => navigate("/app/invoices")}>
          Back to Invoices
        </button>
      </div>
    );
  }

  const gstPercent = Number(invoice.gstPercent || 0);
  const subtotal = invoice.items.reduce((sum, it) => sum + Number(it.qty) * Number(it.price), 0);
  const gstAmount = (subtotal * gstPercent) / 100;
  const roundedOff = Number(invoice.roundedOff || 0);
  const grandTotal = Math.round(subtotal + gstAmount - roundedOff);

  const totalPieces = invoice.items.reduce((sum, it) => sum + Number(it.qty || 0), 0);

  const isVehicle = invoice.transportMethod === "vehicle";
  const showEwayBill = invoice.hasEwayBill === "yes";

  const hsnSummary = useMemo(() => {
    const map = {};
    invoice.items.forEach((it) => {
      const hsn = it.hsn || "-";
      const taxable = Number(it.qty) * Number(it.price);

      if (!map[hsn]) map[hsn] = { hsn, taxable: 0 };
      map[hsn].taxable += taxable;
    });

    return Object.values(map).map((row) => {
      const totalTax = (row.taxable * gstPercent) / 100;
      return { ...row, cgst: totalTax / 2, sgst: totalTax / 2, totalTax };
    });
  }, [invoice.items, gstPercent]);

  const totalTaxAmount = hsnSummary.reduce((s, r) => s + r.totalTax, 0);

  return (
    <div className="invoicePrintWrap">
      {/* Top Bar */}
      <div className="no-print printTopBar" style={{ gap: 10 }}>
        <button className="btn" onClick={() => navigate("/app/invoices")}>
          ← Back
        </button>

        <button className="btn primary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>

      <div className="invoicePaperA4">
        {/* HEADER TABLE */}
        <table className="invHeaderTable">
          <tbody>
            <tr>
              <td className="hdrLeft">
                <b>GSTIN :</b> {company?.gstin || "__________"}
              </td>
              <td className="hdrCenter">
                <b>TAX INVOICE</b>
              </td>
              <td className="hdrRight">
                <i>Original Copy</i>
              </td>
            </tr>

            <tr>
              <td colSpan="3" className="hdrCompanyName">
                {company?.name || "COMPANY NAME"}
              </td>
            </tr>

            <tr>
              <td colSpan="3" className="hdrHrCell">
                <hr className="hdrHr" />
              </td>
            </tr>

            <tr>
              <td colSpan="3" className="hdrCompanyDetails">
                <div>{company?.address || ""}</div>
                <div>
                  Mob. {company?.phone1 || ""}{company?.phone2 ? `, ${company.phone2}` : ""}
                </div>
                <div>Email : {company?.email || ""}</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* INVOICE + TRANSPORT BOXES */}
        <div className="invTwoBoxGrid">
          <div className="invBox">
            <div><b>Invoice No.</b> : {invoice.invoiceNo}</div>
            <div><b>Dated</b> : {(invoice.invoiceDate || invoice.createdAt?.slice(0, 10))}</div>
            <div className="dotted"><b>Place of Supply</b> : {invoice.placeOfSupply || ""}</div>
            <div><b>Reverse Charge</b> : N</div>
            <div className="dotted"><b>GR/RR No.</b> :</div>
          </div>

          <div className="invBox">
            <div className="dotted">
              <b>Transport</b> : {isVehicle ? "Vehicle" : "Self"}
            </div>

            {isVehicle && (
              <div className="dotted">
                <b>Vehicle No.</b> : {invoice.vehicleNo || ""}
              </div>
            )}

            <div className="dotted"><b>Station</b> :</div>

            {showEwayBill && (
              <div className="dotted">
                <b>E-Way Bill No.</b> : {invoice.ewayBillNo || ""}
              </div>
            )}
          </div>
        </div>

        {/* SHIPPED + BILLED */}
        <div className="invTwoBoxGrid">
          <div className="invBox minBox">
            <div><b>Shipped to :</b></div>
            <div style={{ height: 50 }}></div>
            <div><b>GSTIN / UIN :</b></div>
          </div>

          <div className="invBox minBox">
            <div><b>Billed to :</b></div>
            <div style={{ marginTop: 10, fontWeight: 900 }}>{invoice.customerName}</div>
            <div style={{ height: 30 }}></div>
            <div><b>GSTIN / UIN :</b></div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <table className="invMainTable">
          <thead>
            <tr>
              <th style={{ width: 40 }}>S.N.</th>
              <th>Description of Goods</th>
              <th style={{ width: 120 }}>HSN/SAC Code</th>
              <th style={{ width: 60 }}>Qty.</th>
              <th style={{ width: 60 }}>Unit</th>
              <th style={{ width: 90 }}>Price (₹)</th>
              <th style={{ width: 90 }}>Discount (%)</th>
              <th style={{ width: 100 }}>Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((it, idx) => {
              const amount = Number(it.qty) * Number(it.price);
              return (
                <tr key={idx}>
                  <td style={{ textAlign: "center" }}>{idx + 1}</td>
                  <td>{it.name}</td>
                  <td style={{ textAlign: "center" }}>{it.hsn || "-"}</td>
                  <td style={{ textAlign: "center" }}>{it.qty}</td>
                  <td style={{ textAlign: "center" }}>{it.unit || "Pcs."}</td>
                  <td style={{ textAlign: "right" }}>{money(it.price)}</td>
                  <td style={{ textAlign: "right" }}>0</td>
                  <td style={{ textAlign: "right" }}>{money(amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* GST + GRAND TOTAL */}
        <div className="invGrandRow">
          <div className="invGrandLeft">
            <div><b>Add :</b> IGST @ {gstPercent}% &nbsp;&nbsp; {money(gstAmount)}</div>
            <div><b>Less :</b> Rounded Off (-) &nbsp; {money(roundedOff)}</div>
          </div>

          <div className="invGrandRight">
            <div className="grandText">Grand Total</div>
            <div className="grandAmt">{money(grandTotal)}</div>
          </div>
        </div>

        {/* AMOUNT IN WORDS */}
        <div className="invWordsRow">
          <b>Amount in Words:</b> Rupees {amountInWords(grandTotal)}
        </div>

        {/* HSN SUMMARY */}
        <table className="invTaxTable">
          <thead>
            <tr>
              <th>HSN</th>
              <th>Taxable</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>Total Tax</th>
            </tr>
          </thead>

          <tbody>
            {hsnSummary.map((r, i) => (
              <tr key={i}>
                <td style={{ textAlign: "center" }}>{r.hsn}</td>
                <td style={{ textAlign: "right" }}>{money(r.taxable)}</td>
                <td style={{ textAlign: "right" }}>{money(r.cgst)}</td>
                <td style={{ textAlign: "right" }}>{money(r.sgst)}</td>
                <td style={{ textAlign: "right" }}>{money(r.totalTax)}</td>
              </tr>
            ))}

            <tr>
              <td colSpan="4" style={{ textAlign: "right", fontWeight: 900 }}>
                Total Tax Amount
              </td>
              <td style={{ textAlign: "right", fontWeight: 900 }}>
                {money(totalTaxAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* TOTAL PIECES */}
        <div className="piecesRow">
          <b>Total Grand Pieces:</b> {totalPieces}
        </div>

        {/* FOOTER */}
        <div className="invFooterGrid">
          <div className="invFooterBox">
            <b>Declaration</b>
            <div className="small">
              Please pay crossed account cheque in favour of {company?.name || "Company"}
            </div>

            <div className="small" style={{ marginTop: 8 }}>
              <b>Bank Details:</b><br />
              A/C No. {company?.bankAccNo || "________________"} <br />
              IFSC CODE - {company?.ifscCode || "________________"}
            </div>

            <div style={{ marginTop: 10 }}>
              <b>Terms & Conditions</b>
              <ol className="small" style={{ paddingLeft: 16 }}>
                <li>Goods once sold will not be taken back.</li>
                <li>Subject to Jurisdiction only.</li>
              </ol>
            </div>
          </div>

          <div className="invFooterBox">
            <div style={{ fontWeight: 900, textAlign: "center" }}>
              for {company?.name || "Company"}
            </div>

            <div className="small" style={{ marginTop: 20, textAlign: "center" }}>
              <b>Scan to View Invoice Online</b><br />
              <div
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  padding: 5,
                  background: "#fff",
                  border: "1px solid #ddd",
                }}
              >
                <QRCodeCanvas value={invoiceURL} size={85} />
              </div>
            </div>

            <div style={{ marginTop: 30, textAlign: "center" }}>
              Receiver's Signature
            </div>

            <div style={{ marginTop: 50, textAlign: "right", fontWeight: 900 }}>
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
