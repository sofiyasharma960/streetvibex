import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function OrderConfirmPage({ setCart }) {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);

  useEffect(() => {
    // 1. Clear the cart immediately on successful order landing
    if (setCart) setCart([]);

    // 2. Auto-redirect timer
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, setCart]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 pointer-events-none -z-10" style={{
        backgroundSize: "60px 60px",
        backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.02) 1px, transparent 1px)"
      }} />
      
      {/* Cyan Glow Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00FFFF]/10 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-lg w-full"
      >
        {/* Animated Checkmark Circle */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
          className="w-20 h-20 rounded-full border border-[#00FFFF] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(0,255,255,0.3)]"
        >
          <motion.svg 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-10 h-10 text-[#00FFFF]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-5xl font-black text-white tracking-tighter italic mb-4">
            LEVEL <span className="text-[#00FFFF] drop-shadow-[0_0_15px_#00FFFF]">COMPLETE</span>
          </h1>
          <p className="text-white/40 text-[10px] tracking-[0.5em] uppercase mb-8">
            Your order has been encrypted and secured
          </p>

          {/* Receipt Card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-10 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-right from-transparent via-[#00FFFF]/40 to-transparent" />
            
            {[
              { label: "STATUS", value: "DISPATCH READY", color: "text-[#00FFFF]" },
              { label: "PAYMENT", value: "VERIFIED", color: "text-white" },
              { label: "EXPECTED", value: "5-7 BUSINESS DAYS", color: "text-white/60" },
              { label: "ID", value: `#STV-${Math.floor(1000 + Math.random() * 9000)}`, color: "text-white/30" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-4 border-b border-white/5 last:border-0"
              >
                <span className="text-[9px] tracking-[0.3em] text-white/20 font-bold">{item.label}</span>
                <span className={`text-[10px] tracking-widest font-black ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/")}
              className="group relative overflow-hidden px-10 py-5 bg-white text-black font-black tracking-[0.4em] text-[11px] transition-all rounded-xl active:scale-95"
            >
              <span className="relative z-10">CONTINUE MISSION</span>
              <div className="absolute inset-0 bg-[#00FFFF] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            
            <p className="text-white/20 text-[9px] tracking-[0.2em]">
              Returning to base in <span className="text-white font-bold">{count}s</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}