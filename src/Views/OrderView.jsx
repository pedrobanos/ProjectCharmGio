
// OrderView.jsx
import React, { useEffect, useState } from "react";
import { withFotosBase64 } from "../utils/imgToDataUrl";
import { exportPedidoPDF } from "../utils/exportPedidoPDF";
import { getTopLowStockProducts } from "../services/salesServices";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import { createPurchaseOrder } from "../services/purchaseServices";
import { useNavigate } from "react-router-dom";

const OrderView = () => {
    const [products, setProducts] = useState([]);
    const [pedido, setPedido] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const stockThreshold = 1;
    const totalProductsToShow = 20;

    // 🔹 Cargar productos con bajo stock
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const { data, totalPages } = await getTopLowStockProducts(
                    currentPage,
                    totalProductsToShow,
                    stockThreshold
                );
                setProducts(data);
                setTotalPages(totalPages);
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, [currentPage]);

    // 🔹 Cambiar cantidad en el pedido
    const handleCantidadChange = (product, cantidad) => {
        setPedido((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            if (exists)
                return prev.map((i) =>
                    i.id === product.id ? { ...i, cantidad } : i
                );
            return [
                ...prev,
                {
                    id: product.id,
                    nombre: product.nombre,
                    foto: product.foto,
                    cantidad,
                },
            ];
        });
    };

    // 🔹 Exportar a PDF (como ya hacías)
    const handleExport = async () => {
        try {
            setExporting(true);
            const seleccion = pedido.filter((p) => (p.cantidad ?? 0) > 0);
            const rows = await withFotosBase64(seleccion, "foto");
            await exportPedidoPDF({
                pedido: rows,
                titulo: "Hoja de Pedido",
                proveedor: "Tu Proveedor",
            });
        } catch (error) {
            console.error("Error exportando PDF:", error);
        } finally {
            setExporting(false);
        }
    };

    // 🔹 Guardar pedido en Supabase
    const handleGuardarPedido = async () => {
        const pedidoFiltrado = pedido.filter((p) => (p.cantidad ?? 0) > 0);
        if (pedidoFiltrado.length === 0) {
            alert("No hay productos seleccionados.");
            return;
        }

        try {
            setSaving(true);

            await createPurchaseOrder({
                proveedor: "Tu Proveedor",
                nota: "Pedido generado desde interfaz",
                items: pedidoFiltrado.map((p) => ({
                    product_id: p.id,
                    cantidad: p.cantidad,
                })),
            });

            alert("✅ Pedido guardado correctamente en Supabase.");
            setPedido([]); // limpiar pedido tras guardar
            navigate("/purchases"); // navegar a vista de pedidos
        } catch (error) {
            alert("❌ Error guardando pedido: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

    const pedidoConCantidad = pedido.filter((p) => (p.cantidad ?? 0) > 0);
    const totalCantidad = pedidoConCantidad.reduce(
        (sum, p) => sum + (p.cantidad ?? 0),
        0
    );

    return (
        <div className="max-w-screen-lg mx-auto p-6 space-y-6">
            <h1 className="text-5xl font-bold text-center text-blue-600 mb-10">
                Hacer Pedido 🛒💨
            </h1>

            {/* Grid de productos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => (
                    <div
                        key={p.id}
                        className={`border rounded p-3 flex flex-col items-center shadow-sm transition ${(pedido.find((i) => i.id === p.id)?.cantidad ?? 0) > 0
                            ? "bg-black text-white"
                            : "bg-white text-black"
                            }`}
                    >
                        {p.foto ? (
                            <img
                                src={p.foto}
                                alt={p.nombre}
                                className="w-24 h-24 object-cover rounded mb-2"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-500 mb-2">
                                Sin foto
                            </div>
                        )}

                        <div className="flex flex-col flex-1 items-center w-full">
                            <p className="font-semibold text-md text-center mb-2">
                                {p.nombre}
                            </p>
                            <div className="flex flex-col items-center mt-auto">
                                <p className="text-sm text-gray-500 mb-1">
                                    Stock:{" "}
                                    <span className="text-red-600 font-bold">{p.cantidad}</span>
                                </p>
                                <input
                                    type="number"
                                    min="0"
                                    value={pedido.find((i) => i.id === p.id)?.cantidad ?? ""}
                                    onChange={(e) =>
                                        handleCantidadChange(p, Number(e.target.value))
                                    }
                                    className="border rounded px-2 py-1 w-20 text-center"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Paginador */}
            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            {/* Resumen del pedido */}
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-3">📝 Hoja de Pedido</h2>
                {pedidoConCantidad.length === 0 ? (
                    <p className="text-gray-500">No has seleccionado productos.</p>
                ) : (
                    <table className="table-auto w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr className="h-14">
                                <th className="px-4 py-2">Foto</th>
                                <th className="px-4 py-2">Producto</th>
                                <th className="px-4 py-2">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidoConCantidad.map((p) => (
                                <tr
                                    key={p.id}
                                    className="border-t text-center h-14 align-middle"
                                >
                                    <td className="py-2">
                                        {p.foto ? (
                                            <img
                                                src={p.foto}
                                                alt={p.nombre}
                                                className="w-12 h-12 object-cover mx-auto"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-500">--</span>
                                        )}
                                    </td>
                                    <td className="py-2">{p.nombre}</td>
                                    <td className="py-2 font-semibold">{p.cantidad}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold">
                            <tr className="h-14 align-middle">
                                <td colSpan="2" className="px-4 py-2 text-right">
                                    Total:
                                </td>
                                <td className="px-4 py-2 text-center">{totalCantidad}</td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3">
                <button
                    onClick={handleExport}
                    disabled={exporting || pedidoConCantidad.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {exporting ? "Generando PDF..." : "Exportar Pedido a PDF"}
                </button>

                <button
                    onClick={handleGuardarPedido}
                    disabled={saving || pedidoConCantidad.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {saving ? "Guardando..." : "Guardar Pedido en Base de Datos"}
                </button>
            </div>
        </div>
    );
};

export default OrderView;
