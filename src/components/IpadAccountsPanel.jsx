import React, { useEffect, useState } from "react";
import {
  getAllIpadAccounts,
  createIpadAccount,
  updateIpadAccount,
  deleteIpadAccount,
} from "../services/accountsServices";

const EditableCell = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value ?? "");

  const startEdit = () => {
    setTempValue(value ?? "");
    setIsEditing(true);
  };

  const save = () => {
    setIsEditing(false);
    if (tempValue !== (value ?? "")) onChange(tempValue === "" ? null : tempValue);
  };

  return isEditing ? (
    <input
      type="text"
      autoFocus
      className="border rounded px-2 py-1.5 text-sm w-full"
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        else if (e.key === "Escape") setIsEditing(false);
      }}
    />
  ) : (
    <span onDoubleClick={startEdit} className="cursor-pointer block py-1">
      {value || "—"}
    </span>
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
    <div className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-gray-800">
          <i className="fa-solid fa-tablet-screen-button mr-2 text-gray-400"></i>
          Multicuentas iPad
        </h2>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <i className="fa-solid fa-plus"></i> Añadir perfil
        </button>
      </div>

      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

      <div className="w-full overflow-auto rounded-xl border border-gray-200 shadow-sm max-w-2xl">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-3 py-3 text-center">Perfil</th>
              <th className="px-3 py-3 text-center">Usuario</th>
              <th className="px-3 py-3 text-center w-24">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800 text-center">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-3 py-1">
                  <EditableCell
                    value={row.profile_name}
                    onChange={(val) => handleEdit(row.id, "profile_name", val)}
                  />
                </td>
                <td className="px-3 py-1">
                  <EditableCell
                    value={row.username}
                    onChange={(val) => handleEdit(row.id, "username", val)}
                  />
                </td>
                <td className="px-3 py-1">
                  <button
                    type="button"
                    onClick={() => setToDelete(row)}
                    className="text-red-500 hover:text-red-600 cursor-pointer"
                    title="Eliminar perfil"
                  >
                    <i className="fa-solid fa-trash text-lg"></i>
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-gray-400">
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
                className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                autoFocus
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IpadAccountsPanel;