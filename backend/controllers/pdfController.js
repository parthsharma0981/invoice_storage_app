const PDFDocument = require("pdfkit");
const Invoice = require("../models/Invoice");
const Company = require("../models/Company");

exports.generateInvoicePDF = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findOne({
            _id: id,
            adminId: req.user.adminId
        });

        if (!invoice) {
            return res.status(404).json({ msg: "Invoice not found" });
        }

        // Get company details
        const company = await Company.findOne({ adminId: req.user.adminId });

        // Create PDF
        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Invoice-${invoice.invoiceNo || invoice._id}.pdf`
        );

        doc.pipe(res);

        // Header
        doc.fontSize(20).font("Helvetica-Bold").text(company?.name || "Company Name", { align: "center" });
        doc.fontSize(10).font("Helvetica").text(company?.address || "", { align: "center" });
        doc.text(`Phone: ${company?.phone1 || "-"} | Email: ${company?.email || "-"}`, { align: "center" });
        if (company?.gstin) {
            doc.text(`GSTIN: ${company.gstin}`, { align: "center" });
        }

        doc.moveDown();
        doc.strokeColor("#000").lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Invoice details
        doc.fontSize(14).font("Helvetica-Bold").text("TAX INVOICE", { align: "center" });
        doc.moveDown(0.5);

        doc.fontSize(10).font("Helvetica");
        doc.text(`Invoice No: ${invoice.invoiceNo}`, 50);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50);
        doc.text(`Customer: ${invoice.customerName}`, 50);

        doc.moveDown();
        doc.strokeColor("#ddd").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Items table header
        const tableTop = doc.y;
        doc.font("Helvetica-Bold");
        doc.text("Item", 50, tableTop, { width: 200 });
        doc.text("HSN", 250, tableTop, { width: 60 });
        doc.text("Qty", 310, tableTop, { width: 50 });
        doc.text("Price", 360, tableTop, { width: 80 });
        doc.text("Total", 440, tableTop, { width: 80, align: "right" });

        doc.moveDown();
        doc.strokeColor("#ddd").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Items
        doc.font("Helvetica");
        let itemY = doc.y;
        const items = invoice.items || [];

        for (const item of items) {
            const itemTotal = (item.qty || 0) * (item.price || 0);
            doc.text(item.name || "-", 50, itemY, { width: 200 });
            doc.text(item.hsn || "-", 250, itemY, { width: 60 });
            doc.text(String(item.qty || 0), 310, itemY, { width: 50 });
            doc.text(`₹${item.price || 0}`, 360, itemY, { width: 80 });
            doc.text(`₹${itemTotal}`, 440, itemY, { width: 80, align: "right" });
            itemY += 18;
        }

        doc.y = itemY + 10;
        doc.strokeColor("#ddd").lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Totals
        const totalsX = 360;
        doc.font("Helvetica");
        doc.text(`Subtotal:`, totalsX, doc.y);
        doc.text(`₹${invoice.subtotal || 0}`, 440, doc.y - 12, { width: 80, align: "right" });
        doc.moveDown(0.3);

        if (invoice.gstPercent > 0) {
            doc.text(`GST (${invoice.gstPercent}%):`, totalsX, doc.y);
            doc.text(`₹${invoice.gstAmount || 0}`, 440, doc.y - 12, { width: 80, align: "right" });
            doc.moveDown(0.3);
        }

        if (invoice.discount > 0) {
            doc.text(`Discount:`, totalsX, doc.y);
            doc.text(`-₹${invoice.discount}`, 440, doc.y - 12, { width: 80, align: "right" });
            doc.moveDown(0.3);
        }

        doc.moveDown(0.3);
        doc.font("Helvetica-Bold");
        doc.text(`Grand Total:`, totalsX, doc.y);
        doc.text(`₹${invoice.grandTotal || 0}`, 440, doc.y - 12, { width: 80, align: "right" });

        // Payment status
        doc.moveDown();
        const paidAmount = invoice.paidAmount || 0;
        const remaining = (invoice.grandTotal || 0) - paidAmount;

        if (paidAmount > 0) {
            doc.moveDown();
            doc.font("Helvetica");
            doc.text(`Paid: ₹${paidAmount}`, totalsX);
            doc.text(`Balance Due: ₹${remaining}`, totalsX);
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(9).font("Helvetica").fillColor("#666");
        doc.text("Thank you for your business!", 50, doc.y, { align: "center" });
        doc.text("This is a computer-generated invoice.", { align: "center" });

        doc.end();
    } catch (err) {
        console.error("PDF Generation Error:", err);
        res.status(500).json({ msg: "Error generating PDF" });
    }
};
