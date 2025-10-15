import { useEffect, useState } from "react";
import { getAllProducts } from "./services/productServices";
import { getTopLowStockProducts, listSales } from "./services/salesServices";
import { getPendienteMesAnterior, getReembolsosByCliente } from "./services/reembolsoService";

//VERSION ANTERIOR FUNCIONAL SIN DEVOLUCIONES
// export function useSalesData({ selectedMonth, year, porDinero, porCantidad }) {
//   const [loading, setLoading] = useState(false);
//   const [sales, setSales] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [salesEnriched, setSalesEnriched] = useState([]);
//   const [monthlySummary, setMonthlySummary] = useState([]);
//   const [top5, setTop5] = useState([]);
//   const [bestProduct, setBestProduct] = useState(null);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         setLoading(true);
//         const [salesRes, productsRes] = await Promise.all([
//           listSales({ limit: 5000 }),
//           getAllProducts(),
//         ]);

//         const salesData = Array.isArray(salesRes?.data) ? salesRes.data : [];
//         const allProducts = Array.isArray(productsRes) ? productsRes : [];
//         setSales(salesData);
//         setProducts(allProducts);

//         // Enriquecer ventas
//         const enriched = salesData.map((s) => {
//           const prod = allProducts.find(
//             (p) => Number(p.id) === Number(s.product_id)
//           );
//           return {
//             ...s,
//             productName: prod ? prod.nombre ?? "Desconocido" : "Desconocido",
//             foto: prod ? prod.foto ?? null : null,
//             cantidad: Number(s.cantidad ?? 0),
//             precio_venta: Number(s.precio_venta ?? 0),
//             coste_unitario: Number(prod?.precio ?? 0),
//           };
//         });
//         setSalesEnriched(enriched);

//         // Resumen mensual
//         const monthly = {};
//         for (const s of enriched) {
//           if (!s.dia) continue;
//           const mes = s.dia.slice(0, 7);
//           if (!monthly[mes])
//             monthly[mes] = { total: 0, beneficio: 0, unidades: 0 };
//           monthly[mes].total += s.cantidad * s.precio_venta;
//           monthly[mes].beneficio +=
//             s.cantidad * s.precio_venta - s.cantidad * s.coste_unitario;
//           monthly[mes].unidades += s.cantidad;
//         }
//         setMonthlySummary(
//           Object.entries(monthly)
//             .map(([mes, vals]) => ({
//               mes,
//               total: vals.total,
//               beneficio: vals.beneficio > 0 ? vals.beneficio : null,
//               unidades: vals.unidades,
//             }))
//             .sort((a, b) => a.mes.localeCompare(b.mes))
//         );

//         // Top productos del mes seleccionado
//         const monthISO = `${year}-${String(selectedMonth + 1).padStart(
//           2,
//           "0"
//         )}`;
//         const ventasMes = enriched.filter((s) => s.dia?.startsWith(monthISO));

//         const map = {};
//         for (const v of ventasMes) {
//           const pid = Number(v.product_id);
//           if (!map[pid])
//             map[pid] = {
//               unidades: 0,
//               totalDinero: 0,
//               productName: v.productName,
//               foto: v.foto,
//               productId: pid,
//             };
//           map[pid].unidades += v.cantidad;
//           map[pid].totalDinero += v.cantidad * v.precio_venta;
//         }

//         const statsArray = Object.values(map)
//           .map((x) => ({
//             ...x,
//             unidades: Number(x.unidades),
//             totalDinero: Number(x.totalDinero),
//           }))
//           .sort((a, b) =>
//             porDinero ? b.totalDinero - a.totalDinero : b.unidades - a.unidades
//           );

//         setTop5(statsArray.slice(0, 5));
//         setBestProduct(
//           statsArray[0]
//             ? {
//               productId: statsArray[0].productId,
//               nombre: statsArray[0].productName,
//               foto: statsArray[0].foto,
//               unidadesVendidas: statsArray[0].unidades,
//               totalDinero: statsArray[0].totalDinero,
//             }
//             : null
//         );
//       } catch (err) {
//         console.error("Error cargando datos:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [selectedMonth, year, porDinero, porCantidad]);

