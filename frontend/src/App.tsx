import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContactUs from "./components/About/ContactUs.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ContactUs />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
    </Router>
  );
}

export default App;
