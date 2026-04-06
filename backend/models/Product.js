import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    images: [{ type: String }],
    sizes: { type: [String], default: ["S", "M", "L", "XL"] },
    category: { type: String, default: "apparel" },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);