//   return {
//     loading,
//     sales,
//     products,
//     salesEnriched,
//     monthlySummary,
//     top5,
//     bestProduct,
//   };
// }

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

        // 🔹 Enriquecer ventas con datos de productos
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
            estado: s.estado ?? "normal", // 👈 por si no tiene estado, asumimos "normal"
          };
        });
        setSalesEnriched(enriched);

        // 🔹 Resumen mensual con devoluciones incluidas
        const monthly = {};

        for (const s of enriched) {
          if (!s.dia) continue;
          const mes = s.dia.slice(0, 7);
          if (!monthly[mes])
            monthly[mes] = {
              total: 0,
              beneficio: 0,
              unidades: 0,
              devoluciones: 0,
              perdidas: 0,
            };

          const importeVenta = s.cantidad * s.precio_venta;
          const beneficio = importeVenta - s.cantidad * s.coste_unitario;

          if (s.estado === "devuelta") {
            // 🔴 Venta devuelta
            monthly[mes].devoluciones += s.cantidad;
            monthly[mes].perdidas += importeVenta;
          } else {
            // 🟢 Venta activa
            monthly[mes].total += importeVenta;
            monthly[mes].beneficio += beneficio;
            monthly[mes].unidades += s.cantidad;
          }
        }

        // 🔹 Convertir en array ordenado
        setMonthlySummary(
          Object.entries(monthly)
            .map(([mes, vals]) => ({
              mes,
              total: vals.total,
              beneficio: vals.beneficio > 0 ? vals.beneficio : null,
              unidades: vals.unidades,
              devoluciones: vals.devoluciones,
              perdidas: vals.perdidas,
            }))
            .sort((a, b) => a.mes.localeCompare(b.mes))
        );

        // 🔹 Top productos del mes seleccionado
        const monthISO = `${year}-${String(selectedMonth + 1).padStart(
          2,
          "0"
        )}`;
        const ventasMes = enriched.filter((s) => s.dia?.startsWith(monthISO));

        const map = {};
        for (const v of ventasMes) {
          if (v.estado === "devuelta") continue; // 👈 no contamos devoluciones en el top
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


export function useFetchSales({ year, selectedMonth, productId, refreshKey }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [saldoMesAnterior, setSaldoMesAnterior] = useState(0);
  const [saldoMes, setSaldoMes] = useState(0);
  const [saldoTotalPendiente, setSaldoTotalPendiente] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 🔹 1. Obtener productos
        const allProducts = await getAllProducts();
        setProducts(allProducts);

        // 🔹 2. Rango de fechas del mes seleccionado
        const from = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-01T00:00:00Z`;
        const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
        const to = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}T23:59:59Z`;

        // 🔹 3. Ventas (incluyendo campo estado)
        const { data: salesData } = await listSales({
          from,
          to,
          ...(productId && { productId }),
        });

        // 🔹 4. Enlazar con productos para tener nombre/foto
        const salesWithName = salesData.map((s) => {
          const product = allProducts.find((p) => Number(p.id) === Number(s.product_id));
          return {
            ...s,
            productName: product ? product.nombre : "Desconocido",
            foto: product ? product.foto : null,
          };
        });

        // 🔹 5. Evitar duplicados
        const uniqueSalesMap = new Map();
        salesWithName.forEach((s) => uniqueSalesMap.set(s.id, s));
        const uniqueSales = [...uniqueSalesMap.values()];

        // 🔹 Guardar ventas en estado
        setSales(uniqueSales);

        // 🔹 6. Calcular saldo Carol (solo ventas activas)
        const carolSalesMes = uniqueSales.filter(
          (s) =>
            (s.clienteNombre || "").toLowerCase().includes("carol") &&
            s.estado !== "devuelta"
        );

        const totalCarolMes = carolSalesMes.reduce(
          (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
          0
        );

        // 🔹 7. Reembolsos Carol
        const reembolsos = await getReembolsosByCliente("carol");

        const reembolsosMesActual = reembolsos.filter(
          (r) =>
            r.mes_aplicado ===
            `${year}-${String(selectedMonth + 1).padStart(2, "0")}`
        );

        const totalReembolsadoMes = reembolsosMesActual.reduce(
          (acc, r) => acc + (r.monto || 0),
          0
        );

        // 🔹 8. Saldo del mes anterior
        const pendienteAnterior = await getPendienteMesAnterior(
          "carol",
          year,
          selectedMonth,
          listSales
        );
        setSaldoMesAnterior(pendienteAnterior);

        // 🔹 9. Saldo mes actual = ventas - reembolsos
        const saldoMesActual = Math.max(totalCarolMes - totalReembolsadoMes, 0);
        setSaldoMes(saldoMesActual);

        // 🔹 10. Total pendiente = anterior + actual
        const saldoTotal = pendienteAnterior + saldoMesActual;
        setSaldoTotalPendiente(saldoTotal);

      } catch (err) {
        console.error("Error en useFetchSales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, selectedMonth, productId, refreshKey]);

  return {
    loading,
    products,
    sales,
    saldoMesAnterior,
    saldoMes,
    saldoTotalPendiente,
    setSaldoMes,
    setSaldoTotalPendiente,
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

