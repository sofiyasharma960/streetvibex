import { useState, useEffect, Component, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import WhatsAppButton from "./components/WhatsAppButton";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrderConfirmPage = lazy(() => import("./pages/OrderConfirmPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-10 h-10 border-2 border-[#00FFFF] border-t-transparent rounded-full" 
    />
  </div>
);

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
          <h2 className="text-xl font-black mb-4 tracking-tighter">SYSTEM_ERROR_0x1</h2>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#00FFFF] text-black font-bold rounded-full text-xs tracking-widest">REBOOT SYSTEM</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageWrapper({ children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );
}

export default function App() {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("svx-cart")) || []; }
    catch { return []; }
  });

  // 10/10 MOVE: Sync cart across multiple open tabs
  useEffect(() => {
    const handleSync = (e) => {
      if (e.key === "svx-cart") setCart(JSON.parse(e.newValue) || []);
    };
    window.addEventListener("storage", handleSync);
    localStorage.setItem("svx-cart", JSON.stringify(cart));
    return () => window.removeEventListener("storage", handleSync);
  }, [cart]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<PageWrapper><HomePage cart={cart} setCart={setCart} /></PageWrapper>} />
              <Route path="/product/:id" element={<PageWrapper><ProductDetailPage cart={cart} setCart={setCart} /></PageWrapper>} />
              <Route path="/checkout" element={<PageWrapper><CheckoutPage cart={cart} setCart={setCart} /></PageWrapper>} />
              <Route path="/order-confirmed" element={<PageWrapper><OrderConfirmPage setCart={setCart} /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
              <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
              <Route path="/orders" element={<PageWrapper><OrderHistoryPage /></PageWrapper>} />
              <Route path="/admin" element={<PageWrapper><AdminPage /></PageWrapper>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
        <WhatsAppButton />
      </AuthProvider>
    </ErrorBoundary>
  );
}