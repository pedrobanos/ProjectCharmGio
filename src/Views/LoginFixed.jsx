import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

const LoginFixed = ({ onLoginSuccess }) => {  // Recibe la prop
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError("Credenciales inválidas o error de conexión.");
        } else {
            // Guarda usuario en localStorage y estado global
            onLoginSuccess(data.user);
            navigate("/products");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 shadow-md rounded w-96">
                <h2 className="text-2xl text-center font-bold mb-6">Iniciar Sesión</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 mb-4 border rounded"
                />
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Entrar
                </button>
                <div className="text-center mt-4">
                    <Link to="/register" className="text-blue-500 hover:underline">
                        ¿No tienes cuenta? Regístrate!
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default LoginFixed;