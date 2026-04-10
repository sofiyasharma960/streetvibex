import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

// 1. STARTUP GUARD: Crash immediately if critical env vars are missing
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`🚨 FATAL: Missing env var: ${key}`);
    process.exit(1);
  }
}

// 2. PORT BINDING: Render uses 10000 by default
const PORT = process.env.PORT || 10000;

// The '0.0.0.0' is critical for Render to route external traffic to your app
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is flying on port ${PORT}`);
  console.log(`📡 Frequency: production`);
});