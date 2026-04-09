import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundSize: "50px 50px",
        backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.03) 1px, transparent 1px)"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-[9px] tracking-[1em] text-[#00FFFF]/30 mb-4">ERROR 404</p>
        <h1
          className="text-8xl sm:text-9xl font-black text-[#00FFFF] mb-4"
          style={{ textShadow: "0 0 30px #00FFFF, 0 0 60px #00FFFF" }}
        >
          404
        </h1>
        <p className="text-white/30 text-sm mb-2">This page doesn't exist.</p>
        <p className="text-white/15 text-xs tracking-widest mb-10">
          Maybe it was a limited drop and it's gone.
        </p>
        <button
          onClick={() => navigate("/")}
          className="border border-[#00FFFF] text-[#00FFFF] px-10 py-4 text-[10px] tracking-[0.4em] hover:bg-[#00FFFF] hover:text-black transition-all font-black"
          style={{ textShadow: "0 0 10px #00FFFF" }}
        >
          BACK TO SHOP →
        </button>
      </motion.div>
    </div>
  );
}