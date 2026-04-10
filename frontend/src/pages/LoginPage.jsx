import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    setError("");
    if (!form.email.includes("@")) return setError("Valid email required");
    if (!form.password) return setError("Password required");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Login failed");
      login(data);
      navigate(data.isAdmin ? "/admin" : "/orders");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundSize: "50px 50px",
        backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.03) 1px, transparent 1px)"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={() => navigate("/")}
          className="text-lg font-black tracking-[0.25em] text-[#00FFFF] mb-10 block"
          style={{ textShadow: "0 0 20px #00FFFF" }}
        >
          STREETVIBEX
        </button>

        <p className="text-[9px] tracking-[1em] text-[#00FFFF]/30 mb-3">WELCOME BACK</p>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-8">Sign In</h1>

        {error && (
          <div className="mb-4 p-3 border border-red-500/30 bg-red-500/10 rounded-lg">
            <p className="text-red-400 text-xs tracking-wide">{error}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[9px] tracking-[0.4em] text-white/30 block mb-2">EMAIL</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="your@email.com"
              className="w-full bg-black border border-white/10 focus:border-[#00FFFF]/50 px-4 py-3.5 text-sm text-white placeholder-white/15 outline-none rounded-lg transition-all"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-[0.4em] text-white/30 block mb-2">PASSWORD</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Your password"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-black border border-white/10 focus:border-[#00FFFF]/50 px-4 py-3.5 text-sm text-white placeholder-white/15 outline-none rounded-lg transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-[#00FFFF] text-black font-black tracking-[0.4em] text-sm hover:bg-white transition-all disabled:opacity-40 rounded-lg"
        >
          {loading ? "SIGNING IN..." : "SIGN IN →"}
        </button>

        <p className="text-center text-white/25 text-xs mt-6">
          No account?{" "}
          <Link to="/signup" className="text-[#00FFFF] hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}