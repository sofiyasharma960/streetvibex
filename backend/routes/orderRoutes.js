import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import { sendOrderConfirmation } from "../utils/sendEmail.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount, currency, receipt } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: currency || "INR",
      receipt,
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }
    if (!orderDetails?.cart?.length || !orderDetails?.form || !orderDetails?.total) {
      return res.status(400).json({ message: "Missing order details" });
    }
    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // Save order to database
    const order = new Order({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items: orderDetails.cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        size: item.size,
        image: item.images?.[0] || "",
      })),
      shippingAddress: orderDetails.form,
      totalAmount: orderDetails.total,
      status: "confirmed",
      paymentStatus: "paid",
    });

    await order.save();

    // Send confirmation email
    try {
      await sendOrderConfirmation(order);
    } catch (emailErr) {
      console.log("⚠️ Email failed:", emailErr.message);
    }

    res.json({ success: true, message: "Payment verified", orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin)
// Get all orders (admin only)
router.get("/all", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Razorpay webhook
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.body;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSign !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      // Check if order already exists
      const existing = await Order.findOne({
        razorpay_payment_id: payment.id,
      });

      if (!existing) {
        console.log("⚠️ Webhook received for unrecorded payment:", payment.id);
      } else {
        existing.paymentStatus = "paid";
        existing.status = "confirmed";
        await existing.save();
        console.log("✅ Webhook: order updated for payment:", payment.id);
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      console.log("❌ Payment failed for order:", payment.order_id);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;