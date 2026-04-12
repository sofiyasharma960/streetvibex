import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cart, updateQty, cartTotal } = useCart();
  const threshold = 1999;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 z-[200]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-black border-l border-white/10 z-[201] flex flex-col"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-sm font-black tracking-[0.3em] uppercase">
                Your Bag ({cart.length})
              </h2>
              <button
                onClick={onClose}
                className="text-white/20 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-hide">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <p className="text-[10px] tracking-[0.5em] uppercase">Empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id + item.size} className="flex gap-4">
                    <img
                      src={item.images[0]}
                      className="w-20 h-28 object-cover rounded-xl border border-white/5"
                      alt={item.name}
                    />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-[10px] font-black uppercase tracking-tighter w-2/3">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => updateQty(item._id, item.size, -99)}
                            className="text-white/20 hover:text-white/60 text-xs transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[9px] text-white/30 uppercase mt-1">
                          Size: {item.size}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-4 bg-white/5 rounded-lg px-3 py-1 border border-white/10">
                          <button
                            onClick={() => updateQty(item._id, item.size, -1)}
                            className="text-[#00FFFF] font-bold"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-black w-4 text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item._id, item.size, 1)}
                            className="text-[#00FFFF] font-bold"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xs font-black">
                          ₹{(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t border-white/10 bg-white/[0.02]">
                <div className="flex justify-between mb-2 opacity-40">
                  <span className="text-[9px] tracking-widest uppercase font-black">Subtotal</span>
                  <span className="text-[10px] font-black">₹{cartTotal.toLocaleString()}</span>
                </div>
                {cartTotal < threshold && (
                  <p className="text-[8px] text-yellow-400/50 uppercase tracking-widest text-center mb-4">
                    Add ₹{(threshold - cartTotal).toLocaleString()} for Free Shipping
                  </p>
                )}
                <button
                  onClick={() => { onClose(); navigate("/checkout"); }}
                  className="w-full bg-white text-black font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase hover:bg-[#00FFFF] transition-colors"
                >
                  Checkout →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}