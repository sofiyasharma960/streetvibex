import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

import Marquee from "../components/Marquee";
import CartDrawer from "../components/CartDrawer";
import Navbar from "../components/Navbar";

const CATEGORIES = ["ALL", "GRAPHIC TEE", "SHIRT"];
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

const ProductSkeleton = () => (
  <div className="group">
    <div className="w-full aspect-[3/4] bg-white/5 rounded-2xl mb-4 animate-pulse" />
    <div className="h-3 bg-white/10 rounded w-2/3 mb-2 animate-pulse" />
    <div className="h-2 bg-white/5 rounded w-1/4 animate-pulse" />
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const shopRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    const rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryMatch = activeCategory === "ALL" || p.category?.toUpperCase() === activeCategory;
      const searchMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-[#00FFFF] selection:text-black">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* HERO */}
      <section className="relative h-screen flex flex-col justify-center items-center px-6 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full -z-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center z-10"
        >
          <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.8] uppercase mb-4">
            STREET<span className="text-[#00FFFF]" style={{ textShadow: "0 0 20px rgba(0,255,255,0.5)" }}>VIBE</span>X
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-[10px] tracking-[0.8em] text-white/40 mb-8 uppercase"
          >
            Bengaluru • Limited Apparel • Est. 2026
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => shopRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="px-14 py-5 border border-white/20 text-white font-black text-[10px] tracking-[0.4em] uppercase rounded-full hover:bg-[#00FFFF] hover:text-black hover:border-[#00FFFF] transition-colors duration-300"
          >
            Explore Collection
          </motion.button>
        </motion.div>
      </section>

      <Marquee />

      {/* SHOP */}
      <section ref={shopRef} id="shop" className="py-32 px-6 lg:px-16 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div>
            <p className="text-[10px] tracking-[0.5em] text-[#00FFFF] mb-4 uppercase font-bold">The Catalog</p>
            <h2 className="text-5xl font-black tracking-tighter uppercase">Current Drop</h2>
          </div>
          <input
            type="text"
            placeholder="SEARCH DROPS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-b border-white/10 px-2 py-4 text-[11px] tracking-widest w-64 focus:w-80 focus:border-[#00FFFF] outline-none transition-all uppercase"
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full text-[9px] tracking-[0.2em] font-black transition-colors ${
                activeCategory === cat ? "bg-white text-black" : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-16 md:gap-x-10">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {product.countInStock === 0 && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                        <span className="text-[10px] tracking-[0.4em] font-black text-white border border-white/20 px-4 py-2 uppercase">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-[12px] font-black uppercase tracking-tight">{product.name}</h3>
                      <span className="text-[12px] font-medium opacity-60 italic">₹{product.price.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">{product.category}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="py-40 text-center border border-white/5 rounded-3xl">
            <p className="text-white/20 text-[10px] tracking-[0.5em] uppercase font-bold">Signal Lost: No products found</p>
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section ref={aboutRef} id="about" className="py-40 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.85] mb-10">
              WE DON'T DO<br /><span className="text-white/20">AVERAGE.</span>
            </h2>
            <div className="space-y-6 text-white/50 text-md leading-relaxed max-w-lg">
              <p>StreetVibeX is a rebellion against the saturated "fast fashion" market. We don't drop seasons; we drop emotions captured in high-density cotton.</p>
              <p className="border-l border-[#00FFFF] pl-6 italic">"Born in BLR, designed for the bold."</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: "100%", sub: "Authentic" },
              { val: "Ltd.", sub: "Supply" },
              { val: "0", sub: "Restocks" },
              { val: "24/7", sub: "Vibe" },
            ].map((s, i) => (
              <div key={i} className="p-10 bg-white/5 rounded-3xl border border-white/5 hover:border-[#00FFFF]/20 transition-colors">
                <p className="text-4xl font-black text-[#00FFFF] mb-1">{s.val}</p>
                <p className="text-[9px] tracking-widest opacity-30 uppercase">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer ref={contactRef} id="contact" className="py-20 px-6 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div>
            <p className="text-3xl font-black tracking-tighter mb-2">STREET<span className="text-[#00FFFF]">VIBE</span>X</p>
            <p className="text-[10px] tracking-widest text-white/30 uppercase">© 2026 Bengaluru • All Rights Reserved</p>
          </div>
          <div className="flex gap-10">
            {["INSTAGRAM", "WHATSAPP", "EMAIL"].map((link) => (
              <a key={link} href="#" className="text-[10px] tracking-widest font-black text-white/40 hover:text-[#00FFFF] transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}