
// // OrderView.jsx
// import React, { useEffect, useState } from "react";
// import { withFotosBase64 } from "../utils/imgToDataUrl";
// import { exportPedidoPDF } from "../utils/exportPedidoPDF";
// import { getFilteredProducts, getTopLowStockProducts } from "../services/salesServices";
// import Pagination from "../components/Pagination";
// import Loading from "../components/Loading";
// import { createPurchaseOrder } from "../services/purchaseServices";
// import { useNavigate, useSearchParams } from "react-router-dom";


// const OrderView = () => {
//     const [products, setProducts] = useState([]);
//     const [pedido, setPedido] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [exporting, setExporting] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const navigate = useNavigate();

//     const stockThreshold = 1;
//     const totalProductsToShow = 20;

//     // 🔹 Cargar productos con bajo stock

//     useEffect(() => {
//         (async () => {
//             try {
//                 setLoading(true);
//                 const { data, totalPages } = await getTopLowStockProducts(
//                     currentPage,
//                     totalProductsToShow,
//                     stockThreshold
//                 );
//                 setProducts(data);
//                 setTotalPages(totalPages);
//             } catch (error) {
//                 console.error("Error cargando productos:", error);
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [currentPage]);

//     // 🔹 Cambiar cantidad en el pedido
//     const handleCantidadChange = (product, cantidad) => {
//         setPedido((prev) => {
//             const exists = prev.find((i) => i.id === product.id);
//             if (exists)
//                 return prev.map((i) =>
//                     i.id === product.id ? { ...i, cantidad } : i
//                 );
//             return [
//                 ...prev,
//                 {
//                     id: product.id,
//                     nombre: product.nombre,
//                     foto: product.foto,
//                     cantidad,
//                 },
//             ];
//         });
//     };

//     // 🔹 Exportar a PDF (como ya hacías)
//     const handleExport = async () => {
//         try {
//             setExporting(true);
//             const seleccion = pedido.filter((p) => (p.cantidad ?? 0) > 0);
//             const rows = await withFotosBase64(seleccion, "foto");
//             await exportPedidoPDF({
//                 pedido: rows,
//                 titulo: "Hoja de Pedido",
//                 proveedor: "Tu Proveedor",
//             });
//         } catch (error) {
//             console.error("Error exportando PDF:", error);
//         } finally {
//             setExporting(false);
//         }
//     };

//     // 🔹 Guardar pedido en Supabase
//     const handleGuardarPedido = async () => {
//         const pedidoFiltrado = pedido.filter((p) => (p.cantidad ?? 0) > 0);
//         if (pedidoFiltrado.length === 0) {
//             alert("No hay productos seleccionados.");
//             return;
//         }

//         try {
//             setSaving(true);

//             await createPurchaseOrder({
//                 proveedor: "Tu Proveedor",
//                 nota: "Pedido generado desde interfaz",
//                 items: pedidoFiltrado.map((p) => ({
//                     product_id: p.id,
//                     cantidad: p.cantidad,
//                 })),
//             });

//             alert("✅ Pedido guardado correctamente en Supabase.");
//             setPedido([]); // limpiar pedido tras guardar
//             navigate("/purchases"); // navegar a vista de pedidos
//         } catch (error) {
//             alert("❌ Error guardando pedido: " + error.message);
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) return <Loading />;

//     const pedidoConCantidad = pedido.filter((p) => (p.cantidad ?? 0) > 0);
//     const totalCantidad = pedidoConCantidad.reduce(
//         (sum, p) => sum + (p.cantidad ?? 0),
//         0
//     );

//     // console.log(allProducts);
//     return (
//         <div className="max-w-screen-lg mx-auto p-6 space-y-6">
//             <h1 className="text-5xl font-bold text-center text-blue-600 mb-10">
//                 Hacer Pedido 🛒💨
//             </h1>
//             {/* Grid de productos */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {/* {allProducts.slice(0, 10).map((p) => ( */}
//                 {products.map((p) => (
//                     <div
//                         key={p.id}
//                         className={`border rounded p-3 flex flex-col items-center shadow-sm transition ${(pedido.find((i) => i.id === p.id)?.cantidad ?? 0) > 0
//                             ? "bg-black text-white"
//                             : "bg-white text-black"
//                             }`}
//                     >
//                         {p.foto ? (
//                             <img
//                                 src={p.foto}
//                                 alt={p.nombre}
//                                 className="w-24 h-24 object-cover rounded mb-2"
//                             />
//                         ) : (
//                             <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-500 mb-2">
//                                 Sin foto
//                             </div>
//                         )}

