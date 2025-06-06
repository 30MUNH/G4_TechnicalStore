import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductDetail from "./components/product_manager/product_detail.tsx";
import ProductList from "./components/product_manager/product_list.tsx";
import UserList from "./components/user_manager/user_list.tsx";
import HomePage from "./Page/HomePage.tsx";
// import HomePage from './Page/HomePage.tsx'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/userList" element={<UserList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
