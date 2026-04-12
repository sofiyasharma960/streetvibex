import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";

import Marquee from "../components/Marquee";
import CartDrawer from "../components/CartDrawer";
import Navbar from "../components/Navbar";

const CATEGORIES = ["ALL", "GRAPHIC TEE", "SHIRT"];
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

// ── CUSTOM CURSOR ──
function Cursor() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    let raf;
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.1;
      ring.current.y += (pos.current.y - ring.current.y) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + "px";
        ringRef.current.style.top = ring.current.y + "px";
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    const expand = () => {
      if (cursorRef.current) { cursorRef.current.style.width = "6px"; cursorRef.current.style.height = "6px"; }
      if (ringRef.current) { ringRef.current.style.width = "60px"; ringRef.current.style.height = "60px"; }
    };
    const shrink = () => {
      if (cursorRef.current) { cursorRef.current.style.width = "12px"; cursorRef.current.style.height = "12px"; }
      if (ringRef.current) { ringRef.current.style.width = "40px"; ringRef.current.style.height = "40px"; }
    };
    document.querySelectorAll("a, button").forEach(el => {
      el.addEventListener("mouseenter", expand);
      el.addEventListener("mouseleave", shrink);
    });
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" />
      <div ref={ringRef} className="custom-cursor-ring" />
    </>
  );
}

// ── SKELETON ──
const ProductSkeleton = () => (
  <div className="group">
    <div className="w-full aspect-[3/4] bg-white/5 mb-5 animate-pulse" />
    <div className="h-4 bg-white/10 rounded w-2/3 mb-2 animate-pulse" />
    <div className="h-3 bg-white/5 rounded w-1/4 animate-pulse" />
  </div>
);

