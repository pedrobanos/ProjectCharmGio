// import React, { useState, useEffect } from "react";
// import { listSales } from "../services/salesServices";
// import { getAllProducts } from "../services/productServices";
// import Loading from "../components/Loading";
// import SearchBar from "../components/SearchBar";

// const MONTHS = [
//     "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
//     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
// ];

// const COLS = [
//     "w-16",     // Foto
//     "w-[40%]",  // Producto más grande
//     "w-[10%]",  // Cantidad
//     "w-[10%]",  // Cliente
//     "w-[15%]",  // Precio
//     "w-[20%]",  // Fecha
// ];

// const SalesView = ({ productId }) => {
//     const [sales, setSales] = useState([]);
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//     const year = new Date().getFullYear();

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);

//                 // Traer productos
//                 const allProducts = await getAllProducts();
//                 setProducts(allProducts);

//                 // Rango del mes
//                 const from = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
//                 const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
//                 const to = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}`;

//                 // Traer ventas filtradas
//                 const { data: salesData } = await listSales({ from, to, productId });

//                 // Relacionar product_id con product.nombre y foto
//                 const salesWithName = salesData.map(s => {
//                     const product = allProducts.find(p => Number(p.id) === Number(s.product_id));
//                     return {
//                         ...s,
//                         productName: product ? product.nombre : "Desconocido",
//                         foto: product ? product.foto : null
//                     };
//                 });

//                 setSales(salesWithName);
//             } catch (err) {
//                 console.error("Error al cargar ventas/productos:", err);
//                 setSales([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [selectedMonth, productId, year]);

//     if (loading) return <Loading />;

//     // Calcular total de ventas del mes
//     const totalVentas = sales.reduce((acc, s) => acc + (s.cantidad || 0), 0);

//     // Calcular total de productos restantes sumando todas las cantidades de products
//     const totalRestantes = products.reduce((acc, product) => acc + product.cantidad, 0)

//     const beneficio = sales.reduce((acc, s) => {
//         const product = products.find(p => Number(p.id) === Number(s.product_id));
//         if (product && s.precio_venta != null) {
//             return acc + (s.precio_venta - product.precio) * s.cantidad;
//         }
//         return acc;
//     }, 0);

//     return (
//         <div className="max-w-screen-lg mx-auto p-4 space-y-6">
//             <h1 className="text-5xl text-center font-bold mb-8 text-blue-500">
//                 Ventas de {MONTHS[selectedMonth]} - {year}
//             </h1>
//             {/* Botones de meses */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
//                 {MONTHS.map((name, index) => (
//                     <button
//                         key={name}
//                         onClick={() => setSelectedMonth(index)}
//                         className={`px-3 py-2 rounded-lg border font-semibold transition
//               ${selectedMonth === index
//                                 ? "bg-blue-600 text-white"
//                                 : "bg-gray-100 hover:bg-blue-100"
//                             }`}
//                     >
//                         {name}
//                     </button>
//                 ))}
//             </div>
//             {/* Tabla de ventas */}
//             <div className="flex justify-center w-1/2 mb-4 ">
//                 <input type="select" value={productId || ""} readOnly
//                     className="border pl-3 pr-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold"
//                 >
//                     {productId ? `Producto ID: ${productId}` : "Todas las ventas"}
//                 </input>
//             </div>
//             <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-md">
//                 <table className="min-w-full border-collapse text-sm sm:text-base">
//                     <colgroup>
//                         {COLS.map((cls, i) => (
//                             <col key={i} className={cls} />
//                         ))}
//                     </colgroup>

