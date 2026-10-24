import React, { useState } from "react";
import PlatformIcon from "./PlatformIcon";
import RowActionsMenu from "./RowActionsMenu";
import { copyToClipboard } from "../utils/listingUtils";
import { isBlocked, normalizePlatform } from "../services/listingsServices";

// Botón pequeño de copiar con confirmación visual
export const CopyMini = ({ value, title = "Copiar" }) => {
  const [ok, setOk] = useState(false);
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        if (await copyToClipboard(String(value))) {
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        }
      }}
      className={`w-7 h-7 inline-flex items-center justify-center rounded-md flex-shrink-0 ${
        ok ? "text-green-600 bg-green-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
      }`}
      title={ok ? "Copiado" : title}
    >
      <i className={ok ? "fa-solid fa-check" : "fa-regular fa-copy"}></i>
    </button>
  );
};

// Fila "icono · etiqueta · valor · copiar"
const Row = ({ icon, label, value, copy, secret, mono }) => {
  const [show, setShow] = useState(false);
  const empty = value === null || value === undefined || value === "";
  const shown = empty ? "—" : secret && !show ? "••••••••" : String(value);
  return (
    <div className="flex items-center gap-2 py-1 min-w-0">
      <i className={`${icon} w-4 text-center text-gray-400 flex-shrink-0`} aria-hidden="true"></i>
      <span className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</span>
      <span
        className={`text-sm flex-1 min-w-0 truncate ${empty ? "text-gray-300" : "text-gray-800"} ${
          mono ? "font-mono text-[13px]" : ""
        }`}
        title={empty || (secret && !show) ? undefined : String(value)}
      >
        {shown}
      </span>
      {secret && !empty && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
          title={show ? "Ocultar" : "Mostrar"}
        >
          <i className={show ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
        </button>
      )}
      {copy && !empty && <CopyMini value={value} />}
    </div>
  );
};

const Group = ({ icon, title, children }) => (
  <div className="pt-2">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5 flex items-center gap-1.5">
      <i className={icon}></i>
      {title}
    </p>
    {children}
  </div>
);

const formatFecha = (v) => {
  if (!v) return "";
  const s = String(v);
  const d = /^\d{4}-\d{2}-\d{2}/.test(s) ? new Date(s.slice(0, 10) + "T12:00:00") : null;
  return d && !isNaN(d) ? d.toLocaleDateString("es-ES") : s;
};

/**
 * Tarjeta de una cuenta de Vinted / Wallapop / …
 */
const AccountCard = ({ account, activeListings = 0, onEdit, onDelete, onToggleBlock }) => {
  const blocked = isBlocked(account);
  const platform = normalizePlatform(account.platform_app);
  const title = account.username || account.mail || account.phone_number || `Cuenta ${account.id}`;

  return (
    <article
      className={`bg-white rounded-2xl shadow-sm border flex flex-col min-w-0 ${
        blocked ? "border-red-200" : "border-gray-200"
      }`}
    >
      {/* Cabecera */}
      <div className="flex items-start gap-3 p-4 pb-3 border-b border-gray-100">
        {platform ? (
          <PlatformIcon platform={platform} size={40} className="rounded-xl" />
        ) : (
          <span className="w-10 h-10 rounded-xl bg-gray-200 text-gray-500 flex items-center justify-center">
            <i className="fa-solid fa-store"></i>
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate" title={title}>
            {title}
          </p>
          <p className="text-xs text-gray-500 truncate">{account.platform_app || "Sin plataforma"}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {blocked ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                <i className="fa-solid fa-ban"></i>
                Bloqueada {formatFecha(account.blocked_at) && `· ${formatFecha(account.blocked_at)}`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                <i className="fa-solid fa-circle-check"></i>
                Activa
              </span>
            )}
            {account.is_pro === true && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                <i className="fa-solid fa-crown"></i>
                PRO
              </span>
            )}
            {activeListings > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                <i className="fa-solid fa-bullhorn"></i>
                {activeListings} anuncio{activeListings === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
        <RowActionsMenu
          title="Acciones de la cuenta"
          items={[
            {
              key: "editar",
              label: "Editar",
              color: "#7e22ce",
              icon: <i className="fa-solid fa-pen-to-square"></i>,
              onClick: () => onEdit(account),
            },
            blocked
              ? {
                  key: "desbloquear",
                  label: "Desbloquear",
                  color: "#16a34a",
                  icon: <i className="fa-solid fa-lock-open"></i>,
                  onClick: () => onToggleBlock(account),
                }
              : {
                  key: "bloquear",
                  label: "Bloquear",
                  color: "#dc2626",
                  icon: <i className="fa-solid fa-ban"></i>,
                  onClick: () => onToggleBlock(account),
                },
            {
              key: "eliminar",
              label: "Eliminar",
              color: "#ef4444",
              danger: true,
              icon: <i className="fa-solid fa-trash"></i>,
              onClick: () => onDelete(account),
            },
          ]}
        />
      </div>

      {/* Datos */}
      <div className="px-4 pb-3 divide-y divide-gray-50">
        <Group icon="fa-solid fa-key" title="Acceso">
          <Row icon="fa-solid fa-envelope" label="Mail" value={account.mail} copy />
          <Row icon="fa-solid fa-at" label="Usuario" value={account.username} copy />
          <Row icon="fa-solid fa-lock" label="Password" value={account.password} copy secret />
        </Group>
        <Group icon="fa-solid fa-mobile-screen-button" title="Teléfono y SIM">
          <Row icon="fa-solid fa-phone" label="Teléfono" value={account.phone_number} copy />
          <Row icon="fa-solid fa-user" label="Asociado a" value={account.associated_number} />
          <Row icon="fa-solid fa-mobile-screen" label="Móvil" value={account.phone_brand} />
          <Row
            icon="fa-solid fa-sim-card"
            label="SIM"
            value={
              account.sim_brand
                ? `${account.sim_brand}${account.is_esim === true ? " · eSIM" : ""}`
                : account.is_esim === true
                ? "eSIM"
                : ""
            }
          />
          <Row icon="fa-solid fa-hashtag" label="PIN" value={account.pin} copy secret />
          <Row icon="fa-solid fa-unlock-keyhole" label="PUK" value={account.puk} copy secret />
        </Group>
        <Group icon="fa-solid fa-building-columns" title="Banco">
          <Row icon="fa-solid fa-landmark" label="Banco" value={account.bank_name} />
          <Row icon="fa-solid fa-credit-card" label="IBAN" value={account.iban} copy mono />
        </Group>
      </div>

      {/* Pie */}
      <div className="mt-auto flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
        <span className="text-xs text-gray-500 flex items-center gap-1.5">
          <i className="fa-regular fa-calendar"></i>
          {account.created_at ? `Creada ${formatFecha(account.created_at)}` : "Sin fecha de alta"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleBlock(account)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border ${
              blocked
                ? "border-green-200 text-green-700 bg-white hover:bg-green-50"
                : "border-red-200 text-red-700 bg-white hover:bg-red-50"
            }`}
          >
            <i className={blocked ? "fa-solid fa-lock-open" : "fa-solid fa-ban"}></i>
            {blocked ? "Desbloquear" : "Bloquear"}
          </button>
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-purple-700 text-white hover:bg-purple-800"
          >
            <i className="fa-solid fa-pen-to-square"></i>
            Editar
          </button>
        </div>
      </div>
    </article>
  );
};

export default AccountCard;
