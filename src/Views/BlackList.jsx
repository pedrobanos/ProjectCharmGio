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
        <div className="p-6">
            <h1 className="text-5xl text-center font-bold mb-8">☠️ Lista Negra ☠️</h1>
            <p className="text-gray-600 mb-6">
                Aquí puedes gestionar los clientes bloqueados y añadir nuevos manualmente.
            </p>

            {/* Input añadir cliente */}
            <div className="flex items-center gap-2 mb-8">
                <input
                    type="text"
                    placeholder="Añadir cliente a blacklist..."
                    value={newCliente}
                    onChange={(e) => setNewCliente(e.target.value)}
                    className="border px-3 py-2 rounded w-96 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                    onClick={addCliente}
                    className="px-4 py-2 bg-red-600 w-12 h-12 cursor-pointer text-white rounded-full hover:bg-red-700 transition font-semibold"
                >
                    <i className="fa-solid fa-skull-crossbones"></i>
                </button>
            </div>
            {blacklist.length === 0 ? (
                <p className="text-gray-500">No hay clientes en la blacklist.</p>
            ) : (
                <table className="table-auto w-full border-collapse border border-gray-200 text-left mt-2">
                    <thead className="bg-gray-100">
                        <tr className="text-center">
                            <th className="border px-4 py-2">Cliente</th>
                            <th className="border px-4 py-2">Fecha de bloqueo</th>
                            <th className="border px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blacklist.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-50 text-center">
                                <td className="border px-4 py-2">☠️ {b.cliente} ☠️</td>
                                <td className="border px-4 py-2">{b.fecha}</td>
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => confirmarEliminar(b)}
                                        className="px-3 py-1 cursor-pointer rounded hover:text-red-700 transition"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Modal de confirmación */}
            {mostrarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
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
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEliminar}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

export default BlackList;
