import React, { useState, useEffect } from "react";
import PlatformIcon from "./PlatformIcon";
import { isBlocked, normalizePlatform } from "../services/listingsServices";

const COLUMNS = [
  { key: "mail", icon: "fa-solid fa-envelope", label: "Mail", minW: 220 },
  { key: "username", icon: "fa-solid fa-at", label: "Usuario", minW: 160 },
  { key: "password", icon: "fa-solid fa-lock", label: "Password", type: "password", minW: 170 },
  { key: "phone_number", icon: "fa-solid fa-phone", label: "Teléfono", minW: 130 },
  { key: "associated_number", icon: "fa-solid fa-user", label: "Asociado a", minW: 200 },
  { key: "pin", icon: "fa-solid fa-hashtag", label: "PIN", minW: 90 },
  { key: "puk", icon: "fa-solid fa-unlock-keyhole", label: "PUK", minW: 110 },
  { key: "phone_brand", icon: "fa-solid fa-mobile-screen", label: "Móvil", minW: 200 },
  { key: "sim_brand", icon: "fa-solid fa-sim-card", label: "SIM", minW: 110 },
  { key: "is_esim", icon: "fa-solid fa-microchip", label: "eSIM", type: "boolean", minW: 90 },
  { key: "is_pro", icon: "fa-solid fa-crown", label: "PRO", type: "boolean", pro: true, minW: 90 },
  { key: "platform_app", icon: "fa-solid fa-shop", label: "Plataforma", minW: 130 },
  { key: "created_at", icon: "fa-solid fa-calendar-plus", label: "Creada", type: "date", minW: 150 },
  { key: "blocked_at", icon: "fa-solid fa-ban", label: "Bloqueada", minW: 130 },
  { key: "bank_name", icon: "fa-solid fa-landmark", label: "Banco", minW: 150 },
  { key: "iban", icon: "fa-solid fa-credit-card", label: "IBAN", minW: 220 },
];

const ACTIONS_W = 124;

/* Nombre con el que se identifica una cuenta en los mensajes */
export const nombreCuenta = (account) =>
  account?.mail || account?.username || account?.phone_number || "esta cuenta (sin datos)";

/* ─────────────── Modal de confirmación ─────────────── */
export const ConfirmDeleteModal = ({ account, onCancel, onConfirm }) => {
  useEffect(() => {
    if (!account) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [account, onCancel]);

  if (!account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="absolute inset-0" onClick={onCancel} />

      <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          ¿Seguro que quieres eliminar esta cuenta?
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Se eliminará{" "}
          <span className="font-semibold text-gray-700 break-all">{nombreCuenta(account)}</span> de
          forma permanente. Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-xmark"></i>
            Cancelar
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-trash"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── Celda editable ─────────────── */
const EditableCell = ({ value, type, onChange, pro }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value ?? "");
  const [revealed, setRevealed] = useState(false);

  const startEdit = () => {
    setTempValue(value ?? "");
    setIsEditing(true);
  };

  const save = (newValue = tempValue) => {
    setIsEditing(false);
    if (newValue !== (value ?? "")) onChange(newValue === "" ? null : newValue);
  };

  const cancel = () => setIsEditing(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    else if (e.key === "Escape") cancel();
  };

  if (type === "password") {
    return isEditing ? (
      <div className="flex items-center gap-1">
        <input
          type={revealed ? "text" : "password"}
          autoFocus
          className="border rounded px-2 py-1.5 text-sm w-full"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => save()}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setRevealed((r) => !r)}
          className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
        >
          <i className={revealed ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-1 justify-center">
        <span onDoubleClick={startEdit} className="cursor-pointer truncate">
          {value ? (revealed ? value : "••••••••") : "—"}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer"
            title={revealed ? "Ocultar" : "Mostrar"}
          >
            <i className={revealed ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
          </button>
        )}
      </div>
    );
  }

  if (type === "boolean") {
    return isEditing ? (
      <select
        autoFocus
        className="border rounded px-1 py-1.5 text-sm w-full"
        value={value === true ? "yes" : value === false ? "no" : ""}
        onChange={(e) =>
          save(e.target.value === "yes" ? true : e.target.value === "no" ? false : null)
        }
        onBlur={cancel}
      >
        <option value="">—</option>
        <option value="yes">Sí</option>
        <option value="no">No</option>
      </select>
    ) : (
      <span onDoubleClick={startEdit} className="cursor-pointer block py-1">
        {pro && value === true ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            <i className="fa-solid fa-crown"></i> PRO
          </span>
        ) : value === true ? (
          "Sí"
        ) : value === false ? (
          "No"
        ) : (
          "—"
        )}
      </span>
    );
  }

  if (type === "date") {
    return isEditing ? (
      <input
        type="date"
        autoFocus
        className="border rounded px-2 py-1.5 text-sm w-full"
        value={value ? String(value).slice(0, 10) : ""}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={() => save()}
        onKeyDown={handleKeyDown}
      />
    ) : (
      <span onDoubleClick={startEdit} className="cursor-pointer block py-1">
        {value ? String(value).slice(0, 10) : "—"}
      </span>
    );
  }

  return isEditing ? (
    <input
      type="text"
      autoFocus
      className="border rounded px-2 py-1.5 text-sm w-full"
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={() => save()}
      onKeyDown={handleKeyDown}
    />
  ) : (
    <span
      onDoubleClick={startEdit}
      className="cursor-pointer block py-1 truncate"
      title={value || ""}
    >
      {value || "—"}
    </span>
  );
};

