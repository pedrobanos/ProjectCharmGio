import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { formatCurrency, MONTHS } from "../Constants";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";
import { Link } from "react-router-dom";
import { useSalesData } from "../hooks";


const StatsView = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    // Solo una métrica activa a la vez
    const [porDinero, setPorDinero] = useState(true);
    const [porCantidad, setPorCantidad] = useState(false);

    const {
        loading,
        sales,
        products,
        salesEnriched,
        monthlySummary,
        top5,
        bestProduct,
    } = useSalesData({ year, selectedMonth, porDinero, porCantidad });

    if (loading) return <Loading />;

    // Checkboxes exclusivos
    const handlePorDineroChange = (e) => {
        setPorDinero(e.target.checked);
        setPorCantidad(!e.target.checked);
    };
    const handlePorCantidadChange = (e) => {
        setPorCantidad(e.target.checked);
        setPorDinero(!e.target.checked);
    };

    // Totales del mes actual
    const monthISO = `${year}-${String(selectedMonth + 1).padStart(2, "0")}`;
    const totalVendidas = salesEnriched
        .filter(
            (s) =>
                s.dia?.startsWith(monthISO) &&
                s.estado !== "devuelta" // 👈 excluimos devoluciones
        )
        .reduce((acc, s) => acc + (s.cantidad || 0), 0);

    const totalDevueltas = salesEnriched
        .filter(
            (s) =>
                s.dia?.startsWith(monthISO) &&
                s.estado === "devuelta"
        )
        .reduce((acc, s) => acc + (s.cantidad || 0), 0);

    const totalRestantes = products.reduce((acc, p) => acc + (p.cantidad || 0), 0);

    const SectionTitle = ({ icon, color, children }) => (
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2.5 text-gray-900">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${color}`}>
                <i className={icon}></i>
            </span>
            {children}
        </h2>
    );

    return (
        <div className="w-full max-w-6xl mx-auto px-1 sm:px-2 pb-10 space-y-5">
            <PageHeader
                icon="fa-solid fa-chart-simple"
                tone="pink"
                title="Estadísticas"
                subtitle={`${MONTHS[selectedMonth]} de ${year}`}
                className="mb-2"
            />

            {/* Selector mes/año */}
            <div className="flex flex-wrap gap-3 sm:gap-5 items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-3">
                <label className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">
                        <i className="fa-regular fa-calendar mr-1.5 text-gray-400"></i>Mes:
                    </span>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i}>
                                {m}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">
                        <i className="fa-solid fa-calendar-days mr-1.5 text-gray-400"></i>Año:
                    </span>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-2 py-1.5 w-24"
                    />
                </label>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                    <label
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer ${
                            porDinero ? "bg-pink-700 text-white" : "bg-white text-gray-600"
                        }`}
                    >
                        <input type="checkbox" className="sr-only" checked={porDinero} onChange={handlePorDineroChange} />
                        <i className="fa-solid fa-euro-sign"></i> Por beneficio
                    </label>
                    <label
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer ${
                            porCantidad ? "bg-pink-700 text-white" : "bg-white text-gray-600"
                        }`}
                    >
                        <input type="checkbox" className="sr-only" checked={porCantidad} onChange={handlePorCantidadChange} />
                        <i className="fa-solid fa-boxes-stacked"></i> Por cantidad
                    </label>
                </div>
            </div>

            {/* Totales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    ["fa-solid fa-cart-shopping", "bg-green-600", "Unidades vendidas", `${totalVendidas} uds`, "text-green-700"],
                    ["fa-solid fa-arrow-rotate-left", "bg-red-600", "Devoluciones", `${totalDevueltas} uds`, "text-red-700"],
                    ["fa-solid fa-boxes-stacked", "bg-blue-600", "Unidades en stock", `${totalRestantes} uds`, "text-blue-700"],
                ].map(([icon, bg, label, value, color]) => (
                    <div key={label} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex items-center gap-3">
                        <span className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg ${bg}`}>
                            <i className={icon}></i>
                        </span>
                        <div>
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Producto del mes */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                    <SectionTitle icon="fa-solid fa-star" color="bg-amber-500">Producto del mes</SectionTitle>
                    {bestProduct ? (
                        <div className="flex items-center gap-4">
                            {bestProduct.foto ? (
                                <img
                                    src={bestProduct.foto}
                                    alt={bestProduct.nombre}
                                    className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                                />
                            ) : (
                                <div className="w-24 h-24 flex items-center justify-center rounded-xl border bg-gray-50 text-gray-300">
                                    <i className="fa-solid fa-image text-2xl"></i>
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-lg text-gray-900">{bestProduct.nombre}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <i className="fa-solid fa-boxes-stacked mr-1.5 text-gray-400"></i>
                                    Unidades vendidas: <span className="font-semibold">{bestProduct.unidadesVendidas}</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    <i className="fa-solid fa-sack-dollar mr-1.5 text-gray-400"></i>
                                    Total ingresado:{" "}
                                    <span className="font-semibold">{formatCurrency(bestProduct.totalDinero)}</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">No hay ventas en {MONTHS[selectedMonth]} de {year}.</p>
                    )}
                </div>

                {/* Top5 */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                    <SectionTitle icon="fa-solid fa-trophy" color="bg-yellow-500">Top 5 ventas del mes</SectionTitle>
                    {top5.length === 0 ? (
                        <p className="text-gray-500">No hay datos.</p>
                    ) : (
                        <ul className="space-y-1">
                            {top5.map((p, idx) => (
                                <li key={p.productId}>
                                    <Link
                                        to={`/products/${p.productId}`}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50"
                                    >
                                        <span
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                idx === 0
                                                    ? "bg-amber-400 text-white"
                                                    : idx === 1
                                                    ? "bg-gray-300 text-gray-800"
                                                    : idx === 2
                                                    ? "bg-orange-300 text-white"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            {idx + 1}
                                        </span>
                                        {p.foto ? (
                                            <img
                                                src={p.foto}
                                                alt={p.productName}
                                                className="w-11 h-11 object-cover rounded-lg border border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-gray-50 text-gray-300">
                                                <i className="fa-solid fa-image"></i>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{p.productName}</p>
                                            <p className="text-sm text-gray-500">
                                                {porDinero ? formatCurrency(p.totalDinero) : `${p.unidades} uds`}
                                            </p>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-300 text-xs"></i>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Gráfico mensual */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                <SectionTitle icon="fa-solid fa-chart-column" color="bg-pink-700">Ventas mes a mes</SectionTitle>
                {monthlySummary.length === 0 ? (
                    <p className="text-gray-500">No hay datos de ventas.</p>
                ) : (
                    <div style={{ width: "100%", height: 320 }}>
                        <ResponsiveContainer>
                            <BarChart data={monthlySummary}>
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip formatter={(v) => (porDinero ? formatCurrency(v) : v)} />
                                <Legend />
                                <Bar
                                    dataKey={porDinero ? "total" : "unidades"}
                                    name={porDinero ? "Ingresos" : "Unidades"}
                                    fill="#8884d8"
                                    radius={[6, 6, 0, 0]}
                                />
                                {porDinero && (
                                    <Bar dataKey="beneficio" name="Beneficio" fill="#82ca9d" radius={[6, 6, 0, 0]} />
                                )}
                                <Bar
                                    dataKey={porDinero ? "perdidas" : "devoluciones"}
                                    name={porDinero ? "Pérdidas por devoluciones (€)" : "Devoluciones (unds)"}
                                    fill="rgba(239,68,68,0.7)"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsView;
