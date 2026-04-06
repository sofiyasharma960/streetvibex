import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmPage from "./pages/OrderConfirmPage";

export default function App() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("svx-cart")) || [];
    } catch {
      return [];
    }
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("svx-cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <Routes>
      <Route path="/" element={<HomePage cart={cart} setCart={setCart} />} />
      <Route path="/product/:id" element={<ProductDetailPage cart={cart} setCart={setCart} />} />
      <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
      <Route path="/order-confirmed" element={<OrderConfirmPage />} />
    </Routes>
  );
}