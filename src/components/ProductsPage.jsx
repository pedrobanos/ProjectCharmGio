
import React, { useState, useEffect, useMemo } from "react";
import TableElement from "./TableElement";
import SearchBar from "./SearchBar";
import {
    getAllProducts,
    updateProduct,
    deleteProduct,
} from "../services/productServices";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { createSale } from "../services/salesServices";
import { diaMadridYYYYMMDD } from "../Constants";
import { supabase } from "../supabaseClient";

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cantidadVenta, setCantidadVenta] = useState(1);
    const [precioVenta, setPrecioVenta] = useState(0); // nuevo estado para precio de venta
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [sales, setSales] = useState([]); // para añadir ventas localmente
    const [cliente, setCliente] = useState("");
    const location = useLocation();
    const navigate = useNavigate();


    // Estado para ordenamiento
    const [orderBy, setOrderBy] = useState(null);
    const [orderDirection, setOrderDirection] = useState("asc");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await getAllProducts();
            setProducts(data);
        } catch (err) {
            console.error("Error al cargar productos:", err);
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
        const term = searchTerm.toLowerCase();
        return products.filter((p) => {
            // Buscamos en todos estos campos
            return (
                (p.nombre?.toLowerCase().includes(term)) ||
                (p.lugar?.toLowerCase().includes(term)) ||
                (String(p.precio).toLowerCase().includes(term)) ||
                (p.proveedor?.toLowerCase().includes(term)) ||
                (p.codigoProveedor?.toLowerCase().includes(term)) ||
                (p.url?.toLowerCase().includes(term))
            );
        }).sort((a, b) => {
            if (!orderBy) return 0;

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
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
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
        setError("");
        setIsModalOpen(true);
    };


    // const confirmSale = async () => {
    //     if (cantidadVenta < 1) return setError("La cantidad debe ser mayor o igual a 1.");
    //     if (cantidadVenta > selectedProduct.cantidad)
    //         return setError("No hay suficiente stock.");

    //     try {
    //         const updated = await updateProduct(selectedProduct.id, {
    //             cantidad: selectedProduct.cantidad - cantidadVenta,
    //         });

    //         setProducts((prev) =>
    //             prev.map((p) =>
    //                 p.id === selectedProduct.id ? { ...p, ...updated } : p
    //             )
    //         );
    //         setIsModalOpen(false);
    //     } catch (err) {
    //         console.error("Error en venta:", err);
    //         setError("Error al realizar la venta.");
    //     }
    // };
    // const confirmSale = async () => {
    //     if (cantidadVenta < 1)
    //         return setError("La cantidad debe ser mayor o igual a 1.");
    //     if (cantidadVenta > selectedProduct.cantidad)
    //         return setError("No hay suficiente stock.");

    //     try {
    //         // 1) Llama a la RPC transaccional (crea fila en sales + descuenta stock de products)
    //         const { data: sale, error } = await supabase.rpc("confirm_sale", {
    //             p_product_id: Number(selectedProduct.id), // bigint
    //             p_cantidad: Number(cantidadVenta),        // integer
    //             p_dia: null,                              // o diaMadridYYYYMMDD()
    //         });

    //         if (error) {
    //             console.error("RPC error:", error);
    //             throw new Error(error.message); // muestra el error real
    //         }

    //         // 2) Refresca el estado local de productos (descuenta stock en UI)
    //         setProducts(prev =>
    //             prev.map(p =>
    //                 p.id === selectedProduct.id
    //                     ? { ...p, cantidad: p.cantidad - cantidadVenta }
    //                     : p
    //             )
    //         );

    //         // 3) (Opcional) añade la venta al estado local
    //         setSales?.(prev => [sale, ...(prev || [])]);

    //         setIsModalOpen(false);
    //         setError(null);
    //     } catch (err) {
    //         console.error("Error en venta:", err);
    //         setError(err.message || "Error al realizar la venta.");
    //     }
    // };

    const confirmSale = async () => {
        if (cantidadVenta < 1)
            return setError("La cantidad debe ser mayor o igual a 1.");
        if (cantidadVenta > selectedProduct.cantidad)
            return setError("No hay suficiente stock.");

        try {
            const { data: sale, error } = await supabase.rpc("confirm_sale", {
                p_product_id: Number(selectedProduct.id), // bigint
                p_cantidad: Number(cantidadVenta),        // integer
                p_dia: null,                              // o tu diaMadridYYYYMMDD()
                p_cliente: cliente || null,               // 👈 pasa el cliente (puede ser null)
                p_precio_venta: Number(precioVenta) || null,      // 👈 pasa el precio de venta (puede ser null)
            });

            if (error) {
                console.error("RPC error:", error);
                throw new Error(error.message);
            }

            // UI reactiva
            setProducts(prev =>
                prev.map(p =>
                    p.id === selectedProduct.id
                        ? { ...p, cantidad: p.cantidad - cantidadVenta }
                        : p
                )
            );

            setSales?.(prev => [sale, ...(prev || [])]);
            setIsModalOpen(false);
            setCliente("");
            setCantidadVenta(1);
            setPrecioVenta(0); // reset precio de venta
            setError(null);
        } catch (err) {
            console.error("Error en venta:", err);
            setError(err.message || "Error al realizar la venta.");
        }
    };


    return (
        <div className="flex flex-col items-center justify-center gap-4 p-6">
            <h1 className="text-5xl text-center font-bold mb-4 text-blue-500">
                Productos de la tienda <span className="mx-4">💍</span>
            </h1>
            <div className="flex items-center space-x-3 w-full max-w-xl mx-auto">
                <SearchBar
                    onSearch={setSearchTerm}
                    placeholder="Buscar por nombre, proveedor, código, URL, lugar o precio..."
                />
                <Link
                    to="/create-product"
                    className="sm:hidden flex items-center justify-center whitespace-nowrap
             bg-blue-600 hover:bg-blue-700 rounded-full p-3"
                >
                    <i className="fa-solid fa-plus text-white"></i>
                </Link>


            </div>

            <TableElement
                products={filteredProducts}
                onEditCell={handleEditCell}
                onDelete={handleDelete}
                onSale={handleSale}
                orderBy={orderBy}
                orderDirection={orderDirection}
                onSort={handleSort}
            />

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
                        <label className="block text-sm font-medium mb-1">
                            Nombre Cliente
                        </label>
                        <input
                            type="text"
                            value={cliente}
                            onChange={(e) => setCliente(e.target.value)}
                            placeholder="John Doe"
                            className="border border-gray-300 rounded-md p-2 w-full mb-2"
                        />
                        <label className="block text-sm font-medium mb-1">
                            Precio de Venta (€)
                        </label>
                        <input
                            type="text"
                            value={precioVenta}
                            onChange={(e) => setPrecioVenta(e.target.value)}
                            placeholder="Nombre del cliente"
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
        </div>
    );
};

export default ProductsPage;
