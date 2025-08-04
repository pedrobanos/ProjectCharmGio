import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const [userAuthenticated, setUserAuthenticated] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user"); // cambiar a "user"
    setUserAuthenticated(!!user);
  }, []);

  if (userAuthenticated === null) {
    return <p>Cargando...</p>;
  }

  return userAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
