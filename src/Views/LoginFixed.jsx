import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../../public/loginFoto.png"; // Asegúrate de que la ruta sea correcta

const LoginFixed = ({ onLoginSuccess }) => {
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
            onLoginSuccess(data.user);
            navigate("/products");
        }
    };



    return (
        <div
            className="min-h-screen w-full flex flex-col sm:flex-row items-center justify-center sm:justify-start bg-no-repeat bg-cover bg-right px-4"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "80%",
                backgroundColor: "#beedff",
            }}
        >
            <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-10 shadow-xl rounded-2xl w-full max-w-md sm:ml-24 my-10 sm:my-0">
                <div className="flex flex-col items-center mb-6">
                    <span className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-sm mb-3">
                        <i className="fa-solid fa-gem"></i>
                    </span>
                    <h2 className="text-3xl text-center font-bold text-gray-900">Charm Gio</h2>
                    <p className="text-sm text-gray-500 mt-1">Inicia sesión para gestionar la tienda</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <label className="block mb-4">
                        <span className="text-xs font-semibold text-gray-600 mb-1 block">Email</span>
                        <div className="relative">
                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full py-2.5 pl-10 pr-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            />
                        </div>
                    </label>
                    <label className="block mb-4">
                        <span className="text-xs font-semibold text-gray-600 mb-1 block">Contraseña</span>
                        <div className="relative">
                            <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-2.5 pl-10 pr-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            />
                        </div>
                    </label>
                    {error && (
                        <p className="text-red-600 text-sm mb-3 flex items-center gap-2">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 shadow-sm"
                    >
                        <i className="fa-solid fa-right-to-bracket"></i>
                        Entrar
                    </button>
                    {/* <div className="text-center mt-4">
                        <Link to="/register" className="text-blue-600 hover:underline">
                            ¿No tienes cuenta? Regístrate!
                        </Link>
                    </div> */}
                </form>
            </div>
        </div>
    );

};

export default LoginFixed;
