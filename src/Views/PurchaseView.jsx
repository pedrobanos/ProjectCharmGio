import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
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
        <div className="w-full max-w-5xl mx-auto px-1 sm:px-2 pb-10">
            <PageHeader
                icon="fa-solid fa-bag-shopping"
                tone="green"
                title="Historial de pedidos"
                subtitle={`${orders.length} pedidos a proveedores`}
                actions={
                    <button
                        type="button"
                        onClick={() => navigate("/orders")}
                        className="flex items-center gap-2 text-sm font-semibold bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 shadow-sm"
                    >
                        <i className="fa-solid fa-cart-plus"></i> Hacer pedido
                    </button>
                }
            />
            {
                orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                        <i className="fa-solid fa-box-open text-3xl text-gray-300 mb-3 block"></i>
                        No hay pedidos realizados aún.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm bg-white">
                    <table className="min-w-[640px] w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-2.5"><i className="fa-solid fa-hashtag mr-1.5 text-gray-400"></i>ID</th>
                                <th className="px-4 py-2.5"><i className="fa-solid fa-truck mr-1.5 text-gray-400"></i>Proveedor</th>
                                <th className="px-4 py-2.5"><i className="fa-solid fa-calendar-day mr-1.5 text-gray-400"></i>Fecha</th>
                                <th className="px-4 py-2.5"><i className="fa-solid fa-circle-half-stroke mr-1.5 text-gray-400"></i>Estado</th>
                                <th className="px-4 py-2.5"><i className="fa-solid fa-boxes-stacked mr-1.5 text-gray-400"></i>Total productos</th>
                                <th className="px-4 py-2.5"><i className="fa-solid fa-gear mr-1.5 text-gray-400"></i>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-800">
                            {orders.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-50 text-center">
                                    <td className="px-4 py-2">{o.id}</td>
                                    <td className="px-4 py-2">{o.proveedor}</td>
                                    <td className="px-4 py-2">{new Date(o.created_at).toLocaleString("es-ES")}</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${o.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            <i className={o.estado === "pendiente" ? "fa-solid fa-hourglass-half" : "fa-solid fa-circle-check"}></i>
                                            {o.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{o.total_cantidad}</td>
                                    <td className="space-x-3 px-4 py-2">
                                        <button
                                            onClick={() => navigate(`/purchases/${o.id}`)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg"
                                        >
                                            <i className="fa-solid fa-folder-open"></i>
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
                    </div>
                )}
        </div>
    );
};

export default PurchaseView;

