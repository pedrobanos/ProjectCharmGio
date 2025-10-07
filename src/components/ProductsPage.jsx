
// import React, { useState, useEffect, useMemo } from "react";
// import TableElement from "./TableElement";
// import SearchBar from "./SearchBar";
// import {
//     getAllProducts,
//     updateProduct,
//     deleteProduct,
// } from "../services/productServices";
// import { Link } from "react-router-dom";
// import { supabase } from "../supabaseClient";
// import Loading from "./Loading";
// import { normalizeString } from "../Constants";
// import { SaleConfirmedModal } from "./SaleConfirmedModal";
// import { getClientesBlacklisted } from "../services/clientServices";

// const ProductsPage = () => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [orderBy, setOrderBy] = useState(null);
//     const [orderDirection, setOrderDirection] = useState("asc");

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [cantidadVenta, setCantidadVenta] = useState(1);
//     const [precioVenta, setPrecioVenta] = useState(0);
//     const [cliente, setCliente] = useState("");
//     const [error, setError] = useState("");
//     const [sales, setSales] = useState([]);
//     const [isSaleConfirmed, setIsSaleConfirmed] = useState(false);

//     const [isLote, setIsLote] = useState(false);
//     const [selectedIds, setSelectedIds] = useState([]);
//     const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
//     const [batchProducts, setBatchProducts] = useState([]);
//     const [precioTotalLote, setPrecioTotalLote] = useState(0);


//     const [currentPage, setCurrentPage] = useState(1);

//     useEffect(() => {
//         fetchProducts();
//     }, []);

//     useEffect(() => {
//         setCurrentPage(1);
//     }, [searchTerm]);

//     const fetchProducts = async () => {
//         setLoading(true);
//         try {
//             const data = await getAllProducts();
//             const normalized = data.map((p) => ({
//                 ...p,
//                 nombreLower: normalizeString(p.nombre),
//                 lugarLower: normalizeString(p.lugar),
//                 codigoProveedorLower: normalizeString(p.codigoProveedor),
//                 descripcionLower: normalizeString(p.descripcion),
//             }));
//             setProducts(normalized);
//         } catch (err) {
//             console.error("Error al cargar productos:", err);
//         } finally {
//             setLoading(false);
//         }
//     };


//     const handleSort = (columnKey) => {
//         if (orderBy === columnKey) {
//             setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
//         } else {
//             setOrderBy(columnKey);
//             setOrderDirection("asc");
//         }
//     };
//     //Cadena de búsqueda consecutiva 
//     // const filteredProducts = useMemo(() => {
//     //     const term = normalizeString(searchTerm);

//     //     let filtered = products;
//     //     if (term) {
//     //         filtered = products.filter(
//     //             (p) =>
//     //                 (p.nombreLower || "").includes(term) ||
//     //                 (p.lugarLower || "").includes(term) ||
//     //                 (p.codigoProveedorLower || "").includes(term) ||
//     //                 (p.descripcionLower || "").includes(term)
//     //         );
//     //     }

//     //     if (!orderBy) return filtered;

//     //     return [...filtered].sort((a, b) => { // 👈 importante clonar con spread
//     //         let valA = a[orderBy];
//     //         let valB = b[orderBy];

//     //         if (typeof valA === "string" && !isNaN(valA)) valA = Number(valA);
//     //         if (typeof valB === "string" && !isNaN(valB)) valB = Number(valB);

//     //         if (valA === undefined || valA === null) valA = "";
//     //         if (valB === undefined || valB === null) valB = "";

//     //         if (typeof valA === "number" && typeof valB === "number") {
//     //             return orderDirection === "asc" ? valA - valB : valB - valA;
//     //         }

//     //         valA = valA.toString().toLowerCase();
//     //         valB = valB.toString().toLowerCase();

//     //         if (valA < valB) return orderDirection === "asc" ? -1 : 1;
//     //         if (valA > valB) return orderDirection === "asc" ? 1 : -1;
//     //         return 0;
//     //     });
//     // }, [products, searchTerm, orderBy, orderDirection]);

//     const filteredProducts = useMemo(() => {
//         const term = normalizeString(searchTerm);

//         let filtered = products;
//         if (term) {
//             const terms = term.split(" ").filter(Boolean); // 👈 divide en palabras

//             filtered = products.filter((p) => {
//                 // concatenamos todos los campos relevantes en un solo string
//                 const haystack =
//                     `${p.nombreLower || ""} ${p.lugarLower || ""} ${p.codigoProveedorLower || ""} ${p.descripcionLower || ""}`;

//                 // normalizamos y pasamos a lowercase
//                 const normalizedHaystack = normalizeString(haystack);

//                 // verificamos que TODAS las palabras del search estén presentes
//                 return terms.every((t) => normalizedHaystack.includes(t));
//             });
//         }

//         if (!orderBy) return filtered;

//         return [...filtered].sort((a, b) => {
//             let valA = a[orderBy];
//             let valB = b[orderBy];

//             if (typeof valA === "string" && !isNaN(valA)) valA = Number(valA);
//             if (typeof valB === "string" && !isNaN(valB)) valB = Number(valB);

//             if (valA === undefined || valA === null) valA = "";
//             if (valB === undefined || valB === null) valB = "";

