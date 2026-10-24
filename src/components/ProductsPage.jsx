import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import VentaIndividualModal from "./VentaIndivualModal";
import VentaLoteModal from "./VentaLoteModal";
import PageHeader from "./PageHeader";
import PlatformIcon from "./PlatformIcon";
import {
    getListingAccounts,
    getActiveListings,
    groupListingsByProduct,
    updateListingStatus,
    listingsToRemoveAfterSale,
} from "../services/listingsServices";

const ProductsPage = ({ userRole }) => {
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

    // 📣 Anuncios (Vinted / Wallapop)
    const [listingAccounts, setListingAccounts] = useState([]);
    const [activeListings, setActiveListings] = useState([]);
    const [selectedListingId, setSelectedListingId] = useState("");
    // Filtro por anuncios: "todos" | "anunciados" | "sin" | "Vinted" | "Wallapop" | "acc:<id>"
    const [listingFilter, setListingFilter] = useState("todos");
    const [soldListing, setSoldListing] = useState(null);
    const [listingsToReview, setListingsToReview] = useState([]);

    const listingsByProduct = useMemo(
        () => groupListingsByProduct(activeListings, listingAccounts),
        [activeListings, listingAccounts]
    );

    const fetchListings = useCallback(async () => {
        try {
            const [accounts, listings] = await Promise.all([
                getListingAccounts(),
                getActiveListings(),
            ]);
            setListingAccounts(accounts);
            setActiveListings(listings);
        } catch (err) {
            // Si aún no existe la tabla "listings", la app sigue funcionando sin anuncios
            console.warn("No se pudieron cargar los anuncios:", err?.message || err);
        }
    }, []);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    // Tras una venta: marca el anuncio vendido y calcula qué anuncios hay que borrar
    const reviewListingsAfterSale = async (items) => {
        const toReview = [];
        let sold = null;
        for (const { product, cantidadVendida, saleId, listingId } of items) {
            const prodListings = listingsByProduct[String(product.id)] || [];
            if (listingId) {
                const listing = prodListings.find((l) => String(l.id) === String(listingId));
                try {
                    await updateListingStatus(listingId, "vendido", saleId ?? null);
                    if (listing) sold = { ...listing, product };
                } catch (err) {
                    console.error("No se pudo marcar el anuncio como vendido:", err);
                }
            }
            const others = prodListings.filter((l) => String(l.id) !== String(listingId));
            const remaining = Number(product.cantidad) - Number(cantidadVendida);
            listingsToRemoveAfterSale(remaining, others).forEach((l) =>
                toReview.push({ ...l, product })
            );
        }
        setSoldListing(sold);
        setListingsToReview(toReview);
        fetchListings();
    };

    const handleRetireListing = async (listing) => {
        try {
            await updateListingStatus(listing.id, "retirado");
            setListingsToReview((prev) => prev.filter((l) => l.id !== listing.id));
            fetchListings();
        } catch (err) {
            console.error("No se pudo retirar el anuncio:", err);
            alert("No se pudo actualizar el anuncio. Inténtalo de nuevo.");
        }
    };




    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        setSearchParams({ page: currentPage });
    }, [currentPage, setSearchParams]);

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
        } finally {
            setLoading(false);
        }
    };



    const handleSort = (columnKey) => {
        if (orderBy === columnKey) {
            setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
        } else {
            setOrderBy(columnKey);
            // "Plataforma anuncio": la primera vez, los anunciados arriba
            setOrderDirection(columnKey === "anuncios" ? "desc" : "asc");
        }
    };

    const filteredProducts = useMemo(() => {
        const term = normalizeString(searchTerm);
        let filtered = products;
        if (term) {
            const terms = term.split(" ").filter(Boolean);
            filtered = products.filter((p) => {
                const cuentas = (listingsByProduct[String(p.id)] || [])
                    .map((l) => `${l.account.username || ""} ${l.account.platform || ""}`)
                    .join(" ");
                const haystack = `${p.nombreLower || ""} ${p.lugarLower || ""} ${p.codigoProveedorLower || ""
                    } ${p.descripcionLower || ""} ${p.proveedor || ""} ${cuentas}`;
                const normalizedHaystack = normalizeString(haystack);
                return terms.every((t) => normalizedHaystack.includes(t));
            });
        }
        if (listingFilter !== "todos") {
            filtered = filtered.filter((p) => {
                const pl = listingsByProduct[String(p.id)] || [];
                if (listingFilter === "anunciados") return pl.length > 0;
                if (listingFilter === "sin") return pl.length === 0;
                if (listingFilter.startsWith("acc:")) {
                    const id = listingFilter.slice(4);
                    return pl.some((l) => String(l.account_id) === id);
                }
                return pl.some((l) => l.account.platform === listingFilter);
            });
        }
        if (!orderBy) return filtered;
        if (orderBy === "anuncios") {
            // Ordena por nº de anuncios activos; a igualdad, por plataforma/cuenta y nombre
            const info = (p) => {
                const pl = listingsByProduct[String(p.id)] || [];
                const first = pl
                    .map((l) => `${l.account.platform} ${l.account.username || ""}`.toLowerCase())
                    .sort()[0] || "";
                return { n: pl.length, first };
            };
            const dir = orderDirection === "asc" ? 1 : -1;
            return [...filtered].sort((a, b) => {
                const ia = info(a);
                const ib = info(b);
                if (ia.n !== ib.n) return (ia.n - ib.n) * dir;
                if (ia.first !== ib.first) return ia.first.localeCompare(ib.first, "es");
                return String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
            });
        }
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
    }, [products, searchTerm, orderBy, orderDirection, listingFilter, listingsByProduct]);

    // Contadores para los filtros de anuncios
    const listingCounts = useMemo(() => {
        const c = { todos: products.length, anunciados: 0, sin: 0, Vinted: 0, Wallapop: 0 };
        for (const p of products) {
            const pl = listingsByProduct[String(p.id)] || [];
            if (pl.length) c.anunciados += 1;
            else c.sin += 1;
            if (pl.some((l) => l.account.platform === "Vinted")) c.Vinted += 1;
            if (pl.some((l) => l.account.platform === "Wallapop")) c.Wallapop += 1;
        }
        return c;
    }, [products, listingsByProduct]);

    const changeListingFilter = (value) => {
        setListingFilter(value);
        setCurrentPage(1);
    };

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
        // Si solo está publicado en una cuenta, se preselecciona ese anuncio
        const prodListings = listingsByProduct[String(product.id)] || [];
        setSelectedListingId(prodListings.length === 1 ? String(prodListings[0].id) : "");
        setIsModalOpen(true);
    };

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

            const saleRow = Array.isArray(sale) ? sale[0] : sale;
            if (saleRow) setSales((prev) => [saleRow, ...(prev || [])]);

            await reviewListingsAfterSale([
                {
                    product: selectedProduct,
                    cantidadVendida: cantidadVenta,
                    saleId: saleRow?.id,
                    listingId: selectedListingId || null,
                },
            ]);

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
            // 📣 Avisar de anuncios que hay que borrar
            await reviewListingsAfterSale(
                batchProducts.map((p) => ({
                    product: p,
                    cantidadVendida: p.cantidadVenta,
                    saleId: null,
                    listingId: null,
                }))
            );
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
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            {loading ? (
                <Loading />
            ) : (
                <>
                    <PageHeader
                        icon="fa-solid fa-gem"
                        tone="red"
                        title="Productos de la tienda"
                        subtitle={`${products.length} productos · ${listingCounts.anunciados} anunciados`}
                        className="max-w-7xl px-1 mb-2"
                    />
                    <div className="w-full max-w-5xl mx-auto mb-2 flex flex-col gap-3">
                        <div className="flex items-center gap-3 w-full">
                            <SearchBar
                                onSearch={setSearchTerm}
                                placeholder="Buscar por nombre, lugar o código de proveedor..."
                            />
                            {/* === SOLO ADMIN VE LOS BOTONES === */}
                            {userRole === "admin" ? (
                                isLote ? (
                                    <>
                                        {/* Botón "Lote" */}
                                        <button
                                            className="w-1/7 hidden sm:flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 justify-center whitespace-nowrap"
                                            onClick={createBatch}
                                        >
                                            <i className="fa-solid fa-layer-group w-5 text-white" aria-hidden="true"></i>
                                            Lote
                                        </button>

                                        {/* Botón "Cancelar lote" */}
                                        <button
                                            className="w-1/6 hidden sm:flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-600 justify-center whitespace-nowrap"
                                            onClick={handleCreateBatch}
                                        >
                                            <i className="fa-solid fa-xmark w-5 text-white" aria-hidden="true"></i>
                                            Cancelar lote
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* Botón móvil */}
                                        <Link
                                            to="/create-product"
                                            className="sm:hidden flex items-center justify-center whitespace-nowrap bg-blue-600 hover:bg-blue-700 rounded-full p-3"
                                        >
                                            <i className="fa-solid fa-plus text-white"></i>
                                        </Link>

                                        {/* Botón escritorio */}
                                        <button
                                            className="hidden sm:inline-flex w-1/7 items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-600 justify-center whitespace-nowrap"
                                            onClick={handleCreateBatch}
                                        >
                                            <i className="fa-solid fa-plus w-5 text-white" aria-hidden="true"></i>
                                            Crear lote
                                        </button>
                                    </>
                                )
                            ) : <Link
                                to="/create-product"
                                className=" flex items-center justify-center whitespace-nowrap bg-blue-600 hover:bg-blue-700 rounded-full p-3"
                            >
                                <i className="fa-solid fa-plus text-white"></i>
                            </Link>}
                        </div>

                        {/* 📣 Filtro por anuncios */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1.5">
                                <i className="fa-solid fa-bullhorn"></i>
                                Anuncios:
                            </span>
                            {[
                                ["todos", "Todos", <i key="i" className="fa-solid fa-layer-group"></i>],
                                ["anunciados", "Anunciados", <i key="i" className="fa-solid fa-circle-check text-teal-600"></i>],
                                ["sin", "Sin anunciar", <i key="i" className="fa-regular fa-circle text-gray-400"></i>],
                                ["Vinted", "Vinted", <PlatformIcon key="i" platform="Vinted" size={15} />],
                                ["Wallapop", "Wallapop", <PlatformIcon key="i" platform="Wallapop" size={15} />],
                            ].map(([key, label, icon]) => {
                                const active = listingFilter === key;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => changeListingFilter(key)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition ${
                                            active
                                                ? "bg-gray-900 text-white border-gray-900"
                                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        {icon}
                                        {label}
                                        <span className={`text-xs rounded-full px-1.5 ${active ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                                            {listingCounts[key]}
                                        </span>
                                    </button>
                                );
                            })}
                            {listingAccounts.length > 0 && (
                                <select
                                    value={listingFilter.startsWith("acc:") ? listingFilter : ""}
                                    onChange={(e) => changeListingFilter(e.target.value || "todos")}
                                    className={`rounded-full border px-3 py-1.5 text-sm bg-white ${
                                        listingFilter.startsWith("acc:") ? "border-gray-900" : "border-gray-200"
                                    }`}
                                    title="Ver los anunciados en una cuenta"
                                >
                                    <option value="">👤 Por cuenta…</option>
                                    {listingAccounts.map((a) => (
                                        <option key={a.id} value={`acc:${a.id}`}>
                                            {a.platform} · {a.username || a.mail || `Cuenta ${a.id}`}
                                        </option>
                                    ))}
                                </select>
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
                        userRole={userRole}
                        listingsByProduct={listingsByProduct}
                        listingAccounts={listingAccounts}
                        onListingsChanged={fetchListings}
                    />
                    {/* Modal de venta individual */}
                    {isModalOpen && selectedProduct && (
                        <VentaIndividualModal
                            isOpen={isModalOpen}
                            selectedProduct={selectedProduct}
                            cantidadVenta={cantidadVenta}
                            setCantidadVenta={setCantidadVenta}
                            cliente={cliente}
                            setCliente={setCliente}
                            precioVenta={precioVenta}
                            setPrecioVenta={setPrecioVenta}
                            error={error}
                            confirmSale={confirmSale}
                            setIsModalOpen={setIsModalOpen}
                            productListings={listingsByProduct[String(selectedProduct.id)] || []}
                            selectedListingId={selectedListingId}
                            setSelectedListingId={setSelectedListingId}
                        />
                    )}
                    {/* 🟢 Modal de lote */}
                    {isBatchModalOpen && (
                        <VentaLoteModal
                            isOpen={isBatchModalOpen}
                            batchProducts={batchProducts}
                            setBatchProducts={setBatchProducts}
                            cliente={cliente}
                            setCliente={setCliente}
                            precioTotalLote={precioTotalLote}
                            setPrecioTotalLote={setPrecioTotalLote}
                            precioUnitarioLote={precioUnitarioLote}
                            setPrecioUnitarioLote={setPrecioUnitarioLote}
                            confirmBatchSale={confirmBatchSale}
                            setIsBatchModalOpen={setIsBatchModalOpen}
                            error={error}
                        />
                    )}

                    <SaleConfirmedModal
                        isOpen={isSaleConfirmed}
                        soldListing={soldListing}
                        listingsToReview={listingsToReview}
                        onRetireListing={handleRetireListing}
                        onClose={() => {
                            setIsSaleConfirmed(false)
                            setSoldListing(null);
                            setListingsToReview([]);
                            fetchProducts(true);
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default ProductsPage;





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
