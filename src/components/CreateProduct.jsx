import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productServices"; // ajusta el path si es distinto

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

const CreateProduct = () => {
    const [nombre, setNombre] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [precio, setPrecio] = useState("");
    const [lugar, setLugar] = useState("");
    const [proveedor, setProveedor] = useState("");
    const [codigoProveedor, setCodigoProveedor] = useState("");
    const [urlInput, setUrlInput] = useState(""); // Solo lo que escribe el usuario
    const [foto, setFoto] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const validateFields = () => {
        if (!nombre.trim()) return "El nombre es obligatorio.";
        if (!cantidad || isNaN(cantidad) || Number(cantidad) < 0) return "Cantidad inválida.";
        if (!precio.trim()) return "El precio es obligatorio.";
        if (!lugar.trim()) return "El lugar es obligatorio.";
        if (!proveedor.trim()) return "El proveedor es obligatorio.";
        if (!codigoProveedor.trim()) return "El código del proveedor es obligatorio.";
        if (urlInput && !/^\S+\.\S+/.test(urlInput)) return "La URL no es válida (usa formato: ejemplo.com)";
        return null;
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Error al subir la imagen");

        const data = await res.json();
        return data.secure_url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        const validationError = validateFields();
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        try {
            let fotoURL = "";
            if (foto) {
                fotoURL = await uploadToCloudinary(foto);
            }

            const newProduct = {
                nombre: nombre.trim(),
                cantidad: Number(cantidad),
                precio: precio.trim(),
                lugar: lugar.trim(),
                proveedor: proveedor.trim(),
                codigoProveedor: codigoProveedor.trim(),
                foto: fotoURL || "",
                url: urlInput ? `https://${urlInput.trim()}` : "",
            };

            await createProduct(newProduct);

            setSuccess("Producto creado con éxito!");
            setNombre("");
            setCantidad("");
            setPrecio("");
            setLugar("");
            setProveedor("");
            setCodigoProveedor("");
            setUrlInput("");
            setFoto(null);
            navigate("/products");
        } catch (err) {
            console.error(err);
            setError(err.message || "Error al crear el producto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-6">
            <h2 className="text-xl font-bold mb-4">Crear nuevo producto</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {success && <p className="text-green-500 mb-2">{success}</p>}

            <form onSubmit={handleSubmit}>
                {[
                    { label: "Nombre", value: nombre, set: setNombre },
                    { label: "Cantidad", value: cantidad, set: setCantidad, type: "number" },
                    { label: "Precio", value: precio, set: setPrecio, type: "number" },
                    { label: "Lugar del producto", value: lugar, set: setLugar },
                    { label: "Proveedor", value: proveedor, set: setProveedor },
                    { label: "Código Proveedor", value: codigoProveedor, set: setCodigoProveedor },
                ].map(({ label, value, set, type = "text" }, i) => (
                    <div key={i} className="mb-4">
                        <label className="block mb-1 font-semibold">{label}:</label>
                        <input
                            type={type}
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            className="border p-2 rounded w-full"
                            required
                        />
                    </div>
                ))}
                {/* Campo URL con https:// fijo */}
                <div className="mb-4">
                    <label className="block mb-1 font-semibold">URL:</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l border border-r-0 bg-gray-100 text-gray-600 text-sm">
                            https://
                        </span>
                        <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="www.ejemplo.com"
                            className="border p-2 rounded-r w-full"
                        />
                    </div>
                </div>
                <label className="block mb-2 font-semibold">Foto:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFoto(e.target.files[0])}
                    className="border p-2 rounded w-full mb-4"
                />
                {foto && (
                    <div className="mb-4">
                        <p className="text-gray-500 text-sm">Vista previa:</p>
                        <img
                            src={URL.createObjectURL(foto)}
                            alt="Preview"
                            className="h-32 w-auto object-cover rounded border"
                        />
                    </div>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full"
                >
                    {loading ? "Creando..." : "Crear Producto"}
                </button>
            </form>
        </div>
    );
};

export default CreateProduct;
