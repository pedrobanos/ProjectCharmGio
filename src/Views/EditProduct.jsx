import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../services/productServices"; // ajusta el path si es distinto

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Campos del producto
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [lugar, setLugar] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [codigoProveedor, setCodigoProveedor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [urlInput, setUrlInput] = useState(""); // sólo el dominio sin https://

  // Imagen
  const [fotoFile, setFotoFile] = useState(null); // nueva (opcional)
  const [fotoActual, setFotoActual] = useState(""); // url existente

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helpers
  const stripHttps = (url = "") => url.replace(/^https?:\/\//i, "");

  const validateFields = () => {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (cantidad === "" || isNaN(cantidad) || Number(cantidad) < 0)
      return "Cantidad inválida.";
    if (!precio.toString().trim()) return "El precio es obligatorio.";
    if (!lugar.trim()) return "El lugar es obligatorio.";
    if (!proveedor.trim()) return "El proveedor es obligatorio.";
    if (!codigoProveedor.trim()) return "El código del proveedor es obligatorio.";
    if (urlInput && !/^\S+\.\S+/.test(urlInput))
      return "La URL no es válida (usa formato: ejemplo.com)";
    return null;
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Error al subir la imagen");

    const data = await res.json();
    return data.secure_url;
  };

  // Cargar producto al iniciar
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const product = await getProductById(id);
        if (!isMounted) return;
        // Ajusta los nombres de campos según tu tabla
        setNombre(product?.nombre ?? product?.name ?? "");
        setCantidad(
          product?.cantidad ?? product?.quantity ?? product?.qty ?? ""
        );
        setPrecio(product?.precio ?? product?.price ?? "");
        setLugar(product?.lugar ?? product?.location ?? "");
        setProveedor(product?.proveedor ?? product?.supplier ?? "");
        setCodigoProveedor(
          product?.codigoProveedor ?? product?.supplier_code ?? ""
        );
        setDescripcion(product?.descripcion ?? product?.description ?? "");
        const url = product?.url ?? "";
        setUrlInput(stripHttps(url));
        setFotoActual(product?.foto ?? product?.image ?? "");
      } catch (err) {
        console.error(err);
        setError(err.message || "No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      let fotoURL = fotoActual || "";
      if (fotoFile) {
        fotoURL = await uploadToCloudinary(fotoFile);
      }

      const updates = {
        nombre: nombre.trim(),
        cantidad: Number(cantidad),
        precio: `${precio}`.trim(),
        lugar: lugar.trim(),
        proveedor: proveedor.trim(),
        codigoProveedor: codigoProveedor.trim(),
        descripcion: descripcion.trim(),
        foto: fotoURL,
        url: urlInput ? `https://${urlInput.trim()}` : "",
      };

      await updateProduct(Number(id), updates);
      setSuccess("Producto actualizado con éxito!");
      // Navega al listado (ajusta la ruta si hace falta)


      const fromSearch = location.state?.fromSearch;
      if (fromSearch) {
        // Vuelve a la lista con la misma página (?page=…)
        navigate(`/products${fromSearch}`, { replace: true });
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/products");
      }



      navigate("/products");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded mt-6">Cargando...</div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded mt-6">
      <h2 className="text-3xl font-bold mb-4">Editar producto</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="mt-8">
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
              className="border p-2 rounded w-full border-blue-600"
              required
            />
          </div>
        ))}

        {/* Descripción */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Descripción (opcional):</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border p-2 rounded w-full border-blue-600"
            rows={3}
            required
          />
        </div>

        {/* URL con https:// fijo */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">URL:</label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l border border-r-0 bg-gray-100 border-blue-600 text-gray-600 text-sm">
              https://
            </span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="www.ejemplo.com"
              className="border p-2 rounded-r w-full border-blue-600"
              required
            />
          </div>
        </div>

        {/* Imagen */}
        <label className="block mb-2 font-semibold">Foto (opcional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full mb-4 border-blue-600"
        />

        {(fotoFile || fotoActual) && (
          <div className="mb-4">
            <p className="text-gray-500 text-sm">Vista previa:</p>
            <img
              src={fotoFile ? URL.createObjectURL(fotoFile) : fotoActual}
              alt="Preview"
              className="h-32 w-auto object-cover rounded border"
            />
          </div>
        )}

        <div className="flex gap-3 justify-center mt-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;