//             if (typeof valA === "number" && typeof valB === "number") {
//                 return orderDirection === "asc" ? valA - valB : valB - valA;
//             }

//             valA = valA.toString().toLowerCase();
//             valB = valB.toString().toLowerCase();

//             if (valA < valB) return orderDirection === "asc" ? -1 : 1;
//             if (valA > valB) return orderDirection === "asc" ? 1 : -1;
//             return 0;
//         });
//     }, [products, searchTerm, orderBy, orderDirection]);

//     const handleEditCell = async (id, field, newValue) => {
//         try {
//             const updated = await updateProduct(id, { [field]: newValue });
//             const updatedNormalized = {
//                 ...updated,
//                 nombreLower: normalizeString(updated.nombre),
//                 lugarLower: normalizeString(updated.lugar),
//                 codigoProveedorLower: normalizeString(updated.codigoProveedor),
//             };
//             setProducts((prev) =>
//                 prev.map((p) => (p.id === id ? { ...p, ...updatedNormalized } : p))
//             );
//         } catch (err) {
//             console.error("Error al actualizar:", err);
//         }
//     };

//     const handleDelete = async (product) => {
//         if (!window.confirm(`¿Eliminar producto ${product.nombre}?`)) return;
//         try {
//             await deleteProduct(product.id);
//             setProducts((prev) => prev.filter((p) => p.id !== product.id));
//         } catch (err) {
//             console.error("Error al eliminar:", err);
//         }
//     };

//     const handleSale = (product) => {
//         setSelectedProduct(product);
//         setCantidadVenta(1);
//         setPrecioVenta(0);
//         setCliente("");
//         setError("");
//         setIsModalOpen(true);
//     };


//     const confirmSale = async () => {
//         if (cantidadVenta < 1)
//             return setError("La cantidad debe ser mayor o igual a 1.");
//         if (cantidadVenta > selectedProduct.cantidad)
//             return setError("No hay suficiente stock.");

//         try {
//             let clienteId = null;

//             if (cliente) {
//                 // Buscar cliente por nombre
//                 const { data: existingClient, error: searchError } = await supabase
//                     .from("clientes")
//                     .select("id")
//                     .eq("nombre", cliente)
//                     .single();

//                 if (searchError && searchError.code !== "PGRST116") {
//                     throw searchError;
//                 }

//                 if (existingClient) {
//                     clienteId = existingClient.id;
//                 } else {
//                     // Crear nuevo cliente
//                     const { data: newClient, error: insertError } = await supabase
//                         .from("clientes")
//                         .insert([{ nombre: cliente }])
//                         .select("id")
//                         .single();

//                     if (insertError) throw insertError;
//                     clienteId = newClient.id;
//                 }

//                 // 🔹 Verificar blacklist
//                 const blacklistedIds = await getClientesBlacklisted();
//                 if (blacklistedIds.includes(clienteId)) {
//                     return setError("❌ No se puede vender a este cliente porque está en la blacklist.");
//                 }
//             }

//             // Llamamos a confirm_sale con cliente_id
//             const { data: sale, error } = await supabase.rpc("confirm_sale", {
//                 p_product_id: Number(selectedProduct.id),
//                 p_cantidad: Number(cantidadVenta),
//                 p_dia: null,
//                 p_cliente_id: clienteId,
//                 p_precio_venta: precioVenta === "" ? null : Number(precioVenta),
//             });

//             if (error) throw new Error(error.message);

//             setProducts((prev) =>
//                 prev.map((p) =>
//                     p.id === selectedProduct.id
//                         ? { ...p, cantidad: p.cantidad - cantidadVenta }
//                         : p
//                 )
//             );

//             if (sale) {
//                 setSales?.((prev) => [sale[0], ...(prev || [])]);
//             }

//             setIsModalOpen(false);
//             setIsSaleConfirmed(true);
//             setIsLote(false);
//             setSelectedIds([]);
//             setCliente("");
//         } catch (err) {
//             setError(err.message || "Error al realizar la venta.");
//         }
//     };



//     const handleCreateBatch = () => {
//         setIsLote(!isLote);
//         setSelectedIds([]);
//         setBatchProducts([]);
//         setPrecioTotalLote(0);
//     };

//     const createBatch = () => {
//         if (selectedIds.length === 0) {
//             alert("Por favor, selecciona al menos un producto para crear un lote.");
//             return;
//         }
//         const productsInBatch = products.filter((p) => selectedIds.includes(p.id));
//         setBatchProducts(productsInBatch.map((p) => ({ ...p, cantidadVenta: 1 })));
//         setIsBatchModalOpen(true);
//     };
//     useEffect(() => {
//         if (batchProducts.length === 0) return;

//         const totalUnidades = batchProducts.reduce(
//             (acc, p) => acc + (p.cantidadVenta || 1),
//             0
//         );
//         if (totalUnidades === 0) return;

//         const precioUnitario = precioTotalLote / totalUnidades;

