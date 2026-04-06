import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function OrderConfirmPage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);

  useEffect(() => {
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
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundSize: "50px 50px",
        backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.03) 1px, transparent 1px)"
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg w-full"
      >
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, delay: 0.2 }}
          className="w-24 h-24 rounded-full border-2 border-[#00FFFF] flex items-center justify-center mx-auto mb-8 drop-shadow-[0_0_30px_#00FFFF]"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl text-[#00FFFF]"
          >
            ✓
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[9px] tracking-[1em] text-[#00FFFF]/40 mb-4">ORDER CONFIRMED</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-4">
            YOU'RE IN<br />
            <span className="text-[#00FFFF] drop-shadow-[0_0_20px_#00FFFF]">THE DROP</span>
          </h1>
          <p className="text-white/30 text-sm leading-relaxed mb-2 max-w-sm mx-auto">
            Your order is confirmed and being processed. A confirmation email is on its way.
          </p>
          <p className="text-white/20 text-xs tracking-widest mb-10">
            Estimated delivery: 5–7 business days
          </p>

          <div className="bg-white/3 border border-[#00FFFF]/10 rounded-2xl p-6 mb-8 text-left space-y-3">
            {[
              { label: "STATUS", value: "Confirmed ✓", color: "text-green-400" },
              { label: "PAYMENT", value: "Successful", color: "text-green-400" },
              { label: "SHIPPING", value: "5–7 business days", color: "text-white/50" },
              { label: "SUPPORT", value: "streetvibex0x0@gmail.com", color: "text-[#00FFFF]/60" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-white/25 tracking-widest">{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-10 py-4 bg-[#00FFFF] text-black font-black tracking-[0.4em] text-[10px] hover:bg-white transition-all rounded-lg"
            >
              BACK TO SHOP
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-10 py-4 border border-white/10 text-white/40 font-black tracking-[0.4em] text-[10px] hover:border-white/20 hover:text-white/60 transition-all rounded-lg"
            >
              VIEW MORE DROPS
            </button>
          </div>

          <p className="text-white/15 text-[10px] tracking-widest mt-8">
            Redirecting to shop in {count}s...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}