//                         <div className="flex flex-col flex-1 items-center w-full">
//                             <p className="font-semibold text-md text-center mb-2">
//                                 {p.nombre}
//                             </p>
//                             <div className="flex flex-col items-center mt-auto">
//                                 <p className="text-sm text-gray-500 mb-1">
//                                     Stock:{" "}
//                                     <span className="text-red-600 font-bold">{p.cantidad}</span>
//                                 </p>
//                                 <input
//                                     type="number"
//                                     min="0"
//                                     value={pedido.find((i) => i.id === p.id)?.cantidad ?? ""}
//                                     onChange={(e) =>
//                                         handleCantidadChange(p, Number(e.target.value))
//                                     }
//                                     className="border rounded px-2 py-1 w-20 text-center"
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Paginador */}
//             <Pagination
//                 totalPages={totalPages}
//                 currentPage={currentPage}
//                 onPageChange={setCurrentPage}
//             />

//             {/* Resumen del pedido */}
//             <div className="mt-6">
//                 <h2 className="text-xl font-bold mb-3">📝 Hoja de Pedido</h2>
//                 {pedidoConCantidad.length === 0 ? (
//                     <p className="text-gray-500">No has seleccionado productos.</p>
//                 ) : (
//                     <table className="table-auto w-full border text-sm">
//                         <thead className="bg-gray-100">
//                             <tr className="h-14">
//                                 <th className="px-4 py-2">Foto</th>
//                                 <th className="px-4 py-2">Producto</th>
//                                 <th className="px-4 py-2">Cantidad</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {pedidoConCantidad.map((p) => (
//                                 <tr
//                                     key={p.id}
//                                     className="border-t text-center h-14 align-middle"
//                                 >
//                                     <td className="py-2">
//                                         {p.foto ? (
//                                             <img
//                                                 src={p.foto}
//                                                 alt={p.nombre}
//                                                 className="w-12 h-12 object-cover mx-auto"
//                                             />
//                                         ) : (
//                                             <span className="text-xs text-gray-500">--</span>
//                                         )}
//                                     </td>
//                                     <td className="py-2">{p.nombre}</td>
//                                     <td className="py-2 font-semibold">{p.cantidad}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                         <tfoot className="bg-gray-100 font-bold">
//                             <tr className="h-14 align-middle">
//                                 <td colSpan="2" className="px-4 py-2 text-right">
//                                     Total:
//                                 </td>
//                                 <td className="px-4 py-2 text-center">{totalCantidad}</td>
//                             </tr>
//                         </tfoot>
//                     </table>
//                 )}
//             </div>

//             {/* Botones de acción */}
//             <div className="flex justify-end space-x-3">
//                 <button
//                     onClick={handleExport}
//                     disabled={exporting || pedidoConCantidad.length === 0}
//                     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
//                 >
//                     {exporting ? "Generando PDF..." : "Exportar Pedido a PDF"}
//                 </button>

//                 <button
//                     onClick={handleGuardarPedido}
//                     disabled={saving || pedidoConCantidad.length === 0}
//                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//                 >
//                     {saving ? "Guardando..." : "Guardar Pedido en Base de Datos"}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default OrderView;

// OrderView.jsx



// /////PRUEBASSSS//////
// import React, { useEffect, useState, useRef } from "react";
// import { withFotosBase64 } from "../utils/imgToDataUrl";
// import { exportPedidoPDF } from "../utils/exportPedidoPDF";
// import { getFilteredProducts } from "../services/salesServices";
// import Pagination from "../components/Pagination";
// import Loading from "../components/Loading";
// import { createPurchaseOrder } from "../services/purchaseServices";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import SearchBar from "../components/SearchBar";

// const OrderView = () => {
//     const [products, setProducts] = useState([]);
//     const [pedido, setPedido] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [exporting, setExporting] = useState(false);
//     const [saving, setSaving] = useState(false);

//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [maxStock, setMaxStock] = useState(0);

//     const navigate = useNavigate();
//     const [searchParams, setSearchParams] = useSearchParams();

//     // 🔹 Ref para debounce del slider
//     const [sliderValue, setSliderValue] = useState(0); // valor visual mientras mueves
//     const stockDebounceRef = useRef(null);

//     useEffect(() => {
//         const page = parseInt(searchParams.get("page")) || 1;
//         const search = searchParams.get("search") || "";
//         const stock = parseInt(searchParams.get("stock")) || 0;

