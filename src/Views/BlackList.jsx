import PageHeader from "../components/PageHeader";
import React, { useState, useEffect } from "react";
import {
    getBlacklist,
    addClienteToBlacklistPorNombre,
    removeClienteFromBlacklist,
} from "../services/clientServices";

const BlackList = () => {
    const [blacklist, setBlacklist] = useState([]);
    const [newCliente, setNewCliente] = useState("");
    const [clienteAEliminar, setClienteAEliminar] = useState(null); // ✅ Guardar el cliente a eliminar
    const [mostrarModal, setMostrarModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Cargar datos al montar
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getBlacklist();
            setBlacklist(data);
        } catch (err) {
            console.error("Error cargando blacklist:", err);
        }
        finally {
            setLoading(false);
        }
    };

    const addCliente = async () => {
        const nombre = newCliente.trim();
        if (!nombre) return;
        try {
            await addClienteToBlacklistPorNombre(nombre);
            setNewCliente("");
            fetchData();
        } catch (err) {
            console.error("Error añadiendo cliente:", err);
        }
    };

    const confirmarEliminar = (cliente) => {
        setClienteAEliminar(cliente);
        setMostrarModal(true);
    };

    const handleEliminar = async () => {
        if (!clienteAEliminar) return;
        try {
            await removeClienteFromBlacklist(clienteAEliminar.id);
            fetchData();
        } catch (err) {
            console.error("Error eliminando cliente:", err);
        } finally {
            setMostrarModal(false);
            setClienteAEliminar(null);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 pb-10">
            <PageHeader
                icon="fa-solid fa-skull-crossbones"
                tone="black"
                title="Lista negra"
                subtitle="Clientes bloqueados: no se les puede vender. Añade nuevos a mano."
            />

            {/* Input añadir cliente */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    addCliente();
                }}
                className="flex items-center gap-2 mb-6 bg-white border border-gray-200 rounded-2xl shadow-sm p-3"
            >
                <div className="relative flex-1">
                    <i className="fa-solid fa-user-slash absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Nombre del cliente a bloquear…"
                        value={newCliente}
                        onChange={(e) => setNewCliente(e.target.value)}
                        className="w-full border border-gray-200 pl-9 pr-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition font-semibold flex items-center gap-2"
                >
                    <i className="fa-solid fa-skull-crossbones"></i>
                    <span className="hidden sm:inline">Bloquear</span>
                </button>
            </form>
            {blacklist.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                    <i className="fa-solid fa-face-smile text-3xl text-gray-300 mb-3 block"></i>
                    No hay clientes en la lista negra.
                </div>
            ) : (
                <ul className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-100">
                    {blacklist.map((b) => (
                        <li key={b.id} className="flex items-center gap-3 px-4 py-3">
                            <span className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                                <i className="fa-solid fa-skull-crossbones"></i>
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{b.cliente}</p>
                                <p className="text-xs text-gray-500">
                                    <i className="fa-regular fa-calendar mr-1"></i>
                                    Bloqueado el {b.fecha}
                                </p>
                            </div>
                            <button
                                onClick={() => confirmarEliminar(b)}
                                className="w-9 h-9 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Quitar de la lista negra"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {/* Modal de confirmación */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-4">
                        <h2 className="text-xl font-bold mb-4 text-center text-red-600">
                            ¿Estás seguro?
                        </h2>
                        <p className="text-gray-700 mb-6 text-center">
                            Vas a eliminar a <strong>{clienteAEliminar?.cliente}</strong> de la
                            lista negra. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setMostrarModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                            >
                                <i className="fa-solid fa-xmark"></i>
                                Cancelar
                            </button>
                            <button
                                onClick={handleEliminar}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                                <i className="fa-solid fa-trash"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlackList;
