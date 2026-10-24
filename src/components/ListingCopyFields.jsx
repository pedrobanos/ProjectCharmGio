import React, { useEffect, useState } from "react";
import { copyToClipboard, formatPrecioAnuncio } from "../utils/listingUtils";

const CopyRow = ({ label, value, multiline, copiedKey, setCopiedKey, fieldKey, editable, onEdit, inputMode }) => {
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
              : "bg-gray-800 text-white hover:bg-gray-700 cursor-pointer"
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
      {editable ? (
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => {
            onEdit(e.target.value);
            if (copiedKey === fieldKey) setCopiedKey(null); // al cambiarlo hay que volver a copiar
          }}
          placeholder="Escribe el precio"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-base text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      ) : (
        <div
          className={`w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 bg-gray-50 break-words ${
            multiline ? "whitespace-pre-wrap max-h-40 overflow-y-auto" : ""
          }`}
        >
          {isEmpty ? <span className="text-gray-400 italic">Sin datos</span> : value}
        </div>
      )}
      {copiedKey === `error-${fieldKey}` && (
        <p className="text-xs text-red-600 mt-1">
          No se pudo copiar. Mantén pulsado el texto para copiarlo a mano.
        </p>
      )}
    </div>
  );
};

// Título, descripción y precio con su botón de copiar
const ListingCopyFields = ({ product }) => {
  const [copiedKey, setCopiedKey] = useState(null);
  const [precio, setPrecio] = useState(() => formatPrecioAnuncio(product?.precio));

  // Al cambiar de producto, se reinicia el "Copiado" y el precio
  useEffect(() => {
    setCopiedKey(null);
    setPrecio(formatPrecioAnuncio(product?.precio));
  }, [product?.id, product?.precio]);

  if (!product) return null;
  const common = { copiedKey, setCopiedKey };

  return (
    <>
      <CopyRow label="Título" fieldKey="titulo" value={product.nombre?.trim() || ""} {...common} />
      <CopyRow
        label="Descripción"
        fieldKey="descripcion"
        value={product.descripcion?.trim() || ""}
        multiline
        {...common}
      />
      <CopyRow
        label="Precio (€) · editable"
        fieldKey="precio"
        value={precio}
        editable
        onEdit={setPrecio}
        inputMode="decimal"
        {...common}
      />
    </>
  );
};

export default ListingCopyFields;
