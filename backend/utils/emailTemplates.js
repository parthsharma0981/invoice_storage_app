function baseTemplate({ title, bodyHtml }) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:20px;">
    <div style="max-width:650px; margin:auto; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e5e7eb;">
      
      <div style="background:#0b0f19; padding:18px 20px;">
        <h2 style="margin:0; color:#ffffff; font-size:18px;">VaniBoard SaaS</h2>
        <p style="margin:6px 0 0; color:rgba(255,255,255,0.7); font-size:13px;">Smart Billing & Inventory</p>
      </div>

      <div style="padding:20px;">
        <h3 style="margin:0 0 10px; color:#111827;">${title}</h3>
        <div style="color:#374151; font-size:14px; line-height:1.6;">
          ${bodyHtml}
        </div>
      </div>

      <div style="padding:14px 20px; background:#f9fafb; border-top:1px solid #e5e7eb;">
        <p style="margin:0; font-size:12px; color:#6b7280;">
          This is an automated email from VaniBoard SaaS. Please do not reply.
        </p>
      </div>
    </div>
  </div>
  `;
}

function productAddedMail({ companyName, product, productsCount }) {
  return baseTemplate({
    title: "New Product Added ✅",
    bodyHtml: `
      <p><b>${companyName}</b> has added a new product.</p>
      <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb;">
        <p style="margin:0;"><b>Product:</b> ${product.name}</p>
        <p style="margin:6px 0 0;"><b>Category:</b> ${product.category || "-"}</p>
        <p style="margin:6px 0 0;"><b>Price:</b> ₹${product.price || 0}</p>
        <p style="margin:6px 0 0;"><b>Stock:</b> ${product.stock || 0}</p>
      </div>
      <p style="margin-top:12px;">Total products in system: <b>${productsCount}</b></p>
    `,
  });
}

function invoiceCreatedCompanyMail({ companyName, invoice }) {
  return baseTemplate({
    title: "Invoice Created 🧾",
    bodyHtml: `
      <p>A new invoice has been created for <b>${companyName}</b>.</p>
      <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb;">
        <p style="margin:0;"><b>Invoice No:</b> ${invoice.invoiceNo}</p>
        <p style="margin:6px 0 0;"><b>Customer:</b> ${invoice.customerName}</p>
        <p style="margin:6px 0 0;"><b>Grand Total:</b> ₹${invoice.grandTotal}</p>
        <p style="margin:6px 0 0;"><b>Date:</b> ${new Date(invoice.createdAt).toLocaleString()}</p>
      </div>
    `,
  });
}

function invoiceCreatedCustomerMail({ customerName, invoice, companyName }) {
  return baseTemplate({
    title: "Your Invoice is Ready ✅",
    bodyHtml: `
      <p>Hello <b>${customerName}</b>,</p>
      <p>Your invoice has been generated successfully from <b>${companyName}</b>.</p>

      <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb;">
        <p style="margin:0;"><b>Invoice No:</b> ${invoice.invoiceNo}</p>
        <p style="margin:6px 0 0;"><b>Total Amount:</b> ₹${invoice.grandTotal}</p>
      </div>

      <p style="margin-top:12px;">
        If you have any questions, please contact the company.
      </p>
    `,
  });
}

function staffCreatedCompanyMail({ staffUsername, companyName }) {
  return baseTemplate({
    title: "New Staff Account Created 👤",
    bodyHtml: `
      <p>A new staff account has been created under <b>${companyName}</b>.</p>
      <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb;">
        <p style="margin:0;"><b>Staff Username:</b> ${staffUsername}</p>
      </div>
    `,
  });
}

function customerGreetingMail({ customerName, companyName }) {
  return baseTemplate({
    title: "Welcome to Our Store 🎉",
    bodyHtml: `
      <p>Hello <b>${customerName}</b>,</p>
      <p>Thank you for connecting with <b>${companyName}</b>.</p>
      <p>We’re happy to serve you with quick billing and smooth service.</p>
      <p style="margin-top:12px;"><b>Regards,</b><br/>${companyName}</p>
    `,
  });
}

function customerAddedCompanyMail({ customerName, customerEmail, companyName }) {
  return baseTemplate({
    title: "New Customer Added ✅",
    bodyHtml: `
      <p>A new customer has been added under <b>${companyName}</b>.</p>
      <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb;">
        <p style="margin:0;"><b>Name:</b> ${customerName}</p>
        <p style="margin:6px 0 0;"><b>Email:</b> ${customerEmail || "-"}</p>
      </div>
    `,
  });
}

/* ===========================
   ✅ NEW: DUE EMAIL TEMPLATES
=========================== */

function dueCustomerMail({ customerName, companyName, amount, notes }) {
  return baseTemplate({
    title: "Payment Due Reminder ⚠️",
    bodyHtml: `
      <p>Hello <b>${customerName}</b>,</p>
      <p>This is a gentle reminder from <b>${companyName}</b> regarding your pending due amount.</p>

      <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb;">
        <p style="margin:0;"><b>Pending Due:</b> ₹${amount}</p>
        <p style="margin:6px 0 0;"><b>Notes:</b> ${notes || "-"}</p>
      </div>

      <p style="margin-top:12px;">
        Please complete the payment at your earliest convenience.
      </p>

      <p style="margin-top:12px;"><b>Regards,</b><br/>${companyName}</p>
    `,
  });
}

function dueCompanyMail({ companyName, customerName, amount }) {
  return baseTemplate({
    title: "Due Updated ✅",
    bodyHtml: `
      <p>A due entry has been updated under <b>${companyName}</b>.</p>

      <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb;">
        <p style="margin:0;"><b>Customer:</b> ${customerName}</p>
        <p style="margin:6px 0 0;"><b>Current Due Amount:</b> ₹${amount}</p>
      </div>
    `,
  });
}

function passwordResetMail({ userName, companyName, resetUrl }) {
  return baseTemplate({
    title: "Password Reset Request 🔑",
    bodyHtml: `
      <p>Hello <b>${userName}</b>,</p>
      <p>We received a request to reset your password for <b>${companyName}</b>.</p>

      <div style="padding:16px; margin:16px 0; text-align:center;">
        <a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background:#0b0f19; color:#ffffff; text-decoration:none; border-radius:8px; font-weight:bold;">
          Reset Password
        </a>
      </div>

      <p style="color:#6b7280; font-size:13px;">
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>

      <div style="padding:12px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb; margin-top:12px;">
        <p style="margin:0; font-size:12px; color:#6b7280;">
          <b>Direct Link:</b> ${resetUrl}
        </p>
      </div>
    `,
  });
}

function lowStockAlertMail({ companyName, lowStockProducts }) {
  const productRows = lowStockProducts.map(
    (p) => `<tr>
      <td style="padding:8px; border-bottom:1px solid #e5e7eb;">${p.name}</td>
      <td style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:center;">${p.stock}</td>
      <td style="padding:8px; border-bottom:1px solid #e5e7eb; text-align:center;">${p.lowStockThreshold || 5}</td>
    </tr>`
  ).join("");

  return baseTemplate({
    title: "Low Stock Alert ⚠️",
    bodyHtml: `
      <p><b>${companyName}</b> has products with low stock levels:</p>

      <table style="width:100%; border-collapse:collapse; margin:12px 0;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px; text-align:left; border-bottom:2px solid #e5e7eb;">Product</th>
            <th style="padding:8px; text-align:center; border-bottom:2px solid #e5e7eb;">Stock</th>
            <th style="padding:8px; text-align:center; border-bottom:2px solid #e5e7eb;">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <p style="margin-top:12px;">
        Please restock these items to avoid running out.
      </p>
    `,
  });
}

module.exports = {
  baseTemplate,
  productAddedMail,
  invoiceCreatedCompanyMail,
  invoiceCreatedCustomerMail,
  staffCreatedCompanyMail,
  customerGreetingMail,
  customerAddedCompanyMail,

  // ✅ DUE EXPORTS
  dueCustomerMail,
  dueCompanyMail,

  // ✅ NEW EXPORTS
  passwordResetMail,
  lowStockAlertMail,
};
