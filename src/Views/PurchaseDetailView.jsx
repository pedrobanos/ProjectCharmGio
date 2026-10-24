import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { confirmPurchaseOrder, getPurchaseOrderById, updateItemQuantity, updateItemStatus } from "../services/purchaseServices";
import Loading from "../components/Loading";

// const PurchaseDetailView = () => {
//     const { id } = useParams();
//     const [items, setItems] = useState([]);
//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [confirming, setConfirming] = useState(false);

//     useEffect(() => {
//         (async () => {
//             try {
//                 setLoading(true);
//                 const { order, items } = await getPurchaseOrderById(id);
//                 setOrder(order);
//                 setItems(items);
//             } catch (err) {
//                 console.error("Error cargando pedido:", err.message);
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [id]);

//     const handleUpdateItem = async (itemId, estado) => {
//         try {
//             await updateItemStatus(itemId, estado);
//             setItems((prev) =>
//                 prev.map((i) => (i.id === itemId ? { ...i, estado } : i))
//             );
//         } catch (err) {
//             console.error("Error actualizando item:", err.message);
//         }
//     };

//     const handleConfirmOrder = async () => {
//         if (!window.confirm("¿Confirmar pedido completo? Esto actualizará el stock.")) return;
//         try {
//             setConfirming(true);
//             await confirmPurchaseOrder(order.id);
//             alert("Pedido confirmado y stock actualizado ✅");
//             setOrder((prev) => ({ ...prev, estado: "confirmado" }));
//         } catch (err) {
//             alert("Error al confirmar pedido: " + err.message);
//         } finally {
//             setConfirming(false);
//         }
//     };

//     if (loading) return <p className="text-center text-gray-500">Cargando pedido...</p>;
//     if (!order) return <p className="text-center text-red-500">Pedido no encontrado.</p>;

//     return (
//         <div className="max-w-screen-lg mx-auto p-6">
//             <h1 className="text-4xl font-bold mb-4">
//                 Pedido #{order.id} - {order.proveedor}
//             </h1>

//             <div className="flex justify-between items-center mb-4">
//                 <p className="text-gray-600">
//                     Estado:{" "}
//                     <span
//                         className={`font-bold ${order.estado === "pendiente" ? "text-yellow-600" : "text-green-600"
//                             }`}
//                     >
//                         {order.estado}
//                     </span>
//                 </p>
//                 {order.estado === "pendiente" && (
//                     <button
//                         onClick={handleConfirmOrder}
//                         disabled={
//                             confirming ||
//                             items.length === 0 ||
//                             items.some((i) => !i.estado || i.estado.trim() === "")
//                         }
//                         className={`px-4 py-2 rounded text-white transition ${confirming ||
//                                 items.length === 0 ||
//                                 items.some((i) => !i.estado || i.estado.trim() === "")
//                                 ? "bg-gray-400 cursor-not-allowed"
//                                 : "bg-green-700 hover:bg-green-800"
//                             }`}
//                     >
//                         {confirming
//                             ? "Confirmando..."
//                             : items.some((i) => !i.estado || i.estado.trim() === "")
//                                 ? "Selecciona estado de todos los productos"
//                                 : "Confirmar Pedido Completo"}
//                     </button>
//                 )}
//             </div>

//             {items.length === 0 ? (
//                 <p className="text-gray-500">Este pedido no contiene productos.</p>
//             ) : (
//                 <table className="table-auto w-full border text-sm">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th>Foto</th>
//                             <th>Producto</th>
//                             <th>Cantidad</th>
//                             <th>Estado</th>
//                             <th>Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {items.map((i) => (
//                             <tr key={i.id} className="border-t text-center">
//                                 <td>
//                                     {i.products?.foto ? (
//                                         <img
//                                             src={i.products.foto}
//                                             alt={i.products.nombre}
//                                             className="w-12 h-12 mx-auto rounded"
//                                         />
//                                     ) : (
//                                         "--"
//                                     )}
//                                 </td>
//                                 <td>{i.products?.nombre}</td>
//                                 <td>{i.cantidad}</td>
//                                 <td>
//                                     <span
//                                         className={`px-2 py-1 rounded text-white ${i.estado === "pendiente"
//                                             ? "bg-yellow-500"
//                                             : i.estado === "confirmado"
//                                                 ? "bg-green-600"
//                                                 : "bg-red-500"
//                                             }`}
//                                     >
//                                         {i.estado}
//                                     </span>
//                                 </td>
//                                 <td className="space-x-2">
//                                     <button
//                                         onClick={() => handleUpdateItem(i.id, "confirmado")}
//                                         className="bg-green-500 px-2 py-1 text-white rounded"
//                                     >
//                                         Confirmado
//                                     </button>
//                                     <button
//                                         onClick={() => handleUpdateItem(i.id, "pendiente")}
//                                         className="bg-yellow-500 px-2 py-1 text-white rounded"
//                                     >
//                                         Pendiente
//                                     </button>
//                                     <button
//                                         onClick={() => handleUpdateItem(i.id, "perdido")}
//                                         className="bg-red-500 px-2 py-1 text-white rounded"
//                                     >
//                                         Perdido
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// };

