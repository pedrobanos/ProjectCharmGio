
// // export default CreateProduct;
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createProduct } from "../services/productServices"; // ajusta el path si es distinto

// const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
// const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// const CreateProduct = () => {
//     const [nombre, setNombre] = useState("");
//     const [cantidad, setCantidad] = useState("");
//     const [precio, setPrecio] = useState("");
//     const [lugar, setLugar] = useState("");
//     const [proveedor, setProveedor] = useState("");
//     const [codigoProveedor, setCodigoProveedor] = useState("");
//     const [descripcion, setDescripcion] = useState("");
//     const [urlInput, setUrlInput] = useState("");
//     const [foto, setFoto] = useState(null);
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [success, setSuccess] = useState("");
//     const navigate = useNavigate();

//     const validateFields = () => {
//         if (!nombre.trim()) return "El nombre es obligatorio.";
//         if (!cantidad || isNaN(cantidad) || Number(cantidad) < 0) return "Cantidad inválida.";
//         if (!precio.trim()) return "El precio es obligatorio.";
//         if (!lugar.trim()) return "El lugar es obligatorio.";
//         if (!proveedor.trim()) return "El proveedor es obligatorio.";
//         if (!codigoProveedor.trim()) return "El código del proveedor es obligatorio.";
//         if (urlInput && !/^\S+\.\S+/.test(urlInput)) return "La URL no es válida (usa formato: ejemplo.com)";
//         return null;
//     };

//     const uploadToCloudinary = async (file) => {
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//         const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
//             method: "POST",
//             body: formData,
//         });

//         if (!res.ok) throw new Error("Error al subir la imagen");

//         const data = await res.json();
//         return data.secure_url;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess("");
//         setLoading(true);

//         const validationError = validateFields();
//         if (validationError) {
//             setError(validationError);
//             setLoading(false);
//             return;
//         }

//         try {
//             let fotoURL = "";
//             if (foto) {
//                 fotoURL = await uploadToCloudinary(foto);
//             }

//             const newProduct = {
//                 nombre: nombre.trim(),
//                 cantidad: Number(cantidad),
//                 precio: precio.trim(),
//                 lugar: lugar.trim(),
//                 proveedor: proveedor.trim(),
//                 codigoProveedor: codigoProveedor.trim(),
//                 descripcion: descripcion.trim(), // puede estar vacío
//                 foto: fotoURL || "",
//                 url: urlInput ? `https://${urlInput.trim()}` : "",
//             };

//             await createProduct(newProduct);

//             setSuccess("Producto creado con éxito!");
//             setNombre("");
//             setCantidad("");
//             setPrecio("");
//             setLugar("");
//             setProveedor("");
//             setCodigoProveedor("");
//             setDescripcion("");
//             setUrlInput("");
//             setFoto(null);
//             navigate("/products");
//         } catch (err) {
//             console.error(err);
//             setError(err.message || "Error al crear el producto.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-md mx-auto p-6 bg-white rounded mt-6">
//             <h1 className="text-5xl text-center font-bold mb-4 text-blue-500">Crear Producto </h1>
//             {error && <p className="text-red-500 mb-2">{error}</p>}
//             {success && <p className="text-green-500 mb-2">{success}</p>}

//             <form onSubmit={handleSubmit} className="mt-8">
//                 {[
//                     { label: "Nombre", value: nombre, set: setNombre },
//                     { label: "Cantidad", value: cantidad, set: setCantidad, type: "number" },
//                     { label: "Precio", value: precio, set: setPrecio, type: "number" },
//                     { label: "Lugar del producto", value: lugar, set: setLugar },
//                     { label: "Proveedor", value: proveedor, set: setProveedor },
//                     { label: "Código Proveedor", value: codigoProveedor, set: setCodigoProveedor },
//                 ].map(({ label, value, set, type = "text" }, i) => (
//                     <div key={i} className="mb-4">
//                         <label className="block mb-1 font-semibold">{label}:</label>
//                         <input
//                             type={type}
//                             value={value}
//                             onChange={(e) => set(e.target.value)}
//                             className="border p-2 rounded w-full border-blue-600"
//                             required
//                         />
//                     </div>
//                 ))}

//                 {/* Descripción opcional con contador */}
//                 <div className="mb-4">
//                     <label className="block mb-1 font-semibold">Descripción (opcional):</label>
//                     <textarea
//                         value={descripcion}
//                         onChange={(e) => setDescripcion(e.target.value)}
//                         className="border p-2 rounded w-full border-blue-600"
//                         rows={3}
//                         required
//                     />
//                     {/* <div className="text-sm text-gray-500 text-right">{descripcion.length}/250</div> */}
//                 </div>
//                 {/* URL con https:// fijo
//                 <div className="mb-4">
//                     <label className="block mb-1 font-semibold">URL:</label>
//                     <div className="flex">
//                         <span className="inline-flex items-center px-3 rounded-l border border-r-0 bg-gray-100 border-blue-600 text-gray-600 text-sm">
//                             https://
//                         </span>
//                         <input
//                             type="text"
//                             value={urlInput}
//                             onChange={(e) => setUrlInput(e.target.value)}
//                             placeholder="www.ejemplo.com"
//                             className="border p-2 rounded-r w-full border-blue-600"
//                         // required
//                         />
//                     </div>
//                 </div> */}
//                 <label className="block mb-2 font-semibold">Foto:</label>
//                 <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => setFoto(e.target.files[0])}
//                     className="border p-2 rounded w-full mb-4 border-blue-600"
//                     required
//                 />
//                 {foto && (
//                     <div className="mb-4">
//                         <p className="text-gray-500 text-sm">Vista previa:</p>
//                         <img
//                             src={URL.createObjectURL(foto)}
//                             alt="Preview"
//                             className="h-32 w-auto object-cover rounded border"
//                         />
//                     </div>
//                 )}