//         setBatchProducts((prev) => {
//             let changed = false;
//             const updated = prev.map((p) => {
//                 const nuevoPrecio = Number(precioUnitario.toFixed(2));
//                 if (p.precioVenta !== nuevoPrecio) {
//                     changed = true;
//                     return { ...p, precioVenta: nuevoPrecio };
//                 }
//                 return p;
//             });
//             return changed ? updated : prev; // 👈 solo actualiza si cambió
//         });
//     }, [precioTotalLote]); // 👈 solo depende de precioTotalLote


//     const confirmBatchSale = async () => {
//         // Validar cantidades
//         for (const p of batchProducts) {
//             if (p.cantidadVenta < 1) {
//                 return setError(`La cantidad de ${p.nombre} debe ser mayor o igual a 1.`);
//             }
//             if (p.cantidadVenta > p.cantidad) {
//                 return setError(`No hay suficiente stock de ${p.nombre}.`);
//             }
//         }

//         try {
//             let clienteId = null;

//             if (cliente) {
//                 // Buscar cliente por nombre
//                 const { data: existingClient, error: searchError } = await supabase
//                     .from("clientes")
//                     .select("id")
//                     .eq("nombre", cliente)
//                     .single();

//                 if (searchError && searchError.code !== "PGRST116") {
//                     throw searchError;
//                 }

//                 if (existingClient) {
//                     clienteId = existingClient.id;
//                 } else {
//                     // Crear cliente nuevo
//                     const { data: newClient, error: insertError } = await supabase
//                         .from("clientes")
//                         .insert([{ nombre: cliente }])
//                         .select("id")
//                         .single();

//                     if (insertError) throw insertError;
//                     clienteId = newClient.id;
//                 }

//                 // 🔹 Verificar blacklist
//                 const blacklistedIds = await getClientesBlacklisted();
//                 if (blacklistedIds.includes(clienteId)) {
//                     return setError("❌ No se puede vender a este cliente porque está en la blacklist.");
//                 }
//             }

//             // Procesar cada producto del lote
//             for (const p of batchProducts) {
//                 const { data: sale, error } = await supabase.rpc("confirm_sale", {
//                     p_product_id: p.id,
//                     p_cantidad: Number(p.cantidadVenta),
//                     p_dia: null,
//                     p_cliente_id: clienteId,
//                     p_precio_venta: p.precioVenta === "" ? null : Number(p.precioVenta),
//                 });
//                 if (error) throw new Error(error.message);

//                 if (sale) {
//                     setSales((prev) => [sale[0], ...(prev || [])]);
//                 }
//             }

//             // Actualizar stock local
//             setProducts((prev) =>
//                 prev.map((p) => {
//                     const sold = batchProducts.find((bp) => bp.id === p.id);
//                     return sold ? { ...p, cantidad: p.cantidad - sold.cantidadVenta } : p;
//                 })
//             );

//             // Resetear estados
//             setIsBatchModalOpen(false);
//             setIsSaleConfirmed(true);
//             setIsLote(false);
//             setSelectedIds([]);
//             setBatchProducts([]);
//             setCliente("");
//             setPrecioTotalLote(0);
//             setError(""); // limpiar errores
//         } catch (err) {
//             setError(err.message || "Error al realizar la venta del lote.");
//         }
//     };



//     return (
//         <div className="flex flex-col items-center justify-center gap-4 p-6">
//             {loading ? (
//                 <Loading />
//             ) : (
//                 <>
//                     <h1 className="text-5xl text-center font-bold mb-4 text-blue-500">
//                         Productos de la tienda <span className="mx-4">💍</span>
//                     </h1>
//                     <div className="w-full max-w-xl mx-auto mb-4 flex flex-col gap-2">
//                         <div className="flex items-center gap-3 w-full">
//                             <SearchBar
//                                 onSearch={setSearchTerm}
//                                 placeholder="Buscar por nombre, lugar o código de proveedor..."
//                                 className="w-3/5"
//                             />

//                             {isLote ? (
//                                 <>
//                                     <button
//                                         className="w-1/7 hidden sm:flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 justify-center whitespace-nowrap"
//                                         onClick={createBatch}
//                                     >
//                                         <i className="fa-solid fa-layer-group w-5 text-white" aria-hidden="true"></i>
//                                         Lote
//                                     </button>
//                                     <button
//                                         className="w-2/7 hidden sm:flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-600 justify-center whitespace-nowrap"
//                                         onClick={handleCreateBatch}
//                                     >
//                                         <i className="fa-solid fa-xmark w-5 text-white" aria-hidden="true"></i>
//                                         Cancelar lote
//                                     </button>
//                                 </>
//                             ) : (
//                                 <>
//                                     <Link
//                                         to="/create-product"
//                                         className="sm:hidden flex items-center justify-center whitespace-nowrap bg-blue-600 hover:bg-blue-700 rounded-full p-3"
//                                     >
//                                         <i className="fa-solid fa-plus text-white"></i>
//                                     </Link>
//                                     <button
//                                         className="hidden sm:inline-flex w-1/5 items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600 justify-center whitespace-nowrap"
//                                         onClick={handleCreateBatch}
//                                     >
//                                         <i className="fa-solid fa-plus w-5 text-white" aria-hidden="true"></i>
//                                         Crear lote
//                                     </button>
//                                 </>
//                             )}
//                         </div>
//                     </div>

