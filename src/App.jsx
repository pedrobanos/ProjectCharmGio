import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
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
import SalesView from "./Views/SalesView";
import SidebarActions from "./components/SidebarActions";
import StatsView from "./Views/StatsView";

function AppContent() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [products, setProducts] = useState([]);

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
      {!hideNavBar && user && (
        <NavBar user={user} onLogout={handleLogout} />
      )}

      {/* Main layout con sidebar + contenido */}
      <div className="flex flex-1">
        {!hideNavBar && user && (
          <SidebarActions user={user} />
        )}

        {/* Contenido principal */}
        <div className="flex-grow p-4 overflow-auto">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={user ? <Navigate to="/products" replace /> : <LoginFixed onLoginSuccess={handleLogin} />} />
            <Route path="/create-product" element={<ProtectedRoute user={user}><CreateProduct /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute user={user}><ProductsPage /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute user={user}><SalesView /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute user={user}><StatsView /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute user={user}><Product /></ProtectedRoute>} />
            <Route path="/products/edit/:id" element={<ProtectedRoute user={user}><EditProduct /></ProtectedRoute>} />
            <Route path="/create-batch" element={<ProtectedRoute user={user}><h1 className="text-3xl font-bold text-center mt-10">Crear Lote - En construcción</h1></ProtectedRoute>} />
          </Routes>
        </div>
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