/* ─────────────── Tabla ─────────────── */
const AccountsTable = ({ accounts, onEditCell, onDelete, onEdit, onToggleBlock }) => {
  const [accountToDelete, setAccountToDelete] = useState(null);

  const confirmDelete = () => {
    const account = accountToDelete;
    setAccountToDelete(null);
    if (account) onDelete(account);
  };

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
        <i className="fa-solid fa-hand-pointer"></i>
        Doble clic en una celda para editarla. Las acciones están en la primera columna.
      </p>
      <div className="w-full overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm max-h-[75vh]">
        <table className="border-collapse text-sm" style={{ minWidth: "100%" }}>
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th
                className="sticky left-0 top-0 z-30 bg-gray-100 px-2 py-3 text-center border-r border-gray-200"
                style={{ width: ACTIONS_W, minWidth: ACTIONS_W }}
              >
                Acciones
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="sticky top-0 z-10 bg-gray-100 px-3 py-3 text-center whitespace-nowrap"
                  style={{ minWidth: col.minW }}
                >
                  <i className={`${col.icon} mr-1.5 text-gray-400`}></i>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {accounts.map((account) => (
              <tr key={account.id} className={`hover:bg-gray-50 ${isBlocked(account) ? "bg-red-50/40" : ""}`}>
                <td
                  className="sticky left-0 z-20 bg-white text-center border-r border-gray-200"
                  style={{ width: ACTIONS_W, minWidth: ACTIONS_W }}
                >
                  <div className="flex items-center justify-center gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(account)}
                        className="w-8 h-8 rounded-lg text-purple-700 hover:bg-purple-50"
                        title="Editar cuenta"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    )}
                    {onToggleBlock && (
                      <button
                        type="button"
                        onClick={() => onToggleBlock(account)}
                        className={`w-8 h-8 rounded-lg ${
                          isBlocked(account)
                            ? "text-green-600 hover:bg-green-50"
                            : "text-orange-600 hover:bg-orange-50"
                        }`}
                        title={isBlocked(account) ? "Desbloquear cuenta" : "Bloquear cuenta y quitar sus anuncios"}
                      >
                        <i className={isBlocked(account) ? "fa-solid fa-lock-open" : "fa-solid fa-ban"}></i>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAccountToDelete(account)}
                      className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50"
                      title="Eliminar cuenta"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className="px-3 py-1" style={{ minWidth: col.minW }}>
                    {col.key === "platform_app" && normalizePlatform(account.platform_app) ? (
                      <div className="flex items-center gap-1.5">
                        <PlatformIcon platform={account.platform_app} size={16} />
                        <EditableCell
                          value={account[col.key]}
                          type={col.type}
                          onChange={(val) => onEditCell(account.id, col.key, val)}
                        />
                      </div>
                    ) : (
                    <EditableCell
                      value={account[col.key]}
                      type={col.type}
                      pro={col.pro}
                      onChange={(val) => onEditCell(account.id, col.key, val)}
                    />
                    )}
                  </td>
                ))}


              </tr>
            ))}

            {accounts.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length + 1}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  No hay cuentas todavía. Añade la primera con el botón "Añadir cuenta".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        account={accountToDelete}
        onCancel={() => setAccountToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AccountsTable;