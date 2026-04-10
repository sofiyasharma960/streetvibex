import express from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { razorpay } from "../config/razorpay.js";
import { sendOrderConfirmation } from "../utils/sendEmail.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// HELPER: Stock Management Logic
const decreaseProductStock = async (cartItems) => {
  for (const item of cartItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { countInStock: -item.qty },
    });
  }
};

// POST /api/orders/create — Razorpay order init
router.post("/create", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `svx_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders/verify — Razorpay payment verification
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
      userId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Transaction tampered with" });
    }

    const order = new Order({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items: orderDetails.cart,
      shippingAddress: orderDetails.form,
      totalAmount: orderDetails.total,
      userId: userId || null,
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "razorpay",
    });

    await order.save();
    await decreaseProductStock(orderDetails.cart);

    try {
      await sendOrderConfirmation(order);
    } catch (e) {
      console.log("Email failed but order saved.");
    }

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders/cod — Cash on delivery
router.post("/cod", async (req, res) => {
  try {
    const { orderDetails, userId } = req.body;
    const order = await Order.create({
      items: orderDetails.cart,
      shippingAddress: orderDetails.form,
      totalAmount: orderDetails.total,
      userId: userId || null,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "confirmed",
    });
    await decreaseProductStock(orderDetails.cart);
    try {
      await sendOrderConfirmation(order);
    } catch (e) {
      console.log("Email failed but order saved.");
    }
    res.json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders/coupon — Validate coupon code
router.post("/coupon", async (req, res) => {
  const COUPONS = {
    VIBE10: { type: "percent", discount: 10, code: "VIBE10" },
    FIRST50: { type: "flat", discount: 50, code: "FIRST50" },
  };
  const coupon = COUPONS[req.body.code?.toUpperCase()];
  if (!coupon)
    return res.status(400).json({ message: "Invalid coupon code" });
  res.json(coupon);
});

// GET /api/orders/my-orders — Logged-in user's orders
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status — Admin update order status
router.patch("/:id/status", protect, protectAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/all — Admin: all orders, paginated
// NOTE: This must come AFTER specific named routes (/my-orders, /coupon, etc.)
// so Express doesn't try to match "my-orders" as an :id param
router.get("/all", protect, protectAdmin, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const total = await Order.countDocuments();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── export MUST be last — anything after this line is dead code ──
export default router;