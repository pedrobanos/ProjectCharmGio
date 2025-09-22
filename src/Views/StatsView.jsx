import { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { listSales } from "../services/salesServices";
import { getAllProducts } from "../services/productServices";
import { formatCurrency } from "../Constants";
import Loading from "../components/Loading";
import { Link } from "react-router-dom";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const StatsView = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [loading, setLoading] = useState(true);

    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesEnriched, setSalesEnriched] = useState([]);
    const [bestProduct, setBestProduct] = useState(null);
    const [top5, setTop5] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState([]);

    // Dos checkboxes: solo uno puede estar activo a la vez
    const [porDinero, setPorDinero] = useState(true);
    const [porCantidad, setPorCantidad] = useState(false);

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

                // Enriquecer ventas con nombre, foto y coste unitario
                const enriched = salesData.map((s) => {
                    const prod = allProducts.find(p => Number(p.id) === Number(s.product_id));
                    return {
                        ...s,
                        productName: prod ? (prod.nombre ?? "Desconocido") : "Desconocido",
                        foto: prod ? (prod.foto ?? null) : null,
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
                    if (!monthly[mes]) monthly[mes] = { total: 0, beneficio: 0, unidades: 0 };
                    monthly[mes].total += s.cantidad * s.precio_venta;
                    monthly[mes].beneficio += (s.cantidad * s.precio_venta - s.cantidad * s.coste_unitario);
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

                // Top productos mes seleccionado
                const monthISO = `${year}-${String(selectedMonth + 1).padStart(2, "0")}`;
                const ventasMes = enriched.filter(s => s.dia?.startsWith(monthISO));

                const map = {};
                for (const v of ventasMes) {
                    const pid = Number(v.product_id);
                    if (!map[pid]) map[pid] = { unidades: 0, totalDinero: 0, productName: v.productName, foto: v.foto, productId: pid };
                    map[pid].unidades += v.cantidad;
                    map[pid].totalDinero += v.cantidad * v.precio_venta;
                }

                const statsArray = Object.values(map)
                    .map(x => ({
                        ...x,
                        unidades: Number(x.unidades),
                        totalDinero: Number(x.totalDinero)
                    }))
                    .sort((a, b) =>
                        porDinero
                            ? b.totalDinero - a.totalDinero
                            : b.unidades - a.unidades
                    );

                setTop5(statsArray.slice(0, 5));
                setBestProduct(statsArray[0] ? {
                    productId: statsArray[0].productId,
                    nombre: statsArray[0].productName,
                    foto: statsArray[0].foto,
                    unidadesVendidas: statsArray[0].unidades,
                    totalDinero: statsArray[0].totalDinero,
                } : null);

            } catch (err) {
                console.error("Error cargando datos:", err);
            } finally { setLoading(false); }
        };

        load();
    }, [selectedMonth, year, porDinero, porCantidad]);

    if (loading) return <Loading />;

    // Manejo de checkboxes para que solo uno esté activo
    const handlePorDineroChange = (e) => {
        setPorDinero(e.target.checked);
        setPorCantidad(!e.target.checked);
    };
    const handlePorCantidadChange = (e) => {
        setPorCantidad(e.target.checked);
        setPorDinero(!e.target.checked);
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">📊 Estadísticas</h1>

            {/* Selector mes/año y checkboxes */}
            <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2">
                    <span className="text-sm">Mes:</span>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="border rounded px-2 py-1">
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                </label>
                <label className="flex items-center gap-2">
                    <span className="text-sm">Año:</span>
                    <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded px-2 py-1 w-24" />
                </label>
                <label className="flex items-center gap-1">
                    <input type="checkbox" checked={porDinero} onChange={handlePorDineroChange} />
                    <span className="text-sm">Por Beneficio (€)</span>
                </label>
                <label className="flex items-center gap-1">
                    <input type="checkbox" checked={porCantidad} onChange={handlePorCantidadChange} />
                    <span className="text-sm">Por Cantidad (unds)</span>
                </label>
            </div>

            {/* Producto del mes */}
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">⭐️ Producto del mes</h2>
                {bestProduct ? (
                    <div className="flex items-center gap-4">
                        {bestProduct.foto ? <img src={bestProduct.foto} alt={bestProduct.nombre} className="w-20 h-20 object-cover rounded-md border" /> :
                            <div className="w-20 h-20 flex items-center justify-center rounded-md border bg-gray-50 text-sm text-gray-500">Sin foto</div>}
                        <div>
                            <p className="font-medium text-lg">{bestProduct.nombre}</p>
                            <p className="text-sm text-gray-600">Unidades vendidas: <span className="font-semibold">{bestProduct.unidadesVendidas}</span></p>
                            <p className="text-sm text-gray-600">Total ingresado: <span className="font-semibold">{formatCurrency(bestProduct.totalDinero)}</span></p>
                        </div>
                    </div>
                ) : <p>No hay ventas en {MONTHS[selectedMonth]} de {year}.</p>}
            </div>

            {/* Top5 */}
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">🏆 Top 5 Ventas del mes</h3>
                {top5.length === 0 ? <p>No hay datos.</p> :
                    <ul className="space-y-2">
                        {top5.map((p, idx) => (
                            <Link key={p.productId} to={`/products/${p.productId}`} className="text-black-500 hover:text-blue-600">
                                <li key={p.productId} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50">
                                    {p.foto ? <img src={p.foto} alt={p.productName} className="w-12 h-12 object-cover rounded-md border" /> :
                                        <div className="w-12 h-12 flex items-center justify-center rounded-md border bg-gray-50 text-xs text-gray-500">--</div>}
                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between">
                                            <p className="font-medium">{p.productName}</p>
                                            <p className="text-sm text-blue-500 ">#{idx + 1}</p>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {porDinero ? formatCurrency(p.totalDinero) : `${p.unidades} unds`}
                                        </p>
                                    </div>
                                </li>
                            </Link>
                        ))}
                    </ul>
                }
            </div>

            {/* Gráfico mensual */}
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">📈 Ventas mes a mes</h2>
                {monthlySummary.length === 0 ? <p>No hay datos de ventas.</p> :
                    <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer>
                            <BarChart data={monthlySummary}>
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip formatter={v => porDinero ? formatCurrency(v) : v} />
                                <Legend />
                                <Bar dataKey={porDinero ? "total" : "unidades"} name={porDinero ? "Ingresos" : "Unidades"} fill="#8884d8" radius={[6, 6, 0, 0]} />
                                {porDinero && <Bar dataKey="beneficio" name="Beneficio" fill="#82ca9d" radius={[6, 6, 0, 0]} />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                }
            </div>

            {/* Totales */}
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                        Total unidades restantes:{" "}
                        <span className="text-blue-600">
                            {products.reduce((acc, p) => acc + (p.cantidad || 0), 0)} unds
                        </span>
                    </h3>
                    <h3 className="text-lg font-semibold text-gray-700">
                        Total unidades vendidas:{" "}
                        <span className="text-green-600">
                            {salesEnriched
                                .filter(s => s.dia?.startsWith(`${year}-${String(selectedMonth + 1).padStart(2, "0")}`))
                                .reduce((acc, s) => acc + (s.cantidad || 0), 0)}{" "}
                            unds
                        </span>
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default StatsView;



