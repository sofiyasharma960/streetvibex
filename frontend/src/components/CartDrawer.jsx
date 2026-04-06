import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ cart, setCart, isOpen, onClose }) {
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = cartTotal >= 1999 ? 0 : 99;

  const removeFromCart = (pid, size) =>
    setCart((prev) => prev.filter((i) => !(i._id === pid && i.size === size)));

  const changeQty = (pid, size, delta) =>
    setCart((prev) =>
      prev
        .map((i) =>
          i._id === pid && i.size === size ? { ...i, qty: i.qty + delta } : i
        )
        .filter((i) => i.qty > 0)
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[190]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#060606] border-l border-[#00FFFF]/20 z-[200] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#00FFFF]/10">
              <h2 className="text-[10px] font-black text-[#00FFFF] tracking-[0.5em]">
                YOUR BAG ({cartCount})
              </h2>
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white text-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 && (
                <div className="text-center mt-20">
                  <p className="text-white/15 text-xs tracking-[0.4em]">
                    BAG IS EMPTY
                  </p>
                  <p className="text-white/10 text-xs mt-2">
                    Add something legendary
                  </p>
                </div>
              )}
              {cart.map((item) => (
                <div
                  key={item._id + item.size}
                  className="flex gap-3 items-center border border-white/5 rounded-xl p-3 hover:border-[#00FFFF]/20 transition-all"
                >
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/80x100/050a0a/00FFFF?text=${item.name}`;
                    }}
                    className="w-14 rounded-lg object-cover bg-white/5 flex-shrink-0"
                    style={{ height: "72px" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-[#00FFFF] tracking-widest truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-white/25 mt-0.5">
                      Size: {item.size}
                    </p>
                    <p className="text-sm font-bold text-white/60 mt-1">
                      ₹{item.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item._id, item.size)}
                      className="text-white/20 hover:text-red-400 text-xs transition-colors"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-1 border border-white/10 rounded-lg px-2 py-1">
                      <button
                        onClick={() => changeQty(item._id, item.size, -1)}
                        className="text-[#00FFFF] w-5 text-center font-bold"
                      >
                        −
                      </button>
                      <span className="text-xs text-white w-5 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => changeQty(item._id, item.size, 1)}
                        className="text-[#00FFFF] w-5 text-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#00FFFF]/10 space-y-3">
              <div className="flex justify-between text-xs text-white/30">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Shipping</span>
                <span
                  className={`font-bold ${
                    shipping === 0 ? "text-green-400" : "text-white/40"
                  }`}
                >
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-yellow-400/50 text-center">
                  Add ₹{(1999 - cartTotal).toLocaleString()} more for free
                  shipping
                </p>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="font-bold text-white">Total</span>
                <span className="text-[#00FFFF] font-black text-xl drop-shadow-[0_0_8px_#00FFFF]">
                  ₹{(cartTotal + shipping).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
                disabled={cart.length === 0}
                className="w-full py-4 bg-[#00FFFF] text-black font-black tracking-[0.3em] text-sm hover:bg-white transition-all disabled:opacity-20 disabled:cursor-not-allowed rounded-xl"
              >
                CHECKOUT →
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 border border-white/10 text-white/30 text-[10px] tracking-widest hover:border-white/20 hover:text-white/50 transition-all rounded-xl"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}