import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistButton({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("svx-wishlist") || "[]");
    setWishlisted(wishlist.some((item) => item._id === product._id));
  }, [product._id]);

  const toggle = (e) => {
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem("svx-wishlist") || "[]");
    let updated;
    if (wishlisted) {
      updated = wishlist.filter((item) => item._id !== product._id);
    } else {
      updated = [...wishlist, product];
      setPop(true);
      setTimeout(() => setPop(false), 1000);
    }
    localStorage.setItem("svx-wishlist", JSON.stringify(updated));
    setWishlisted(!wishlisted);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.85 }}
        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
          wishlisted
            ? "bg-red-500/20 border-red-500/50 text-red-400"
            : "bg-black/50 border-white/20 text-white/40 hover:border-white/40 hover:text-white/70"
        }`}
        aria-label="Add to wishlist"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {pop && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] text-red-400 tracking-widest whitespace-nowrap pointer-events-none"
          >
            ♥ SAVED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}