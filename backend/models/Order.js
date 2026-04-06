import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        qty: Number,
        size: String,
        image: String,
      },
    ],
    shippingAddress: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
      state: String,
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "confirmed",
    },
    paymentStatus: { type: String, default: "paid" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);