//                     <TableElement
//                         products={filteredProducts}
//                         onEditCell={handleEditCell}
//                         onDelete={handleDelete}
//                         onSale={handleSale}
//                         orderBy={orderBy}
//                         orderDirection={orderDirection}
//                         onSort={handleSort}
//                         onLote={createBatch}
//                         isLote={isLote}
//                         selectedIds={selectedIds}
//                         setSelectedIds={setSelectedIds}
//                         currentPage={currentPage}
//                         setCurrentPage={setCurrentPage}
//                         searchTerm={searchTerm}
//                     />

//                     {/* Modal de venta individual */}
//                     {isModalOpen && selectedProduct && (
//                         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//                             <div className="bg-white p-6 rounded-lg shadow-lg w-80">
//                                 <h2 className="text-lg font-semibold">
//                                     Charm: {selectedProduct.nombre}
//                                 </h2>
//                                 <span className="text-xs text-gray-500 mb-4">Lugar: {selectedProduct.lugar}</span>
//                                 {selectedProduct.foto && (
//                                     <img
//                                         src={selectedProduct.foto}
//                                         alt={selectedProduct.nombre}
//                                         className="w-full max-w-xs rounded-full mx-auto sm:w-48 sm:h-48 object-cover"
//                                     />
//                                 )}
//                                 <label className="block text-sm font-medium mb-1">
//                                     Cantidad a vender (Stock: {selectedProduct.cantidad})
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min="1"
//                                     value={cantidadVenta}
//                                     onChange={(e) => setCantidadVenta(Number(e.target.value))}
//                                     className="border border-gray-300 rounded-md p-2 w-full mb-2"
//                                 />
//                                 <label className="block text-sm font-medium mb-1">Nombre Cliente</label>
//                                 <input
//                                     type="text"
//                                     value={cliente}
//                                     onChange={(e) => setCliente(e.target.value)}
//                                     placeholder="John Doe"
//                                     className="border border-gray-300 rounded-md p-2 w-full mb-2"
//                                 />
//                                 <label className="block text-sm font-medium mb-1">Precio de Venta (€)</label>
//                                 <input
//                                     type="text"
//                                     value={precioVenta}
//                                     onChange={(e) => {
//                                         const value = e.target.value.replace(",", "."); // 👈 reemplaza coma por punto
//                                         setPrecioVenta(value);
//                                     }}
//                                     placeholder="Precio de venta"
//                                     className="border border-gray-300 rounded-md p-2 w-full mb-2"
//                                 />
//                                 {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
//                                 <div className="flex justify-end space-x-2">
//                                     <button
//                                         onClick={() => setIsModalOpen(false)}
//                                         className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
//                                     >
//                                         Cancelar
//                                     </button>
//                                     <button
//                                         onClick={confirmSale}
//                                         className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
//                                     >
//                                         Confirmar
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Modal de lote */}
//                     {isBatchModalOpen && (
//                         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//                             <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[95vh] overflow-y-auto">
//                                 <h2 className="text-4xl text-center font-semibold mb-4">Lote de Productos</h2>
//                                 <ul className="divide-y divide-gray-200">
//                                     {batchProducts.map((p, index) => (
//                                         <li key={p.id} className="py-2 flex flex-col gap-2">
//                                             <div className="flex items-center gap-2">
//                                                 {p.foto ? (
//                                                     <img
//                                                         src={p.foto}
//                                                         alt={p.nombre}
//                                                         className="w-16 h-16  hover:scale-140 transition-transform duration-200 object-cover rounded-full mx-2"
//                                                     />
//                                                 ) : (
//                                                     <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs  mx-2">
//                                                         No foto
//                                                     </div>
//                                                 )}
//                                                 <span className="font-medium">{p.nombre} (Stock: {p.cantidad})</span>
//                                             </div>
//                                             <span className="text-xs text-gray-500"> {p.lugar}</span>
//                                             <div className="flex gap-2">
//                                                 <input
//                                                     type="number"
//                                                     min="1"
//                                                     max={p.cantidad}
//                                                     value={p.cantidadVenta || 1}
//                                                     onChange={(e) => {
//                                                         const val = Number(e.target.value);
//                                                         setBatchProducts((prev) =>
//                                                             prev.map((prod, i) =>
//                                                                 i === index ? { ...prod, cantidadVenta: val } : prod
//                                                             )
//                                                         );
//                                                     }}
//                                                     className="border border-gray-300 rounded-md p-2 w-1/2"
//                                                     placeholder="Cantidad a vender"
//                                                 />
//                                                 <input
//                                                     type="text"
//                                                     value={p.precioVenta || ""}
//                                                     readOnly
//                                                     className="border border-gray-300 rounded-md p-2 w-1/2 bg-gray-100"
//                                                     placeholder="Precio unitario calculado"
//                                                 />
//                                             </div>
//                                         </li>
//                                     ))}
//                                 </ul>
//                                 <div className="flex flex-col sm:flex-row gap-4 mb-4 items-end">
//                                     <div className="flex-1">
//                                         <label className="block text-sm font-medium mb-1">
//                                             Nombre Cliente (opcional)
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={cliente}
//                                             onChange={(e) => setCliente(e.target.value)}
//                                             placeholder="John Doe"
//                                             className="border border-gray-300 rounded-md p-2 w-full"
//                                         />
//                                     </div>
//                                     <div className="flex-1">
//                                         <label className="block text-sm font-medium mb-1">
//                                             Precio total del lote (€)
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={precioTotalLote}
//                                             onChange={(e) => {
//                                                 const value = e.target.value.replace(",", "."); // 👈 reemplaza coma por punto
//                                                 setPrecioTotalLote((value));
//                                             }}
//                                             className="border border-gray-300 rounded-md p-2 w-full"
//                                             placeholder="Precio total del lote"
//                                         />
//                                     </div>
//                                 </div>
//                                 {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
//                                 <div className="flex justify-center text-center items-center mt-6 gap-4">
//                                     <button
//                                         onClick={() => setIsBatchModalOpen(false)}
//                                         className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md"
//                                     ><i className="fa-solid fa-xmark mx-2"></i>
//                                         Cancelar
//                                     </button>
//                                     <button
//                                         onClick={confirmBatchSale}
//                                         className="bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded-md"
//                                     ><i className="fa-solid fa-cart-shopping mx-2"></i>
//                                         Confirmar
//                                     </button>
//                                 </div>