// export default PurchaseDetailView;


const PurchaseDetailView = () => {
    const { id } = useParams();
    const [items, setItems] = useState([]);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

    const loadData = async () => {
        const { order, items } = await getPurchaseOrderById(id);
        setOrder(order);
        setItems(items);
    };

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                await loadData();
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleQuantityChange = async (itemId, cantidad_recibida) => {
        const qty = Math.max(0, Number(cantidad_recibida) || 0);
        setItems((prev) =>
            prev.map((i) => {
                if (i.id !== itemId) return i;
                const restante = Math.max((i.cantidad ?? 0) - qty, 0);
                const nuevoEstado = restante === 0 ? "confirmado" : "pendiente";
                return {
                    ...i,
                    cantidad_recibida: qty,
                    estado: nuevoEstado,
                };
            })
        );
        try {
            await updateItemQuantity(itemId, qty);
            const item = items.find((x) => x.id === itemId);
            if (item && qty === Number(item.cantidad)) {
                await updateItemStatus(itemId, "confirmado");
            }
        } catch (e) {
            console.error(e);
        }
    };


    const handleMarkFull = async (item) => {
        try {
            // marcar recepción total (recibida = pedida)
            await updateItemQuantity(item.id, item.cantidad);
            // también marca el estado como confirmado
            await updateItemStatus(item.id, "confirmado");
            // actualiza en memoria
            setItems((prev) =>
                prev.map((i) =>
                    i.id === item.id
                        ? { ...i, cantidad_recibida: item.cantidad, estado: "confirmado" }
                        : i
                )
            );
        } catch (e) {
            console.error(e);
        }
    };


    const handleSetEstado = async (itemId, estado) => {
        try {
            await updateItemStatus(itemId, estado);
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, estado } : i));
        } catch (e) {
            console.error(e);
        }
    };

    const handleConfirmOrder = async () => {
        try {
            setConfirming(true);
            await confirmPurchaseOrder(order.id);
            await loadData(); // 🔁 refresca para ver restantes/estados recalculados
        } catch (err) {
            alert("Error al confirmar pedido: " + err.message);
        } finally {
            setConfirming(false);
        }
    };

    if (loading) return <Loading />
    if (!order) return <p className="text-center text-red-500">Pedido no encontrado.</p>;

    // deshabilita si alguna línea no tiene número válido (permitimos 0)
    const disableConfirm =
        confirming ||
        items.length === 0 ||
        items.some(i => i.estado !== 'perdido' && (typeof i.cantidad_recibida !== 'number' || isNaN(i.cantidad_recibida)));

    return (
        <div className="w-full max-w-5xl mx-auto px-1 sm:px-2 pb-10">
            <PageHeader
                icon="fa-solid fa-box-open"
                tone="green"
                title={`Pedido #${order.id}`}
                subtitle={`Proveedor: ${order.proveedor || "—"}`}
                actions={
                    <Link
                        to="/purchases"
                        className="flex items-center gap-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50"
                    >
                        <i className="fa-solid fa-arrow-left"></i> Volver a pedidos
                    </Link>
                }
            />

            <div className="flex flex-wrap gap-3 justify-between items-center mb-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-3">
                <p className="text-gray-600 flex items-center gap-2">
                    <i className="fa-solid fa-circle-half-stroke text-gray-400"></i>
                    Estado:{" "}
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            order.estado === "pendiente" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        }`}
                    >
                        <i className={order.estado === "pendiente" ? "fa-solid fa-hourglass-half" : "fa-solid fa-circle-check"}></i>
                        {order.estado}
                    </span>
                </p>
                {order.estado === "confirmado" ? (
                    <button
                        disabled
                        className="px-4 py-2 rounded-xl text-green-800 bg-green-100 cursor-not-allowed flex items-center gap-2 font-semibold"
                    >
                        <i className="fa-solid fa-circle-check"></i>
                        Pedido confirmado
                    </button>
                ) : (
                    <button
                        onClick={handleConfirmOrder}
                        disabled={disableConfirm}
                        className={`px-4 py-2 rounded-xl text-white transition flex items-center gap-2 font-semibold ${disableConfirm
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-700 hover:bg-green-800"
                            }`}
                    >
                        <i className={confirming ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-truck-ramp-box"}></i>
                        {confirming ? "Aplicando recepción..." : "Confirmar pedido completo"}
                    </button>
                )}

            </div>

            <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
            <table className="table-fixed w-full min-w-[760px] border-collapse text-sm sm:text-base">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
                    <tr>
                        <th className="w-16 px-2 py-2.5 text-center"><i className="fa-solid fa-image mr-1 text-gray-400"></i>Foto</th>
                        <th className="w-40 px-2 py-2.5 text-center"><i className="fa-solid fa-gem mr-1 text-gray-400"></i>Producto</th>
                        <th className="w-14 px-2 py-2.5 text-center"><i className="fa-solid fa-cart-arrow-down mr-1 text-gray-400"></i>Pedida</th>
                        <th className="w-14 px-2 py-2.5 text-center"><i className="fa-solid fa-dolly mr-1 text-gray-400"></i>Recibida</th>
                        <th className="w-14 px-2 py-2.5 text-center"><i className="fa-solid fa-hourglass-half mr-1 text-gray-400"></i>Restante</th>
                        <th className="w-20 px-2 py-2.5 text-center"><i className="fa-solid fa-circle-half-stroke mr-1 text-gray-400"></i>Estado</th>
                        {order.estado !== "confirmado" && (
                            <th className="w-28 px-2 py-2.5 text-center"><i className="fa-solid fa-gear mr-1 text-gray-400"></i>Acciones</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {items.map((i) => {
                        const restanteCalc = Math.max(
                            (Number(i.cantidad) || 0) - (Number(i.cantidad_recibida) || 0),
                            0
                        );

                        const isPendiente = i.estado !== "perdido" && restanteCalc > 0;
                        const editable = isPendiente && order.estado === "pendiente";

                        return (
                            <tr key={i.id} className="border-t text-center">
                                <td className="px-2 py-3">
                                    {i.products?.foto ? (
                                        console.log(i.products),
                                        <img
                                            src={i.products.foto}
                                            alt={i.products.nombre}
                                            className="h-14 w-14 object-cover rounded-xl mx-auto hover:scale-105 transition-transform duration-200"
                                        />
                                    ) : (
                                        "--"
                                    )}
                                </td>
                                <td className="px-2 py-2 break-words whitespace-normal text-left">
                                    <div>
                                        <p className="font-medium text-gray-900">{i.products?.nombre}</p>
                                        {i.products?.lugar && (
                                            <p className="text-sm text-gray-500 mt-1"><i className="fa-solid fa-location-dot mr-1"></i>{i.products.lugar}</p>
                                        )}
                                    </div>
                                </td>

                                <td>{i.cantidad}</td>
                                <td>
                                    {editable ? (
                                        <input
                                            type="number"
                                            min="0"
                                            max={i.cantidad}
                                            value={i.cantidad_recibida ?? 0}
                                            onChange={(e) => handleQuantityChange(i.id, e.target.value)}
                                            className="border rounded px-2 py-1 w-20 text-center"
                                        />
                                    ) : (
                                        i.cantidad_recibida
                                    )}
                                </td>
                                <td>{restanteCalc}</td>
                                <td>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold capitalize ${i.estado === "confirmado"
                                            ? "bg-green-100 text-green-800"
                                            : i.estado === "perdido"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        <i className={i.estado === "confirmado" ? "fa-solid fa-circle-check" : i.estado === "perdido" ? "fa-solid fa-ban" : "fa-solid fa-hourglass-half"}></i>
                                        {i.estado}
                                    </span>
                                </td>

                                {/* 🔹 Renderiza las acciones solo si el pedido no está confirmado */}
                                {order.estado !== "confirmado" && (
                                    <td className="space-x-2 text-center">
                                        {editable && (
                                            <div className="flex flex-row gap-3 justify-center">
                                                {/* ✅ Botón confirmar con tooltip */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => handleMarkFull(i)}
                                                        className="text-green-500 text-2xl px-2 py-1 rounded cursor-pointer transition-transform hover:scale-110"
                                                    >
                                                        <i className="fa-solid fa-circle-check"></i>
                                                    </button>
                                                    <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                                        Confirmar
                                                    </span>
                                                </div>
                                                {/* ❌ Botón perdido con tooltip */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => {
                                                            handleQuantityChange(i.id, 0);
                                                            handleSetEstado(i.id, "perdido");
                                                        }}
                                                        className="text-red-500 text-2xl px-2 py-1 rounded cursor-pointer transition-transform hover:scale-110"
                                                    >
                                                        <i className="fa-solid fa-ban"></i>
                                                    </button>
                                                    <span className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                                        Cancelado
                                                    </span>
                                                </div>
                                            </div>

                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>

            </table>
            </div>
        </div>
    );
};

export default PurchaseDetailView;
