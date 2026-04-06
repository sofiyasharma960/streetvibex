import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";

dotenv.config();

const products = [
  {
    name: "VOID WALKER",
    description: "Anime-inspired surreal artwork. The feeling of existing between two worlds. 100% combed cotton oversized tee.",
    price: 1299,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/q_auto/f_auto/v1775392264/Screenshot_2026-04-05_173755_fycsvs.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "graphic tee",
    inStock: true,
  },
  {
    name: "APEX PREDATOR",
    description: "Great White Shark — support and protect them. Vintage illustration on heavyweight black cotton.",
    price: 1299,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_174036_aarupv.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "graphic tee",
    inStock: true,
  },
  {
    name: "ALL EYES ON ME",
    description: "Surrealist eye print shirt. Grey canvas. For the ones who see everything.",
    price: 1399,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_173652_edvlcp.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "shirt",
    inStock: true,
  },
  {
    name: "REBIRTH AWAKENING",
    description: "Gothic cathedral stained glass artwork. Acid-washed oversized tee. The darkness becomes light.",
    price: 1499,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_174117_ahdcij.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "graphic tee",
    inStock: true,
  },
  {
    name: "THE OTHER SIDE",
    description: "Create your dream. Coordinates to nowhere. Editorial graphic tee for the ones who wander.",
    price: 1299,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_173601_aiabg4.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "graphic tee",
    inStock: true,
  },
  {
    name: "NEWSPAPER FASHION",
    description: "Vintage newspaper knit. Retro editorial aesthetic. For the ones who read between the lines.",
    price: 1899,
    images: ["https://res.cloudinary.com/dcnxrmul3/image/upload/v1775391403/Screenshot_2026-04-05_174011_qy4eai.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "knit",
    inStock: true,
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log("✅ 6 products seeded successfully!");
    process.exit();
  })
  .catch((err) => {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  });