import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CartDrawer from "../components/CartDrawer";
import WishlistButton from "../components/WishlistButton";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { sanitizeString } from "../utils/sanitize";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cartCount } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`${API}/api/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setTotalReviews(data.total || 0);
      })
      .catch(() => {});
  }, [id, API]);

  const handleAddToCart = useCallback(
    (andCheckout = false) => {
      if (!selectedSize) {
        setSizeError(true);
        setTimeout(() => setSizeError(false), 2500);
        return;
      }
      addToCart(product, selectedSize);
      if (andCheckout) {
        navigate("/checkout");
      } else {
        setAdded(true);
        setCartOpen(true);
        setTimeout(() => setAdded(false), 2000);
      }
    },
    [selectedSize, product, addToCart, navigate]
  );

  const submitReview = async () => {
    setReviewError("");
    if (!user) return setReviewError("Please sign in to leave a review");
    if (!reviewForm.rating) return setReviewError("Please select a rating");
    const comment = sanitizeString(reviewForm.comment);
    if (!comment) return setReviewError("Please write a comment");
    if (comment.length > 500) return setReviewError("Comment must be under 500 characters");

    setReviewLoading(true);
    try {
      const res = await fetch(`${API}/api/reviews/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ rating: reviewForm.rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) return setReviewError(data.message || "Failed to submit review");
      setReviews((prev) => [data, ...prev]);
      setTotalReviews((t) => t + 1);
      setReviewForm({ rating: 0, comment: "" });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch {
      setReviewError("Something went wrong. Try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  const StarRating = ({ value, interactive = false, size = "text-lg" }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && setReviewForm((p) => ({ ...p, rating: star }))}
          onMouseEnter={() => interactive && setHoveredStar(star)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
          className={`${size} transition-colors ${
            star <= (interactive ? hoveredStar || value : value)
              ? "text-yellow-400"
              : "text-white/15"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (loading || !product)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 w-full z-[100] flex justify-between items-center px-6 sm:px-12 py-5 bg-black/90 border-b border-white/5">
        <button
          onClick={() => navigate("/")}
          className="text-base font-black tracking-[0.2em] text-[#00FFFF]"
        >
          STREETVIBEX
        </button>
        <button
          onClick={() => setCartOpen(true)}
          className="border border-[#00FFFF]/40 text-[#00FFFF] px-4 py-2 hover:bg-[#00FFFF] hover:text-black transition-colors text-[10px] tracking-widest font-bold rounded-lg"
        >
          BAG {cartCount > 0 && `(${cartCount})`}
        </button>
      </nav>

      <div className="pt-24 px-4 sm:px-8 lg:px-16 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* IMAGE */}
          <div className="w-full lg:w-1/2">
            <div className="relative w-full rounded-2xl overflow-hidden bg-white/3 border border-white/5 aspect-[3/4]">
              <img
                src={product.images?.[imgIdx]}
                alt={product.name}
                fetchpriority="high"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 ${
                    i === imgIdx ? "border-[#00FFFF]" : "border-white/10"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" loading="lazy" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div className="w-full lg:w-1/2">
            <p className="text-[9px] tracking-[0.8em] text-[#00FFFF]/40 mb-2 uppercase">
              {product.category} — StreetVibeX
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-3 uppercase">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-2xl sm:text-3xl font-black text-[#00FFFF]">
                ₹{product.price?.toLocaleString()}
              </p>
              <WishlistButton product={product} />
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-8 border-l-2 border-[#00FFFF]/20 pl-4">
              {product.description}
            </p>

            <div className="mb-8">
              <p className="text-xs font-black tracking-[0.4em] text-white/60 mb-4">SELECT SIZE</p>
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 font-black border-2 rounded-xl transition-all ${
                      selectedSize === size
                        ? "border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/10"
                        : "border-white/10 text-white/40 hover:border-white/30"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p className="text-red-400 text-[10px] mt-2 tracking-widest">Please select a size</p>
              )}
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <button
                onClick={() => handleAddToCart(false)}
                className={`w-full py-5 font-black tracking-[0.3em] text-sm rounded-xl transition-colors ${
                  added ? "bg-green-400 text-black" : "bg-[#00FFFF] text-black hover:bg-white"
                }`}
              >
                {added ? "✓ ADDED TO BAG" : "ADD TO BAG"}
              </button>
              <button
                onClick={() => handleAddToCart(true)}
                className="w-full py-5 font-black tracking-[0.3em] text-sm rounded-xl bg-white/5 border border-white/15 text-white hover:bg-white/10 transition-colors"
              >
                BUY NOW →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🚚", title: "Free Shipping" },
                { icon: "↩️", title: "7-Day Return" },
                { icon: "🔒", title: "Secure Pay" },
              ].map((b, i) => (
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
          <h2 className="text-3xl font-black text-white tracking-tighter mb-10">
            REVIEWS ({totalReviews})
          </h2>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="border border-white/8 rounded-2xl p-6 bg-white/3">
              <p className="text-[9px] tracking-widest text-white/25 mb-5">LEAVE A REVIEW</p>
              {user ? (
                <div className="space-y-4">
                  <StarRating value={reviewForm.rating} interactive size="text-2xl" />
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((p) => ({
                        ...p,
                        comment: e.target.value.slice(0, 500),
                      }))
                    }
                    maxLength={500}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#00FFFF] outline-none h-32 resize-none"
                    placeholder="Tell us about the quality..."
                  />
                  <p className="text-[9px] text-white/20 text-right">
                    {reviewForm.comment.length}/500
                  </p>
                  {reviewError && <p className="text-red-400 text-[10px]">{reviewError}</p>}
                  {reviewSuccess && <p className="text-green-400 text-[10px]">✓ Review submitted!</p>}
                  <button
                    onClick={submitReview}
                    disabled={reviewLoading}
                    className="bg-[#00FFFF] text-black px-8 py-3 rounded-lg font-black text-[10px] tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {reviewLoading ? "SUBMITTING..." : "SUBMIT REVIEW"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="text-[#00FFFF] text-[10px] tracking-widest border border-[#00FFFF]/30 px-6 py-3 rounded-lg hover:bg-[#00FFFF]/10 transition-colors"
                >
                  SIGN IN TO REVIEW
                </button>
              )}
            </div>

            <div className="space-y-6 max-h-[500px] overflow-y-auto scroll-hide pr-2">
              {reviews.length === 0 && (
                <p className="text-white/20 text-[10px] tracking-widest">No reviews yet. Be the first.</p>
              )}
              {reviews.map((r) => (
                <div key={r._id} className="border-b border-white/5 pb-6">
                  <StarRating value={r.rating} size="text-sm" />
                  <p className="text-white text-sm mt-2">{r.comment}</p>
                  <p className="text-white/20 text-[10px] mt-2 uppercase">
                    {r.userName || "Customer"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}