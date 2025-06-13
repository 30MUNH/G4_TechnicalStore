import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ContactUs from "./components/About/ContactUs.jsx";
import Aboutus from "./components/About/Aboutus.jsx";
import HomePage from "./Page/HomePage.jsx";
import CartPage from "./Page/CartPage.jsx";
import { CartProvider } from "./Hook/useCart.jsx";

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<Aboutus />} />
          <Route path="/cart" element={<CartPage />} />
          {/* Redirect any unknown paths to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
