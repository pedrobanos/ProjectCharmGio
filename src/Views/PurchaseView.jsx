import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmPurchaseOrder, getPurchaseOrders } from "../services/purchaseServices";


const PurchaseView = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const data = await getPurchaseOrders();
                setOrders(data);
            } catch (err) {
                console.error("Error cargando pedidos:", err.message);
            }
        })();
    }, []);

    const handleConfirmarPedido = async (id) => {
        try {
            await confirmPurchaseOrder(id);
            alert("Pedido confirmado ✅");
            setOrders((prev) =>
                prev.map((o) => (o.id === id ? { ...o, estado: "confirmado" } : o))
            );
        } catch (err) {
            alert("Error al confirmar pedido: " + err.message);
        }
    };


    return (
        <div className="max-w-screen-lg mx-auto p-6">
            <h1 className="text-5xl font-bold text-center text-blue-600 mt-9 mb-8">
                Historial de Pedidos
            </h1>
            {
                orders.length === 0 ? (
                    <p className="text-center text-gray-500">No hay pedidos realizados aún.</p>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Proveedor</th>
                                <th className="px-4 py-2">Fecha</th>
                                <th className="px-4 py-2">Estado</th>
                                <th className="px-4 py-2">Total productos</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-800">
                            {orders.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-50 text-center">
                                    <td className="px-4 py-2">{o.id}</td>
                                    <td className="px-4 py-2">{o.proveedor}</td>
                                    <td className="px-4 py-2">{new Date(o.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded text-white ${o.estado === "pendiente" ? "bg-yellow-500" : "bg-green-600"
                                                }`}
                                        >
                                            {o.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{o.total_cantidad}</td>
                                    <td className="space-x-3 px-4 py-2">
                                        <button
                                            onClick={() => navigate(`/purchases/${o.id}`)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded cursor-pointer"
                                        >
                                            Abrir
                                        </button>
                                        {/* {o.estado === "pendiente" && (
                                            <button
                                                onClick={() => handleConfirmarPedido(o.id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded"
                                            >
                                                Confirmar
                                            </button>
                                        )} */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
        </div>
    );
};

export default PurchaseView;

