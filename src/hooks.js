import { useEffect, useState } from "react";
import { getAllProducts } from "./services/productServices";
import { getTopLowStockProducts, listSales } from "./services/salesServices";
import { getReembolsosByCliente } from "./services/reembolsoService";


export function useSalesData({ selectedMonth, year, porDinero, porCantidad }) {
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesEnriched, setSalesEnriched] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [top5, setTop5] = useState([]);
    const [bestProduct, setBestProduct] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [salesRes, productsRes] = await Promise.all([
                    listSales({ limit: 5000 }),
                    getAllProducts(),
                ]);

                const salesData = Array.isArray(salesRes?.data) ? salesRes.data : [];
                const allProducts = Array.isArray(productsRes) ? productsRes : [];
                setSales(salesData);
                setProducts(allProducts);

                // Enriquecer ventas
                const enriched = salesData.map((s) => {
                    const prod = allProducts.find(
                        (p) => Number(p.id) === Number(s.product_id)
                    );
                    return {
                        ...s,
                        productName: prod ? prod.nombre ?? "Desconocido" : "Desconocido",
                        foto: prod ? prod.foto ?? null : null,
                        cantidad: Number(s.cantidad ?? 0),
                        precio_venta: Number(s.precio_venta ?? 0),
                        coste_unitario: Number(prod?.precio ?? 0),
                    };
                });
                setSalesEnriched(enriched);

                // Resumen mensual
                const monthly = {};
                for (const s of enriched) {
                    if (!s.dia) continue;
                    const mes = s.dia.slice(0, 7);
                    if (!monthly[mes])
                        monthly[mes] = { total: 0, beneficio: 0, unidades: 0 };
                    monthly[mes].total += s.cantidad * s.precio_venta;
                    monthly[mes].beneficio +=
                        s.cantidad * s.precio_venta - s.cantidad * s.coste_unitario;
                    monthly[mes].unidades += s.cantidad;
                }
                setMonthlySummary(
                    Object.entries(monthly)
                        .map(([mes, vals]) => ({
                            mes,
                            total: vals.total,
                            beneficio: vals.beneficio > 0 ? vals.beneficio : null,
                            unidades: vals.unidades,
                        }))
                        .sort((a, b) => a.mes.localeCompare(b.mes))
                );

                // Top productos del mes seleccionado
                const monthISO = `${year}-${String(selectedMonth + 1).padStart(
                    2,
                    "0"
                )}`;
                const ventasMes = enriched.filter((s) => s.dia?.startsWith(monthISO));

                const map = {};
                for (const v of ventasMes) {
                    const pid = Number(v.product_id);
                    if (!map[pid])
                        map[pid] = {
                            unidades: 0,
                            totalDinero: 0,
                            productName: v.productName,
                            foto: v.foto,
                            productId: pid,
                        };
                    map[pid].unidades += v.cantidad;
                    map[pid].totalDinero += v.cantidad * v.precio_venta;
                }

                const statsArray = Object.values(map)
                    .map((x) => ({
                        ...x,
                        unidades: Number(x.unidades),
                        totalDinero: Number(x.totalDinero),
                    }))
                    .sort((a, b) =>
                        porDinero ? b.totalDinero - a.totalDinero : b.unidades - a.unidades
                    );

                setTop5(statsArray.slice(0, 5));
                setBestProduct(
                    statsArray[0]
                        ? {
                            productId: statsArray[0].productId,
                            nombre: statsArray[0].productName,
                            foto: statsArray[0].foto,
                            unidadesVendidas: statsArray[0].unidades,
                            totalDinero: statsArray[0].totalDinero,
                        }
                        : null
                );
            } catch (err) {
                console.error("Error cargando datos:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [selectedMonth, year, porDinero, porCantidad]);

    return {
        loading,
        sales,
        products,
        salesEnriched,
        monthlySummary,
        top5,
        bestProduct,
    };
}

// export function useFetchSales({ year, selectedMonth, productId }) {
//     const [loading, setLoading] = useState(false);
//     const [products, setProducts] = useState([]);
//     const [sales, setSales] = useState([]);
//     const [saldoMes, setSaldoMes] = useState(0);
//     const [saldoTotalPendiente, setSaldoTotalPendiente] = useState(0);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 // 🔹 Productos
//                 const allProducts = await getAllProducts();
//                 setProducts(allProducts);
//                 // 🔹 Rango de fechas (mes actual)
//                 const from = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-01T00:00:00Z`;
//                 const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
//                 const to = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}T23:59:59Z`;
//                 // 🔹 Ventas del mes actual (opcionalmente por producto)
//                 const { data: salesData } = await listSales({
//                     from,
//                     to,
//                     ...(productId && { productId }),
//                 });
//                 const salesWithName = salesData.map((s) => {
//                     const product = allProducts.find(
//                         (p) => Number(p.id) === Number(s.product_id)
//                     );
//                     return {
//                         ...s,
//                         productName: product ? product.nombre : "Desconocido",
//                         foto: product ? product.foto : null,
//                     };
//                 });
//                 // 🔹 Evitar duplicados
//                 const uniqueSalesMap = new Map();
//                 salesWithName.forEach((s) => uniqueSalesMap.set(s.id, s));
//                 const uniqueSales = [...uniqueSalesMap.values()];
//                 setSales(uniqueSales);
//                 // Helpers fechas
//                 const inRange = (date, startISO, endISO) =>
//                     date >= new Date(startISO) && date <= new Date(endISO);
//                 const getRDate = (r) => new Date(r?.created_at || r?.fecha || r?.date);
//                 // 🔹 Ventas Carol (solo mes actual)
//                 const carolSalesMes = uniqueSales.filter((s) =>
//                     (s.clienteNombre || "").toLowerCase().includes("carol")
//                 );
//                 //cambiar
//                 const totalCarolMes = carolSalesMes.reduce(
//                     (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
//                     0
//                 );
//                 // 🔹 Reembolsos Carol (filtrados por mes actual)
//                 const reembolsos = await getReembolsosByCliente("carol");
//                 const reembolsosMes = reembolsos.filter((r) => {
//                     const d = getRDate(r);
//                     return !isNaN(d) && inRange(d, from, to);
//                 });
//                 const totalReembolsadoMes = reembolsosMes.reduce(
//                     (acc, r) => acc + (r.monto || 0),
//                     0
//                 );
//                 // 🔹 Saldo del mes actual (ventas del mes - reembolsos del mes)
//                 const saldoMesActual = Math.max(totalCarolMes - totalReembolsadoMes, 0);
//                 setSaldoMes(saldoMesActual);
//                 // 🔹 Saldo acumulado hasta fin de mes seleccionado
//                 const fromYear = `${year}-01-01T00:00:00Z`;
//                 const { data: ventasYear } = await listSales({
//                     from: fromYear,
//                     to,
//                     ...(productId && { productId }), // si estás filtrando por producto, respétalo
//                 });
//                 //cam
//                 const ventasCarolYear = ventasYear.filter((s) =>
//                     (s.clienteNombre || "").toLowerCase().includes("carol")
//                 );
//                 const totalCarolYear = ventasCarolYear.reduce(
//                     (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
//                     0
//                 );
//                 // Reembolsos acumulados desde 1/enero hasta "to"
//                 const reembolsosYear = reembolsos.filter((r) => {
//                     const d = getRDate(r);
//                     return !isNaN(d) && inRange(d, fromYear, to);
//                 });
//                 const totalReembolsadoYear = reembolsosYear.reduce(
//                     (acc, r) => acc + (r.monto || 0),
//                     0
//                 );
//                 const saldoPendienteTotal = Math.max(
//                     totalCarolYear - totalReembolsadoYear,
//                     0
//                 );
//                 setSaldoTotalPendiente(saldoPendienteTotal);
//             } catch (err) {
//                 console.error("Error en useFetchSales:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [year, selectedMonth, productId]);

//     return {
//         loading,
//         products,
//         sales,
//         saldoMes,
//         saldoTotalPendiente,
//         setSaldoMes,
//         setSaldoTotalPendiente,
//     };
// }

export function useFetchSales({ year, selectedMonth, productId }) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [saldoMes, setSaldoMes] = useState(0);
    const [saldoTotalPendiente, setSaldoTotalPendiente] = useState(0);

    // 🔹 Función reutilizable
    const fetchData = async () => {
        try {
            setLoading(true);

            // 🔸 1. Obtener productos
            const allProducts = await getAllProducts();
            setProducts(allProducts);

            // 🔸 2. Calcular fechas de rango
            const from = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-01T00:00:00Z`;
            const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
            const to = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}T23:59:59Z`;

            // 🔸 3. Ventas del mes actual
            const { data: salesData } = await listSales({
                from,
                to,
                ...(productId && { productId }),
            });

            const salesWithName = salesData.map((s) => {
                const product = allProducts.find(
                    (p) => Number(p.id) === Number(s.product_id)
                );
                return {
                    ...s,
                    productName: product ? product.nombre : "Desconocido",
                    foto: product ? product.foto : null,
                };
            });

            // Evitar duplicados
            const uniqueSalesMap = new Map();
            salesWithName.forEach((s) => uniqueSalesMap.set(s.id, s));
            const uniqueSales = [...uniqueSalesMap.values()];
            setSales(uniqueSales);

            // Helpers de fecha
            const inRange = (date, startISO, endISO) =>
                date >= new Date(startISO) && date <= new Date(endISO);
            const getRDate = (r) => new Date(r?.created_at || r?.fecha || r?.date);

            // 🔸 4. Ventas de Carol (mes actual)
            const carolSalesMes = uniqueSales.filter((s) =>
                (s.clienteNombre || "").toLowerCase().includes("carol")
            );
            const totalCarolMes = carolSalesMes.reduce(
                (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
                0
            );

            // 🔸 5. Reembolsos (todos y por mes)
            const reembolsos = await getReembolsosByCliente("carol");

            const reembolsosMes = reembolsos.filter((r) => {
                const d = getRDate(r);
                return !isNaN(d) && inRange(d, from, to);
            });
            const totalReembolsadoMes = reembolsosMes.reduce(
                (acc, r) => acc + (r.monto || 0),
                0
            );

            // 🔸 6. Saldo del mes actual
            const saldoMesActual = Math.max(totalCarolMes - totalReembolsadoMes, 0);
            setSaldoMes(saldoMesActual);

            // 🔸 7. Saldo acumulado (año completo hasta "to")
            const fromYear = `${year}-01-01T00:00:00Z`;
            const { data: ventasYear } = await listSales({
                from: fromYear,
                to,
                ...(productId && { productId }),
            });

            const ventasCarolYear = ventasYear.filter((s) =>
                (s.clienteNombre || "").toLowerCase().includes("carol")
            );
            const totalCarolYear = ventasCarolYear.reduce(
                (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
                0
            );

            const reembolsosYear = reembolsos.filter((r) => {
                const d = getRDate(r);
                return !isNaN(d) && inRange(d, fromYear, to);
            });
            const totalReembolsadoYear = reembolsosYear.reduce(
                (acc, r) => acc + (r.monto || 0),
                0
            );

            // 🔸 8. Saldo total pendiente (acumulado)
            const saldoPendienteTotal = Math.max(
                totalCarolYear - totalReembolsadoYear,
                0
            );
            setSaldoTotalPendiente(saldoPendienteTotal);
        } catch (err) {
            console.error("Error en useFetchSales:", err);
        } finally {
            setLoading(false);
        }
    };

    // Ejecutar al montar y cuando cambie el mes/año/producto
    useEffect(() => {
        fetchData();
    }, [year, selectedMonth, productId]);

    return {
        loading,
        products,
        sales,
        saldoMes,
        saldoTotalPendiente,
        setSaldoMes,
        setSaldoTotalPendiente,
        refetch: fetchData, // ✅ permite recargar datos desde el componente
    };
}



export function useLowStockProducts(enabled) {
    const [loading, setLoading] = useState(false);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!enabled) return; // si no está activado el checkbox, no llamamos al servicio

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getTopLowStockProducts();
                setLowStockProducts(data);
            } catch (err) {
                console.error("Error cargando productos con stock bajo:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [enabled]);

    return { loading, lowStockProducts, error };
}