export default function HomePage({ cart, setCart }) {
  const navigate = useNavigate();
  const shopRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/products`);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
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
    <div className="grain bg-black min-h-screen text-white selection:bg-[#00FFFF] selection:text-black antialiased">
      <Cursor />
      <Navbar cart={cart} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} />

      {/* ── HERO ── */}
      <section className="relative h-screen flex flex-col justify-center items-start px-8 md:px-16 lg:px-24 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#00FFFF] rounded-full blur-[200px] -z-10 pointer-events-none"
        />

        {/* Side text */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-4">
          <div className="w-px h-20 bg-gradient-to-b from-transparent to-[#00FFFF]/20" />
          <p className="text-[9px] tracking-[0.5em] text-white/15 uppercase font-display [writing-mode:vertical-rl]">JP Nagar · Bengaluru · 2026</p>
          <div className="w-px h-20 bg-gradient-to-t from-transparent to-[#00FFFF]/20" />
        </div>

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="z-10 max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xs md:text-sm tracking-[0.5em] text-[#00FFFF]/50 uppercase mb-6 font-display"
          >
            // Limited Streetwear
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold leading-[0.85] tracking-[-0.03em] uppercase mb-8"
            style={{ fontSize: "clamp(72px, 14vw, 180px)" }}
          >
            STREET<br />
            <span className="text-[#00FFFF]" style={{ textShadow: "0 0 80px rgba(0,255,255,0.35)" }}>VIBE</span>
            <span className="text-white/15">X</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base md:text-lg text-white/40 max-w-lg leading-relaxed mb-10 font-light"
          >
            We don't do seasons. We drop emotions — captured in heavyweight cotton, designed for the ones who refuse to blend in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex items-center gap-6 flex-wrap"
          >
            <button
              onClick={() => shopRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="group relative px-10 py-4 bg-[#00FFFF] text-black font-display font-bold text-sm tracking-[0.15em] uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_rgba(0,255,255,0.4)]"
            >
              <span className="relative z-10">SHOP THE DROP →</span>
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <button
              onClick={() => aboutRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm tracking-[0.2em] text-white/25 hover:text-white/50 uppercase transition-colors font-display"
            >
              Our Story ↓
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-8 md:left-16 lg:left-24 flex items-center gap-4"
        >
          <motion.div
            animate={{ scaleX: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-px bg-[#00FFFF]/30 origin-left"
          />
          <span className="text-[9px] tracking-[0.5em] text-white/15 uppercase font-display">Scroll</span>
        </motion.div>
      </section>

      <Marquee />

      {/* ── SHOP ── */}
      <section ref={shopRef} id="shop" className="py-32 px-8 md:px-16 lg:px-24 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16"
        >
          <div>
            <p className="text-xs tracking-[0.5em] text-[#00FFFF] mb-3 uppercase font-display">The Catalog</p>
            <h2 className="font-display text-5xl md:text-6xl font-bold tracking-[-0.02em] uppercase">Current Drop</h2>
          </div>
          <input
            type="text"
            placeholder="Search drops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-b border-white/10 px-2 py-3 text-sm w-56 focus:w-72 focus:border-[#00FFFF] outline-none transition-all text-white/60 placeholder:text-white/20 font-display"
          />
        </motion.div>

        <div className="flex flex-wrap gap-3 mb-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 text-xs tracking-[0.15em] font-display font-medium uppercase transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[#00FFFF] text-black"
                  : "bg-transparent text-white/30 border border-white/10 hover:border-white/30 hover:text-white/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="product-card group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white/5 mb-5">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="product-card-img w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <div className="bg-[#00FFFF] text-black text-center py-3 text-xs tracking-[0.2em] uppercase font-display font-bold">
                        Quick View →
                      </div>
                    </div>
                    {product.countInStock === 0 && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <span className="text-xs tracking-[0.3em] font-display font-bold text-white border border-white/20 px-4 py-2 uppercase">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-display font-medium text-sm uppercase tracking-tight text-white group-hover:text-[#00FFFF] transition-colors">{product.name}</h3>
                      <span className="text-sm font-light text-white/40">₹{product.price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-white/20 uppercase tracking-widest font-display">{product.category}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="py-40 text-center border border-white/5">
            <p className="text-white/20 text-sm tracking-[0.3em] uppercase font-display">No products found</p>
          </div>
        )}
      </section>

      {/* ── ABOUT ── */}
      <section ref={aboutRef} id="about" className="py-40 px-8 md:px-16 lg:px-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="grid lg:grid-cols-2 gap-24 items-center"
          >
            <div>
              <p className="text-xs tracking-[0.5em] text-[#00FFFF]/50 uppercase mb-6 font-display">About</p>
              <h2 className="font-display font-bold tracking-[-0.02em] uppercase leading-[0.9] mb-10" style={{ fontSize: "clamp(48px,6vw,88px)" }}>
                WE DON'T<br />DO<br /><span className="text-white/10">AVERAGE.</span>
              </h2>
              <div className="space-y-6 text-white/40 text-base leading-relaxed max-w-lg">
                <p>StreetVibeX doesn't do seasons, trends, or restocks. Every piece is a limited drop — once it's gone, it's gone forever.</p>
                <p className="border-l-2 border-[#00FFFF] pl-6 italic text-white/60 text-lg font-light">"Born in BLR. Designed for the bold. Worn by the few."</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "100%", sub: "Authentic", desc: "No fast fashion. Ever." },
                { val: "Ltd.", sub: "Supply", desc: "Every drop is finite." },
                { val: "0", sub: "Restocks", desc: "Miss it and it's gone." },
                { val: "BLR", sub: "Origin", desc: "Made in Bengaluru." }
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white/[0.02] border border-white/5 hover:border-[#00FFFF]/20 transition-all duration-500 group"
                >
                  <p className="font-display text-4xl font-bold text-[#00FFFF] mb-1 group-hover:text-white transition-colors">{s.val}</p>
                  <p className="text-xs tracking-widest text-white/25 uppercase mb-2 font-display">{s.sub}</p>
                  <p className="text-xs text-white/10 group-hover:text-white/25 transition-colors">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer ref={contactRef} id="contact" className="border-t border-white/5 bg-[#030303]">
        <div className="px-8 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16">
            <div>
              <p className="font-display text-3xl font-bold tracking-tight mb-4">
                STREET<span className="text-[#00FFFF]">VIBE</span>X
              </p>
              <p className="text-sm text-white/25 leading-relaxed max-w-xs">
                Limited streetwear from JP Nagar, Bengaluru. Designed for the bold. No seasons, no restocks, no compromises.
              </p>
            </div>
            <div>
              <p className="text-xs tracking-[0.4em] text-white/15 uppercase mb-6 font-display">Quick Links</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Shop", action: () => shopRef.current?.scrollIntoView({ behavior: "smooth" }) },
                  { label: "About", action: () => aboutRef.current?.scrollIntoView({ behavior: "smooth" }) },
                  { label: "My Orders", action: () => navigate("/orders") },
                  { label: "Sign In", action: () => navigate("/login") },
                ].map((link) => (
                  <button key={link.label} onClick={link.action} className="text-sm text-white/25 hover:text-[#00FFFF] transition-colors text-left uppercase tracking-widest font-display">
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs tracking-[0.4em] text-white/15 uppercase mb-6 font-display">Get In Touch</p>
              <div className="flex flex-col gap-3">
                <a href="https://wa.me/918955062883" target="_blank" rel="noreferrer" className="text-sm text-white/25 hover:text-[#00FFFF] transition-colors uppercase tracking-widest font-display">WhatsApp →</a>
                <a href="mailto:streetvibex0x0@gmail.com" className="text-sm text-white/25 hover:text-[#00FFFF] transition-colors uppercase tracking-widest font-display">Email →</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-sm text-white/25 hover:text-[#00FFFF] transition-colors uppercase tracking-widest font-display">Instagram →</a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 px-8 md:px-16 lg:px-24 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/10 tracking-widest uppercase font-display">© 2026 StreetVibeX · Bengaluru · All Rights Reserved</p>
            <p className="text-xs text-white/10 tracking-widest uppercase font-display">No restocks. No seasons. No average.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}