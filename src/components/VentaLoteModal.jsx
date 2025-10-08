

// import React from "react";

// export default function VentaLoteModal({
//   isOpen,
//   batchProducts,
//   setBatchProducts,
//   cliente,
//   setCliente,
//   precioTotalLote,
//   setPrecioTotalLote,
//   precioUnitarioLote,
//   setPrecioUnitarioLote,
//   confirmBatchSale,
//   setIsBatchModalOpen,
//   error,
// }) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[95vh] overflow-y-auto">
//         <h2 className="text-4xl text-center font-semibold mb-4">
//           Lote de Productos
//         </h2>

//         <ul className="divide-y divide-gray-200">
//           {batchProducts.map((p, index) => (
//             <li key={p.id} className="py-2 flex flex-col gap-2">
//               <div className="flex items-center gap-2">
//                 {p.foto ? (
//                   <img
//                     src={p.foto}
//                     alt={p.nombre}
//                     className="w-16 h-16 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs">
//                     No foto
//                   </div>
//                 )}
//                 <span className="font-medium">
//                   {p.nombre} (Stock: {p.cantidad})
//                 </span>
//               </div>
//               <span className="text-xs text-gray-500">{p.lugar}</span>

//               <div className="flex gap-2 mt-2">
//                 <input
//                   type="number"
//                   step="any"
//                   min="0"
//                   value={p.cantidadVenta ?? ""}
//                   onChange={(e) => {
//                     const cantidad = parseFloat(e.target.value.replace(",", "."));
//                     if (isNaN(cantidad) || cantidad < 0) return;
//                     setBatchProducts((prev) => {
//                       const updated = prev.map((prod, i) => {
//                         if (i === index) {
//                           const precioBase =
//                             precioUnitarioLote != null ? precioUnitarioLote : prod.precio;
//                           const precioVenta = precioBase * cantidad;
//                           return {
//                             ...prod,
//                             cantidadVenta: cantidad,
//                             precioVenta: Number(precioVenta.toFixed(2)),
//                           };
//                         }
//                         return prod;
//                       });
//                       const nuevoTotal = updated.reduce(
//                         (acc, p) => acc + (p.precioVenta || 0),
//                         0
//                       );
//                       setPrecioTotalLote(Number(nuevoTotal.toFixed(2)));
//                       return updated;
//                     });
//                   }}
//                   className="border border-gray-300 rounded-md p-2 w-1/2"
//                 />
//                 <input
//                   type="text"
//                   readOnly
//                   value={p.precioVenta?.toFixed(2) ?? ""}
//                   className="border border-gray-300 rounded-md p-2 w-1/2 bg-gray-100"
//                 />
//               </div>
//             </li>
//           ))}
//         </ul>

//         {/* Datos del lote */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-4 items-end">
//           <div className="flex-1">
//             <label className="block text-sm font-medium mb-1">
//               Nombre Cliente (opcional)
//             </label>
//             <input
//               type="text"
//               value={cliente}
//               onChange={(e) => setCliente(e.target.value)}
//               placeholder="John Doe"
//               className="border border-gray-300 rounded-md p-2 w-full"
//             />
//           </div>

//           <div className="flex-1">
//             <label className="block text-sm font-medium mb-1">
//               Total Lote (€)
//             </label>
//             <input
//               type="text"
//               inputMode="decimal"
//               value={precioTotalLote?.toString() || ""}
//               onChange={(e) => {
//                 let value = e.target.value.replace(",", ".").replace(/[^0-9.]/g, "");
//                 const parts = value.split(".");
//                 if (parts.length > 2) value = parts[0] + "." + parts.slice(1).join("");
//                 if (value === "" || value.endsWith(".")) {
//                   setPrecioTotalLote(value);
//                   return;
//                 }
//                 const totalNum = parseFloat(value);
//                 if (isNaN(totalNum)) return;
//                 const totalUnidades = batchProducts.reduce(
//                   (acc, p) => acc + (p.cantidadVenta || 0),
//                   0
//                 );
//                 const nuevoUnitario = totalUnidades > 0 ? totalNum / totalUnidades : 0;
//                 setPrecioUnitarioLote(nuevoUnitario);
//                 setPrecioTotalLote(totalNum);
//                 setBatchProducts((prev) =>
//                   prev.map((p) => ({
//                     ...p,
//                     precioVenta: Number(
//                       (nuevoUnitario * (p.cantidadVenta || 0)).toFixed(2)
//                     ),
//                   }))
//                 );
//               }}
//               className="border border-gray-300 rounded-md p-2 w-full"
//             />
//           </div>
//         </div>

//         {error && (
//           <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
//         )}

//         <div className="flex justify-center text-center items-center mt-6 gap-4">
//           <button
//             onClick={() => setIsBatchModalOpen(false)}
//             className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md"
//           >
//             <i className="fa-solid fa-xmark mx-2"></i>
//             Cancelar
//           </button>
//           <button
//             onClick={confirmBatchSale}
//             className="bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded-md"
//           >
//             <i className="fa-solid fa-cart-shopping mx-2"></i>
//             Confirmar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";

