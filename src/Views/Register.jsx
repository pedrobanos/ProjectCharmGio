import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // Asegúrate de que la ruta sea correcta
import { useNavigate } from "react-router-dom";
import bgImage from "../../public/loginFoto.png"; // Asegúrate de que la ruta sea correcta


const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("¡Registro exitoso! Revisa tu email.");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-start bg-no-repeat  bg-cover"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "80%",
        backgroundColor: "#beedff",
      }}
    >
      <form onSubmit={handleRegister} className="bg-white p-8 shadow-md rounded w-96">
        <h2 className="text-2xl font-bold mb-6">Registrarse</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirmar Contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Crear cuenta
        </button>
      </form>
    </div>
  );
};

export default Register;
