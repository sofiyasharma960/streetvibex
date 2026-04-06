import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", address: "",
    city: "", pincode: "", state: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = total >= 1999 ? 0 : 99;
  const grandTotal = total + shipping;

  const handleChange = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.phone.length < 10) e.phone = "Valid 10-digit number required";
    if (!form.address.trim()) e.address = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (form.pincode.length !== 6) e.pincode = "Valid 6-digit pincode required";
    if (!form.state.trim()) e.state = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    if (cart.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "INR",
          receipt: `order_${Date.now()}`,
        }),
      });
      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "StreetVibeX",
        description: "Limited Edition Drop",
        order_id: order.id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#00FFFF" },
        handler: async (response) => {
          await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              orderDetails: { cart, form, total: grandTotal },
            }),
          });
          setCart([]);
          localStorage.removeItem("svx-cart");
          navigate("/order-confirmed");
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "FULL NAME", field: "name", placeholder: "Your full name", type: "text", col: "full" },
    { label: "EMAIL ADDRESS", field: "email", placeholder: "your@email.com", type: "email", col: "full" },
    { label: "PHONE NUMBER", field: "phone", placeholder: "10-digit mobile number", type: "tel", col: "full" },
    { label: "STREET ADDRESS", field: "address", placeholder: "House no, Street, Area", type: "text", col: "full" },
    { label: "CITY", field: "city", placeholder: "City", type: "text", col: "half" },
    { label: "PINCODE", field: "pincode", placeholder: "6-digit pincode", type: "text", col: "half" },
    { label: "STATE", field: "state", placeholder: "State", type: "text", col: "full" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundSize: "50px 50px",
        backgroundImage: "linear-gradient(to right, rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,245,255,0.03) 1px, transparent 1px)"
      }} />

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] flex justify-between items-center px-6 sm:px-12 py-5 backdrop-blur-xl bg-black/70 border-b border-white/5">
        <button
          onClick={() => navigate("/")}
          className="text-base font-black tracking-[0.25em] text-[#00FFFF] drop-shadow-[0_0_20px_#00FFFF]"
        >
          STREETVIBEX
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[9px] tracking-widest px-3 py-1 rounded-full bg-[#00FFFF] text-black font-black">1 DETAILS</span>
          <span className="text-white/20 text-xs">→</span>
          <span className="text-[9px] tracking-widest px-3 py-1 rounded-full bg-white/10 text-white/40">2 PAY</span>
        </div>
      </nav>

      <div className="pt-28 px-6 sm:px-12 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10">

          {/* LEFT — FORM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-3"
          >
            <p className="text-[9px] tracking-[0.8em] text-[#00FFFF]/40 mb-6">DELIVERY DETAILS</p>

            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ label, field, placeholder, type, col }) => (
                <div key={field} className={col === "full" ? "col-span-2" : "col-span-1"}>
                  <label className="text-[9px] tracking-[0.4em] text-white/30 block mb-2">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={handleChange(field)}
                    placeholder={placeholder}
                    autoComplete="on"
                    className={`w-full bg-black border px-4 py-3.5 text-sm text-white placeholder-white/15 outline-none transition-all rounded-lg ${
                      errors[field]
                        ? "border-red-500/50 focus:border-red-400"
                        : "border-white/10 focus:border-[#00FFFF]/50"
                    }`}
                  />
                  {errors[field] && (
                    <p className="text-red-400 text-[10px] mt-1 tracking-wide">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 border border-white/5 rounded-xl">
              <p className="text-[9px] tracking-widest text-white/20 mb-3">PAYMENT METHOD</p>
              <div className="flex items-center gap-3 p-3 border border-[#00FFFF]/20 rounded-lg">
                <div className="w-3 h-3 bg-[#00FFFF] rounded-full drop-shadow-[0_0_6px_#00FFFF]" />
                <div>
                  <p className="text-xs text-white/70 font-bold">Razorpay</p>
                  <p className="text-[9px] text-white/30">UPI, Cards, Netbanking, Wallets</p>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || cart.length === 0}
              className="w-full mt-6 py-5 bg-[#00FFFF] text-black font-black tracking-[0.4em] text-sm hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
            >
              {loading ? "PROCESSING..." : `PAY ₹${grandTotal.toLocaleString()} →`}
            </button>

            <p className="text-center text-[10px] text-white/20 mt-4 tracking-widest">
              🔒 Secured by Razorpay
            </p>
          </motion.div>

          {/* RIGHT — ORDER SUMMARY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <p className="text-[9px] tracking-[0.8em] text-[#00FFFF]/40 mb-6">ORDER SUMMARY</p>

            <div className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
                {cart.length === 0 && (
                  <p className="text-white/20 text-xs tracking-widest text-center py-4">Cart is empty</p>
                )}
                {cart.map((item) => (
                  <div key={item._id + item.size} className="flex gap-3 items-center">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.images?.[0]}
                        alt={item.name}
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/60x80/050a0a/00FFFF?text=${item.name}`;
                        }}
                        className="w-14 rounded-lg object-cover bg-white/5"
                        style={{ height: "72px" }}
                      />
                      <span className="absolute -top-2 -right-2 bg-[#00FFFF] text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-white tracking-widest truncate">{item.name}</p>
                      <p className="text-[9px] text-white/30 mt-0.5">Size: {item.size}</p>
                    </div>
                    <p className="text-sm font-bold text-white/70 flex-shrink-0">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 p-5 space-y-3">
                <div className="flex justify-between text-xs text-white/40">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Shipping</span>
                  <span className={`font-bold ${shipping === 0 ? "text-green-400" : "text-white/40"}`}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                {shipping > 0 && (
                  <p className="text-[9px] text-yellow-400/60 tracking-wide">
                    Add ₹{(1999 - total).toLocaleString()} more for free shipping
                  </p>
                )}
                <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-[#00FFFF] font-black text-2xl drop-shadow-[0_0_10px_#00FFFF]">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {form.city && (
                <div className="border-t border-white/5 p-4">
                  <p className="text-[9px] text-[#00FFFF]/60 tracking-widest">
                    📦 Delivering to {form.city}{form.state ? `, ${form.state}` : ""}
                  </p>
                  <p className="text-[9px] text-white/20 mt-1">Estimated delivery: 5–7 business days</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}