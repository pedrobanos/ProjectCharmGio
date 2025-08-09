import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import './App.css';
import ProductsPage from './components/ProductsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Product from "./components/Product";
import Register from "./Views/Register";
import EditProduct from "./Views/EditProduct";

import CreateProduct from "./components/CreateProduct";
import NavBar from "./components/NavBar";

import LoginFixed from "./Views/LoginFixed"; // Importa el componente LoginFixed
import Footer from "./components/Footer";

function AppContent() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    navigate("/products"); // Redirige a products después de login
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const hideNavBar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/NavBar */}
      {!hideNavBar && user && <NavBar user={user} onLogout={handleLogout} />}
      {/* Main content, crece para ocupar el espacio */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user ? <Navigate to="/products" replace /> : <LoginFixed onLoginSuccess={handleLogin} />} />
          {/* <Route path="/register" element={user ? <Navigate to="/products" replace /> : <Register onRegisterSuccess={() => { }} />} /> */}
          <Route path="/create-product" element={<ProtectedRoute user={user}><CreateProduct /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute user={user}><ProductsPage /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute user={user}><Product /></ProtectedRoute>} />
          <Route path="/products/edit/:id" element={<ProtectedRoute user={user}><EditProduct /></ProtectedRoute>} />
        </Routes>
      </div>
      {!hideNavBar && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
