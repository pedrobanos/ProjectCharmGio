import React, { useEffect, useState } from "react";
import {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../services/accountsServices";
import AccountsTable from "../components/AccountsTable";

import Loading from "../components/Loading";
import AddAccountModal from "../components/AccountModal";
import IpadAccountsPanel from "../components/IpadAccountsPanel";

const AccountsView = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllAccounts();
        setAccounts(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "No se pudieron cargar las cuentas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEditCell = async (id, field, value) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
    try {
      await updateAccount(id, { [field]: value });
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el cambio.");
      const data = await getAllAccounts();
      setAccounts(data);
    }
  };

  const handleCreate = async (nuevaCuenta) => {
    const creada = await createAccount(nuevaCuenta);
    setAccounts((prev) => [...prev, creada]);
  };

  const handleDelete = async (account) => {
    try {
      await deleteAccount(account.id);
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la cuenta.");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="w-full md:pl-14 mt-10 py-6 px-2">
      <h1 className="text-5xl text-center font-bold mb-4 mt-8 text-blue-500">Cuentas 🪪</h1>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          <i className="fa-solid fa-plus"></i> Añadir cuenta
        </button>
      </div>

    
      <AccountsTable
        accounts={accounts}
        onEditCell={handleEditCell}
        onDelete={handleDelete}
      />

      <AddAccountModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
      <IpadAccountsPanel />
    </div>
  );
};

export default AccountsView;