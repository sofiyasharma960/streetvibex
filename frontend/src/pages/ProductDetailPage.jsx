import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CartDrawer from "../components/CartDrawer";

export default function ProductDetailPage({ cart, setCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = cartTotal >= 1999 ? 0 : 99;

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const addToCart = useCallback((andCheckout = false) => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2500);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id && i.size === selectedSize);
      if (existing) return prev.map((i) =>
        i._id === product._id && i.size === selectedSize ? { ...i, qty: i.qty + 1 } : i
      );
      return [...prev, { ...product, size: selectedSize, qty: 1 }];
    });
    if (andCheckout) {
      navigate("/checkout");
    } else {
      setAdded(true);
      setCartOpen(true);
      setTimeout(() => setAdded(false), 2000);
    }
  }, [selectedSize, product, setCart, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white/40 tracking-widest text-sm">Product not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundSize: "50px 50px",
        backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.03) 1px, transparent 1px)"
      }} />

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 w-full z-[100] flex justify-between items-center px-6 sm:px-12 py-5 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <button
          onClick={() => navigate("/")}
          className="text-base font-black tracking-[0.2em] text-[#00FFFF] drop-shadow-[0_0_20px_#00FFFF]"
        >
          STREETVIBEX
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-[10px] tracking-widest text-white/30 hover:text-white transition-colors hidden sm:block"
          >
            ← BACK
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 border border-[#00FFFF]/40 text-[#00FFFF] px-4 py-2 hover:bg-[#00FFFF] hover:text-black transition-all text-[10px] tracking-widest font-bold rounded-lg"
          >
            BAG
            {cartCount > 0 && (
              <span className="bg-[#00FFFF] text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="pt-24 px-4 sm:px-8 lg:px-16 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* LEFT — IMAGE */}
          <div className="w-full lg:w-1/2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative w-full rounded-2xl overflow-hidden bg-white/3 border border-white/5" style={{ aspectRatio: "3/4" }}>
                <img
                  src={product.images?.[imgIdx]}
                  alt={product.name}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.src = `https://placehold.co/600x800/050a0a/00FFFF?text=${encodeURIComponent(product.name)}`;
                  }}
                  className="w-full h-full object-cover"
                />
                {product.images?.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {product.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-[#00FFFF] w-6" : "bg-white/30 w-1.5"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? "border-[#00FFFF]" : "border-white/10 hover:border-white/30"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT — PRODUCT INFO */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:sticky lg:top-28"
            >
              <p className="text-[9px] tracking-[0.8em] text-[#00FFFF]/40 mb-2 uppercase">
                {product.category} — StreetVibeX
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-none mb-3">
                {product.name}
              </h1>
              <p className="text-2xl sm:text-3xl font-black text-[#00FFFF] drop-shadow-[0_0_10px_#00FFFF] mb-2">
                ₹{product.price?.toLocaleString()}
              </p>
              <p className="text-[10px] text-green-400 tracking-widest mb-5">✓ IN STOCK</p>
              <p className="text-white/40 text-sm leading-relaxed mb-8 border-l-2 border-[#00FFFF]/20 pl-4">
                {product.description}
              </p>

              {/* SIZE SELECTOR */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-black tracking-[0.4em] text-white/60">SELECT SIZE</p>
                </div>
                <AnimatePresence>
                  {sizeError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <p className="text-red-400 text-xs tracking-widest flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        ⚠ Please select a size to continue
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex flex-wrap gap-3">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`w-16 h-16 text-base font-black border-2 rounded-xl transition-all duration-200 ${
                        selectedSize === size
                          ? "border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/15 drop-shadow-[0_0_12px_#00FFFF] scale-105"
                          : sizeError
                          ? "border-red-500/30 text-white/40"
                          : "border-white/15 text-white/50 hover:border-[#00FFFF]/40 hover:text-white/80"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-[#00FFFF]/50 text-[10px] tracking-widest mt-3">
                    Selected: <span className="text-[#00FFFF] font-bold">{selectedSize}</span>
                  </p>
                )}
              </div>

              {/* PRICING SUMMARY */}
              <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-8">
                <p className="text-[9px] tracking-[0.5em] text-white/20 mb-4">ORDER SUMMARY</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Price</span>
                    <span className="text-white font-bold">₹{product.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Shipping</span>
                    <span className={`font-bold ${cartTotal + product.price >= 1999 ? "text-green-400" : "text-white/40"}`}>
                      {cartTotal + product.price >= 1999 ? "FREE" : "₹99"}
                    </span>
                  </div>
                  {selectedSize && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Size</span>
                      <span className="text-[#00FFFF] font-bold">{selectedSize}</span>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-[#00FFFF] font-black text-xl drop-shadow-[0_0_8px_#00FFFF]">
                      ₹{(product.price + (cartTotal + product.price >= 1999 ? 0 : 99)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-4 mb-8">
                <button
                  onClick={() => addToCart(false)}
                  className={`w-full py-5 font-black tracking-[0.3em] text-sm transition-all rounded-xl ${
                    added
                      ? "bg-green-400 text-black"
                      : "bg-[#00FFFF] text-black hover:bg-white active:scale-95"
                  }`}
                >
                  {added ? "✓ ADDED TO BAG" : "ADD TO BAG"}
                </button>
                <button
                  onClick={() => addToCart(true)}
                  className="w-full py-5 font-black tracking-[0.3em] text-sm transition-all rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10 active:scale-95"
                >
                  BUY NOW →
                </button>
              </div>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "🚚", title: "Free Shipping", desc: "Above ₹1999" },
                  { icon: "↩️", title: "7-Day Return", desc: "Easy returns" },
                  { icon: "🔒", title: "Secure Pay", desc: "Razorpay" },
                ].map((b, i) => (
                  <div key={i} className="text-center p-3 border border-white/5 rounded-xl hover:border-[#00FFFF]/15 transition-all">
                    <p className="text-xl mb-1">{b.icon}</p>
                    <p className="text-[9px] font-black text-white/40 tracking-wider mb-0.5">{b.title}</p>
                    <p className="text-[9px] text-white/20">{b.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <CartDrawer cart={cart} setCart={setCart} isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}