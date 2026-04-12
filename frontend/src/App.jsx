import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";

import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AdminPage from "./pages/AdminPage";
import OrderConfirmedPage from "./pages/OrderConfirmedPage";
import NotFoundPage from "./pages/NotFoundPage";
import WhatsAppButton from "./components/WhatsAppButton";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WhatsAppButton />
          <Routes>
            <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
            <Route path="/product/:id" element={<ErrorBoundary><ProductDetailPage /></ErrorBoundary>} />
            <Route path="/checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
            <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
            <Route path="/signup" element={<ErrorBoundary><SignupPage /></ErrorBoundary>} />
            <Route path="/orders" element={<ErrorBoundary><OrderHistoryPage /></ErrorBoundary>} />
            <Route path="/admin" element={<ErrorBoundary><AdminPage /></ErrorBoundary>} />
            <Route path="/order-confirmed" element={<ErrorBoundary><OrderConfirmedPage /></ErrorBoundary>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}