import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ContactUs from "./components/About/ContactUs.jsx";
import Aboutus from "./components/About/Aboutus.jsx";
import Login from "./components/Login/Login.jsx";
import SignUp from "./components/Login/SignUp.jsx";
import ForgotPassword from "./components/Login/ForgotPassword.jsx";
import HomePage from "./Page/HomePage";
import CartPage from "./Page/CartPage.jsx";
import AllProductsPage from "./Page/AllProductsPage";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from './components/Navigation';
import Header from './components/header';
import { Fragment } from 'react';
import type { ReactNode } from 'react';
import CustomerList from "./components/Customer_manager/CustomerList.jsx";
import ShipperManagement from "./components/Shipper_manager/ShipperManagement.jsx";

function AuthBgWrapper({ children }: { children: ReactNode }) {
  return <div className="auth-bg-custom">{children}</div>;
}

// �� Tách logic route để dùng useLocation
function AppContent() {
  const location = useLocation();

  // Các route không muốn hiện header/navigation
  const hideHeaderAndNavRoutes = ["/login", "/signup", "/forgot-password", "/about", "/contact", "/cart", "/manage-customers", "/manage-shippers"];
  const shouldHide = hideHeaderAndNavRoutes.includes(location.pathname);

  return (
    <Fragment>
      {!shouldHide && <Header />}
      {!shouldHide && <Navigation />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/all-products" element={<AllProductsPage />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<AuthBgWrapper><Login /></AuthBgWrapper>} />
        <Route path="/signup" element={<AuthBgWrapper><SignUp /></AuthBgWrapper>} />
        <Route path="/forgot-password" element={<AuthBgWrapper><ForgotPassword /></AuthBgWrapper>} />
        <Route path="/manage-customers" element={<CustomerList />} />
        <Route path="/manage-shippers" element={<ShipperManagement />} />
        {/* Redirect any unknown paths to home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Fragment>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;