//                     {/* Cabecera */}
//                     <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
//                         <tr>
//                             <th className="px-2 py-2 text-center">Foto</th>
//                             <th className="px-2 py-2 text-center">Producto</th>
//                             <th className="px-2 py-2 text-center">Cantidad</th>
//                             <th className="px-2 py-2 text-center">Cliente</th>
//                             <th className="px-2 py-2 text-center">Precio Venta</th>
//                             <th className="px-2 py-2 text-center">Fecha</th>
//                         </tr>
//                     </thead>
//                     {/* Datos con scroll */}
//                     <tbody className="divide-y divide-gray-200 text-gray-800">
//                         {sales.map((s) => (
//                             <tr key={s.id} className="text-center">
//                                 <td className="px-2 py-3">
//                                     {s.foto ? (
//                                         <img
//                                             src={s.foto}
//                                             alt={s.productName}
//                                             className="h-10 w-10 object-cover rounded-full mx-auto"
//                                         />
//                                     ) : (
//                                         <span className="text-xs">Sin foto</span>
//                                     )}
//                                 </td>
//                                 <td className="px-2 py-2 break-words whitespace-normal text-left">
//                                     {s.productName}
//                                 </td>
//                                 <td className="px-2 py-2 text-green-600 font-bold">{s.cantidad}</td>
//                                 <td className="px-2 py-2">{s.cliente || "-"}</td>
//                                 <td className="px-2 py-2">
//                                     {s.precio_venta != null ? `${s.precio_venta} €` : "-"}
//                                 </td>
//                                 <td className="px-2 py-2">
//                                     {new Date(s.created_at).toLocaleString("es-ES")}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                     {/* Totales fijos al final */}
//                     {/* {sales.length > 0 && (
//                         <tfoot className="bg-gray-100 font-bold text-gray-800 sticky bottom-0">
//                             <tr className="border-t border-gray-300">
//                                 <td colSpan={2} className="px-2 py-2 text-start">
//                                     Total de ventas en {MONTHS[selectedMonth]} de {year}:
//                                 </td>
//                                 <td className="px-2 py-2 text-start text-green-600">
//                                     {totalVentas} unds
//                                 </td>
//                                 <td colSpan={3}></td>
//                             </tr>

//                             <tr className="border-t border-gray-300">
//                                 <td colSpan={2} className="px-2 py-2 text-start">
//                                     Total de productos restantes:
//                                 </td>
//                                 <td className="px-2 py-2 text-blue-600">
//                                     {totalRestantes} unds
//                                 </td>
//                                 <td colSpan={3}></td>
//                             </tr>

