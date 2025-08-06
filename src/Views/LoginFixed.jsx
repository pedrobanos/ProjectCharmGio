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
            <div className="bg-white bg-opacity-90 backdrop-blur-sm p-6 sm:p-10 shadow-lg rounded-xl w-full max-w-md sm:ml-24 my-10 sm:my-0">
                <h2 className="text-3xl text-center font-bold mb-6 text-gray-800">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
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
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-semibold"
                    >
                        Entrar
                    </button>
                    <div className="text-center mt-4">
                        <Link to="/register" className="text-blue-600 hover:underline">
                            ¿No tienes cuenta? Regístrate!
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );

};

export default LoginFixed;
