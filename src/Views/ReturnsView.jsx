import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Loading from "../components/Loading";
import PageHeader from "../components/PageHeader";

const ReturnsView = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReturns = async () => {
            const { data, error } = await supabase
                .from("returns")
                .select(`
          id,
          sale_id,
          product_id,
          cantidad,
          precio_unitario,
          total_devuelto,
          beneficio_revertido,
          fecha_devolucion,
          motivo,
          products ( nombre, foto ),
          clientes ( nombre )
        `)
                .order("fecha_devolucion", { ascending: false });

            if (error) console.error(error);
            setReturns(data || []);
            setLoading(false);
        };

        fetchReturns();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="w-full max-w-6xl mx-auto px-1 sm:px-2 pb-10">
            <PageHeader
                icon="fa-solid fa-arrow-rotate-left"
                tone="gray"
                title="Productos devueltos"
                subtitle={`${returns.length} devoluciones`}
            />

            {returns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                    <i className="fa-solid fa-box-open text-3xl text-gray-300 mb-3 block"></i>
                    No hay devoluciones.
                </div>
            ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm bg-white">
                <table className="min-w-[900px] w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-image mr-1.5 text-gray-400"></i>Foto</th>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-gem mr-1.5 text-gray-400"></i>Producto</th>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-user mr-1.5 text-gray-400"></i>Cliente</th>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-boxes-stacked mr-1.5 text-gray-400"></i>Cantidad</th>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-tag mr-1.5 text-gray-400"></i>Precio unit.</th>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-money-bill-wave mr-1.5 text-gray-400"></i>Total devuelto</th>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-chart-line mr-1.5 text-gray-400"></i>Beneficio revertido</th>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-calendar-day mr-1.5 text-gray-400"></i>Fecha</th>
                            <th className="px-4 py-2.5"><i className="fa-solid fa-comment mr-1.5 text-gray-400"></i>Motivo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                        {returns.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 text-center">
                                <td className="px-2 py-2">
                                    {r.products?.foto ? (
                                        <img
                                            src={r.products.foto}
                                            alt={r.products.nombre}
                                            className="h-12 w-12 object-cover rounded-full mx-auto"
                                        />
                                    ) : (
                                        <span>-</span>
                                    )}
                                </td>
                                <td className="px-4 py-2">{r.products?.nombre || "-"}</td>
                                <td className="px-4 py-2">{r.clientes?.nombre || "-"}</td>
                                <td className="px-4 py-2 text-blue-600 font-bold">{r.cantidad}</td>
                                <td className="px-4 py-2">{r.precio_unitario} €</td>
                                <td className="px-4 py-2 text-red-600 font-bold">{r.total_devuelto} €</td>
                                <td className="px-4 py-2 text-yellow-700">{r.beneficio_revertido?.toFixed(2)} €</td>
                                <td className="px-4 py-2">
                                    {new Date(r.fecha_devolucion).toLocaleString("es-ES")}
                                </td>
                                <td className="px-4 py-2">{r.motivo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
};

export default ReturnsView;
