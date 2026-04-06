import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderConfirmation = async (order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #111;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #111;">${item.size}</td>
        <td style="padding: 12px; border-bottom: 1px solid #111;">${item.qty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #111;">₹${(item.price * item.qty).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  const mailOptions = {
    from: `"StreetVibeX" <${process.env.EMAIL_USER}>`,
    to: order.shippingAddress.email,
    subject: "✅ Order Confirmed — StreetVibeX",
    html: `
      <div style="background:#000; color:#fff; font-family: sans-serif; padding: 40px; max-width: 600px; margin: auto;">
        <h1 style="color:#00FFFF; letter-spacing: 0.2em;">STREETVIBEX</h1>
        <p style="color:#aaa;">JP Nagar, Bengaluru — Est. 2026</p>
        
        <h2 style="margin-top: 32px;">Hey ${order.shippingAddress.name},</h2>
        <p style="color:#aaa;">Your order is confirmed and being processed. Here's your summary:</p>

        <table style="width:100%; border-collapse: collapse; margin-top: 24px;">
          <thead>
            <tr style="color:#00FFFF; font-size: 12px; letter-spacing: 0.1em;">
              <th style="padding: 12px; text-align:left;">ITEM</th>
              <th style="padding: 12px; text-align:left;">SIZE</th>
              <th style="padding: 12px; text-align:left;">QTY</th>
              <th style="padding: 12px; text-align:left;">PRICE</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 24px; padding: 20px; border: 1px solid #222; border-radius: 8px;">
          <p style="margin: 0; color:#aaa;">Total Paid</p>
          <p style="margin: 4px 0 0; font-size: 28px; font-weight: 900; color:#00FFFF;">₹${order.totalAmount.toLocaleString()}</p>
        </div>

        <div style="margin-top: 24px; padding: 20px; border: 1px solid #222; border-radius: 8px;">
          <p style="color:#00FFFF; font-size: 12px; letter-spacing: 0.1em;">DELIVERY ADDRESS</p>
          <p style="color:#aaa; margin: 8px 0 0;">
            ${order.shippingAddress.address},<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.pincode}
          </p>
        </div>

        <p style="margin-top: 32px; color:#555; font-size: 12px;">
          Estimated delivery: 5–7 business days<br/>
          Questions? Reply to this email or reach us at streetvibex0x0@gmail.com
        </p>

        <p style="margin-top: 32px; color:#222; font-size: 11px;">© 2026 StreetVibeX — JP Nagar, Bengaluru</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};