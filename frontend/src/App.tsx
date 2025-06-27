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
import ManageProduct from "./components/ManageProduct/ManageProduct";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from './components/Navigation';
import Header from './components/header';
import { Fragment } from 'react';

// 👇 Tách logic route để dùng useLocation
function AppContent() {
  const location = useLocation();

  // Các route không muốn hiện header/navigation
  const hideHeaderAndNavRoutes = ["/login", "/signup", "/forgot-password", "/about", "/contact", "/cart"];
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/manage-product" element={<ManageProduct />} />
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