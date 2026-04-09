import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    razorpay_order_id:   { type: String, default: "COD" },
    razorpay_payment_id: { type: String, default: "COD" },
    razorpay_signature:  { type: String, default: "COD" },
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
    paymentMethod: { type: String, enum: ["razorpay", "cod"], default: "razorpay" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);