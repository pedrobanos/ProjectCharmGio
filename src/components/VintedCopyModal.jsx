import React, { useEffect, useState } from "react";

// Copia texto al portapapeles. Usa la API moderna y, si no está disponible
// (p. ej. abriendo la app por http en la red local), un textarea oculto.
const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // seguimos con el método alternativo
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.fontSize = "16px"; // evita el zoom automático en iOS
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

// Precio en formato español sin símbolo: 3 -> "3", 3.5 -> "3,5", 3.25 -> "3,25"
const formatPrecioVinted = (precio) => {
  const n = Number(precio);
  if (precio == null || isNaN(n)) return "";
  return n.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const CopyRow = ({ label, value, multiline, copiedKey, setCopiedKey, fieldKey }) => {
  const isCopied = copiedKey === fieldKey;
  const isEmpty = !value;

  const handleCopy = async () => {
    if (isEmpty) return;
    const ok = await copyToClipboard(value);
    setCopiedKey(ok ? fieldKey : `error-${fieldKey}`);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          disabled={isEmpty}
          className={`min-w-[110px] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isEmpty
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : isCopied
              ? "bg-green-600 text-white"
              : "bg-[#007782] text-white hover:bg-[#00646d] cursor-pointer"
          }`}
        >
          {isCopied ? (
            <>
              <i className="fa-solid fa-check mr-1"></i>Copiado
            </>
          ) : (
            <>
              <i className="fa-regular fa-copy mr-1"></i>Copiar
            </>
          )}
        </button>
      </div>
      <div
        className={`w-full border rounded-md px-3 py-2 text-sm text-gray-800 bg-gray-50 break-words ${
          multiline ? "whitespace-pre-wrap max-h-40 overflow-y-auto" : ""
        }`}
      >
        {isEmpty ? <span className="text-gray-400 italic">Sin datos</span> : value}
      </div>
      {copiedKey === `error-${fieldKey}` && (
        <p className="text-xs text-red-600 mt-1">
          No se pudo copiar. Mantén pulsado el texto para copiarlo a mano.
        </p>
      )}
    </div>
  );
};

const VintedCopyModal = ({ product, onClose }) => {
  const [copiedKey, setCopiedKey] = useState(null);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!product) return null;

  const titulo = product.nombre?.trim() || "";
  const descripcion = product.descripcion?.trim() || "";
  const precio = formatPrecioVinted(product.precio);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 normal-case"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-5 text-left max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          {product.foto && (
            <img
              src={product.foto}
              alt={`Foto de ${titulo}`}
              className="w-14 h-14 object-cover rounded-md border"
            />
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-800">Copiar para Vinted</h2>
            <p className="text-xs text-gray-500">
              Copia un campo, pégalo en Vinted y vuelve a por el siguiente.
            </p>
          </div>
        </div>

        <CopyRow
          label="Título"
          fieldKey="titulo"
          value={titulo}
          copiedKey={copiedKey}
          setCopiedKey={setCopiedKey}
        />
        <CopyRow
          label="Descripción"
          fieldKey="descripcion"
          value={descripcion}
          multiline
          copiedKey={copiedKey}
          setCopiedKey={setCopiedKey}
        />
        <CopyRow
          label="Precio (€)"
          fieldKey="precio"
          value={precio}
          copiedKey={copiedKey}
          setCopiedKey={setCopiedKey}
        />
      </div>
    </div>
  );
};

export default VintedCopyModal;
