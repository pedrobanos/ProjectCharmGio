import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../services/accountsServices";
import {
  getActiveListings,
  isBlocked,
  normalizePlatform,
  retireListingsByAccount,
} from "../services/listingsServices";
import AccountsTable, { ConfirmDeleteModal, nombreCuenta } from "../components/AccountsTable";
import AccountCard from "../components/AccountCard";
import Loading from "../components/Loading";
import AccountModal from "../components/AccountModal";
import IpadAccountsPanel from "../components/IpadAccountsPanel";
import PageHeader from "../components/PageHeader";
import PlatformIcon from "../components/PlatformIcon";
import { diaMadridYYYYMMDD, normalizeString } from "../Constants";

const VIEW_KEY = "cuentas_vista";

const FILTERS = [
  { key: "todas", label: "Todas", icon: <i className="fa-solid fa-layer-group"></i> },
  { key: "Vinted", label: "Vinted", icon: <PlatformIcon platform="Vinted" size={16} /> },
  { key: "Wallapop", label: "Wallapop", icon: <PlatformIcon platform="Wallapop" size={16} /> },
  { key: "pro", label: "PRO", icon: <i className="fa-solid fa-crown text-amber-500"></i> },
  { key: "activas", label: "Activas", icon: <i className="fa-solid fa-circle-check text-green-600"></i> },
  { key: "bloqueadas", label: "Bloqueadas", icon: <i className="fa-solid fa-ban text-red-600"></i> },
];