//                             <tr className="border-t border-gray-300">
//                                 <td colSpan={2} className="px-2 py-2 text-start">
//                                     Beneficio:
//                                 </td>
//                                 <td className="px-2 py-2 text-blue-600">
//                                     {beneficio.toFixed(2)} €
//                                 </td>
//                                 <td colSpan={3}></td>
//                             </tr>
//                         </tfoot>
//                     )} */}
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default SalesView;
import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { listSales } from "../services/salesServices";
import { getAllProducts } from "../services/productServices";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const SalesView = ({ productId }) => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [filterBy, setFilterBy] = useState("todos");

    const year = new Date().getFullYear();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Traemos todos los productos
                const allProducts = await getAllProducts();
                setProducts(allProducts);

                // Rango de fechas exacto por created_at
                const from = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-01T00:00:00Z`;
                const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
                const to = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}T23:59:59Z`;

                // Traemos ventas
                const { data: salesData } = await listSales({ from, to, ...(productId && { productId }) });

                // Mapeamos con nombre y foto del producto
                const salesWithName = salesData.map(s => {
                    const product = allProducts.find(p => Number(p.id) === Number(s.product_id));
                    return {
                        ...s,
                        productName: product ? product.nombre : "Desconocido",
                        foto: product ? product.foto : null
                    };
                });

                // 🔹 Eliminar posibles duplicados por ID
                const uniqueSalesMap = new Map();
                salesWithName.forEach(s => uniqueSalesMap.set(s.id, s));
                const uniqueSales = [...uniqueSalesMap.values()];

                console.log("Ventas recibidas del backend (totales):", salesWithName.length);
                console.log("Ventas únicas por ID:", uniqueSales.length); // Debe mostrar 116

                setSales(uniqueSales);

            } catch (err) {
                console.error("Error al cargar ventas/productos:", err);
                setSales([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth, productId, year]);

    if (loading) return <Loading />;

    // Filtrado por cliente
    const filteredSales = sales.filter(s => {
        const cliente = (s.cliente || "").toLowerCase().trim();
        const esGio = cliente.includes("gio");
        const esCarol = cliente.includes("carol");

        if (filterBy === "gio") return esGio;
        if (filterBy === "carol") return esCarol;
        if (filterBy === "otros") return !esGio && !esCarol;
        return true;
    });

    // Totales generales
    const totalVentas = filteredSales.reduce((acc, s) => acc + (s.cantidad || 0), 0);

    // Beneficio general (excluyendo Carol)
    const beneficioTotal = filteredSales
        .filter(s => !(s.cliente || "").toLowerCase().includes("carol"))
        .reduce((acc, s) => {
            const product = products.find(p => Number(p.id) === Number(s.product_id));
            if (product && s.precio_venta != null) {
                return acc + (s.precio_venta - (product.precio || 0)) * s.cantidad;
            }
            return acc;
        }, 0);

    // Ventas de Carol
    const carolSales = filteredSales.filter(s => (s.cliente || "").toLowerCase().includes("carol"));
    const totalCarolImporte = carolSales.reduce((acc, s) => acc + ((s.precio_venta || 0) * (s.cantidad || 0)), 0);

    return (
        <div className="max-w-screen-lg mx-auto p-4 space-y-6">
            <h1 className="text-5xl text-center font-bold mb-8 text-blue-500">
                Ventas de {MONTHS[selectedMonth]} - {year}
            </h1>

            {/* Botones de meses */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                {MONTHS.map((name, index) => (
                    <button
                        key={name}
                        onClick={() => setSelectedMonth(index)}
                        className={`px-3 py-2 rounded-lg border font-semibold transition ${selectedMonth === index ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-blue-100"}`}
                    >{name}</button>
                ))}
            </div>

            {/* Filtro cliente */}
            <div className="flex flex-col w-1/2 mb-4">
                <label htmlFor="filtroCliente" className="mb-1 font-semibold text-gray-700">Vendido por:</label>
                <select
                    id="filtroCliente"
                    value={filterBy}
                    onChange={e => setFilterBy(e.target.value)}
                    className="border pl-3 pr-3 py-2 w-1/2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                    <option value="todos">Todos</option>
                    <option value="gio">Gio</option>
                    <option value="carol">Carol</option>
                    <option value="otros">Pedro</option>
                </select>
            </div>

            {/* Tabla de ventas */}
            <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-md">
                <table className="table-fixed min-w-full border-collapse text-sm sm:text-base">
                    <colgroup>
                        <col className="w-16" />
                        <col className="w-52" />
                        <col className="w-10" />
                        <col className="w-10" />
                        <col className="w-24" />
                    </colgroup>
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
                        <tr>
                            <th className="px-2 py-2 text-center">Foto</th>
                            <th className="px-2 py-2 text-center">Producto</th>
                            <th className="px-2 py-2 text-center">Cantidad</th>
                            <th className="px-2 py-2 text-center">Precio Venta</th>
                            <th className="px-2 py-2 text-center">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                        {filteredSales.map(s => (
                            <tr key={s.id} className="text-center">
                                <td className="px-2 py-3">{s.foto ? <img src={s.foto} alt={s.productName} className="h-10 w-10 object-cover rounded-full mx-auto" /> : <span className="text-xs">Sin foto</span>}</td>
                                <td className="px-2 py-2 break-words whitespace-normal text-left">{s.productName}</td>
                                <td className="px-2 py-2 text-green-600 font-bold">{s.cantidad}</td>
                                <td className="px-2 py-2">{s.precio_venta != null ? `${s.precio_venta} €` : "-"}</td>
                                <td className="px-2 py-2 text-left">{new Date(s.created_at).toLocaleString("es-ES")}</td>
                            </tr>
                        ))}
                    </tbody>

                   
                        <tfoot className="bg-gray-100 font-bold text-gray-800 sticky bottom-0">
                            {/* Total de unidades */}
                            <tr className="border-t border-gray-300">
                                <td colSpan={2} className="px-2 py-2 text-start">Total de ventas:</td>
                                <td className="px-2 py-2 text-start text-blue-600">{totalVentas} unds</td>
                                <td colSpan={2}></td>
                            </tr>
                            {/* Beneficio para clientes normales */}
                            {filteredSales.some(s => !(s.cliente || "").toLowerCase().includes("carol")) && (
                                <tr className="border-t border-gray-300">
                                    <td colSpan={2} className="px-2 py-2 text-start">Beneficio:</td>
                                    <td className={`px-2 py-2 text-start ${beneficioTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {beneficioTotal.toFixed(2)} €
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            )}
                            {/* Total a abonar solo para Carol */}
                            {filteredSales.some(s => (s.cliente || "").toLowerCase().includes("carol")) && (
                                <tr className="border-t border-gray-300">
                                    <td colSpan={2} className="px-2 py-2 text-start">Total a abonar:</td>
                                    <td className="px-2 py-2 text-start text-blue-600">{totalCarolImporte.toFixed(2)} €</td>
                                    <td colSpan={2}></td>
                                </tr>
                            )}
                        </tfoot>
                </table>
            </div>
        </div>
    );
};

export default SalesView;
