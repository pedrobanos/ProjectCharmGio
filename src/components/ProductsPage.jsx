
import React, { useState, useEffect, useMemo } from "react";
import TableElement from "./TableElement";
import SearchBar from "./SearchBar";
import {
    getAllProducts,
    updateProduct,
    deleteProduct,
} from "../services/productServices";
import { Link } from "react-router-dom";
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


    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchProducts = async () => {
        setLoading(true);
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
        } finally {
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

    // const filteredProducts = useMemo(() => {
    //     const term = normalizeString(searchTerm);
    //     const filtered = products.filter((p) =>
    //         (p.nombreLower || "").includes(term) ||
    //         (p.lugarLower || "").includes(term) ||
    //         (p.codigoProveedorLower || "").includes(term) ||
    //         (p.descripcionLower || "").includes(term)
    //     );

    //     if (!orderBy) return filtered;

    //     return filtered.sort((a, b) => {
    //         let valA = a[orderBy];
    //         let valB = b[orderBy];

    //         if (typeof valA === "string" && !isNaN(valA)) valA = Number(valA);
    //         if (typeof valB === "string" && !isNaN(valB)) valB = Number(valB);

    //         if (valA === undefined || valA === null) valA = "";
    //         if (valB === undefined || valB === null) valB = "";

    //         if (typeof valA === "number" && typeof valB === "number") {
    //             return orderDirection === "asc" ? valA - valB : valB - valA;
    //         }

    //         valA = valA.toString().toLowerCase();
    //         valB = valB.toString().toLowerCase();

    //         if (valA < valB) return orderDirection === "asc" ? -1 : 1;
    //         if (valA > valB) return orderDirection === "asc" ? 1 : -1;
    //         return 0;
    //     });
    // }, [products, searchTerm, orderBy, orderDirection]);

    const filteredProducts = useMemo(() => {
        const term = normalizeString(searchTerm);

        let filtered = products;
        if (term) {
            filtered = products.filter(
                (p) =>
                    (p.nombreLower || "").includes(term) ||
                    (p.lugarLower || "").includes(term) ||
                    (p.codigoProveedorLower || "").includes(term) ||
                    (p.descripcionLower || "").includes(term)
            );
        }

        if (!orderBy) return filtered;

        return [...filtered].sort((a, b) => { // 👈 importante clonar con spread
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
        setPrecioVenta(0);
        setCliente("");
        setError("");
        setIsModalOpen(true);
    };

    const confirmSale = async () => {
        if (cantidadVenta < 1)
            return setError("La cantidad debe ser mayor o igual a 1.");
        if (cantidadVenta > selectedProduct.cantidad)
            return setError("No hay suficiente stock.");

        try {
            const { data: sale, error } = await supabase.rpc("confirm_sale", {
                p_product_id: Number(selectedProduct.id),
                p_cantidad: Number(cantidadVenta),
                p_dia: null,
                p_cliente: cliente || null,
                p_precio_venta: precioVenta === "" ? null : Number(precioVenta),
            });

            if (error) throw new Error(error.message);

            setProducts((prev) =>
                prev.map((p) =>
                    p.id === selectedProduct.id
                        ? { ...p, cantidad: p.cantidad - cantidadVenta }
                        : p
                )
            );

            setSales?.((prev) => [sale, ...(prev || [])]);
            setIsModalOpen(false);
            setIsSaleConfirmed(true);
            setIsLote(false);
            setSelectedIds([]);
            setCliente("");
        } catch (err) {
            setError(err.message || "Error al realizar la venta.");
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
            alert("Por favor, selecciona al menos un producto para crear un lote.");
            return;
        }
        const productsInBatch = products.filter((p) => selectedIds.includes(p.id));
        setBatchProducts(productsInBatch.map((p) => ({ ...p, cantidadVenta: 1 })));
        setIsBatchModalOpen(true);
    };

    // Recalcular precio unitario automáticamente cuando cambia precioTotalLote o cantidades
    useEffect(() => {
        if (batchProducts.length === 0) return;
        const totalUnidades = batchProducts.reduce(
            (acc, p) => acc + (p.cantidadVenta || 1),
            0
        );
        if (totalUnidades === 0) return;
        const precioUnitario = totalUnidades === 0 ? 0 : precioTotalLote / totalUnidades;
        setBatchProducts((prev) =>
            prev.map((p) => ({ ...p, precioVenta: Number(precioUnitario.toFixed(2)) }))
        );
    }, [precioTotalLote, batchProducts]);


    const confirmBatchSale = async () => {
        // Validar cantidades
        for (const p of batchProducts) {
            if (p.cantidadVenta < 1) {
                alert(`La cantidad de ${p.nombre} debe ser mayor o igual a 1.`);
                return;
            }
            if (p.cantidadVenta > p.cantidad) {
                alert(`No hay suficiente stock de ${p.nombre}.`);
                return;
            }
        }

        try {
            // Confirmar cada producto
            for (const p of batchProducts) {
                const { data: sale, error } = await supabase.rpc("confirm_sale", {
                    p_product_id: Number(p.id),
                    p_cantidad: Number(p.cantidadVenta),
                    p_dia: null,
                    p_cliente: cliente || null,
                    p_precio_venta: p.precioVenta === "" ? null : Number(p.precioVenta),
                });
                if (error) throw new Error(error.message);
                setSales((prev) => [sale, ...(prev || [])]);
            }

            // Actualizar stock local
            setProducts((prev) =>
                prev.map((p) => {
                    const sold = batchProducts.find((bp) => bp.id === p.id);
                    return sold ? { ...p, cantidad: p.cantidad - sold.cantidadVenta } : p;
                })
            );

            setIsBatchModalOpen(false);
            setIsSaleConfirmed(true);
            setIsLote(false);
            setSelectedIds([]);
            setBatchProducts([]);
            setCliente("");
            setPrecioTotalLote(0);
        } catch (err) {
            alert(err.message || "Error al realizar la venta del lote.");
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
                                <h2 className="text-lg font-semibold mb-4">
                                    Vender: {selectedProduct.nombre}
                                </h2>
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
                                    onChange={(e) => setPrecioVenta(e.target.value)}
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

                    {/* Modal de lote */}
                    {isBatchModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
                                <h2 className="text-lg font-semibold mb-4">Lote de Productos</h2>
                                <ul className="divide-y divide-gray-200">
                                    {batchProducts.map((p, index) => (
                                        <li key={p.id} className="py-2 flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                {p.foto ? (
                                                    <img
                                                        src={p.foto}
                                                        alt={p.nombre}
                                                        className="w-10 h-10 object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                                                        No foto
                                                    </div>
                                                )}
                                                <span className="font-medium">{p.nombre} (Stock: {p.cantidad})</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={p.cantidad}
                                                    value={p.cantidadVenta || 1}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setBatchProducts((prev) =>
                                                            prev.map((prod, i) =>
                                                                i === index ? { ...prod, cantidadVenta: val } : prod
                                                            )
                                                        );
                                                    }}
                                                    className="border border-gray-300 rounded-md p-2 w-1/2"
                                                    placeholder="Cantidad a vender"
                                                />
                                                <input
                                                    type="text"
                                                    value={p.precioVenta || ""}
                                                    readOnly
                                                    className="border border-gray-300 rounded-md p-2 w-1/2 bg-gray-100"
                                                    placeholder="Precio unitario calculado"
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <label className="block text-sm font-medium mb-1">
                                    Nombre Cliente (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={cliente}
                                    onChange={(e) => setCliente(e.target.value)}
                                    placeholder="John Doe"
                                    className="border border-gray-300 rounded-md p-2 w-full mb-4"
                                />
                                <label className="block text-sm font-medium mb-1">Precio total del lote (€)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={precioTotalLote}
                                    onChange={(e) => setPrecioTotalLote(Number(e.target.value))}
                                    className="border border-gray-300 rounded-md p-2 w-full mb-4"
                                    placeholder="Precio total del lote"
                                />
                                <div className="flex justify-end mt-4 gap-2">
                                    <button
                                        onClick={() => setIsBatchModalOpen(false)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmBatchSale}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                                    >
                                        Confirmar Lote
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <SaleConfirmedModal
                        isOpen={isSaleConfirmed}
                        onClose={() => setIsSaleConfirmed(false)}
                    />
                </>
            )}
        </div>
    );
};

export default ProductsPage;
