import express from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { razorpay } from "../config/razorpay.js"; // Using the new config
import { sendOrderConfirmation } from "../utils/sendEmail.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// HELPER: Stock Management Logic
const decreaseProductStock = async (cartItems) => {
  for (const item of cartItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { countInStock: -item.qty } // Subtracts quantity from DB
    });
  }
};

// 1. Create Razorpay Order
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

// 2. Verify Payment & Manage Inventory
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails, userId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Transaction tampered with" });
    }

    // CREATE ORDER RECORD
    const order = new Order({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items: orderDetails.cart,
      shippingAddress: orderDetails.form,
      totalAmount: orderDetails.total,
      userId: userId || null,
      status: "confirmed",
      paymentStatus: "paid"
    });

    await order.save();
    
    // REDUCE STOCK IN DB
    await decreaseProductStock(orderDetails.cart);

    // SEND CONFIRMATION EMAIL
    try { await sendOrderConfirmation(order); } catch (e) { console.log("Email failed but order saved."); }

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Admin View: Get all orders (Securely)
router.get("/all", protect, protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;