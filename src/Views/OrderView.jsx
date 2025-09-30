
// import React, { useEffect, useState } from "react";

// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { getTopLowStockProducts } from "../services/salesServices";


// const OrderView = () => {
//   const [products, setProducts] = useState([]);
//   const [pedido, setPedido] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 🔹 Cargar productos
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);
//         const data = await getTopLowStockProducts();
//         setProducts(data);
//       } catch (err) {
//         console.error("Error cargando productos:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   // 🔹 Manejar cantidades
//   const handleCantidadChange = (product, cantidad) => {
//     setPedido((prev) => {
//       const exists = prev.find((item) => item.id === product.id);
//       if (exists) {
//         return prev.map((item) =>
//           item.id === product.id ? { ...item, cantidad } : item
//         );
//       } else {
//         return [...prev, { id: product.id, nombre: product.nombre, foto: product.foto, cantidad }];
//       }
//     });
//   };

//   // 🔹 Exportar a PDF
//   const exportPedidoPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.text("Hoja de Pedido", 14, 20);

//     const tableHead = [["Producto", "Cantidad"]];
//     const tableBody = pedido
//       .filter((p) => p.cantidad > 0)
//       .map((p) => [p.nombre, String(p.cantidad)]);

//     autoTable(doc, {
//       head: tableHead,
//       body: tableBody,
//       startY: 30,
//       styles: { fontSize: 12 },
//     });

//     doc.save("pedido.pdf");
//   };

//   if (loading) return <p className="text-center">Cargando productos...</p>;

//   return (
//     <div className="max-w-screen-lg mx-auto p-6 space-y-6">
//       <h1 className="text-3xl font-bold text-center text-blue-600">🛒 Hacer Pedido</h1>

//       {/* Grid de productos */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {products.map((p) => (
//           <div key={p.id} className="border rounded p-3 flex flex-col items-center shadow-sm">
//             {p.foto ? (
//               <img
//                 src={p.foto}
//                 alt={p.nombre}
//                 className="w-24 h-24 object-cover rounded mb-2"
//               />
//             ) : (
//               <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-xs text-gray-500 mb-2">
//                 Sin foto
//               </div>
//             )}
//             <p className="font-semibold text-center">{p.nombre}</p>
//             <input
//               type="number"
//               min="0"
//               value={pedido.find((item) => item.id === p.id)?.cantidad || ""}
//               onChange={(e) => handleCantidadChange(p, Number(e.target.value))}
//               className="border rounded px-2 py-1 w-20 mt-2 text-center"
//             />
//           </div>
//         ))}
//       </div>

//       {/* Resumen del pedido */}
//       <div className="mt-6">
//         <h2 className="text-xl font-bold mb-3">📝 Hoja de Pedido</h2>
//         {pedido.filter((p) => p.cantidad > 0).length === 0 ? (
//           <p className="text-gray-500">No has seleccionado productos.</p>
//         ) : (
//           <table className="table-auto w-full border text-sm">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-2">Foto</th>
//                 <th className="px-4 py-2">Producto</th>
//                 <th className="px-4 py-2">Cantidad</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pedido
//                 .filter((p) => p.cantidad > 0)
//                 .map((p) => (
//                   <tr key={p.id} className="border-t text-center">
//                     <td className="py-2">
//                       {p.foto ? (
//                         <img
//                           src={p.foto}
//                           alt={p.nombre}
//                           className="w-12 h-12 object-cover mx-auto"
//                         />
//                       ) : (
//                         <span className="text-xs text-gray-500">--</span>
//                       )}
//                     </td>
//                     <td className="py-2">{p.nombre}</td>
//                     <td className="py-2 font-semibold">{p.cantidad}</td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Botón exportar */}
//       <div className="text-right">
//         <button
//           onClick={exportPedidoPDF}
//           disabled={pedido.filter((p) => p.cantidad > 0).length === 0}
//           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
//         >
//           Exportar Pedido a PDF
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OrderView;

// OrderView.jsx
import React, { useEffect, useState } from "react";
import { getAllProducts } from "../services/productServices";
import { withFotosBase64 } from "../utils/imgToDataUrl";
import { exportPedidoPDF } from "../utils/exportPedidoPDF";
import { getTopLowStockProducts } from "../services/salesServices";

const OrderView = () => {
    const [products, setProducts] = useState([]);
    const [pedido, setPedido] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getTopLowStockProducts()
                setProducts(data);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleCantidadChange = (product, cantidad) => {
        setPedido((prev) => {
            const exists = prev.find((i) => i.id === product.id);
            if (exists) return prev.map((i) => (i.id === product.id ? { ...i, cantidad } : i));
            return [...prev, { id: product.id, nombre: product.nombre, foto: product.foto, cantidad }];
        });
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const seleccion = pedido.filter((p) => (p.cantidad ?? 0) > 0);

            // 🔸 Convertir fotos → base64 (solo las que tengan URL)
            const rows = await withFotosBase64(seleccion, "foto");

            await exportPedidoPDF({
                pedido: rows,
                titulo: "Hoja de Pedido",
                proveedor: "Tu Proveedor",
            });
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <p className="text-center">Cargando productos...</p>;

    return (
        <div className="max-w-screen-lg mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center text-blue-600">🛒 Hacer Pedido</h1>
            {/* Grid de productos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((p) => (
                    <div
                        key={p.id}
                        className="border rounded p-3 flex flex-col items-center shadow-sm"
                    >
                        {p.foto ? (
                            <img
                                src={p.foto}
                                alt={p.nombre}
                                className="w-20 h-20 object-cover rounded mb-2"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-500 mb-2">
                                Sin foto
                            </div>
                        )}
                        {/* Contenedor flexible que ocupa todo el espacio */}
                        <div className="flex flex-col flex-1 items-center w-full">
                            <p className="font-semibold text-center mb-2">{p.nombre}</p>

                            {/* Input siempre al final */}
                            <input
                                type="number"
                                min="0"
                                value={pedido.find((i) => i.id === p.id)?.cantidad ?? ""}
                                onChange={(e) => handleCantidadChange(p, Number(e.target.value))}
                                className="border rounded px-2 py-1 w-20 mt-auto text-center"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Resumen del pedido */}
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-3">📝 Hoja de Pedido</h2>
                {pedido.filter((p) => (p.cantidad ?? 0) > 0).length === 0 ? (
                    <p className="text-gray-500">No has seleccionado productos.</p>
                ) : (
                    <table className="table-auto w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2">Foto</th>
                                <th className="px-4 py-2">Producto</th>
                                <th className="px-4 py-2">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedido
                                .filter((p) => (p.cantidad ?? 0) > 0)
                                .map((p) => (
                                    <tr key={p.id} className="border-t text-center">
                                        <td className="py-2">
                                            {p.foto ? (
                                                <img src={p.foto} alt={p.nombre} className="w-12 h-12 object-cover mx-auto" />
                                            ) : (
                                                <span className="text-xs text-gray-500">--</span>
                                            )}
                                        </td>
                                        <td className="py-2">{p.nombre}</td>
                                        <td className="py-2 font-semibold">{p.cantidad}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Botón exportar */}
            <div className="text-right">
                <button
                    onClick={handleExport}
                    disabled={exporting || pedido.filter((p) => (p.cantidad ?? 0) > 0).length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {exporting ? "Generando PDF..." : "Exportar Pedido a PDF"}
                </button>
            </div>
        </div>
    );
};

export default OrderView;
