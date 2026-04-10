import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function CheckoutPage({ cart, setCart }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const submitting = useRef(false);
  const API = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "", phone: "",
    address: "", city: "", pincode: "", state: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = total >= 1999 ? 0 : 99;
  const grandTotal = Math.max(0, total + shipping - discount);

  const handleChange = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Invalid email";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "10 digits required";
    if (!form.address.trim()) e.address = "Required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Invalid pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(`${API}/api/orders/coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) return setCouponError(data.message);
      const disc = data.type === "percent" ? Math.round((total * data.discount) / 100) : data.discount;
      setDiscount(Math.min(disc, total));
      setAppliedCoupon(data.code);
    } catch { setCouponError("Connection error"); }
    finally { setCouponLoading(false); }
  };

  const processOrder = async (isRazorpay = false, rzpResponse = null) => {
    try {
      const endpoint = isRazorpay ? `${API}/api/orders/verify` : `${API}/api/orders/cod`;
      const body = {
        orderDetails: {
          cart,
          form,
          total: grandTotal,
          coupon: appliedCoupon,
          paymentMethod: isRazorpay ? "razorpay" : "cod"
        },
        userId: user?._id,
        ...(isRazorpay && rzpResponse)
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setCart([]);
        localStorage.removeItem("svx-cart");
        navigate("/order-confirmed", { state: { orderId: data.orderId } });
      } else {
        throw new Error(data.message || "Order processing failed");
      }
    } catch (err) {
      alert(err.message);
      setLoading(false);
      submitting.current = false;
    }
  };

  const handlePayment = async () => {
    if (submitting.current || !validate() || cart.length === 0) return;
    submitting.current = true;
    setLoading(true);

    if (paymentMethod === "cod") {
      return processOrder(false);
    }

    try {
      const res = await fetch(`${API}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: grandTotal }),
      });

      const order = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "STREETVIBEX",
        description: "Premium Streetwear Order",
        order_id: order.id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        theme: { color: "#00FFFF" },
        handler: (res) => {
          processOrder(true, res);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            submitting.current = false;
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initialization failed", err);
      setLoading(false);
      submitting.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00FFFF] selection:text-black">
      <Navbar cart={cart} />

      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.02),transparent)]" />

      <div className="pt-32 px-6 max-w-6xl mx-auto pb-20">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* LEFT: Shipping Form */}
          <div className="lg:col-span-7 space-y-8">
            <header>
              <h1 className="text-2xl font-black tracking-tighter italic">CHECKOUT</h1>
              <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mt-1">Shipping & Payment Information</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
              {["name", "email", "phone", "address", "city", "pincode", "state"].map((f) => (
                <div key={f} className={f === "address" || f === "name" || f === "email" ? "col-span-2" : "col-span-1"}>
                  <input
                    placeholder={f.toUpperCase()}
                    className={`w-full bg-white/5 border ${errors[f] ? "border-red-500/50" : "border-white/10"} rounded-xl p-4 text-[10px] outline-none focus:border-[#00FFFF]/50 transition-all uppercase tracking-widest placeholder:text-white/20`}
                    value={form[f]}
                    onChange={handleChange(f)}
                  />
                  {errors[f] && <p className="text-[8px] text-red-500 mt-1 ml-2 tracking-widest uppercase">{errors[f]}</p>}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-[9px] tracking-[0.3em] text-white/20 uppercase">Select Method</p>
              {[{ id: "razorpay", label: "Online Payment (UPI/Card)" }, { id: "cod", label: "Cash on Delivery" }].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all duration-500 ${paymentMethod === m.id ? "border-[#00FFFF] bg-[#00FFFF]/5 shadow-[0_0_20px_rgba(0,255,255,0.05)]" : "border-white/5 text-white/30 hover:border-white/20"}`}
                >
                  <span className="text-[10px] font-black tracking-widest uppercase">{m.label}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? "border-[#00FFFF]" : "border-white/20"}`}>
                    {paymentMethod === m.id && <div className="w-2 h-2 bg-[#00FFFF] rounded-full animate-pulse" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white/2 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 sticky top-32 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFFF]/5 blur-[60px] -z-10" />

              <h2 className="text-[10px] font-black tracking-[0.3em] mb-8 text-[#00FFFF]">ORDER SUMMARY</h2>

              <div className="space-y-5 mb-8 max-h-60 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item._id + item.size} className="flex gap-4 group">
                    <div className="relative overflow-hidden rounded-xl w-14 h-20 bg-white/5">
                      <img src={item.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-tight">{item.name}</p>
                      <p className="text-[9px] text-white/40 uppercase mt-1">S: {item.size} • Q: {item.qty}</p>
                    </div>
                    <div className="flex flex-col justify-center text-right">
                      <p className="text-[10px] font-bold tracking-widest">₹{(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex justify-between text-[10px] text-white/40 tracking-[0.2em] uppercase">
                  <span>Subtotal</span>
                  <span className="text-white">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-white/40 tracking-[0.2em] uppercase">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-400 font-black" : "text-white"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>

                <AnimatePresence>
                  {discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex justify-between text-[10px] text-green-400 tracking-[0.2em] uppercase"
                    >
                      <span>Discount ({appliedCoupon})</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                  <span className="text-xs font-black tracking-[0.2em] uppercase">Total Amount</span>
                  <span className="text-3xl font-black text-[#00FFFF] tabular-nums drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-8 flex gap-2">
                <input
                  placeholder="HAVE A CODE?"
                  className="flex-1 bg-black border border-white/5 rounded-xl p-4 text-[9px] tracking-[0.2em] outline-none focus:border-[#00FFFF]/30 transition-all uppercase"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="px-6 bg-white/5 rounded-xl text-[9px] font-black tracking-widest hover:bg-white hover:text-black transition-all uppercase border border-white/5"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponError && <p className="text-red-500 text-[8px] mt-2 ml-2 uppercase tracking-widest font-bold">{couponError}</p>}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={loading || cart.length === 0}
                className="group relative w-full mt-8 bg-[#00FFFF] text-black font-black py-6 rounded-2xl text-[11px] tracking-[0.5em] uppercase transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] hover:scale-[1.02] disabled:opacity-50 disabled:grayscale disabled:scale-100 overflow-hidden"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-20deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000" />
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    SECURELY PROCESSING...
                  </span>
                ) : (
                  paymentMethod === "cod" ? "CONFIRM ORDER" : "INITIATE PAYMENT"
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}