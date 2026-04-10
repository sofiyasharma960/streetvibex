import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const STATUS_COLORS = {
  confirmed: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  shipped: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  delivered: "text-green-400 border-green-400/30 bg-green-400/10",
  cancelled: "text-red-400 border-red-400/30 bg-red-400/10",
  pending: "text-white/40 border-white/20 bg-white/5",
};

const STATUS_STEPS = ["confirmed", "shipped", "delivered"];

function OrderCard({ order }) {
  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/8 rounded-2xl overflow-hidden"
    >
      <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b border-white/5">
        <div>
          <p className="text-[9px] tracking-widest text-white/25 mb-1">ORDER ID</p>
          <p className="text-xs font-bold text-white/60 font-mono">{order._id.slice(-10).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-widest text-white/25 mb-1">PLACED ON</p>
          <p className="text-xs text-white/50">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] tracking-widest text-white/25 mb-1">TOTAL</p>
          <p className="text-sm font-black text-[#00FFFF]">₹{order.totalAmount?.toLocaleString()}</p>
        </div>
        <span className={`text-[9px] tracking-widest font-bold px-3 py-1.5 rounded-full border capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
          {order.status}
        </span>
      </div>

      {order.status !== "cancelled" && (
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${i <= stepIdx ? "bg-[#00FFFF] border-[#00FFFF]" : "border-white/20 bg-transparent"}`} />
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${i < stepIdx ? "bg-[#00FFFF]" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {STATUS_STEPS.map((step) => (
              <p key={step} className="text-[9px] text-white/25 capitalize">{step}</p>
            ))}
          </div>
        </div>
      )}

      <div className="p-5 space-y-3">
        {order.items?.map((item, i) => (
          <div key={i} className="flex gap-3 items-center">
            <img
              src={item.image}
              alt={item.name}
              crossOrigin="anonymous"
              onError={(e) => { e.target.src = `https://placehold.co/60x80/050a0a/00FFFF?text=${item.name}`; }}
              className="w-12 rounded-lg object-cover bg-white/5 flex-shrink-0"
              style={{ height: "60px" }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white tracking-widest truncate">{item.name}</p>
              <p className="text-[9px] text-white/30 mt-0.5">Size: {item.size} · Qty: {item.qty}</p>
            </div>
            <p className="text-xs font-bold text-white/60">₹{(item.price * item.qty).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="px-5 pb-4 flex justify-between items-center text-[9px] text-white/25 tracking-widest border-t border-white/5 pt-3">
        <span>Payment: <span className="text-white/40 uppercase">{order.paymentMethod}</span></span>
        <span>Est. delivery: 5–7 business days</span>
      </div>
    </motion.div>
  );
}

export default function OrderHistoryPage({ cart }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetch(`${API}/api/orders/my-orders`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundSize: "50px 50px",
        backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.03) 1px, transparent 1px)"
      }} />

      <Navbar cart={cart} />

      <div className="pt-28 px-6 sm:px-12 pb-24 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-[9px] tracking-[1em] text-[#00FFFF]/30 mb-2">YOUR ACCOUNT</p>
            <h1 className="text-3xl font-black text-white tracking-tighter">My Orders</h1>
            <p className="text-white/30 text-xs mt-1">{user?.name} · {user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="text-[9px] tracking-widest text-white/25 hover:text-red-400 border border-white/10 hover:border-red-400/30 px-4 py-2 rounded-lg transition-all"
          >
            SIGN OUT
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white/3 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/20 text-xs tracking-[0.4em] mb-4">NO ORDERS YET</p>
            <button
              onClick={() => navigate("/")}
              className="border border-[#00FFFF] text-[#00FFFF] px-8 py-3 text-[10px] tracking-widest hover:bg-[#00FFFF] hover:text-black transition-all font-black rounded-lg"
            >
              SHOP NOW →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => <OrderCard key={order._id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}