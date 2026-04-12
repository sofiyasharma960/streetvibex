import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar({ onCartOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
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
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
          scrolled ? "bg-black/90 border-b border-white/5 py-4" : "bg-transparent py-7"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-black tracking-[-0.05em] text-white hover:text-[#00FFFF] transition-colors"
          >
            STREETVIBE<span className="text-[#00FFFF]">X</span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {["shop", "about", "contact"].map((item) => (
              <button
                key={item}
                onClick={() => handleNav(item)}
                className="text-[9px] tracking-[0.4em] font-bold text-white/40 hover:text-[#00FFFF] transition-colors uppercase"
              >
                {item}
              </button>
            ))}
            <div className="h-4 w-[1px] bg-white/10 mx-2" />
            {user ? (
              <div className="flex items-center gap-6">
                <Link
                  to={user.isAdmin ? "/admin" : "/orders"}
                  className="text-[9px] tracking-[0.4em] font-black text-[#00FFFF] hover:brightness-125 transition-all uppercase"
                >
                  {user.isAdmin ? "DASHBOARD" : "MY ORDERS"}
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-[9px] tracking-[0.4em] font-bold text-white/20 hover:text-red-500 transition-colors uppercase"
                >
                  EXIT
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-[9px] tracking-[0.4em] font-bold text-white/40 hover:text-[#00FFFF] transition-colors uppercase"
              >
                SIGN IN
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onCartOpen}
              className="group relative flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full hover:border-[#00FFFF]/50 hover:bg-[#00FFFF]/5 transition-all"
            >
              <span className="text-[10px] tracking-[0.2em] font-black group-hover:text-[#00FFFF]">BAG</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-[#00FFFF] text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle menu"
            >
              <div className={`w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <div className={`w-6 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {["shop", "about", "contact"].map((item) => (
              <button
                key={item}
                onClick={() => handleNav(item)}
                className="text-2xl font-black tracking-[0.3em] uppercase hover:text-[#00FFFF] transition-colors"
              >
                {item}
              </button>
            ))}
            <div className="w-12 h-px bg-white/10" />
            {!user ? (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest text-[#00FFFF]">
                SIGN IN
              </Link>
            ) : (
              <button onClick={() => { logout(); setMenuOpen(false); }} className="text-sm tracking-widest text-red-500">
                SIGN OUT
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}