import React, { useEffect, useMemo, useState } from "react";
import ListingCopyFields from "./ListingCopyFields";
import PlatformIcon, { AccountBadge } from "./PlatformIcon";
import { PLATFORM_STYLES } from "../utils/listingUtils";
import {
  accountLabel,
  createListing,
  updateListingStatus,
} from "../services/listingsServices";

const formatFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" })
    : "";

/**
 * Ventana "Copiar para anuncio" (Vinted / Wallapop)
 * - Muestra dónde está publicado el producto
 * - Copia título, descripción y precio
 * - Marca el producto como publicado en una cuenta
 */
const VintedCopyModal = ({ product, accounts = [], activeListings = [], onClose, onChanged }) => {
  const [accountId, setAccountId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Cuentas donde todavía no está publicado
  const availableAccounts = useMemo(() => {
    const used = new Set(activeListings.map((l) => String(l.account_id)));
    return accounts.filter((a) => !used.has(String(a.id)));
  }, [accounts, activeListings]);

  const selectedAccount = availableAccounts.find((a) => String(a.id) === String(accountId));
  const stock = Number(product?.cantidad ?? 0);
  const overListed = activeListings.length >= stock;

  if (!product) return null;

  const handlePublish = async () => {
    if (!selectedAccount) return;
    setSaving(true);
    setError("");
    try {
      await createListing(product.id, selectedAccount.id);
      setAccountId("");
      await onChanged?.();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleRetire = async (listing) => {
    if (!window.confirm(`¿Marcar como retirado el anuncio de ${accountLabel(listing.account)}?`)) return;
    setSaving(true);
    setError("");
    try {
      await updateListingStatus(listing.id, "retirado");
      await onChanged?.();
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const publishColor = PLATFORM_STYLES[selectedAccount?.platform]?.bg || "#9ca3af";

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

        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-4 pr-8">
          {product.foto && (
            <img
              src={product.foto}
              alt={`Foto de ${product.nombre}`}
              className="w-14 h-14 object-cover rounded-md border border-gray-200"
            />
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
              Copiar para anuncio
              <PlatformIcon platform="Vinted" size={18} />
              <PlatformIcon platform="Wallapop" size={18} />
            </h2>
            <p className="text-xs text-gray-500">Stock: {stock}</p>
          </div>
        </div>

        {/* Dónde está publicado */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Publicado en</p>
          {activeListings.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Todavía en ninguna cuenta</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {activeListings.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2">
                  <AccountBadge account={l.account}>
                    <span className="opacity-70 font-normal">· {formatFecha(l.publicado_at)}</span>
                  </AccountBadge>
                  <button
                    type="button"
                    onClick={() => handleRetire(l)}
                    disabled={saving}
                    className="text-xs text-red-600 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Retirar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Anuncios activos: <strong>{activeListings.length}</strong> de <strong>{stock}</strong>{" "}
            (uno por unidad en stock)
          </p>
        </div>

        {/* Campos a copiar */}
        <ListingCopyFields product={product} />

        {/* Marcar como publicado */}
        <div className="border-t border-gray-200 pt-4 mt-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            ¿En qué cuenta lo has subido?
          </label>
          {overListed ? (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {stock <= 0
                ? "⚠️ No queda stock de este producto, no se puede anunciar."
                : `⚠️ Ya está anunciado en ${activeListings.length} cuenta(s) y solo tienes ${stock} unidad(es). Retira un anuncio o añade stock para publicarlo en otra cuenta.`}
            </p>
          ) : availableAccounts.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              {accounts.length === 0
                ? "No hay cuentas de Vinted o Wallapop activas en Cuentas."
                : "Ya está publicado en todas tus cuentas."}
            </p>
          ) : (
            <>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full mb-3 text-base"
              >
                <option value="">Elegir cuenta...</option>
                {availableAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.platform} · {accountLabel(a)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handlePublish}
                disabled={!selectedAccount || saving}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white font-medium disabled:opacity-50 cursor-pointer"
                style={{ backgroundColor: publishColor }}
              >
                {selectedAccount && <PlatformIcon platform={selectedAccount.platform} size={18} />}
                {saving
                  ? "Guardando..."
                  : selectedAccount
                  ? `Marcar publicado en ${accountLabel(selectedAccount)}`
                  : "Marcar publicado"}
              </button>
            </>
          )}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default VintedCopyModal;