/* ─────────────── Confirmar bloqueo / desbloqueo ─────────────── */
const ConfirmBlockModal = ({ account, listings, onCancel, onConfirm, working }) => {
  if (!account) return null;
  const blocked = isBlocked(account);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="absolute inset-0" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            blocked ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          <i className={`fa-solid ${blocked ? "fa-lock-open" : "fa-ban"} text-xl`}></i>
        </div>
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          {blocked ? "¿Desbloquear esta cuenta?" : "¿Bloquear esta cuenta?"}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          <span className="font-semibold text-gray-700 break-all">{nombreCuenta(account)}</span>
          {blocked ? (
            " volverá a estar activa y podrás publicar anuncios en ella."
          ) : listings > 0 ? (
            <>
              {" "}
              quedará bloqueada y se quitarán automáticamente sus{" "}
              <strong className="text-red-600">{listings} anuncio(s) activo(s)</strong> de la app.
            </>
          ) : (
            " quedará bloqueada. No tiene anuncios activos."
          )}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
          >
            <i className="fa-solid fa-xmark"></i>
            Cancelar
          </button>
          <button
            type="button"
            autoFocus
            disabled={working}
            onClick={onConfirm}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60 ${
              blocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <i
              className={
                working ? "fa-solid fa-spinner fa-spin" : blocked ? "fa-solid fa-lock-open" : "fa-solid fa-ban"
              }
            ></i>
            {blocked ? "Desbloquear" : "Bloquear"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountsView = () => {
  const [accounts, setAccounts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [toBlock, setToBlock] = useState(null);
  const [working, setWorking] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todas");
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) || "tarjetas";
    } catch {
      return "tarjetas";
    }
  });

  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      // sin localStorage
    }
  };

  const loadListings = useCallback(async () => {
    try {
      setListings(await getActiveListings());
    } catch {
      setListings([]); // sin tabla de anuncios todavía
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setAccounts(await getAllAccounts());
        await loadListings();
      } catch (err) {
        console.error(err);
        setError(err.message || "No se pudieron cargar las cuentas.");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadListings]);

  // Aviso que desaparece solo
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const listingsByAccount = useMemo(() => {
    const m = {};
    for (const l of listings) m[String(l.account_id)] = (m[String(l.account_id)] || 0) + 1;
    return m;
  }, [listings]);

  const stats = useMemo(() => {
    const s = { total: accounts.length, Vinted: 0, Wallapop: 0, bloqueadas: 0, pro: 0 };
    for (const a of accounts) {
      if (a.is_pro === true) s.pro += 1;
      const p = normalizePlatform(a.platform_app);
      if (p) s[p] += 1;
      if (isBlocked(a)) s.bloqueadas += 1;
    }
    s.activas = s.total - s.bloqueadas;
    return s;
  }, [accounts]);

  const filtered = useMemo(() => {
    const terms = normalizeString(search).split(/\s+/).filter(Boolean);
    return accounts.filter((a) => {
      if (filter === "activas" && isBlocked(a)) return false;
      if (filter === "bloqueadas" && !isBlocked(a)) return false;
      if (filter === "pro" && a.is_pro !== true) return false;
      if ((filter === "Vinted" || filter === "Wallapop") && normalizePlatform(a.platform_app) !== filter)
        return false;
      if (!terms.length) return true;
      const hay = normalizeString(
        Object.entries(a)
          .filter(([k]) => k !== "password")
          .map(([, v]) => (v == null ? "" : String(v)))
          .join(" ")
      );
      return terms.every((t) => hay.includes(t));
    });
  }, [accounts, search, filter]);

  /* ── Acciones ── */

  const handleEditCell = async (id, field, value) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
    try {
      await updateAccount(id, { [field]: value });
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el cambio.");
      setAccounts(await getAllAccounts());
    }
  };

  const handleCreate = async (nuevaCuenta) => {
    const creada = await createAccount(nuevaCuenta);
    setAccounts((prev) => [...prev, creada]);
    setNotice("Cuenta añadida.");
  };

  const handleSaveEdit = async (cambios) => {
    const actualizada = await updateAccount(editing.id, cambios);
    setAccounts((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...actualizada } : a)));
    setNotice("Cambios guardados.");
  };

  const handleDelete = async (account) => {
    try {
      await deleteAccount(account.id);
      setAccounts((prev) => prev.filter((a) => a.id !== account.id));
      setNotice("Cuenta eliminada.");
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la cuenta.");
    }
  };

  // Bloquear: guarda la fecha y quita sus anuncios activos. Desbloquear: borra la fecha.
  const handleToggleBlock = async () => {
    const account = toBlock;
    if (!account) return;
    setWorking(true);
    setError("");
    try {
      if (isBlocked(account)) {
        const upd = await updateAccount(account.id, { blocked_at: null });
        setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, ...upd, blocked_at: null } : a)));
        setNotice(`${nombreCuenta(account)} desbloqueada.`);
      } else {
        const fecha = diaMadridYYYYMMDD();
        const upd = await updateAccount(account.id, { blocked_at: fecha });
        setAccounts((prev) => prev.map((a) => (a.id === account.id ? { ...a, ...upd, blocked_at: fecha } : a)));
        let retirados = 0;
        try {
          retirados = await retireListingsByAccount(account.id);
        } catch (err) {
          console.warn("No se pudieron retirar los anuncios:", err?.message || err);
        }
        await loadListings();
        setNotice(
          `${nombreCuenta(account)} bloqueada${
            retirados ? ` y ${retirados} anuncio(s) retirado(s)` : ""
          }.`
        );
      }
      setToBlock(null);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la cuenta.");
    } finally {
      setWorking(false);
    }
  };

  if (loading) return <Loading />;

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 pb-10">
      <PageHeader
        icon="fa-solid fa-address-card"
        tone="purple"
        title="Cuentas"
        subtitle={`${stats.total} cuentas · ${stats.activas} activas · ${stats.bloqueadas} bloqueadas`}
        actions={
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 text-sm font-semibold bg-purple-700 text-white px-4 py-2.5 rounded-xl hover:bg-purple-800 shadow-sm"
          >
            <i className="fa-solid fa-user-plus"></i> Añadir cuenta
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation"></i>
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800 flex items-center gap-2">
          <i className="fa-solid fa-circle-check"></i>
          {notice}
        </div>
      )}

      {/* Barra de búsqueda, filtros y vista */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 mb-5 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por mail, usuario, teléfono, banco…"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-base sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count =
              f.key === "todas"
                ? stats.total
                : f.key === "activas"
                ? stats.activas
                : f.key === "bloqueadas"
                ? stats.bloqueadas
                : f.key === "pro"
                ? stats.pro
                : stats[f.key];
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition ${
                  active
                    ? "bg-purple-700 text-white border-purple-700"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.icon}
                {f.label}
                <span
                  className={`text-xs rounded-full px-1.5 ${
                    active ? "bg-white/20" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden self-start lg:self-auto">
          {[
            ["tarjetas", "fa-solid fa-grip", "Tarjetas"],
            ["tabla", "fa-solid fa-table", "Tabla"],
          ].map(([v, icon, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => changeView(v)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm ${
                view === v ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title={`Ver en ${label.toLowerCase()}`}
            >
              <i className={icon}></i>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Listado */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          <i className="fa-solid fa-user-slash text-3xl text-gray-300 mb-3"></i>
          <p>
            {accounts.length === 0
              ? 'No hay cuentas todavía. Añade la primera con "Añadir cuenta".'
              : "No hay cuentas que coincidan con la búsqueda o el filtro."}
          </p>
        </div>
      ) : view === "tabla" ? (
        <AccountsTable
          accounts={filtered}
          onEditCell={handleEditCell}
          onDelete={handleDelete}
          onEdit={(a) => {
            setEditing(a);
            setModalOpen(true);
          }}
          onToggleBlock={setToBlock}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              activeListings={listingsByAccount[String(a.id)] || 0}
              onEdit={(acc) => {
                setEditing(acc);
                setModalOpen(true);
              }}
              onDelete={setToDelete}
              onToggleBlock={setToBlock}
            />
          ))}
        </div>
      )}

      <AccountModal
        isOpen={modalOpen}
        account={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onCreate={handleCreate}
        onSave={handleSaveEdit}
      />

      <ConfirmDeleteModal
        account={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          const a = toDelete;
          setToDelete(null);
          if (a) handleDelete(a);
        }}
      />

      <ConfirmBlockModal
        account={toBlock}
        listings={toBlock ? listingsByAccount[String(toBlock.id)] || 0 : 0}
        working={working}
        onCancel={() => setToBlock(null)}
        onConfirm={handleToggleBlock}
      />

      <IpadAccountsPanel />
    </div>
  );
};

export default AccountsView;