export default function VentaLoteModal({
  isOpen,
  batchProducts,
  setBatchProducts,
  cliente,
  setCliente,
  precioTotalLote,
  setPrecioTotalLote,
  precioUnitarioLote,
  setPrecioUnitarioLote,
  confirmBatchSale,
  setIsBatchModalOpen,
  error,
}) {
  const [selectedPerson, setSelectedPerson] = useState(""); // "carol" | "gio" | "otros"
  const [previousTotal, setPreviousTotal] = useState(null); // Guarda precio total antes de Gio

  useEffect(() => {
    if (selectedPerson === "carol") {
      setCliente("vinted (carol)");
      // restaurar total si venía de Gio
      if (previousTotal !== null) {
        setPrecioTotalLote(previousTotal);
        setPreviousTotal(null);
      }
    } else if (selectedPerson === "gio") {
      setCliente("vinted (gio)");
      // guardar precio actual antes de ponerlo a 0
      if (precioTotalLote !== 0) setPreviousTotal(precioTotalLote);
      setPrecioTotalLote(0);
    } else if (selectedPerson === "otros") {
      setCliente("");
      // restaurar si veníamos de Gio
      if (previousTotal !== null) {
        setPrecioTotalLote(previousTotal);
        setPreviousTotal(null);
      }
    } else {
      setCliente("");
    }
  }, [selectedPerson]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[95vh] overflow-y-auto">
        <h2 className="text-4xl text-center font-semibold mb-4">
          Lote de Productos
        </h2>

        <ul className="divide-y divide-gray-200">
          {batchProducts.map((p, index) => (
            <li key={p.id} className="py-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {p.foto ? (
                  <img
                    src={p.foto}
                    alt={p.nombre}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    No foto
                  </div>
                )}
                <span className="font-medium">
                  {p.nombre} <span className="text-yellow-600">(Stock: {p.cantidad})</span>
                </span>
              </div>
              <span className="text-xs text-gray-500">{p.lugar}</span>

              <div className="flex gap-2 mt-2">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={p.cantidadVenta ?? ""}
                  onChange={(e) => {
                    const cantidad = parseFloat(
                      e.target.value.replace(",", ".")
                    );
                    if (isNaN(cantidad) || cantidad < 0) return;
                    setBatchProducts((prev) => {
                      const updated = prev.map((prod, i) => {
                        if (i === index) {
                          const precioBase =
                            precioUnitarioLote != null
                              ? precioUnitarioLote
                              : prod.precio;
                          const precioVenta = precioBase * cantidad;
                          return {
                            ...prod,
                            cantidadVenta: cantidad,
                            precioVenta: Number(precioVenta.toFixed(2)),
                          };
                        }
                        return prod;
                      });
                      const nuevoTotal = updated.reduce(
                        (acc, p) => acc + (p.precioVenta || 0),
                        0
                      );
                      setPrecioTotalLote(Number(nuevoTotal.toFixed(2)));
                      return updated;
                    });
                  }}
                  className="border border-gray-300 rounded-md p-2 w-1/2"
                />
                <input
                  type="text"
                  readOnly
                  value={p.precioVenta?.toFixed(2) ?? ""}
                  className="border border-gray-300 rounded-md p-2 w-1/2 bg-gray-100"
                />
              </div>
            </li>
          ))}
        </ul>

        {/* 🧍 Selector de cliente */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Cliente
            </label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Seleccionar cliente...</option>
              <option value="carol">Carol</option>
              <option value="gio">Gio</option>
              <option value="otros">Otros</option>
            </select>

            {/* Input solo si hay selección */}
            {selectedPerson && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                  Nombre Cliente
                </label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="John Doe"
                  readOnly={selectedPerson !== "otros"}
                  className={`border border-gray-300 rounded-md p-2 w-full ${selectedPerson !== "otros"
                    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                    : ""
                    }`}
                />
              </div>
            )}
          </div>

          {/* Total del lote */}
          <div className="flex-1 mt-4 sm:mt-0">
            <label className="block text-sm font-medium mb-1">
              Total Lote (€)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={precioTotalLote?.toString() || ""}
              onChange={(e) => {
                let value = e.target.value
                  .replace(",", ".")
                  .replace(/[^0-9.]/g, "");
                const parts = value.split(".");
                if (parts.length > 2)
                  value = parts[0] + "." + parts.slice(1).join("");
                if (value === "" || value.endsWith(".")) {
                  setPrecioTotalLote(value);
                  return;
                }
                const totalNum = parseFloat(value);
                if (isNaN(totalNum)) return;
                const totalUnidades = batchProducts.reduce(
                  (acc, p) => acc + (p.cantidadVenta || 0),
                  0
                );
                const nuevoUnitario =
                  totalUnidades > 0 ? totalNum / totalUnidades : 0;
                setPrecioUnitarioLote(nuevoUnitario);
                setPrecioTotalLote(totalNum);
                setBatchProducts((prev) =>
                  prev.map((p) => ({
                    ...p,
                    precioVenta: Number(
                      (nuevoUnitario * (p.cantidadVenta || 0)).toFixed(2)
                    ),
                  }))
                );
              }}
              readOnly={selectedPerson === "gio"} // bloquea edición si Gio
              className={`border border-gray-300 rounded-md p-2 w-full ${selectedPerson === "gio"
                ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                : ""
                }`}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        {/* Botones (mismo estilo que individual) */}
        <div className="flex justify-center text-center items-center mt-6 gap-4">
          <button
            onClick={() => setIsBatchModalOpen(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md"
          >
            <i className="fa-solid fa-xmark mx-2"></i>
            Cancelar
          </button>

          <button
            onClick={confirmBatchSale}
            disabled={!selectedPerson}
            className={`px-2 py-2 rounded-md text-white ${!selectedPerson
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
              }`}
          >
            <i className="fa-solid fa-cart-shopping mx-2"></i>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
