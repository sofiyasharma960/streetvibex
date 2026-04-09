import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

const app = express();

// 10/10 DEPLOYMENT RULE: Trust the proxy (Render, Vercel, Heroku)
// This ensures rate limiting works based on the USER'S IP, not the load balancer's IP.
app.set("trust proxy", 1);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS Config ──────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL, // e.g. https://streetvibex.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy blocked access from: ${origin}`));
    },
    credentials: true,
  })
);

// ── Rate Limiting (Protects against DDoS/Brute Force) ─────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // Slightly more generous for checkout flows
  message: { message: "Payment system busy. Please wait 15 minutes." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many login attempts. Security lockout active." },
});

// Apply global limiter
app.use(limiter);

// ── Body Parsing Logic (CRITICAL ORDER) ──────────────────────────────────────
// Webhook MUST use raw body for signature verification. 
// If express.json() runs first, verification will FAIL.
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));

// Standard JSON parsing for all other routes
app.use(express.json({ limit: "10kb" }));

// ── Application Routes ────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/orders", paymentLimiter, orderRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/reviews", reviewRoutes);

// ── Health Check (For Monitoring Tools) ───────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    uptime: process.uptime(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Path ${req.originalUrl} not found.` });
});

// ── Global Centralized Error Handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const isDev = process.env.NODE_ENV !== "production";

  console.error(`[ERROR] ${req.method} ${req.url}: ${err.message}`);

  res.status(statusCode).json({
    message: isDev ? err.message : "Internal Server Error",
    stack: isDev ? err.stack : null, // Stack traces are for dev eyes only
  });
});

// ── Database Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("💎 MongoDB: Connection Established"))
  .catch((err) => {
    console.error("🚨 MongoDB: Connection Failed ->", err.message);
    process.exit(1); // Shut down if DB is unreachable
  });

export default app;