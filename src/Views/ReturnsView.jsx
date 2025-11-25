import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Loading from "../components/Loading";

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
        <div className="max-w-6xl mx-22 space-y-6 p-6" >
            <h1 className="text-5xl mb-8 mt-9 font-bold text-center text-red-600 ">
                Productos devueltos
            </h1>

            <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2">Foto</th>
                            <th className="px-4 py-2">Producto</th>
                            <th className="px-4 py-2">Cliente</th>
                            <th className="px-4 py-2">Cantidad</th>
                            <th className="px-4 py-2">Precio Unit.</th>
                            <th className="px-4 py-2">Total Devuelto</th>
                            <th className="px-4 py-2">Beneficio Revertido</th>
                            <th className="px-4 py-2">Fecha</th>
                            <th className="px-4 py-2">Motivo</th>
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
        </div>
    );
};

export default ReturnsView;
