import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  shipped: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  delivered: "text-green-400 bg-green-400/10 border-green-400/30",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/30",
  pending: "text-white/40 bg-white/5 border-white/20",
};

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const CATEGORIES = ["GRAPHIC TEE", "SHIRT", "KNIT"];

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("orders");
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "", price: "", category: "GRAPHIC TEE",
    description: "", images: "", sizes: "S,M,L,XL", inStock: true
  });

  useEffect(() => {
    if (!user?.isAdmin) { navigate("/"); return; }
    if (activeTab === "orders") fetchOrders();
    else fetchProducts();
  }, [user, page, activeTab]);

  // ✅ FIX: Use Authorization header (JWT) instead of x-admin-key
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/all?page=${page}&limit=15`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
      setTotalOrders(data.total || 0);
    } catch { console.error("Failed to fetch orders"); }
    finally { setLoading(false); }
  };

  // ✅ FIX: Use Authorization header (JWT) instead of x-admin-key
  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch { alert("Failed to update status"); }
    finally { setUpdating(null); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error("Fetch failed", err); }
    finally { setLoading(false); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";

    const formattedData = {
      ...formData,
      price: Number(formData.price),
      images: typeof formData.images === "string" ? formData.images.split(",").map(img => img.trim()) : formData.images,
      sizes: typeof formData.sizes === "string" ? formData.sizes.split(",").map(s => s.trim()) : formData.sizes,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formattedData),
      });
      if (res.ok) {
        setEditingProduct(null);
        setFormData({ name: "", price: "", category: "GRAPHIC TEE", description: "", images: "", sizes: "S,M,L,XL", inStock: true });
        fetchProducts();
      }
    } catch (err) { alert("Error saving product"); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product forever?")) return;
    try {
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchProducts();
    } catch (err) { console.error("Delete failed"); }
  };

  const filteredOrders = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);
  const revenue = orders.reduce((s, o) => o.paymentStatus === "paid" ? s + o.totalAmount : s, 0);

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundSize: "50px 50px",
        backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.03) 1px, transparent 1px)"
      }} />

      <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-6 sm:px-10 py-4 backdrop-blur-xl bg-black/80 border-b border-[#00FFFF]/15">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/")} className="text-base font-black tracking-[0.2em] text-[#00FFFF]">STREETVIBEX</button>
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button onClick={() => setActiveTab("orders")} className={`px-4 py-1.5 text-[9px] tracking-widest font-black rounded-md transition-all ${activeTab === "orders" ? "bg-[#00FFFF] text-black" : "text-white/40"}`}>ORDERS</button>
            <button onClick={() => setActiveTab("inventory")} className={`px-4 py-1.5 text-[9px] tracking-widest font-black rounded-md transition-all ${activeTab === "inventory" ? "bg-[#00FFFF] text-black" : "text-white/40"}`}>INVENTORY</button>
          </div>
        </div>
        <button onClick={() => { logout(); navigate("/"); }} className="text-[9px] tracking-widest text-white/25 hover:text-red-400 transition-all uppercase">Sign Out</button>
      </nav>

      <div className="pt-24 px-6 sm:px-10 pb-24 max-w-6xl mx-auto">
        {activeTab === "orders" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "TOTAL ORDERS", value: totalOrders },
                { label: "REVENUE (PAID)", value: `₹${revenue.toLocaleString()}` },
                { label: "ACTIVE PAGE", value: page },
                { label: "TOTAL PAGES", value: totalPages },
              ].map((s) => (
                <div key={s.label} className="border border-white/8 rounded-xl p-4 bg-white/2">
                  <p className="text-[9px] tracking-widest text-white/25 mb-2 uppercase">{s.label}</p>
                  <p className="text-xl font-black text-[#00FFFF]">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {["all", ...STATUSES].map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1.5 text-[9px] tracking-widest font-bold rounded-full border transition-all capitalize ${filterStatus === s ? "bg-[#00FFFF] text-black border-[#00FFFF]" : "border-white/15 text-white/40 hover:border-white/30"}`}>{s}</button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/3 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="border border-white/8 rounded-xl overflow-hidden bg-white/2">
                    <div className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-white/3" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                      <div className="flex-1">
                        <p className="text-[10px] font-black tracking-widest uppercase">{order.shippingAddress?.name}</p>
                        <p className="text-[9px] text-white/30">{new Date(order.createdAt).toLocaleDateString()} • {order.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-[#00FFFF]">₹{order.totalAmount?.toLocaleString()}</p>
                        <span className={`text-[8px] tracking-[0.2em] font-black px-2 py-0.5 rounded-full border uppercase ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                      </div>
                    </div>
                    {expandedOrder === order._id && (
                      <div className="p-4 border-t border-white/5 bg-black/40 grid md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[9px] tracking-widest text-white/20 mb-4 uppercase">Items ordered</p>
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex gap-3 mb-3">
                              <img src={item.image} className="w-10 h-12 object-cover rounded bg-white/5" />
                              <div>
                                <p className="text-[10px] font-black uppercase">{item.name}</p>
                                <p className="text-[9px] text-white/40">SIZE: {item.size} | QTY: {item.qty}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-[9px] tracking-widest text-white/20 mb-4 uppercase">Update tracking</p>
                          <div className="flex flex-wrap gap-2">
                            {STATUSES.map((s) => (
                              <button key={s} onClick={() => updateStatus(order._id, s)} disabled={updating === order._id || order.status === s} className={`px-3 py-1.5 text-[9px] font-black rounded border transition-all uppercase ${order.status === s ? "bg-[#00FFFF] text-black border-[#00FFFF]" : "border-white/10 text-white/40 hover:text-white"}`}>
                                {updating === order._id ? "..." : s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-4 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-6 py-2 text-[9px] tracking-widest border border-white/10 rounded-lg disabled:opacity-20 hover:border-white/30 transition-all">PREV</button>
              <span className="text-[9px] tracking-widest text-white/30 self-center">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-6 py-2 text-[9px] tracking-widest border border-white/10 rounded-lg disabled:opacity-20 hover:border-white/30 transition-all">NEXT</button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/3 p-6 rounded-2xl border border-white/10">
                <h2 className="text-[10px] font-black tracking-[0.3em] mb-6 uppercase text-[#00FFFF]">{editingProduct ? "Edit Item" : "New Drop"}</h2>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <input className="w-full bg-black border border-white/10 rounded-lg p-3 text-[10px] tracking-widest outline-none focus:border-[#00FFFF] uppercase" placeholder="NAME" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  <div className="flex gap-2">
                    <input className="w-1/2 bg-black border border-white/10 rounded-lg p-3 text-[10px] outline-none" placeholder="PRICE" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                    <select className="w-1/2 bg-black border border-white/10 rounded-lg p-3 text-[10px] outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <textarea className="w-full bg-black border border-white/10 rounded-lg p-3 text-[10px] outline-none h-24" placeholder="DESCRIPTION" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  <input className="w-full bg-black border border-white/10 rounded-lg p-3 text-[10px] outline-none" placeholder="IMAGE URLS (COMMA SEPARATED)" value={formData.images} onChange={(e) => setFormData({...formData, images: e.target.value})} />
                  <button type="submit" className="w-full bg-[#00FFFF] text-black font-black py-4 rounded-xl text-[10px] tracking-[0.3em] uppercase">{editingProduct ? "Save Changes" : "Publish Drop"}</button>
                  {editingProduct && <button type="button" onClick={() => setEditingProduct(null)} className="w-full text-white/20 text-[9px] tracking-widest mt-2 uppercase">Cancel Edit</button>}
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-3">
              <p className="text-[9px] tracking-widest text-white/25 uppercase mb-4">Stock Management</p>
              {products.map((p) => (
                <div key={p._id} className="group flex items-center justify-between bg-white/2 border border-white/5 p-4 rounded-xl hover:border-[#00FFFF]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={p.images?.[0]} className="w-10 h-14 object-cover rounded bg-white/5" />
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest">{p.name}</h3>
                      <p className="text-[9px] text-white/30 tracking-widest">₹{p.price?.toLocaleString()} • {p.category}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingProduct(p); setFormData({...p, images: p.images.join(", "), sizes: p.sizes.join(", ")}); }} className="text-[9px] font-black text-[#00FFFF] tracking-widest">EDIT</button>
                    <button onClick={() => deleteProduct(p._id)} className="text-[9px] font-black text-red-500 tracking-widest">DELETE</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}