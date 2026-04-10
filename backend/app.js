import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Route Imports
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

const app = express();

/**
 * 1. DEPLOYMENT PREP: Trust Proxy
 * Required for Render/Vercel to pass the correct user IP for rate limiting.
 */
app.set("trust proxy", 1);

/**
 * 2. SECURITY MIDDLEWARE
 */
app.use(helmet()); // Sets various security-related HTTP headers

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL, 
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy blocked access from: ${origin}`));
    },
    credentials: true,
  })
);

/**
 * 3. RATE LIMITING (DDoS Protection)
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

app.use("/api/", limiter); // Apply globally to all API routes

/**
 * 4. BODY PARSING (Order Matters)
 */
// Razorpay webhooks need the RAW body to verify signatures.
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));

// Standard JSON parsing for all other routes
app.use(express.json({ limit: "10kb" }));

/**
 * 5. ROUTES
 */
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);

/**
 * 6. HEALTH CHECK
 * Use this to verify Render is successfully talking to your DB.
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

/**
 * 7. GLOBAL ERROR HANDLER
 */
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`[ERROR] ${req.method} ${req.url}: ${err.message}`);

  res.status(statusCode).json({
    message: process.env.NODE_ENV === "production" 
      ? "Internal Server Error" 
      : err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

/**
 * 8. DATABASE CONNECTION
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("💎 MongoDB: Connection Established"))
  .catch((err) => {
    console.error("🚨 MongoDB: Connection Failed ->", err.message);
    process.exit(1);
  });

export default app;