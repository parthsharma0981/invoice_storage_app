const nodemailer = require("nodemailer");

async function sendMail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: `"InvoicePro" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = sendMail;
