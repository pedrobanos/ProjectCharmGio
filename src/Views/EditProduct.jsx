// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { getProductById, updateProduct } from "../services/productServices"; // ajusta el path si es distinto
// import Loading from "../components/Loading";

// const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
// const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// const EditProduct = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   // Campos del producto
//   const [nombre, setNombre] = useState("");
//   const [cantidad, setCantidad] = useState("");
//   const [precio, setPrecio] = useState("");
//   const [lugar, setLugar] = useState("");
//   const [proveedor, setProveedor] = useState("");
//   const [codigoProveedor, setCodigoProveedor] = useState("");
//   const [descripcion, setDescripcion] = useState("");
//   const [urlInput, setUrlInput] = useState(""); // sólo el dominio sin https://

//   // Imagen
//   const [fotoFile, setFotoFile] = useState(null); // nueva (opcional)
//   const [fotoActual, setFotoActual] = useState(""); // url existente

//   // UI state
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // Helpers
//   const stripHttps = (url = "") => url.replace(/^https?:\/\//i, "");

//   const validateFields = () => {
//     if (!nombre.trim()) return "El nombre es obligatorio.";
//     if (cantidad === "" || isNaN(cantidad) || Number(cantidad) < 0)
//       return "Cantidad inválida.";
//     if (!precio.toString().trim()) return "El precio es obligatorio.";
//     if (!lugar.trim()) return "El lugar es obligatorio.";
//     if (!proveedor.trim()) return "El proveedor es obligatorio.";
//     if (!codigoProveedor.trim()) return "El código del proveedor es obligatorio.";
//     if (urlInput && !/^\S+\.\S+/.test(urlInput))
//       return "La URL no es válida (usa formato: ejemplo.com)";
//     return null;
//   };

//   const uploadToCloudinary = async (file) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//     const res = await fetch(
//       `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
//       {
//         method: "POST",
//         body: formData,
//       }
//     );

//     if (!res.ok) throw new Error("Error al subir la imagen");

//     const data = await res.json();
//     return data.secure_url;
//   };

