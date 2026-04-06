import { useNavigate } from "react-router-dom";

export default function Navbar({ cart, onCartOpen }) {
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-6 sm:px-12 py-5 backdrop-blur-xl bg-black/70 border-b border-white/5">
      <button
        onClick={() => navigate("/")}
        className="text-base font-black tracking-[0.25em] text-[#00FFFF] drop-shadow-[0_0_20px_#00FFFF]"
      >
        STREETVIBEX
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-[10px] tracking-widest text-white/30 hover:text-white transition-colors hidden sm:block"
        >
          SHOP
        </button>
        <button
          onClick={onCartOpen}
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
  );
}