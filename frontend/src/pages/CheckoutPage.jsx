import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { sanitizeForm, isValidPhone, isValidPincode, isValidEmail } from "../utils/sanitize";

const FIELD_LABELS = {
  name: "Full Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  city: "City",
  pincode: "Pincode",
  state: "State",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const submitting = useRef(false);
  const API = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(""); // granular step text
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  const shipping = cartTotal >= 1999 ? 0 : 99;
  const grandTotal = Math.max(0, cartTotal + shipping - discount);

  const handleChange = useCallback((field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validate = () => {
    const sanitized = sanitizeForm(form);
    const e = {};
    if (!sanitized.name) e.name = "Required";
    if (!isValidEmail(sanitized.email)) e.email = "Invalid email";
    if (!isValidPhone(sanitized.phone)) e.phone = "10 digits required";
    if (!sanitized.address) e.address = "Required";
    if (!sanitized.city) e.city = "Required";
    if (!isValidPincode(sanitized.pincode)) e.pincode = "6-digit pincode required";
    if (!sanitized.state) e.state = "Required";
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
        body: JSON.stringify({ code: couponInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) return setCouponError(data.message || "Invalid coupon");
      const disc =
        data.type === "percent"
          ? Math.round((cartTotal * data.discount) / 100)
          : data.discount;
      setDiscount(Math.min(disc, cartTotal));
      setAppliedCoupon(data.code);
    } catch {
      setCouponError("Connection error. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const processOrder = async (isRazorpay = false, rzpResponse = null) => {
    setLoadingStep("Confirming your order...");
    try {
      const endpoint = isRazorpay ? `${API}/api/orders/verify` : `${API}/api/orders/cod`;
      const sanitized = sanitizeForm(form);
      const body = {
        orderDetails: {
          cart,
          form: sanitized,
          total: grandTotal,
          coupon: appliedCoupon,
          paymentMethod: isRazorpay ? "razorpay" : "cod",
        },
        userId: user?._id,
        ...(isRazorpay && rzpResponse),
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        clearCart();
        navigate("/order-confirmed", { state: { orderId: data.orderId } });
      } else {
        throw new Error(data.message || "Order failed. Please try again.");
      }
    } catch (err) {
      alert(err.message);
      setLoading(false);
      setLoadingStep("");
      submitting.current = false;
    }
  };

  const handlePayment = async () => {
    if (submitting.current) return;
    if (!validate()) return;
    if (cart.length === 0) return;

    submitting.current = true;
    setLoading(true);

    if (paymentMethod === "cod") {
      setLoadingStep("Placing your order...");
      return processOrder(false);
    }

    try {
      setLoadingStep("Creating payment session...");
      const res = await fetch(`${API}/api/orders/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: grandTotal }),
      });
      const order = await res.json();

      setLoadingStep("Opening payment gateway...");
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "STREETVIBEX",
        description: "Premium Streetwear Order",
        order_id: order.id,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#00FFFF" },
        handler: (res) => processOrder(true, res),
        modal: {
          ondismiss: () => {
            setLoading(false);
            setLoadingStep("");
            submitting.current = false;
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
      setLoadingStep("");
    } catch (err) {
      console.error("Payment init failed", err);
      setLoading(false);
      setLoadingStep("");
      submitting.current = false;
      alert("Could not connect to payment gateway. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00FFFF] selection:text-black">
      <Navbar />

      <div className="pt-32 px-6 max-w-6xl mx-auto pb-20">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* LEFT */}
          <div className="lg:col-span-7 space-y-8">
            <header>
              <h1 className="text-2xl font-black tracking-tighter italic">CHECKOUT</h1>
              <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase mt-1">
                Shipping & Payment Information
              </p>
            </header>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(FIELD_LABELS).map((f) => (
                <div
                  key={f}
                  className={f === "address" || f === "name" || f === "email" ? "col-span-2" : "col-span-1"}
                >
                  <input
                    placeholder={FIELD_LABELS[f].toUpperCase()}
                    type={f === "email" ? "email" : f === "phone" || f === "pincode" ? "tel" : "text"}
                    inputMode={f === "phone" || f === "pincode" ? "numeric" : "text"}
                    maxLength={f === "pincode" ? 6 : f === "phone" ? 10 : undefined}
                    className={`w-full bg-white/5 border ${
                      errors[f] ? "border-red-500/50" : "border-white/10"
                    } rounded-xl p-4 text-[10px] outline-none focus:border-[#00FFFF]/50 transition-colors uppercase tracking-widest placeholder:text-white/20`}
                    value={form[f]}
                    onChange={handleChange(f)}
                  />
                  {errors[f] && (
                    <p className="text-[8px] text-red-500 mt-1 ml-2 tracking-widest uppercase">
                      {errors[f]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <p className="text-[9px] tracking-[0.3em] text-white/20 uppercase">Select Method</p>
              {[
                { id: "razorpay", label: "Online Payment (UPI / Card)" },
                { id: "cod", label: "Cash on Delivery" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-colors ${
                    paymentMethod === m.id
                      ? "border-[#00FFFF] bg-[#00FFFF]/5"
                      : "border-white/5 text-white/30 hover:border-white/20"
                  }`}
                >
                  <span className="text-[10px] font-black tracking-widest uppercase">{m.label}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === m.id ? "border-[#00FFFF]" : "border-white/20"}`}>
                    {paymentMethod === m.id && <div className="w-2 h-2 bg-[#00FFFF] rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-5">
            <div className="bg-white/3 border border-white/8 rounded-[2.5rem] p-8 sticky top-32">
              <h2 className="text-[10px] font-black tracking-[0.3em] mb-8 text-[#00FFFF]">ORDER SUMMARY</h2>

              <div className="space-y-5 mb-8 max-h-60 overflow-y-auto pr-2 scroll-hide">
                {cart.map((item) => (
                  <div key={item._id + item.size} className="flex gap-4">
                    <div className="w-14 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[10px] font-black uppercase tracking-tight">{item.name}</p>
                      <p className="text-[9px] text-white/40 uppercase mt-1">S: {item.size} • Q: {item.qty}</p>
                    </div>
                    <p className="text-[10px] font-bold tracking-widest self-center">
                      ₹{(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                <div className="flex justify-between text-[10px] text-white/40 tracking-[0.2em] uppercase">
                  <span>Subtotal</span>
                  <span className="text-white">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-white/40 tracking-[0.2em] uppercase">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-400 font-black" : "text-white"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
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
                  <span className="text-xs font-black tracking-[0.2em] uppercase">Total</span>
                  <span className="text-3xl font-black text-[#00FFFF] tabular-nums">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                <input
                  placeholder="COUPON CODE"
                  className="flex-1 bg-black border border-white/5 rounded-xl p-4 text-[9px] tracking-[0.2em] outline-none focus:border-[#00FFFF]/30 transition-colors uppercase"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !!appliedCoupon}
                  className="px-6 bg-white/5 rounded-xl text-[9px] font-black tracking-widest hover:bg-white hover:text-black transition-colors uppercase border border-white/5 disabled:opacity-40"
                >
                  {appliedCoupon ? "✓" : couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-red-500 text-[8px] mt-2 ml-2 uppercase tracking-widest font-bold">{couponError}</p>
              )}

              {/* Loading step indicator */}
              {loading && loadingStep && (
                <p className="text-[9px] text-[#00FFFF]/60 tracking-widest text-center mt-4 uppercase">
                  {loadingStep}
                </p>
              )}

              <button
                onClick={handlePayment}
                disabled={loading || cart.length === 0}
                className="w-full mt-6 bg-[#00FFFF] text-black font-black py-6 rounded-2xl text-[11px] tracking-[0.5em] uppercase transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    PROCESSING...
                  </span>
                ) : paymentMethod === "cod" ? (
                  "CONFIRM ORDER"
                ) : (
                  "INITIATE PAYMENT"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}