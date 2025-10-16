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

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-5xl font-bold mb-8 text-center text-blue-500">📊 Estadísticas</h1>
            {/* Selector mes/año */}
            <div className="flex gap-4 items-center justify-center">
                <label className="flex items-center gap-2">
                    <span className="text-sm">Mes:</span>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="border rounded px-2 py-1"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i}>
                                {m}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-2">
                    <span className="text-sm">Año:</span>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border rounded px-2 py-1 w-24"
                    />
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
                        {bestProduct.foto ? (
                            <img
                                src={bestProduct.foto}
                                alt={bestProduct.nombre}
                                className="w-20 h-20 object-cover rounded-md border"
                            />
                        ) : (
                            <div className="w-20 h-20 flex items-center justify-center rounded-md border bg-gray-50 text-sm text-gray-500">
                                Sin foto
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-lg">{bestProduct.nombre}</p>
                            <p className="text-sm text-gray-600">
                                Unidades vendidas: <span className="font-semibold">{bestProduct.unidadesVendidas}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Total ingresado:{" "}
                                <span className="font-semibold">{formatCurrency(bestProduct.totalDinero)}</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <p>No hay ventas en {MONTHS[selectedMonth]} de {year}.</p>
                )}
            </div>

            {/* Top5 */}
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">🏆 Top 5 Ventas del mes</h3>
                {top5.length === 0 ? (
                    <p>No hay datos.</p>
                ) : (
                    <ul className="space-y-2">
                        {top5.map((p, idx) => (
                            <Link key={p.productId} to={`/products/${p.productId}`} className="text-black-500 hover:text-blue-600">
                                <li className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50">
                                    {p.foto ? (
                                        <img
                                            src={p.foto}
                                            alt={p.productName}
                                            className="w-12 h-12 object-cover rounded-md border"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 flex items-center justify-center rounded-md border bg-gray-50 text-xs text-gray-500">
                                            --
                                        </div>
                                    )}
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
                )}
            </div>

            {/* Gráfico mensual */}
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">📈 Ventas mes a mes</h2>
                {monthlySummary.length === 0 ? (
                    <p>No hay datos de ventas.</p>
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

            {/* Totales */}
            <div className="rounded-2xl border bg-white shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                        Total unidades vendidas:{" "}
                        <span className="text-green-600">
                            {totalVendidas} unds
                        </span>
                    </h3>
                    <h3 className="text-lg font-semibold text-gray-700">
                        Total devoluciones:{" "}
                        <span className="text-red-600">
                            {totalDevueltas} unds
                        </span>
                    </h3>
                    <h3 className="text-lg font-semibold text-gray-700">
                        Total unidades restantes:{" "}
                        <span className="text-blue-600">
                            {products.reduce((acc, p) => acc + (p.cantidad || 0), 0)} unds
                        </span>
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default StatsView;