//         setCurrentPage(page);
//         setSearchTerm(search);
//         setSliderValue(stock);
//         setMaxStock(stock);
//     }, []);
//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const { data, totalPages } = await getFilteredProducts({
//                     page: currentPage,
//                     pageSize: 20,
//                     search: searchTerm,
//                     maxStock,
//                 });
//                 setProducts(data);
//                 setTotalPages(totalPages);

//                 // Si la página actual es mayor al total, resetear a la última válida
//                 if (currentPage > totalPages) setCurrentPage(totalPages || 1);
//             } catch (err) {
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         setSearchParams({
//             page: currentPage,
//             search: searchTerm,
//             stock: maxStock,
//         });

//         fetchData();
//     }, [currentPage, searchTerm, maxStock, setSearchParams]);


//     // 🛒 Modificar cantidad del pedido
//     const handleCantidadChange = (product, cantidad) => {
//         setPedido((prev) => {
//             const exists = prev.find((i) => i.id === product.id);
//             if (exists)
//                 return prev.map((i) =>
//                     i.id === product.id ? { ...i, cantidad } : i
//                 );
//             return [
//                 ...prev,
//                 {
//                     id: product.id,
//                     nombre: product.nombre,
//                     foto: product.foto,
//                     cantidad,
//                 },
//             ];
//         });
//     };

//     // 📄 Exportar a PDF
//     const handleExport = async () => {
//         try {
//             setExporting(true);
//             const seleccion = pedido.filter((p) => (p.cantidad ?? 0) > 0);
//             const rows = await withFotosBase64(seleccion, "foto");

//             await exportPedidoPDF({
//                 pedido: rows,
//                 titulo: "Hoja de Pedido",
//                 proveedor: "Tu Proveedor",
//             });
//         } finally {
//             setExporting(false);
//         }
//     };

//     // 💾 Guardar pedido en Supabase
//     const handleGuardarPedido = async () => {
//         const pedidoFiltrado = pedido.filter((p) => (p.cantidad ?? 0) > 0);

//         if (pedidoFiltrado.length === 0) {
//             alert("No hay productos seleccionados.");
//             return;
//         }

//         try {
//             setSaving(true);

//             await createPurchaseOrder({
//                 proveedor: "Tu Proveedor",
//                 nota: "Pedido generado desde interfaz",
//                 items: pedidoFiltrado.map((p) => ({
//                     product_id: p.id,
//                     cantidad: p.cantidad,
//                 })),
//             });

//             alert("Pedido guardado correctamente.");
//             setPedido([]);
//             navigate("/purchases");
//         } finally {
//             setSaving(false);
//         }
//     };

//     if (loading) return <Loading />;

//     const pedidoConCantidad = pedido.filter((p) => (p.cantidad ?? 0) > 0);
//     const totalCantidad = pedidoConCantidad.reduce(
//         (sum, p) => sum + (p.cantidad ?? 0),
//         0
//     );

//     return (
//         <div className="max-w-screen-lg mx-auto p-6 space-y-6">
//             <h1 className="text-5xl font-bold text-center text-blue-600 mb-10">
//                 Hacer Pedido 🛒💨
//             </h1>

//             {/* 🔍 Barra de búsqueda + Filtro */}
//             <div className="flex gap-4 items-center">
//                 {/* Buscador */}
//                 <SearchBar
//                     onSearch={(v) => {
//                         setSearchTerm(v);
//                         setCurrentPage(1); // reset página al buscar
//                     }}
//                     placeholder="Buscar por nombre..."
//                 />

//                 {/* Range Stock Máximo */}
//                 <div className="flex flex-col">

//                     <input
//                         type="range"
//                         min="0"
//                         max="10"
//                         value={sliderValue}
//                         onChange={(e) => {
//                             const value = Number(e.target.value);
//                             setSliderValue(value); // actualizar valor visual inmediatamente

//                             // 🔹 Debounce para actualizar filtro real
//                             if (stockDebounceRef.current) clearTimeout(stockDebounceRef.current);
//                             stockDebounceRef.current = setTimeout(() => {
//                                 setMaxStock(value); // disparar búsqueda
//                                 setCurrentPage(1);  // reset página
//                             }, 800); // 3 segundos debounce
//                         }}
//                         className="w-40 cursor-pointer"
//                     />

//                     <label className="text-sm text-gray-600">
//                         Stock máximo: {sliderValue}
//                     </label>
//                 </div>
//             </div>

//             {/* 🟦 GRID DE PRODUCTOS */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {products.map((p) => (
//                     <div
//                         key={p.id}
//                         className={`border rounded p-3 flex flex-col items-center shadow-sm transition ${(pedido.find((i) => i.id === p.id)?.cantidad ?? 0) > 0
//                             ? "bg-black text-white"
//                             : "bg-white text-black"
//                             }`}
//                     >
//                         {p.foto ? (
//                             <img
//                                 src={p.foto}
//                                 alt={p.nombre}
//                                 className="w-24 h-24 object-cover rounded mb-2"
//                             />
//                         ) : (
//                             <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-500 mb-2">
//                                 Sin foto
//                             </div>
//                         )}

//                         <p className="font-semibold text-md text-center mb-2">{p.nombre}</p>

//                         <p className="text-sm text-gray-500 mb-1">
//                             Stock: <span className="text-red-600 font-bold">{p.cantidad}</span>
//                         </p>

//                         <input
//                             type="number"
//                             min="0"
//                             value={pedido.find((i) => i.id === p.id)?.cantidad ?? ""}
//                             onChange={(e) =>
//                                 handleCantidadChange(p, Number(e.target.value))
//                             }
//                             className="border rounded px-2 py-1 w-20 text-center"
//                         />
//                     </div>
//                 ))}
//             </div>

//             {/* PAGINADOR */}
//             <Pagination
//                 totalPages={totalPages}
//                 currentPage={currentPage}
//                 onPageChange={setCurrentPage}
//             />

//             {/* 📦 RESUMEN DEL PEDIDO */}
//             <div className="mt-6">
//                 <h2 className="text-xl font-bold mb-3">📝 Hoja de Pedido</h2>
//                 {pedidoConCantidad.length === 0 ? (
//                     <p className="text-gray-500">No has seleccionado productos.</p>
//                 ) : (
//                     <table className="table-auto w-full border text-sm">
//                         <thead className="bg-gray-100">
//                             <tr className="h-14">
//                                 <th className="px-4 py-2">Foto</th>
//                                 <th className="px-4 py-2">Producto</th>
//                                 <th className="px-4 py-2">Cantidad</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {pedidoConCantidad.map((p) => (
//                                 <tr key={p.id} className="border-t text-center h-14 align-middle">
//                                     <td className="py-2">
//                                         {p.foto ? (
//                                             <img
//                                                 src={p.foto}
//                                                 alt={p.nombre}
//                                                 className="w-12 h-12 object-cover mx-auto"
//                                             />
//                                         ) : (
//                                             <span className="text-xs text-gray-500">--</span>
//                                         )}
//                                     </td>
//                                     <td className="py-2">{p.nombre}</td>
//                                     <td className="py-2 font-semibold">{p.cantidad}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                         <tfoot className="bg-gray-100 font-bold">
//                             <tr className="h-14 align-middle">
//                                 <td colSpan="2" className="px-4 py-2 text-right">
//                                     Total:
//                                 </td>
//                                 <td className="px-4 py-2 text-center">{totalCantidad}</td>
//                             </tr>
//                         </tfoot>
//                     </table>
//                 )}
//             </div>

//             {/* Botones de acción */}
//             <div className="flex justify-end space-x-3">
//                 <button
//                     onClick={handleExport}
//                     disabled={exporting || pedidoConCantidad.length === 0}
//                     className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
//                 >
//                     {exporting ? "Generando PDF..." : "Exportar Pedido a PDF"}
//                 </button>

//                 <button
//                     onClick={handleGuardarPedido}
//                     disabled={saving || pedidoConCantidad.length === 0}
//                     className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//                 >
//                     {saving ? "Guardando..." : "Guardar Pedido en Base de Datos"}
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default OrderView;


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
                    cantidad: p.cantidad,
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

    return (<div className="max-w-screen-lg mx-auto p-6 space-y-6"> <h1 className="text-5xl font-bold text-center text-blue-600 mb-10">
        Hacer Pedido 🛒💨 </h1>
        {/* 🔍 Barra de búsqueda + Filtro */}
        <div className="flex gap-4 items-center">
            <div className="relative flex-grow w-1/2">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="border pl-10 pr-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Stock máximo: {sliderValue}
                </label>
            </div>
        </div>
        {/* 🟦 GRID DE PRODUCTOS */}
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

        {/* PAGINADOR */}
        <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
        />

        {/* 📦 RESUMEN DEL PEDIDO */}
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