//                 <div className="flex justify-center mt-3">
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="bg-gray-800 w-1/2 text-white py-2 px-4 rounded hover:bg-blue-600"
//                     >
//                         {loading ? "Creando..." : "Crear Producto"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default CreateProduct;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productServices";
import { LugaresDisponibles } from "../Constants";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const CreateProduct = () => {
    const [nombre, setNombre] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [precio, setPrecio] = useState("");
    const [lugarBase, setLugarBase] = useState(""); // 🔹 NUEVO
    const [posicion, setPosicion] = useState(""); // 🔹 NUEVO
    const [proveedor, setProveedor] = useState("");
    const [codigoProveedor, setCodigoProveedor] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [urlInput, setUrlInput] = useState("");
    const [foto, setFoto] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // 🔹 Lugares base disponibles


    const validateFields = () => {
        if (!nombre.trim()) return "El nombre es obligatorio.";
        if (!cantidad || isNaN(cantidad) || Number(cantidad) < 0) return "Cantidad inválida.";
        if (!precio.trim()) return "El precio es obligatorio.";
        if (!lugarBase.trim()) return "Debes seleccionar un lugar.";
        if (!posicion.trim()) return "Debes indicar la ubicación exacta.";
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

            const lugarFinal = `${lugarBase} ${posicion.trim()}`; // 🔹 Combina el lugar + posición

            const newProduct = {
                nombre: nombre.trim(),
                cantidad: Number(cantidad),
                precio: Number(precio),
                lugar: lugarFinal, // 🔹 Guarda como “Felpudo Grande 2C”
                proveedor: proveedor.trim(),
                codigoProveedor: codigoProveedor.trim(),
                descripcion: descripcion.trim(),
                foto: fotoURL || "",
                url: urlInput ? `https://${urlInput.trim()}` : "",
            };

            await createProduct(newProduct);

            setSuccess("Producto creado con éxito!");
            setNombre("");
            setCantidad("");
            setPrecio("");
            setLugarBase("");
            setPosicion("");
            setProveedor("");
            setCodigoProveedor("");
            setDescripcion("");
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
        <div className="max-w-md mx-auto p-6 bg-white rounded mt-6">
            <h1 className="text-5xl text-center font-bold mb-4 mt-8 text-blue-500">Crear Producto</h1>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {success && <p className="text-green-500 mb-2">{success}</p>}

            <form onSubmit={handleSubmit} className="mt-8">
                {/* Campos comunes */}
                {[
                    { label: "Nombre", value: nombre, set: setNombre },
                    { label: "Cantidad", value: cantidad, set: setCantidad, type: "number" },
                    { label: "Precio", value: precio, set: setPrecio, type: "number" },
                    { label: "Proveedor", value: proveedor, set: setProveedor },
                    { label: "Código Proveedor", value: codigoProveedor, set: setCodigoProveedor },
                ].map(({ label, value, set, type = "text" }, i) => (
                    <div key={i} className="mb-4">
                        <label className="block mb-1 font-semibold">{label}:</label>
                        <input
                            type={type}
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            className="border p-2 rounded w-full border-blue-600"
                            required
                        />
                    </div>
                ))}

                {/* 🔹 Selector de lugar base */}
                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Lugar:</label>
                    <select
                        value={lugarBase}
                        onChange={(e) => setLugarBase(e.target.value)}
                        className="border p-2 rounded w-full border-blue-600"
                        required
                    >
                        <option value="">Selecciona un lugar</option>
                        {LugaresDisponibles.map((lugar) => (
                            <option key={lugar} value={lugar}>
                                {lugar}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 🔹 Input dependiente para posición */}
                {lugarBase && (
                    <div className="mb-4">
                        <label className="block mb-1 font-semibold">Ubicación exacta (ej. G5, 2C, H7...):</label>
                        <input
                            type="text"
                            value={posicion}
                            onChange={(e) => setPosicion(e.target.value)}
                            placeholder="Ejemplo: 2C"
                            className="border p-2 rounded w-full border-blue-600"
                            required
                        />
                    </div>
                )}

                {/* Descripción */}
                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Descripción:</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="border p-2 rounded w-full border-blue-600"
                        rows={3}
                    />
                </div>

                {/* Imagen */}
                <label className="block mb-2 font-semibold">Foto:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFoto(e.target.files[0])}
                    className="border p-2 rounded w-full mb-4 border-blue-600"
                    required
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

                <div className="flex justify-center mt-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-800 w-1/2 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        {loading ? "Creando..." : "Crear Producto"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProduct;