//                             </div>
//                         </div>
//                     )}

//                     <SaleConfirmedModal
//                         isOpen={isSaleConfirmed}
//                         onClose={() => setIsSaleConfirmed(false)}
//                     />
//                 </>
//             )}
//         </div>
//     );
// };

// export default ProductsPage;

import React, { useState, useEffect, useMemo } from "react";
import TableElement from "./TableElement";
import SearchBar from "./SearchBar";
import {
    getAllProducts,
    updateProduct,
    deleteProduct,
} from "../services/productServices";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Loading from "./Loading";
import { normalizeString } from "../Constants";
import { SaleConfirmedModal } from "./SaleConfirmedModal";

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [orderBy, setOrderBy] = useState(null);
    const [orderDirection, setOrderDirection] = useState("asc");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cantidadVenta, setCantidadVenta] = useState(1);
    const [precioVenta, setPrecioVenta] = useState(0);
    const [cliente, setCliente] = useState("");
    const [error, setError] = useState("");
    const [sales, setSales] = useState([]);
    const [isSaleConfirmed, setIsSaleConfirmed] = useState(false);

    const [isLote, setIsLote] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchProducts, setBatchProducts] = useState([]);
    const [precioTotalLote, setPrecioTotalLote] = useState(0);
    const [precioUnitarioLote, setPrecioUnitarioLote] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = Number(searchParams.get("page")) || 1;
    const [currentPage, setCurrentPage] = useState(pageParam);


    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        setSearchParams({ page: currentPage });
    }, [currentPage, setSearchParams]);


    // const fetchProducts = async () => {
    //     setLoading(true);
    //     try {
    //         const data = await getAllProducts();
    //         const normalized = data.map((p) => ({
    //             ...p,
    //             nombreLower: normalizeString(p.nombre),
    //             lugarLower: normalizeString(p.lugar),
    //             codigoProveedorLower: normalizeString(p.codigoProveedor),
    //             descripcionLower: normalizeString(p.descripcion),
    //         }));
    //         setProducts(normalized);
    //     } catch (err) {
    //         console.error("Error al cargar productos:", err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const fetchProducts = async (keepSearch = false) => {
        try {
            const data = await getAllProducts();
            const normalized = data.map((p) => ({
                ...p,
                nombreLower: normalizeString(p.nombre),
                lugarLower: normalizeString(p.lugar),
                codigoProveedorLower: normalizeString(p.codigoProveedor),
                descripcionLower: normalizeString(p.descripcion),
            }));
            setProducts(normalized);
        } catch (err) {
            console.error("Error al cargar productos:", err);
        }finally {
            setLoading(false);
        }
    };



    const handleSort = (columnKey) => {
        if (orderBy === columnKey) {
            setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
        } else {
            setOrderBy(columnKey);
            setOrderDirection("asc");
        }
    };

    const filteredProducts = useMemo(() => {
        const term = normalizeString(searchTerm);
        let filtered = products;
        if (term) {
            const terms = term.split(" ").filter(Boolean);
            filtered = products.filter((p) => {
                const haystack = `${p.nombreLower || ""} ${p.lugarLower || ""} ${p.codigoProveedorLower || ""
                    } ${p.descripcionLower || ""}`;
                const normalizedHaystack = normalizeString(haystack);
                return terms.every((t) => normalizedHaystack.includes(t));
            });
        }
        if (!orderBy) return filtered;
        return [...filtered].sort((a, b) => {
            let valA = a[orderBy];
            let valB = b[orderBy];
            if (typeof valA === "string" && !isNaN(valA)) valA = Number(valA);
            if (typeof valB === "string" && !isNaN(valB)) valB = Number(valB);
            if (valA === undefined || valA === null) valA = "";
            if (valB === undefined || valB === null) valB = "";
            if (typeof valA === "number" && typeof valB === "number") {
                return orderDirection === "asc" ? valA - valB : valB - valA;
            }
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
            if (valA < valB) return orderDirection === "asc" ? -1 : 1;
            if (valA > valB) return orderDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [products, searchTerm, orderBy, orderDirection]);

    const handleEditCell = async (id, field, newValue) => {
        try {
            const updated = await updateProduct(id, { [field]: newValue });
            const updatedNormalized = {
                ...updated,
                nombreLower: normalizeString(updated.nombre),
                lugarLower: normalizeString(updated.lugar),
                codigoProveedorLower: normalizeString(updated.codigoProveedor),
            };
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updatedNormalized } : p))
            );
        } catch (err) {
            console.error("Error al actualizar:", err);
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`¿Eliminar producto ${product.nombre}?`)) return;
        try {
            await deleteProduct(product.id);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));
        } catch (err) {
            console.error("Error al eliminar:", err);
        }
    };

    const handleSale = (product) => {
        setSelectedProduct(product);
        setCantidadVenta(1);
        setPrecioVenta(product.precio || 0);
        setCliente("");
        setError("");
        setIsModalOpen(true);
    };

    // const confirmSale = async () => {
    //     if (cantidadVenta < 1)
    //         return setError("La cantidad debe ser mayor o igual a 1.");
    //     if (cantidadVenta > selectedProduct.cantidad)
    //         return setError("No hay suficiente stock.");

    //     try {
    //         let clienteId = null;
    //         if (cliente) {
    //             const { data: existingClient } = await supabase
    //                 .from("clientes")
    //                 .select("id")
    //                 .eq("nombre", cliente)
    //                 .single();
    //             if (existingClient) clienteId = existingClient.id;
    //         }

    //         const { data: sale, error } = await supabase.rpc("confirm_sale", {
    //             p_product_id: selectedProduct.id,
    //             p_cantidad: cantidadVenta,
    //             p_cliente_id: clienteId,
    //             p_precio_venta: precioVenta,
    //         });
    //         if (error) throw error;

    //         setProducts((prev) =>
    //             prev.map((p) =>
    //                 p.id === selectedProduct.id
    //                     ? { ...p, cantidad: p.cantidad - cantidadVenta }
    //                     : p
    //             )
    //         );
    //         if (sale) setSales((prev) => [sale[0], ...(prev || [])]);
    //         setIsModalOpen(false);
    //         setIsSaleConfirmed(true);
    //     } catch (err) {
    //         setError(err.message);
    //     }
    // };

    const confirmSale = async () => {
        if (cantidadVenta < 1)
            return setError("La cantidad debe ser mayor o igual a 1.");
        if (cantidadVenta > selectedProduct.cantidad)
            return setError("No hay suficiente stock.");

        try {
            let clienteId = null;

            if (cliente) {
                const { data: existingClient, error: findError } = await supabase
                    .from("clientes")
                    .select("id")
                    .eq("nombre", cliente)
                    .maybeSingle();

                if (findError) throw findError;

                if (existingClient) {
                    clienteId = existingClient.id;
                } else {
                    // 👇 crear cliente nuevo
                    const { data: newClient, error: insertError } = await supabase
                        .from("clientes")
                        .insert([{ nombre: cliente }])
                        .select("id")
                        .single();

                    if (insertError) throw insertError;
                    clienteId = newClient.id;
                }
            }

            const { data: sale, error } = await supabase.rpc("confirm_sale", {
                p_product_id: selectedProduct.id,
                p_cantidad: cantidadVenta,
                p_cliente_id: clienteId,
                p_precio_venta: precioVenta,
            });

            if (error) throw error;

            setProducts((prev) =>
                prev.map((p) =>
                    p.id === selectedProduct.id
                        ? { ...p, cantidad: p.cantidad - cantidadVenta }
                        : p
                )
            );

            if (sale) setSales((prev) => [sale[0], ...(prev || [])]);

            setIsModalOpen(false);
            setIsSaleConfirmed(true);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleCreateBatch = () => {
        setIsLote(!isLote);
        setSelectedIds([]);
        setBatchProducts([]);
        setPrecioTotalLote(0);
    };

    const createBatch = () => {
        if (selectedIds.length === 0) {
            alert("Selecciona al menos un producto para el lote.");
            return;
        }
        const productsInBatch = products.filter((p) => selectedIds.includes(p.id));
        const inicial = productsInBatch.map((p) => ({
            ...p,
            cantidadVenta: 1,
            precioVenta: p.precio,
        }));
        const total = inicial.reduce(
            (acc, p) => acc + (p.precio * (p.cantidadVenta || 1)),
            0
        );
        setBatchProducts(inicial);
        setPrecioTotalLote(total);
        setPrecioUnitarioLote(null);
        setIsBatchModalOpen(true);
    };

    const confirmBatchSale = async () => {
        try {
            // ✅ Validar productos antes de registrar la venta
            for (const p of batchProducts) {
                if (p.cantidadVenta <= 0)
                    return setError(`Cantidad inválida para ${p.nombre}`);
                if (p.cantidadVenta > p.cantidad)
                    return setError(`No hay stock suficiente para ${p.nombre}`);
            }

            // ✅ Verificar o crear cliente
            let clienteId = null;

            if (cliente) {
                const { data: existingClient, error: findError } = await supabase
                    .from("clientes")
                    .select("id")
                    .eq("nombre", cliente)
                    .maybeSingle(); // evita error si no hay coincidencias

                if (findError) throw findError;

                if (existingClient) {
                    clienteId = existingClient.id;
                } else {
                    // 👇 crea nuevo cliente si no existe
                    const { data: newClient, error: insertError } = await supabase
                        .from("clientes")
                        .insert([{ nombre: cliente }])
                        .select("id")
                        .single();

                    if (insertError) throw insertError;
                    clienteId = newClient.id;
                }
            }

            // ✅ Registrar ventas de cada producto en el lote
            for (const p of batchProducts) {
                await supabase.rpc("confirm_sale", {
                    p_product_id: p.id,
                    p_cantidad: p.cantidadVenta,
                    p_cliente_id: clienteId,
                    p_precio_venta:
                        p.cantidadVenta > 0
                            ? p.precioVenta / p.cantidadVenta
                            : p.precioVenta,
                });
            }

            // ✅ Limpiar estados y mostrar modal de confirmación
            setIsBatchModalOpen(false);
            setIsSaleConfirmed(true);
            setIsLote(false);
            setBatchProducts([]);
            setPrecioUnitarioLote(null);
            setCliente("");
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };


    return (
        <div className="flex flex-col items-center justify-center gap-4 p-6">
            {loading ? (
                <Loading />
            ) : (
                <>
                    <h1 className="text-5xl text-center font-bold mb-4 text-blue-500">
                        Productos de la tienda <span className="mx-4">💍</span>
                    </h1>
                    <div className="w-full max-w-xl mx-auto mb-4 flex flex-col gap-2">
                        <div className="flex items-center gap-3 w-full">
                            <SearchBar
                                onSearch={setSearchTerm}
                                placeholder="Buscar por nombre, lugar o código de proveedor..."
                                className="w-3/5"
                            />

                            {isLote ? (
                                <>
                                    <button
                                        className="w-1/7 hidden sm:flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 justify-center whitespace-nowrap"
                                        onClick={createBatch}
                                    >
                                        <i className="fa-solid fa-layer-group w-5 text-white" aria-hidden="true"></i>
                                        Lote
                                    </button>
                                    <button
                                        className="w-2/7 hidden sm:flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-600 justify-center whitespace-nowrap"
                                        onClick={handleCreateBatch}
                                    >
                                        <i className="fa-solid fa-xmark w-5 text-white" aria-hidden="true"></i>
                                        Cancelar lote
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/create-product"
                                        className="sm:hidden flex items-center justify-center whitespace-nowrap bg-blue-600 hover:bg-blue-700 rounded-full p-3"
                                    >
                                        <i className="fa-solid fa-plus text-white"></i>
                                    </Link>
                                    <button
                                        className="hidden sm:inline-flex w-1/5 items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600 justify-center whitespace-nowrap"
                                        onClick={handleCreateBatch}
                                    >
                                        <i className="fa-solid fa-plus w-5 text-white" aria-hidden="true"></i>
                                        Crear lote
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 📋 Tabla */}
                    <TableElement
                        products={filteredProducts}
                        onEditCell={handleEditCell}
                        onDelete={handleDelete}
                        onSale={handleSale}
                        orderBy={orderBy}
                        orderDirection={orderDirection}
                        onSort={handleSort}
                        onLote={createBatch}
                        isLote={isLote}
                        selectedIds={selectedIds}
                        setSelectedIds={setSelectedIds}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        searchTerm={searchTerm}
                    />
                    {/* Modal de venta individual */}
                    {isModalOpen && selectedProduct && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                                <h2 className="text-lg font-semibold">
                                    Charm: {selectedProduct.nombre}
                                </h2>
                                <span className="text-xs text-gray-500 mb-4">Lugar: {selectedProduct.lugar}</span>
                                {selectedProduct.foto && (
                                    <img
                                        src={selectedProduct.foto}
                                        alt={selectedProduct.nombre}
                                        className="w-full max-w-xs rounded-full mx-auto sm:w-48 sm:h-48 object-cover"
                                    />
                                )}
                                <label className="block text-sm font-medium mb-1">
                                    Cantidad a vender (Stock: {selectedProduct.cantidad})
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={cantidadVenta}
                                    onChange={(e) => setCantidadVenta(Number(e.target.value))}
                                    className="border border-gray-300 rounded-md p-2 w-full mb-2"
                                />
                                <label className="block text-sm font-medium mb-1">Nombre Cliente</label>
                                <input
                                    type="text"
                                    value={cliente}
                                    onChange={(e) => setCliente(e.target.value)}
                                    placeholder="John Doe"
                                    className="border border-gray-300 rounded-md p-2 w-full mb-2"
                                />
                                <label className="block text-sm font-medium mb-1">Precio de Venta (€)</label>
                                <input
                                    type="text"
                                    value={precioVenta}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(",", "."); // 👈 reemplaza coma por punto
                                        setPrecioVenta(value);
                                    }}
                                    placeholder="Precio de venta"
                                    className="border border-gray-300 rounded-md p-2 w-full mb-2"
                                />
                                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmSale}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* 🟢 Modal de lote */}
                    {isBatchModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[95vh] overflow-y-auto">
                                <h2 className="text-4xl text-center font-semibold mb-4">
                                    Lote de Productos
                                </h2>

                                <ul className="divide-y divide-gray-200">
                                    {batchProducts.map((p, index) => (
                                        <li key={p.id} className="py-2 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                {p.foto ? (
                                                    <img
                                                        src={p.foto}
                                                        alt={p.nombre}
                                                        className="w-16 h-16 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                                                        No foto
                                                    </div>
                                                )}
                                                <span className="font-medium">
                                                    {p.nombre} (Stock: {p.cantidad})
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500"> {p.lugar}</span>
                                            <div className="flex gap-2 mt-2">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    min="0"
                                                    value={p.cantidadVenta ?? ""}
                                                    onChange={(e) => {
                                                        const cantidad = parseFloat(
                                                            e.target.value.replace(",", ".")
                                                        );
                                                        if (isNaN(cantidad) || cantidad < 0) return;
                                                        setBatchProducts((prev) => {
                                                            const updated = prev.map((prod, i) => {
                                                                if (i === index) {
                                                                    const precioBase =
                                                                        precioUnitarioLote != null
                                                                            ? precioUnitarioLote
                                                                            : prod.precio;
                                                                    const precioVenta =
                                                                        precioBase * cantidad;
                                                                    return {
                                                                        ...prod,
                                                                        cantidadVenta: cantidad,
                                                                        precioVenta: Number(
                                                                            precioVenta.toFixed(2)
                                                                        ),
                                                                    };
                                                                }
                                                                return prod;
                                                            });
                                                            const nuevoTotal = updated.reduce(
                                                                (acc, p) =>
                                                                    acc + (p.precioVenta || 0),
                                                                0
                                                            );
                                                            setPrecioTotalLote(
                                                                Number(nuevoTotal.toFixed(2))
                                                            );
                                                            return updated;
                                                        });
                                                    }}
                                                    className="border border-gray-300 rounded-md p-2 w-1/2"
                                                />
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={p.precioVenta?.toFixed(2) ?? ""}
                                                    className="border border-gray-300 rounded-md p-2 w-1/2 bg-gray-100"
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">
                                            Nombre Cliente (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={cliente}
                                            onChange={(e) => setCliente(e.target.value)}
                                            placeholder="John Doe"
                                            className="border border-gray-300 rounded-md p-2 w-full"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">
                                            Total Lote (€)
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={precioTotalLote?.toString() || ""}
                                            onChange={(e) => {
                                                let value = e.target.value
                                                    .replace(",", ".")
                                                    .replace(/[^0-9.]/g, "");
                                                const parts = value.split(".");
                                                if (parts.length > 2)
                                                    value = parts[0] + "." + parts.slice(1).join("");
                                                if (value === "" || value.endsWith(".")) {
                                                    setPrecioTotalLote(value);
                                                    return;
                                                }
                                                const totalNum = parseFloat(value);
                                                if (isNaN(totalNum)) return;
                                                const totalUnidades = batchProducts.reduce(
                                                    (acc, p) => acc + (p.cantidadVenta || 0),
                                                    0
                                                );
                                                const nuevoUnitario =
                                                    totalUnidades > 0 ? totalNum / totalUnidades : 0;
                                                setPrecioUnitarioLote(nuevoUnitario);
                                                setPrecioTotalLote(totalNum);
                                                setBatchProducts((prev) =>
                                                    prev.map((p) => ({
                                                        ...p,
                                                        precioVenta: Number(
                                                            (nuevoUnitario * (p.cantidadVenta || 0)).toFixed(2)
                                                        ),
                                                    }))
                                                );
                                            }}
                                            onBlur={(e) => {
                                                let value = e.target.value
                                                    .replace(",", ".")
                                                    .replace(/[^0-9.]/g, "");
                                                const num = parseFloat(value);
                                                const totalOk = isNaN(num)
                                                    ? 0
                                                    : Number(num.toFixed(2));
                                                setPrecioTotalLote(totalOk);
                                                const totalUnidades = batchProducts.reduce(
                                                    (acc, p) => acc + (p.cantidadVenta || 0),
                                                    0
                                                );
                                                const nuevoUnitario =
                                                    totalUnidades > 0 ? totalOk / totalUnidades : 0;
                                                setPrecioUnitarioLote(nuevoUnitario);
                                                setBatchProducts((prev) =>
                                                    prev.map((p) => ({
                                                        ...p,
                                                        precioVenta: Number(
                                                            (nuevoUnitario * (p.cantidadVenta || 0)).toFixed(2)
                                                        ),
                                                    }))
                                                );
                                            }}
                                            className="border border-gray-300 rounded-md p-2 w-full"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-sm mb-2 text-center">
                                        {error}
                                    </p>
                                )}

                                <div className="flex justify-center text-center items-center mt-6 gap-4">
                                    <button
                                        onClick={() => setIsBatchModalOpen(false)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md"
                                    >
                                        <i className="fa-solid fa-xmark mx-2"></i>
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmBatchSale}
                                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded-md"
                                    >
                                        <i className="fa-solid fa-cart-shopping mx-2"></i>
                                        Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <SaleConfirmedModal
                        isOpen={isSaleConfirmed}
                        onClose={() => {
                            setIsSaleConfirmed(false)
                            fetchProducts(true);
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default ProductsPage;
