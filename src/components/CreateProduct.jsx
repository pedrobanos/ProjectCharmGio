import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../services/productServices";
import { LugaresDisponibles } from "../Constants";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

/* Base sin color de borde: lo decide fieldClass según haya error o no.
   Si dejas border-slate-200 y border-red-300 en la misma cadena, gana el
   orden del CSS de Tailwind, no el de la cadena, y el error no se ve. */
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

/* Etiqueta + campo + mensaje. El error sustituye a la pista, así la altura
   apenas cambia y el formulario no da saltos al validar. */
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

const VALORES_INICIALES = {
    cantidad: "0",
    precio: "3.00",
    proveedor: "Pandora",
    codigoProveedor: "PAN-0001", // cámbialo por el que use el cliente

};

const CreateProduct = () => {
    const [nombre, setNombre] = useState("");
    const [cantidad, setCantidad] = useState(VALORES_INICIALES.cantidad);
    const [precio, setPrecio] = useState(VALORES_INICIALES.precio);
    const [proveedor, setProveedor] = useState(VALORES_INICIALES.proveedor);
    const [codigoProveedor, setCodigoProveedor] = useState(VALORES_INICIALES.codigoProveedor);
    const [lugarBase, setLugarBase] = useState("");
    const [posicion, setPosicion] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [urlInput, setUrlInput] = useState("");
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [dragging, setDragging] = useState(false);

    const [errors, setErrors] = useState({}); // errores por campo
    const [formError, setFormError] = useState(""); // fallos de red o del servidor
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    /* Vista previa sin fugas de memoria: se libera al cambiar o desmontar. */
    useEffect(() => {
        if (!foto) {
            setFotoPreview(null);
            return;
        }
        const url = URL.createObjectURL(foto);
        setFotoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [foto]);

    const lugarFinal = lugarBase && posicion.trim() ? `${lugarBase} ${posicion.trim()}` : "";

    /* Al escribir se limpia el error de ese campo, no el de los demás. */
    const clearError = (key) =>
        setErrors((prev) => {
            if (!prev[key]) return prev;
            const next = { ...prev };
            delete next[key];
            return next;
        });

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
        if (!foto) e.foto = "Añade una foto del producto.";
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
            // Lleva el foco al primer campo con error.
            requestAnimationFrame(() => {
                const el = document.querySelector('[aria-invalid="true"]');
                el?.focus();
                el?.scrollIntoView({ block: "center", behavior: "smooth" });
            });
            return;
        }

        setLoading(true);
        try {
            const fotoURL = foto ? await uploadToCloudinary(foto) : "";

            await createProduct({
                nombre: nombre.trim(),
                cantidad: Number(cantidad),
                precio: Number(precio),
                lugar: lugarFinal,
                proveedor: proveedor.trim(),
                codigoProveedor: codigoProveedor.trim(),
                descripcion: descripcion.trim(),
                foto: fotoURL || "",
                url: urlInput ? `https://${urlInput.trim()}` : "",
            });

            setSuccess("Producto creado.");
            navigate("/products");
        } catch (err) {
            console.error(err);
            setFormError(err.message || "No se ha podido crear el producto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="mx-auto max-w-5xl">
                {/* Cabecera */}
                <header className="mb-8">
                      <h1 className="text-5xl text-center font-bold mb-8 mt-8 text-blue-500">
                         Crear producto
                     </h1>
               </header>

                {/* Solo fallos generales: los de campo van bajo cada input */}
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
                                    {fotoPreview ? (
                                        <img
                                            src={fotoPreview}
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

                                {/* Error de la foto, justo debajo de su zona */}
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
                                            Quitar foto
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Resumen en vivo */}
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <span className={labelBase}>Así se guardará</span>
                                <p className="text-base font-semibold text-slate-900">
                                    {nombre.trim() || (
                                        <span className="font-normal text-slate-300">
                                            Sin nombre
                                        </span>
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
                                    <Field
                                        label="Nombre"
                                        error={errors.nombre}
                                        className="sm:col-span-2"
                                    >
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
                                                ? `Se guardará como "${lugarBase} ${
                                                      posicion.trim() || "…"
                                                  }"`
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
            onClick={() => navigate("/products")}
            className="rounded-xl border border-slate-200 cursor-pointer bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
            Cancelar
        </button>
        <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 cursor-pointer px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {loading ? "Creando…" : "Crear producto"}
        </button>
    </div>
</div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;

  