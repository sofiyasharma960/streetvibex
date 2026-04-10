import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CartDrawer from "../components/CartDrawer";
import WishlistButton from "../components/WishlistButton";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage({ cart, setCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const API = import.meta.env.VITE_API_URL;
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    fetch(`${API}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`${API}/api/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setTotalReviews(data.total || 0);
      });
  }, [id]);

  const addToCart = useCallback((andCheckout = false) => {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2500);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id && i.size === selectedSize);
      if (existing) return prev.map((i) => i._id === product._id && i.size === selectedSize ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, size: selectedSize, qty: 1 }];
    });
    if (andCheckout) navigate("/checkout");
    else { setAdded(true); setCartOpen(true); setTimeout(() => setAdded(false), 2000); }
  }, [selectedSize, product, setCart, navigate]);

  const submitReview = async () => {
    if (!user) return setReviewError("Please sign in to leave a review");
    if (!reviewForm.rating) return setReviewError("Please select a rating");
    if (!reviewForm.comment.trim()) return setReviewError("Please write a comment");
    setReviewLoading(true);
    try {
      const res = await fetch(`${API}/api/reviews/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (!res.ok) return setReviewError(data.message);
      setReviews((prev) => [data, ...prev]);
      setTotalReviews(t => t + 1);
      setReviewForm({ rating: 0, comment: "" });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch { setReviewError("Something went wrong."); } finally { setReviewLoading(false); }
  };

  const StarRating = ({ value, interactive = false, size = "text-lg" }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => interactive && setReviewForm(p => ({ ...p, rating: star }))} onMouseEnter={() => interactive && setHoveredStar(star)} onMouseLeave={() => interactive && setHoveredStar(0)} className={`${size} transition-colors ${star <= (interactive ? hoveredStar || value : value) ? "text-yellow-400" : "text-white/15"}`}>★</button>
      ))}
    </div>
  );

  if (loading || !product) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 w-full z-[100] flex justify-between items-center px-6 sm:px-12 py-5 backdrop-blur-xl bg-black/80 border-b border-white/5">
        <button onClick={() => navigate("/")} className="text-base font-black tracking-[0.2em] text-[#00FFFF]">STREETVIBEX</button>
        <button onClick={() => setCartOpen(true)} className="relative border border-[#00FFFF]/40 text-[#00FFFF] px-4 py-2 hover:bg-[#00FFFF] hover:text-black transition-all text-[10px] tracking-widest font-bold rounded-lg">BAG {cartCount > 0 && `(${cartCount})`}</button>
      </nav>

      <div className="pt-24 px-4 sm:px-8 lg:px-16 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* IMAGE SECTION */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full rounded-2xl overflow-hidden bg-white/3 border border-white/5 aspect-[3/4]">
              <img src={product.images?.[imgIdx]} alt={product.name} fetchpriority="high" decoding="sync" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images?.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 ${i === imgIdx ? "border-[#00FFFF]" : "border-white/10"}`}>
                  <img src={img} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO SECTION */}
          <div className="w-full lg:w-1/2">
            <p className="text-[9px] tracking-[0.8em] text-[#00FFFF]/40 mb-2 uppercase">{product.category} — StreetVibeX</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-3 uppercase">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-2xl sm:text-3xl font-black text-[#00FFFF]">₹{product.price?.toLocaleString()}</p>
              <WishlistButton product={product} />
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-8 border-l-2 border-[#00FFFF]/20 pl-4">{product.description}</p>

            <div className="mb-8">
              <p className="text-xs font-black tracking-[0.4em] text-white/60 mb-4">SELECT SIZE</p>
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-14 h-14 font-black border-2 rounded-xl transition-all ${selectedSize === size ? "border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/10 shadow-[0_0_15px_#00FFFF44]" : "border-white/10 text-white/40"}`}>{size}</button>
                ))}
              </div>
              {sizeError && <p className="text-red-400 text-[10px] mt-2 tracking-widest">Please select a size</p>}
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <button onClick={() => addToCart(false)} className={`w-full py-5 font-black tracking-[0.3em] text-sm rounded-xl transition-all ${added ? "bg-green-400 text-black" : "bg-[#00FFFF] text-black hover:bg-white"}`}>{added ? "✓ ADDED TO BAG" : "ADD TO BAG"}</button>
              <button onClick={() => addToCart(true)} className="w-full py-5 font-black tracking-[0.3em] text-sm rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10">BUY NOW →</button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[{ icon: "🚚", title: "Free Shipping" }, { icon: "↩️", title: "7-Day Return" }, { icon: "🔒", title: "Secure Pay" }].map((b, i) => (
                <div key={i} className="text-center p-3 border border-white/5 rounded-xl">
                  <p className="text-xl mb-1">{b.icon}</p>
                  <p className="text-[9px] font-black text-white/40 uppercase">{b.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-20 border-t border-white/5 pt-16">
          <h2 className="text-3xl font-black text-white tracking-tighter mb-10">REVIEWS ({totalReviews})</h2>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="border border-white/8 rounded-2xl p-6 bg-white/3">
              <p className="text-[9px] tracking-widest text-white/25 mb-5">LEAVE A REVIEW</p>
              {user ? (
                <div className="space-y-4">
                  <StarRating value={reviewForm.rating} interactive size="text-2xl" />
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#00FFFF] outline-none h-32"
                    placeholder="Tell us about the quality..."
                  />
                  {reviewError && <p className="text-red-400 text-[10px]">{reviewError}</p>}
                  {reviewSuccess && <p className="text-green-400 text-[10px]">✓ Review submitted!</p>}
                  <button onClick={submitReview} disabled={reviewLoading} className="bg-[#00FFFF] text-black px-8 py-3 rounded-lg font-black text-[10px] tracking-widest uppercase">
                    {reviewLoading ? "SUBMITTING..." : "SUBMIT REVIEW"}
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate("/login")} className="text-[#00FFFF] text-[10px] tracking-widest border border-[#00FFFF]/30 px-6 py-3 rounded-lg">SIGN IN TO REVIEW</button>
              )}
            </div>
            <div className="space-y-6">
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-white/5 pb-6">
                  <StarRating value={r.rating} size="text-sm" />
                  <p className="text-white text-sm mt-2">{r.comment}</p>
                  <p className="text-white/20 text-[10px] mt-2 uppercase">{r.userName || "Customer"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CartDrawer cart={cart} setCart={setCart} isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}