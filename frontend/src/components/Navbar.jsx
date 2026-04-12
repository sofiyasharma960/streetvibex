import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ cart = [], onCartOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (id) => {
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: id } });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        scrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-7"
      }`}>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#00FFFF] origin-left z-[101]"
          style={{ scaleX: scrollYProgress }}
        />

        <div className="max-w-7xl mx-auto px-8 sm:px-16 flex justify-between items-center">
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-[-0.03em] text-white hover:text-[#00FFFF] transition-all duration-300"
            style={{ textShadow: scrolled ? "none" : "0 0 20px rgba(0,255,255,0.2)" }}
          >
            STREETVIBE<span className="text-[#00FFFF]">X</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {["shop", "about", "contact"].map((item) => (
              <button
                key={item}
                onClick={() => handleNav(item)}
                className="text-xs tracking-[0.3em] font-display text-white/30 hover:text-white transition-colors uppercase"
              >
                {item}
              </button>
            ))}

            <div className="h-4 w-px bg-white/10 mx-2" />

            {user ? (
              <div className="flex items-center gap-6">
                <Link
                  to={user.isAdmin ? "/admin" : "/orders"}
                  className="text-xs tracking-[0.3em] font-display font-bold text-[#00FFFF] hover:brightness-125 transition-all uppercase"
                >
                  {user.isAdmin ? "DASHBOARD" : "MY ORDERS"}
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-xs tracking-[0.3em] font-display text-white/20 hover:text-red-400 transition-colors uppercase"
                >
                  EXIT
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs tracking-[0.3em] font-display text-white/30 hover:text-white transition-colors uppercase"
              >
                SIGN IN
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onCartOpen}
              className="group relative flex items-center gap-3 border border-white/10 px-5 py-2.5 hover:border-[#00FFFF]/50 hover:bg-[#00FFFF]/5 transition-all duration-300"
            >
              <span className="text-xs tracking-[0.2em] font-display group-hover:text-[#00FFFF] transition-colors">BAG</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-[#00FFFF] text-black text-[9px] font-display font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
            >
              <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-black flex flex-col items-center justify-center gap-10 md:hidden"
          >
            {["shop", "about", "contact"].map((item, i) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleNav(item)}
                className="font-display text-4xl font-bold tracking-[-0.02em] uppercase text-white/60 hover:text-[#00FFFF] transition-colors"
              >
                {item}
              </motion.button>
            ))}
            <div className="w-12 h-px bg-white/10" />
            {!user ? (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="font-display text-sm tracking-widest text-[#00FFFF] uppercase">Sign In</Link>
            ) : (
              <button onClick={() => { logout(); setMenuOpen(false); }} className="font-display text-sm tracking-widest text-red-400 uppercase">Sign Out</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}