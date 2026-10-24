import PageHeader from "../components/PageHeader";
import React, { useEffect, useState, useRef } from "react";
import { withFotosBase64 } from "../utils/imgToDataUrl";
import { exportPedidoPDF } from "../utils/exportPedidoPDF";
import { getFilteredProducts } from "../services/salesServices";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import { createPurchaseOrder } from "../services/purchaseServices";
import { useNavigate, useSearchParams } from "react-router-dom";

const OrderView = () => {
    const [products, setProducts] = useState([]);
    const [pedido, setPedido] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [saving, setSaving] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = parseInt(searchParams.get("page")) || 1;
    const initialSearch = searchParams.get("search") || "";
    const initialStock = parseInt(searchParams.get("stock")) || 0;

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [maxStock, setMaxStock] = useState(0);
    const [sliderValue, setSliderValue] = useState(initialStock);


    const [inputValue, setInputValue] = useState(initialSearch);
    const searchDebounceRef = useRef(null);
    const stockDebounceRef = useRef(null);



    const navigate = useNavigate();

    // 🔍 Fetch productos
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, totalPages } = await getFilteredProducts({
                page: currentPage,
                pageSize: 20,
                search: searchTerm,
                maxStock,
            });
            setProducts(data);
            setTotalPages(totalPages);


            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(totalPages);
            }
        } catch (err) {
            console.error("Error cargando productos:", err);
        } finally {
            setLoading(false);
        }

    };

    // 🔹 Actualizar URL y fetch al cambiar filtros o página
    useEffect(() => {
        setSearchParams({
            page: currentPage,
            search: searchTerm,
            stock: maxStock,
        });
        fetchProducts();
    }, [currentPage, searchTerm, maxStock, setSearchParams]);

    // 🛒 Modificar cantidad del pedido
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
                    precio: product.precio,
                    cantidad,
                },
            ];
        });
    };

    // 📄 Exportar a PDF
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
        } finally {
            setExporting(false);
        }
    };

    // 💾 Guardar pedido en Supabase
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
                    cantidad: p.cantidad
                })),
            });
            alert("Pedido guardado correctamente.");
            setPedido([]);
            navigate("/purchases");
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
    
    
  const pedidoConPrecio = pedido.filter((p) => (p.precio ?? 0) > 0);

  const totalPrecio = pedidoConPrecio.reduce(
    (sum, p) => sum + (p.precio*p.cantidad ?? 0),
    0
  );


    return (
    <div className="w-full max-w-6xl mx-auto px-1 sm:px-2 pb-10 space-y-5">
        <PageHeader
            icon="fa-solid fa-cart-plus"
            tone="green"
            title="Hacer pedido"
            subtitle="Elige cuántas unidades pedir de cada producto al proveedor"
            className="mb-2"
        />
        {/* 🔍 Barra de búsqueda + Filtro */}
        <div className="flex flex-wrap gap-4 items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-3">
            <div className="relative flex-grow min-w-[200px]">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="border border-gray-200 pl-10 pr-3 py-2.5 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    value={inputValue} // usamos inputValue para que el usuario pueda escribir libremente
                    onChange={(e) => {
                        const value = e.target.value;
                        setInputValue(value); // actualizar lo que se ve
                        setCurrentPage(1);

                        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                        searchDebounceRef.current = setTimeout(() => {
                            setSearchTerm(value); // actualizar searchTerm con debounce
                        }, 400);
                    }}
                />
            </div>

            {/* Range Stock Máximo */}
            <div className="flex flex-col">
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={sliderValue}
                    onChange={(e) => {
                        const value = Number(e.target.value);
                        setSliderValue(value);
                        if (stockDebounceRef.current) clearTimeout(stockDebounceRef.current);
                        stockDebounceRef.current = setTimeout(() => {
                            setMaxStock(value);
                            setCurrentPage(1);
                        }, 800);
                    }}

                    className="w-40 cursor-pointer"
                />
                <label className="text-sm text-gray-600">
                    <i className="fa-solid fa-boxes-stacked mr-1.5 text-gray-400"></i>
                    Stock máximo: <strong>{sliderValue}</strong>
                </label>
            </div>
        </div>
        {/* 🟦 GRID DE PRODUCTOS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {products.map((p) => (
                <div
                    key={p.id}
                    className={`border rounded-2xl p-3 flex flex-col items-center shadow-sm transition ${(pedido.find((i) => i.id === p.id)?.cantidad ?? 0) > 0
                        ? "bg-green-50 border-green-500 ring-2 ring-green-500/30 text-gray-900"
                        : "bg-white border-gray-200 text-gray-900"
                        }`}
                >
                    {p.foto ? (
                        <img
                            src={p.foto}
                            alt={p.nombre}
                            className="w-24 h-24 object-cover rounded-xl mb-2"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 mb-2">
                            <i className="fa-solid fa-image text-2xl"></i>
                        </div>
                    )}

                    <div className="flex flex-col flex-1 items-center w-full">
                        <p className="font-semibold text-sm text-center mb-2 leading-snug">
                            {p.nombre}
                        </p>
                        <div className="flex flex-col items-center mt-auto">
                            <p className="text-sm text-gray-500 mb-1">
                                <i className="fa-solid fa-boxes-stacked mr-1"></i>Stock:{" "}
                                <span className="text-red-600 font-bold">{p.cantidad}</span>
                            </p>
                            <input
                                type="number"
                                min="0"
                                value={pedido.find((i) => i.id === p.id)?.cantidad ?? ""}
                                onChange={(e) =>
                                    handleCantidadChange(p, Number(e.target.value))
                                }
                                placeholder="0"
                                className="border border-gray-300 rounded-lg px-2 py-1.5 w-20 text-center bg-white"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* PAGINADOR */}
        <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
        />

        {/* 📦 RESUMEN DEL PEDIDO */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-green-600 text-white flex items-center justify-center text-sm">
                    <i className="fa-solid fa-clipboard-list"></i>
                </span>
                Hoja de pedido
            </h2>
            {pedidoConCantidad.length === 0 ? (
                <p className="text-gray-500">
                    <i className="fa-solid fa-hand-pointer mr-1.5"></i>No has seleccionado productos.
                </p>
            ) : (
                <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr className="h-14">
                            <th className="px-4 py-2"><i className="fa-solid fa-image mr-1.5 text-gray-400"></i>Foto</th>
                            <th className="px-4 py-2"><i className="fa-solid fa-gem mr-1.5 text-gray-400"></i>Producto</th>
                            <th className="px-4 py-2"><i className="fa-solid fa-boxes-stacked mr-1.5 text-gray-400"></i>Cantidad</th>
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
                     <tfoot className="bg-blue-100 font-bold">
                        <tr className="h-14 align-middle">
                            <td colSpan="2" className="px-4 py-2 text-right">
                                <i className="fa-solid fa-euro-sign mr-2 text-blue-600"></i>Total precio:
                            </td>
                            <td className="px-4 py-2 text-center">{totalPrecio}</td>
                        </tr>
                          </tfoot>
                    <tfoot className="bg-gray-100 font-bold">
                        <tr className="h-14 align-middle">
                            <td colSpan="2" className="px-4 py-2 text-right">
                                <i className="fa-solid fa-boxes-stacked mr-2 text-gray-500"></i>Total cantidad:
                            </td>
                            <td className="px-4 py-2 text-center">{totalCantidad}</td>
                        </tr>
                    </tfoot>
                    
                </table>
                </div>
            )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap justify-end gap-3">
            <button
                onClick={handleExport}
                disabled={exporting || pedidoConCantidad.length === 0}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-800 rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
                <i className={exporting ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-file-pdf text-red-600"}></i>
                {exporting ? "Generando PDF..." : "Exportar pedido a PDF"}
            </button>

            <button
                onClick={handleGuardarPedido}
                disabled={saving || pedidoConCantidad.length === 0}
                className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
            >
                <i className={saving ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk"}></i>
                {saving ? "Guardando..." : "Guardar pedido"}
            </button>
        </div>
    </div>

    );
};

export default OrderView;
