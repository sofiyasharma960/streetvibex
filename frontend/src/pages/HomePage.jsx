import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

// Components
import Marquee from "../components/Marquee";
import CartDrawer from "../components/CartDrawer";
import Navbar from "../components/Navbar";

const CATEGORIES = ["ALL", "GRAPHIC TEE", "SHIRT", "KNIT", "HOODIE"];

function ProductSkeleton() {
  return (
    <div className="group">
      <div className="w-full aspect-[3/4] bg-white/5 rounded-2xl mb-4 animate-pulse" />
      <div className="h-4 bg-white/10 rounded w-2/3 mb-2 animate-pulse" />
      <div className="h-3 bg-white/5 rounded w-1/4 animate-pulse" />
    </div>
  );
}

export default function HomePage({ cart, setCart }) {
  const navigate = useNavigate();
  const shopRef = useRef(null);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. FIXED Smooth Scroll (Lenis) 
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let rafId;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // 2. Data Fetching
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 3. Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCategory === "ALL" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-[#00FFFF] selection:text-black">
      <Navbar cart={cart} onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} />

      {/* HERO SECTION */}
      <section className="relative h-[100vh] flex flex-col justify-center items-center px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FFFF]/10 rounded-full blur-[160px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h2 className="text-[10px] tracking-[0.8em] text-[#00FFFF] mb-6 uppercase font-bold">Bengaluru // 2026</h2>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] italic uppercase">
            Wearable<br />
            <span className="text-transparent stroke-text">Art</span>
          </h1>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shopRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="mt-12 px-12 py-5 bg-white text-black font-black text-[10px] tracking-[0.4em] uppercase rounded-full hover:bg-[#00FFFF] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          >
            Enter the Drop
          </motion.button>
        </motion.div>

        <div className="absolute bottom-10 left-10 hidden md:block">
          <p className="text-[9px] tracking-widest text-white/20 leading-relaxed uppercase">
            Limited Release<br />No Restocks<br />StreetVibeX©
          </p>
        </div>
      </section>

      <Marquee />

      {/* SHOP SECTION */}
      <section ref={shopRef} id="shop" className="py-32 px-6 sm:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20">
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] tracking-widest font-bold transition-all border ${
                  activeCategory === cat 
                  ? "bg-[#00FFFF] border-[#00FFFF] text-black" 
                  : "bg-transparent border-white/10 text-white/40 hover:border-white/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <input 
              type="text"
              placeholder="SEARCH DROPS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[10px] tracking-widest focus:outline-none focus:border-[#00FFFF]/50 transition-all uppercase"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4].map((n) => <ProductSkeleton key={n} />)}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#111] border border-white/5">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.countInStock === 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-[10px] tracking-[0.5em] font-black text-red-500 uppercase -rotate-12 border-2 border-red-500 px-4 py-1">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex justify-between items-start">
                    <div>
                      <h3 className="text-[11px] font-black uppercase tracking-tighter group-hover:text-[#00FFFF] transition-colors">{product.name}</h3>
                      <p className="text-[9px] text-white/30 uppercase mt-1 tracking-widest">{product.category}</p>
                    </div>
                    <p className="text-[11px] font-black italic">₹{product.price.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-white/20 text-xs tracking-[0.5em] uppercase font-bold italic">No items found in this frequency</p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[10px] tracking-widest text-white/20 uppercase font-bold">
            © 2026 STREETVIBEX — Engineered in Bengaluru
          </p>
          <div className="flex gap-8">
            {['Instagram', 'Twitter', 'Terms'].map((link) => (
              <a key={link} href="#" className="text-[9px] tracking-[0.3em] uppercase font-black hover:text-[#00FFFF] transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.2); }
        @media (min-width: 1024px) { .stroke-text { -webkit-text-stroke: 2px rgba(255,255,255,0.2); } }
      `}} />
    </div>
  );
}