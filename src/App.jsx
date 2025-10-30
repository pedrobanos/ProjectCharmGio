import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import './App.css';
import ProductsPage from './components/ProductsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Product from "./components/Product";
import EditProduct from "./Views/EditProduct";
import CreateProduct from "./components/CreateProduct";
import NavBar from "./components/NavBar";
import LoginFixed from "./Views/LoginFixed"; // Importa el componente LoginFixed
import Register from "./Views/Register";
import Footer from "./components/Footer";
import SalesView from "./Views/SalesView";
import SidebarActions from "./components/SidebarActions";
import StatsView from "./Views/StatsView";
import BlackList from "./Views/BlackList";
import OrderView from "./Views/OrderView";
import PurchaseView from "./Views/PurchaseView";
import ReturnsView from "./Views/ReturnsView";
import PurchaseDetailView from "./Views/PurchaseDetailView";

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

  const adminEmails = ["test@test.com", "giovanapilagatto@gmail.com"];
  const userEmail = user?.email?.toLowerCase();
  const userRole = adminEmails.includes(userEmail) ? "admin" : "user";



  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/NavBar */}
      {!hideNavBar && user && (
        <NavBar user={user} onLogout={handleLogout} />
      )}

      {/* Main layout con sidebar + contenido */}
      <div className="flex flex-1">
        {!hideNavBar && user && (
          <SidebarActions userRole={userRole} />
        )}

        {/* Contenido principal */}
        <div className="flex-grow p-4 overflow-auto">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={user ? <Navigate to="/products" replace /> : <LoginFixed onLoginSuccess={handleLogin} />} />
            {/* <Route path="/register" element={<Register />} /> */}
            <Route path="/create-product" element={<ProtectedRoute user={user}><CreateProduct /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute user={user}><ProductsPage userRole={userRole} /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute user={user}><SalesView userRole={userRole} /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute user={user}><OrderView /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute user={user}><StatsView /></ProtectedRoute>} />
            <Route path="/returns" element={<ProtectedRoute user={user}><ReturnsView /></ProtectedRoute>} />
            <Route path="/purchases" element={<ProtectedRoute user={user}><PurchaseView /></ProtectedRoute>} />
            <Route path="/purchases/:id" element={<ProtectedRoute user={user}><PurchaseDetailView /></ProtectedRoute>} />
            <Route path="/black-list" element={<ProtectedRoute user={user}><BlackList /></ProtectedRoute>} />
            <Route path="/products/:id" element={<ProtectedRoute user={user}><Product /></ProtectedRoute>} />
            <Route path="/products/edit/:id" element={<ProtectedRoute user={user}><EditProduct /></ProtectedRoute>} />
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
