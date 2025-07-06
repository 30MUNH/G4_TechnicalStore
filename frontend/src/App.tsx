import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import ContactUs from "./components/About/ContactUs.jsx";
import Aboutus from "./components/About/Aboutus.jsx";
import Login from "./components/Login/Login.jsx";
import SignUp from "./components/Login/SignUp.jsx";
import ForgotPassword from "./components/Login/ForgotPassword.jsx";
import HomePage from "./Page/HomePage";
import CartPage from "./Page/CartPage.jsx";
import CheckoutPage from "./Page/CheckoutPage.jsx";
import AllProductsPage from "./Page/AllProductsPage";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navigation from './components/Navigation';
import Header from './components/header';
import { Fragment, useEffect } from 'react';
import type { ReactNode } from 'react';
import CustomerList from "./components/Customer_manager/CustomerList.jsx";
import ShipperManagement from "./components/Shipper_manager/ShipperManagement.jsx";
import { AdminApp } from "./components/admin";

function AuthBgWrapper({ children }: { children: ReactNode }) {
  return <div className="auth-bg-custom">{children}</div>;
}

// Protected Route Component for admin access
function ProtectedRoute({ children, requireAdmin = false }: { children: ReactNode, requireAdmin?: boolean }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // For admin routes, we'll let the component handle the redirect
  // since the user data might not be fully loaded yet
  if (requireAdmin && !user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Component để handle navigation events từ AuthContext
function AuthNavigationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthLogout = (event: CustomEvent) => {
      const redirectTo = event.detail?.redirectTo || '/login';
      navigate(redirectTo, { replace: true });
    };

    window.addEventListener('auth:logout', handleAuthLogout as EventListener);
    
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout as EventListener);
    };
  }, [navigate]);

  return null;
}

// Tách logic route để dùng useLocation
function AppContent() {
  const location = useLocation();

  // Các route không muốn hiện header/navigation
  const hideHeaderAndNavRoutes = ["/login", "/signup", "/forgot-password", "/about", "/contact", "/cart", "/checkout", "/manage-customers", "/manage-shippers", "/admin"];
  const shouldHide = hideHeaderAndNavRoutes.includes(location.pathname);

  return (
    <Fragment>
      <AuthNavigationHandler />
      {!shouldHide && <Header />}
      {!shouldHide && <Navigation />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/all-products" element={<AllProductsPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<AuthBgWrapper><Login /></AuthBgWrapper>} />
        <Route path="/signup" element={<AuthBgWrapper><SignUp /></AuthBgWrapper>} />
        <Route path="/forgot-password" element={<AuthBgWrapper><ForgotPassword /></AuthBgWrapper>} />

        <Route path="/manage-customers" element={
          <ProtectedRoute requireAdmin={true}>
            <CustomerList />
          </ProtectedRoute>
        } />
        <Route path="/manage-shippers" element={
          <ProtectedRoute requireAdmin={true}>
            <ShipperManagement />
          </ProtectedRoute>
        } />
        
        {/* Admin Dashboard Route */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminApp />
          </ProtectedRoute>
        } />
        
        {/* Redirect any unknown paths to home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Fragment>
  );
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;