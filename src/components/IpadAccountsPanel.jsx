import React, { useEffect, useState } from "react";
import {
  getAllIpadAccounts,
  createIpadAccount,
  updateIpadAccount,
  deleteIpadAccount,
} from "../services/accountsServices";

// Campo que se edita directamente y se guarda al salir de él
const EditableCell = ({ value, onChange, placeholder, icon }) => {
  const [tempValue, setTempValue] = useState(value ?? "");

  useEffect(() => setTempValue(value ?? ""), [value]);

  const save = () => {
    if (tempValue !== (value ?? "")) onChange(tempValue === "" ? null : tempValue);
  };

  return (
    <div className="relative">
      {icon && (
        <i className={`${icon} absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs`}></i>
      )}
      <input
        type="text"
        className={`w-full rounded-lg border border-transparent bg-transparent py-1.5 pr-2 text-sm hover:border-gray-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
          icon ? "pl-7" : "pl-2"
        }`}
        value={tempValue}
        placeholder={placeholder}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          else if (e.key === "Escape") {
            setTempValue(value ?? "");
            e.currentTarget.blur();
          }
        }}
      />
    </div>
  );
};

const IpadAccountsPanel = () => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setRows(await getAllIpadAccounts());
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las multicuentas del iPad.");
      }
    })();
  }, []);

  const handleEdit = async (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    try {
      await updateIpadAccount(id, { [field]: value });
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el cambio.");
      setRows(await getAllIpadAccounts());
    }
  };

  const handleAdd = async () => {
    try {
      const nueva = await createIpadAccount({ profile_name: "", username: "" });
      setRows((prev) => [...prev, nueva]);
    } catch (err) {
      console.error(err);
      setError("No se pudo añadir el perfil.");
    }
  };

  const handleDelete = async () => {
    const row = toDelete;
    setToDelete(null);
    if (!row) return;
    try {
      await deleteIpadAccount(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el perfil.");
    }
  };

  return (
    <section className="mt-10 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 max-w-3xl min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-gray-800 text-white flex items-center justify-center">
            <i className="fa-solid fa-tablet-screen-button"></i>
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Multicuentas iPad</h2>
            <p className="text-xs text-gray-500">Perfiles abiertos en el iPad · toca un campo para editarlo</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800"
        >
          <i className="fa-solid fa-plus"></i> Añadir perfil
        </button>
      </div>

      {error && (
        <p className="text-red-600 mb-3 text-sm flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </p>
      )}

      <div className="w-full overflow-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-2.5 text-left">
                <i className="fa-solid fa-id-badge mr-1.5 text-gray-400"></i>Perfil
              </th>
              <th className="px-3 py-2.5 text-left">
                <i className="fa-solid fa-at mr-1.5 text-gray-400"></i>Usuario
              </th>
              <th className="px-3 py-2.5 text-center w-20">
                <i className="fa-solid fa-gear text-gray-400"></i>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-3 py-1">
                  <EditableCell
                    value={row.profile_name}
                    placeholder="Nombre del perfil"
                    icon="fa-solid fa-id-badge"
                    onChange={(val) => handleEdit(row.id, "profile_name", val)}
                  />
                </td>
                <td className="px-3 py-1">
                  <EditableCell
                    value={row.username}
                    placeholder="Usuario"
                    icon="fa-solid fa-at"
                    onChange={(val) => handleEdit(row.id, "username", val)}
                  />
                </td>
                <td className="px-3 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => setToDelete(row)}
                    className="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50"
                    title="Eliminar perfil"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-gray-400 text-center">
                  <i className="fa-solid fa-tablet-screen-button mr-2"></i>
                  No hay perfiles todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="absolute inset-0" onClick={() => setToDelete(null)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
              ¿Seguro que quieres eliminar este perfil?
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Se eliminará{" "}
              <span className="font-semibold text-gray-700">
                {toDelete.profile_name || toDelete.username || "este perfil"}
              </span>{" "}
              de forma permanente.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <i className="fa-solid fa-xmark"></i>
                Cancelar
              </button>
              <button
                type="button"
                autoFocus
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 flex items-center gap-2"
              >
                <i className="fa-solid fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default IpadAccountsPanel;