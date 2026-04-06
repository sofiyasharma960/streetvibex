import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lenis from "lenis";
import Marquee from "../components/Marquee";
import CartDrawer from "../components/CartDrawer";

export default function HomePage({ cart, setCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-8 sm:px-12 py-5 backdrop-blur-xl bg-black/60 border-b border-[#00FFFF]/20">
        <div
          className="text-lg font-black tracking-[0.25em] text-[#00FFFF] cursor-pointer hover:drop-shadow-[0_0_30px_#00FFFF] transition-all"
          onClick={() => scrollTo("hero")}
          style={{ textShadow: "0 0 20px #00FFFF" }}
        >
          STREETVIBEX
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-10 text-[10px] tracking-[0.4em] font-bold">
            {["SHOP", "ABOUT", "CONTACT"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="text-white/40 hover:text-[#00FFFF] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
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

      {/* HERO */}
      <section id="hero" className="relative w-full h-screen flex flex-col items-center justify-center text-center px-6 bg-black overflow-hidden">
        {/* Grid background */}
        <div className="fixed inset-0 pointer-events-none -z-10" style={{
          backgroundSize: "50px 50px",
          backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.03) 1px, transparent 1px)"
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10"
        >
          <p className="text-[9px] tracking-[1em] text-[#00FFFF]/40 mb-4 uppercase">
            JP Nagar, Bengaluru — Est. 2026
          </p>
          <h1
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-[0.15em] text-[#00FFFF] mb-4"
            style={{ textShadow: "0 0 30px #00FFFF, 0 0 60px #00FFFF, 0 0 90px #00FFFF" }}
          >
            STREETVIBEX
          </h1>
          <p className="text-white/25 max-w-xs mx-auto text-sm leading-relaxed mb-10">
            Wearable art for the ones who don't fit in the feed.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => scrollTo("shop")}
              className="border border-[#00FFFF] text-[#00FFFF] px-10 py-4 text-[10px] tracking-[0.4em] hover:bg-[#00FFFF] hover:text-black transition-all duration-300 font-black"
              style={{ textShadow: "0 0 20px #00FFFF" }}
            >
              SHOP DROPS →
            </button>
            <button
              onClick={() => scrollTo("about")}
              className="border border-white/10 text-white/30 px-10 py-4 text-[10px] tracking-[0.4em] hover:border-white/20 hover:text-white/50 transition-all duration-300 font-black"
            >
              OUR STORY
            </button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] tracking-[0.4em] text-white/15">SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-[#00FFFF]/30 to-transparent"
          />
        </motion.div>
      </section>

      <Marquee />

      {/* SHOP SECTION */}
      <section id="shop" className="px-6 sm:px-12 py-24 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="text-[9px] tracking-[1em] text-[#00FFFF]/30 mb-4">CURRENT SEASON</p>
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-none">
            THE<br />
            <span className="text-[#00FFFF]" style={{ textShadow: "0 0 20px #00FFFF" }}>
              COLLECTION
            </span>
          </h2>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((prod, i) => (
              <motion.div
                key={prod._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => navigate(`/product/${prod._id}`)}
                className="group cursor-pointer"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-white/3 rounded-xl mb-3 border border-white/5 group-hover:border-[#00FFFF]/20 transition-all">
                  <img
                    src={prod.images?.[0]}
                    alt={prod.name}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = `https://placehold.co/600x800/050a0a/00FFFF?text=${prod.name}`;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-[10px] tracking-widest text-white font-black">VIEW PRODUCT →</span>
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="text-[10px] font-black text-white tracking-widest">{prod.name}</h3>
                  <p className="text-[#00FFFF] font-black text-sm mt-1">₹{prod.price?.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="px-6 sm:px-12 py-24 bg-black border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[9px] tracking-[1em] text-[#00FFFF]/30 mb-4">OUR STORY</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-8">
            BORN IN<br />
            <span className="text-[#00FFFF]" style={{ textShadow: "0 0 20px #00FFFF" }}>JP NAGAR</span>
          </h2>
          <p className="text-white/30 text-sm leading-relaxed mb-4">
            StreetVibeX is wearable art for the ones who don't fit in the feed. Every piece is designed in Bengaluru, inspired by the chaos, the culture, and the kids who create their own lane.
          </p>
          <p className="text-white/20 text-sm leading-relaxed">
            Limited drops. No restocks. If you know, you know.
          </p>
        </div>
      </section>

      <Marquee reverse />

      {/* CONTACT SECTION */}
      <section id="contact" className="px-6 sm:px-12 py-24 bg-black border-t border-white/5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-[9px] tracking-[1em] text-[#00FFFF]/30 mb-4">GET IN TOUCH</p>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-8">CONTACT</h2>
          <div className="space-y-4">
            {[
              { label: "EMAIL", value: "streetvibex0x0@gmail.com" },
              { label: "LOCATION", value: "JP Nagar, Bengaluru, Karnataka" },
              { label: "INSTAGRAM", value: "@streetvibex" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-[10px] tracking-widest text-white/20">{item.label}</span>
                <span className="text-[10px] tracking-widest text-white/50">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#00FFFF]/10 px-8 sm:px-12 py-12 bg-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-lg font-black tracking-[0.25em] text-[#00FFFF]/20">STREETVIBEX</p>
          <p className="text-[9px] tracking-widest text-white/10">© 2026 STREETVIBEX — JP NAGAR, BLR</p>
          <p className="text-[9px] tracking-widest text-white/10">streetvibex0x0@gmail.com</p>
        </div>
      </footer>

      <CartDrawer cart={cart} setCart={setCart} isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}