//   // Cargar producto al iniciar
//   useEffect(() => {
//     let isMounted = true;
//     (async () => {
//       try {
//         const product = await getProductById(id);
//         if (!isMounted) return;
//         // Ajusta los nombres de campos según tu tabla
//         setNombre(product?.nombre ?? product?.name ?? "");
//         setCantidad(
//           product?.cantidad ?? product?.quantity ?? product?.qty ?? ""
//         );
//         setPrecio(product?.precio ?? product?.price ?? "");
//         setLugar(product?.lugar ?? product?.location ?? "");
//         setProveedor(product?.proveedor ?? product?.supplier ?? "");
//         setCodigoProveedor(
//           product?.codigoProveedor ?? product?.supplier_code ?? ""
//         );
//         setDescripcion(product?.descripcion ?? product?.description ?? "");
//         const url = product?.url ?? "";
//         setUrlInput(stripHttps(url));
//         setFotoActual(product?.foto ?? product?.image ?? "");
//       } catch (err) {
//         console.error(err);
//         setError(err.message || "No se pudo cargar el producto.");
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => {
//       isMounted = false;
//     };
//   }, [id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     const validationError = validateFields();
//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setSaving(true);
//     try {
//       let fotoURL = fotoActual || "";
//       if (fotoFile) {
//         fotoURL = await uploadToCloudinary(fotoFile);
//       }

//       const updates = {
//         nombre: nombre.trim(),
//         cantidad: Number(cantidad),
//         precio: `${precio}`.trim(),
//         lugar: lugar.trim(),
//         proveedor: proveedor.trim(),
//         codigoProveedor: codigoProveedor.trim(),
//         descripcion: descripcion.trim(),
//         foto: fotoURL,
//         url: urlInput ? `https://${urlInput.trim()}` : "",
//       };

//       await updateProduct(Number(id), updates);
//       setSuccess("Producto actualizado con éxito!");
//       // Navega al listado (ajusta la ruta si hace falta)


//       const fromSearch = location.state?.fromSearch;
//       if (fromSearch) {
//         // Vuelve a la lista con la misma página (?page=…)
//         navigate(`/products${fromSearch}`, { replace: true });
//       } else if (window.history.length > 1) {
//         navigate(-1);
//       } else {
//         navigate("/products");
//       }



//       navigate("/products");
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Error al actualizar el producto.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Loading />
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded mt-6">
//      <h1 className="text-5xl text-center font-bold mb-4 mt-8 text-blue-500">Editar producto</h1>

//       {error && <p className="text-red-500 mb-2">{error}</p>}
//       {success && <p className="text-green-500 mb-2">{success}</p>}

//       <form onSubmit={handleSubmit} className="mt-8">
//         {[
//           { label: "Nombre", value: nombre, set: setNombre },
//           { label: "Cantidad", value: cantidad, set: setCantidad, type: "number" },
//           { label: "Precio", value: precio, set: setPrecio, type: "number" },
//           { label: "Lugar del producto", value: lugar, set: setLugar },
//           { label: "Proveedor", value: proveedor, set: setProveedor },
//           { label: "Código Proveedor", value: codigoProveedor, set: setCodigoProveedor },
//         ].map(({ label, value, set, type = "text" }, i) => (
//           <div key={i} className="mb-4">
//             <label className="block mb-1 font-semibold">{label}:</label>
//             <input
//               type={type}
//               value={value}
//               onChange={(e) => set(e.target.value)}
//               className="border p-2 rounded w-full border-blue-600"
//               required
//             />
//           </div>
//         ))}

//         {/* Descripción */}
//         <div className="mb-4">
//           <label className="block mb-1 font-semibold">Descripción (opcional):</label>
//           <textarea
//             value={descripcion}
//             onChange={(e) => setDescripcion(e.target.value)}
//             className="border p-2 rounded w-full border-blue-600"
//             rows={3}
//             required
//           />
//         </div>

//         {/* URL con https:// fijo */}
//         <div className="mb-4">
//           <label className="block mb-1 font-semibold">URL:</label>
//           <div className="flex">
//             <span className="inline-flex items-center px-3 rounded-l border border-r-0 bg-gray-100 border-blue-600 text-gray-600 text-sm">
//               https://
//             </span>
//             <input
//               type="text"
//               value={urlInput}
//               onChange={(e) => setUrlInput(e.target.value)}
//               placeholder="www.ejemplo.com"
//               className="border p-2 rounded-r w-full border-blue-600"
//               required
//             />
//           </div>
//         </div>

//         {/* Imagen */}
//         <label className="block mb-2 font-semibold">Foto (opcional):</label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
//           className="border p-2 rounded w-full mb-4 border-blue-600"
//         />

//         {(fotoFile || fotoActual) && (
//           <div className="mb-4">
//             <p className="text-gray-500 text-sm">Vista previa:</p>
//             <img
//               src={fotoFile ? URL.createObjectURL(fotoFile) : fotoActual}
//               alt="Preview"
//               className="h-32 w-auto object-cover rounded border"
//             />
//           </div>
//         )}

//         <div className="flex gap-3 justify-center mt-3">
//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
//           >
//             Cancelar
//           </button>
//           <button
//             type="submit"
//             disabled={saving}
//             className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-blue-600"
//           >
//             {saving ? "Guardando..." : "Guardar cambios"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default EditProduct;

import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../services/productServices";
import { LugaresDisponibles } from "../Constants";
import Loading from "../components/Loading";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 " +
  "placeholder-slate-400 outline-none transition focus:ring-4 disabled:opacity-60";

const fieldClass = (hasError, extra = "") =>
  `${inputBase} ${
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
  } ${extra}`;

const labelBase =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500";

const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

const AlertIcon = ({ className = "" }) => (
  <svg
    className={`h-3.5 w-3.5 shrink-0 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
    />
  </svg>
);

const Field = ({ label, hint, error, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className={labelBase}>{label}</span>
    {children}
    {error ? (
      <span
        role="alert"
        className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-red-600"
      >
        <AlertIcon className="mt-px" />
        {error}
      </span>
    ) : hint ? (
      <span className="mt-1 block text-xs text-slate-400">{hint}</span>
    ) : null}
  </label>
);

const stripHttps = (url = "") => url.replace(/^https?:\/\//i, "");

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [proveedor, setProveedor] = useState("");
  const [codigoProveedor, setCodigoProveedor] = useState("");
  const [lugarBase, setLugarBase] = useState("");
  const [posicion, setPosicion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [urlInput, setUrlInput] = useState("");

  const [foto, setFoto] = useState(null); // nueva foto (opcional)
  const [fotoActual, setFotoActual] = useState(""); // url ya guardada
  const [fotoPreview, setFotoPreview] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Vista previa de la foto nueva (si se elige una)
  useEffect(() => {
    if (!foto) {
      setFotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(foto);
    setFotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const lugarFinal =
    lugarBase && posicion.trim() ? `${lugarBase} ${posicion.trim()}` : "";

  const clearError = (key) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // Cargar producto al iniciar
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const product = await getProductById(id);
        if (!isMounted) return;

        setNombre(product?.nombre ?? product?.name ?? "");
        setCantidad(
          String(product?.cantidad ?? product?.quantity ?? product?.qty ?? "")
        );
        setPrecio(String(product?.precio ?? product?.price ?? ""));
        setProveedor(product?.proveedor ?? product?.supplier ?? "");
        setCodigoProveedor(
          product?.codigoProveedor ?? product?.supplier_code ?? ""
        );
        setDescripcion(product?.descripcion ?? product?.description ?? "");
        setUrlInput(stripHttps(product?.url ?? ""));
        setFotoActual(product?.foto ?? product?.image ?? "");

        const lugarGuardado = product?.lugar ?? product?.location ?? "";
        const match = LugaresDisponibles.find((l) =>
          lugarGuardado.startsWith(l)
        );
        if (match) {
          setLugarBase(match);
          setPosicion(lugarGuardado.slice(match.length).trim());
        } else if (lugarGuardado) {
          setLugarBase("");
          setPosicion(lugarGuardado);
        }
      } catch (err) {
        console.error(err);
        setFormError(err.message || "No se pudo cargar el producto.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const validateFields = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = "Escribe el nombre del producto.";
    if (cantidad === "" || isNaN(cantidad) || Number(cantidad) < 0)
      e.cantidad = "Indica una cantidad de 0 o más.";
    if (!String(precio).trim()) e.precio = "Indica el precio.";
    else if (isNaN(precio) || Number(precio) < 0) e.precio = "El precio no es válido.";
    if (!lugarBase.trim()) e.lugarBase = "Selecciona un lugar.";
    if (!posicion.trim()) e.posicion = "Indica la posición exacta.";
    if (!proveedor.trim()) e.proveedor = "Indica el proveedor.";
    if (!codigoProveedor.trim()) e.codigoProveedor = "Indica el código del proveedor.";
    if (!foto && !fotoActual) e.foto = "Añade una foto del producto.";
    if (urlInput && !/^\S+\.\S+/.test(urlInput))
      e.urlInput = "Usa el formato ejemplo.com, sin https://";
    return e;
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("No se ha podido subir la imagen. Inténtalo de nuevo.");
    const data = await res.json();
    return data.secure_url;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFoto(file);
      clearError("foto");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    const found = validateFields();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      requestAnimationFrame(() => {
        const el = document.querySelector('[aria-invalid="true"]');
        el?.focus();
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }

    setSaving(true);
    try {
      let fotoURL = fotoActual || "";
      if (foto) {
        fotoURL = await uploadToCloudinary(foto);
      }

      const updates = {
        nombre: nombre.trim(),
        cantidad: Number(cantidad),
        precio: Number(precio),
        lugar: lugarFinal,
        proveedor: proveedor.trim(),
        codigoProveedor: codigoProveedor.trim(),
        descripcion: descripcion.trim(),
        foto: fotoURL,
        url: urlInput ? `https://${urlInput.trim()}` : "",
      };

      await updateProduct(Number(id), updates);
      setSuccess("Producto actualizado.");

      const fromSearch = location.state?.fromSearch;
      if (fromSearch) {
        navigate(`/products${fromSearch}`, { replace: true });
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      setFormError(err.message || "No se ha podido actualizar el producto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-5xl text-center font-bold mb-8 mt-8 text-blue-500">
            Editar producto
          </h1>
        </header>

        {formError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
            {/* ── Columna izquierda: foto + resumen ── */}
            <aside className="lg:sticky lg:top-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className={labelBase}>Foto</span>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-invalid={!!errors.foto}
                  className={`group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition focus:outline-none focus:ring-4 ${
                    dragging
                      ? "border-blue-500 bg-blue-50 focus:ring-blue-500/20"
                      : errors.foto
                      ? "border-red-300 bg-red-50/40 focus:ring-red-500/20"
                      : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40 focus:ring-blue-500/20"
                  }`}
                >
                  {fotoPreview || fotoActual ? (
                    <img
                      src={fotoPreview || fotoActual}
                      alt="Vista previa del producto"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="px-6 text-center">
                      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5V18a3 3 0 003 3h12a3 3 0 003-3v-1.5M12 3v13.5m0-13.5L7.5 7.5M12 3l4.5 4.5"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Arrastra la foto aquí
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        o haz clic para buscarla en el equipo
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    setFoto(e.target.files[0] || null);
                    clearError("foto");
                  }}
                />

                {errors.foto && (
                  <p
                    role="alert"
                    className="mt-2 flex items-start gap-1.5 text-xs font-medium text-red-600"
                  >
                    <AlertIcon className="mt-px" />
                    {errors.foto}
                  </p>
                )}

                {foto && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="truncate text-xs text-slate-500">
                      {foto.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFoto(null)}
                      className="shrink-0 text-xs font-semibold text-slate-500 underline-offset-2 hover:text-red-600 hover:underline"
                    >
                      Quitar foto nueva
                    </button>
                  </div>
                )}
              </div>

              {/* Resumen en vivo */}
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className={labelBase}>Así se guardará</span>
                <p className="text-base font-semibold text-slate-900">
                  {nombre.trim() || (
                    <span className="font-normal text-slate-300">Sin nombre</span>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      lugarFinal
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {lugarFinal || "Ubicación pendiente"}
                  </span>
                  {cantidad !== "" && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {cantidad} uds.
                    </span>
                  )}
                  {precio !== "" && !isNaN(precio) && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {eur.format(Number(precio))}
                    </span>
                  )}
                </div>
              </div>
            </aside>

            {/* ── Columna derecha: datos ── */}
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-sm font-semibold text-slate-900">
                  Datos del producto
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nombre" error={errors.nombre} className="sm:col-span-2">
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value);
                        clearError("nombre");
                      }}
                      placeholder="Pusera Plata"
                      aria-invalid={!!errors.nombre}
                      className={fieldClass(errors.nombre)}
                    />
                  </Field>

                  <Field label="Cantidad" error={errors.cantidad}>
                    <input
                      type="number"
                      min="0"
                      value={cantidad}
                      onChange={(e) => {
                        setCantidad(e.target.value);
                        clearError("cantidad");
                      }}
                      placeholder="0"
                      aria-invalid={!!errors.cantidad}
                      className={fieldClass(errors.cantidad)}
                    />
                  </Field>

                  <Field label="Precio" error={errors.precio}>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={precio}
                        onChange={(e) => {
                          setPrecio(e.target.value);
                          clearError("precio");
                        }}
                        placeholder="0,00"
                        aria-invalid={!!errors.precio}
                        className={fieldClass(errors.precio, "pr-9")}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-slate-400">
                        €
                      </span>
                    </div>
                  </Field>

                  <Field label="Proveedor" error={errors.proveedor}>
                    <input
                      type="text"
                      value={proveedor}
                      onChange={(e) => {
                        setProveedor(e.target.value);
                        clearError("proveedor");
                      }}
                      placeholder="Pandora"
                      aria-invalid={!!errors.proveedor}
                      className={fieldClass(errors.proveedor)}
                    />
                  </Field>

                  <Field label="Código proveedor" error={errors.codigoProveedor}>
                    <input
                      type="text"
                      value={codigoProveedor}
                      onChange={(e) => {
                        setCodigoProveedor(e.target.value);
                        clearError("codigoProveedor");
                      }}
                      placeholder="ALE-925"
                      aria-invalid={!!errors.codigoProveedor}
                      className={fieldClass(errors.codigoProveedor)}
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-sm font-semibold text-slate-900">
                  Ubicación en el almacén
                </h2>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Lugar" error={errors.lugarBase}>
                    <select
                      value={lugarBase}
                      onChange={(e) => {
                        setLugarBase(e.target.value);
                        clearError("lugarBase");
                      }}
                      aria-invalid={!!errors.lugarBase}
                      className={fieldClass(
                        errors.lugarBase,
                        "appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10"
                      )}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%2394a3b8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                      }}
                    >
                      <option value="">Selecciona un lugar</option>
                      {LugaresDisponibles.map((lugar) => (
                        <option key={lugar} value={lugar}>
                          {lugar}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Posición exacta"
                    error={errors.posicion}
                    hint={
                      lugarBase
                        ? `Se guardará como "${lugarBase} ${posicion.trim() || "…"}"`
                        : "Selecciona antes un lugar."
                    }
                  >
                    <input
                      type="text"
                      value={posicion}
                      onChange={(e) => {
                        setPosicion(e.target.value);
                        clearError("posicion");
                      }}
                      disabled={!lugarBase}
                      placeholder="2C"
                      aria-invalid={!!errors.posicion}
                      className={fieldClass(
                        errors.posicion,
                        "uppercase disabled:cursor-not-allowed disabled:bg-slate-50"
                      )}
                    />
                  </Field>
                </div>
              </section>
            </div>

            {/* ── Ancho completo bajo las dos columnas ── */}
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-sm font-semibold text-slate-900">
                  Detalles adicionales
                </h2>

                <div className="space-y-5">
                  <Field label="Descripción" hint="Opcional.">
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      rows={4}
                      placeholder="Referencias compatibles, observaciones…"
                      className={fieldClass(false, "resize-y")}
                    />
                  </Field>

                  <Field label="Enlace" hint="Opcional." error={errors.urlInput}>
                    <div
                      className={`flex overflow-hidden rounded-xl border bg-white transition focus-within:ring-4 ${
                        errors.urlInput
                          ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500/10"
                          : "border-slate-200 focus-within:border-blue-500 focus-within:ring-blue-500/10"
                      }`}
                    >
                      <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-400">
                        https://
                      </span>
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value);
                          clearError("urlInput");
                        }}
                        placeholder="ejemplo.com/pieza"
                        aria-invalid={!!errors.urlInput}
                        className="w-full min-w-0 bg-transparent px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
                      />
                    </div>
                  </Field>
                </div>
              </section>

              {/* Acciones */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded-xl border border-slate-200 cursor-pointer bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 cursor-pointer px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;