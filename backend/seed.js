import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";

dotenv.config();

const products = [
  {
    name: "VOID WALKER",
    description: "Anime-inspired surreal artwork. 100% combed cotton oversized tee.",
    price: 1299,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/q_auto/f_auto/v1775392264/Screenshot_2026-04-05_173755_fycsvs.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "graphic tee",
    countInStock: 20, // UPDATED
  },
  {
    name: "APEX PREDATOR",
    description: "Great White Shark vintage illustration on heavyweight black cotton.",
    price: 1299,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_174036_aarupv.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "graphic tee",
    countInStock: 20, // UPDATED
  },
  {
    name: "ALL EYES ON ME",
    description: "Surrealist eye print shirt. Grey canvas.",
    price: 1399,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_173652_edvlcp.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "shirt",
    countInStock: 20, // UPDATED
  },
  {
    name: "REBIRTH AWAKENING",
    description: "Gothic cathedral stained glass artwork. Acid-washed oversized tee.",
    price: 1499,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_174117_ahdcij.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "graphic tee",
    countInStock: 20, // UPDATED
  },
  {
    name: "THE OTHER SIDE",
    description: "Editorial graphic tee for the ones who wander.",
    price: 1299,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_173601_aiabg4.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "graphic tee",
    countInStock: 20, // UPDATED
  },
  {
    name: "NEWSPAPER FASHION",
    description: "Vintage newspaper knit. Retro editorial aesthetic.",
    price: 1899,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_174011_qy4eai.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "knit",
    countInStock: 20, // UPDATED
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log("✅ 6 products seeded with stock numbers!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  });