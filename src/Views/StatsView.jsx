import React, { useState, useEffect } from "react";
import { listSales } from "../services/salesServices";
import { getAllProducts } from "../services/productServices";
import Loading from "../components/Loading";

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const COLS = [
    "w-16",     // Foto
    "w-[40%]",  // Producto más grande
    "w-[10%]",  // Cantidad
    "w-[10%]",  // Cliente
    "w-[15%]",  // Precio
    "w-[20%]",  // Fecha
];

const StatsView = ({ productId }) => {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const year = new Date().getFullYear();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Traer productos
                const allProducts = await getAllProducts();
                setProducts(allProducts);

                // Rango del mes
                const from = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-01`;
                const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
                const to = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}`;

                // Traer ventas filtradas
                const { data: salesData } = await listSales({ from, to, productId });

                // Relacionar product_id con product.nombre y foto
                const salesWithName = salesData.map(s => {
                    const product = allProducts.find(p => Number(p.id) === Number(s.product_id));
                    return {
                        ...s,
                        productName: product ? product.nombre : "Desconocido",
                        foto: product ? product.foto : null
                    };
                });

                setSales(salesWithName);
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

    // Calcular total de ventas del mes
    const totalVentas = sales.reduce((acc, s) => acc + (s.cantidad || 0), 0);

    // Calcular total de productos restantes sumando todas las cantidades de products
    const totalRestantes = products.reduce((acc, product) => acc + product.cantidad, 0)

    return (
        <div className="max-w-screen-lg mx-auto p-4 space-y-6">
            <h2 className="text-4xl text-center font-bold mb-6 mt-6">
                Ventas de {MONTHS[selectedMonth]} - {year}
            </h2>
            {/* Botones de meses */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                {MONTHS.map((name, index) => (
                    <button
                        key={name}
                        onClick={() => setSelectedMonth(index)}
                        className={`px-3 py-2 rounded-lg border font-semibold transition
              ${selectedMonth === index
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-blue-100"
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>
            {/* Tabla de ventas */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm sm:text-base border border-gray-200">
                    <colgroup>
                        {COLS.map((cls, i) => (
                            <col key={i} className={cls} />
                        ))}
                    </colgroup>
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm">
                        <tr>
                            <th className="px-2 py-2 text-center">Foto</th>
                            <th className="px-2 py-2 text-center">Producto</th>
                            <th className="px-2 py-2 text-center">Cantidad</th>
                            <th className="px-2 py-2 text-center">Cliente</th>
                            <th className="px-2 py-2 text-center">Precio Venta</th>
                            <th className="px-2 py-2 text-center">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                        {sales.map(s => (
                            <tr key={s.id} className="text-center">
                                <td className="px-2 py-3">
                                    {s.foto ? (
                                        <img
                                            src={s.foto}
                                            alt={s.productName}
                                            className="h-10 w-10 object-cover rounded-full mx-auto"
                                        />
                                    ) : (
                                        <span className="text-xs">Sin foto</span>
                                    )}
                                </td>
                                <td className="px-2 py-2 break-words whitespace-normal text-left">
                                    {s.productName}
                                </td>
                                <td className="px-2 py-2 text-green-600 font-bold">{s.cantidad}</td>
                                <td className="px-2 py-2">{s.cliente || "-"}</td>
                                <td className="px-2 py-2">
                                    {s.precio_venta != null ? `${s.precio_venta} €` : "-"}
                                </td>
                                <td className="px-2 py-2">{new Date(s.created_at).toLocaleString("es-ES")}</td>
                            </tr>
                        ))}

                        {sales.length > 0 && (
                            <>
                                {/* Total de ventas */}
                                <tr className="bg-gray-100 font-bold text-gray-800">
                                    <td colSpan={2} className="px-2 py-2 text-start">
                                        Total de ventas en {MONTHS[selectedMonth]} de {year}:
                                    </td>
                                    <td className="px-2 py-2 text-start text-green-600">{totalVentas} unds</td>
                                    <td colSpan={3}></td>
                                </tr>

                                {/* Total de productos restantes */}
                                <tr className="bg-gray-100 font-bold text-gray-800">
                                    <td colSpan={2} className="px-2 py-2 text-start">
                                        Total de productos restantes:
                                    </td>
                                    <td className="px-2 py-2 text-blue-600 ">{totalRestantes} unds</td>
                                    <td colSpan={3}></td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StatsView;
