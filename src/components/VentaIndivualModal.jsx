// import React, { useState, useEffect } from "react";

// export default function VentaIndividualModal({
//   isOpen,
//   selectedProduct,
//   cantidadVenta,
//   setCantidadVenta,
//   cliente,
//   setCliente,
//   precioVenta,
//   setPrecioVenta,
//   error,
//   confirmSale,
//   setIsModalOpen,
// }) {
//   const [selectedPerson, setSelectedPerson] = useState(""); // "carol", "gio", "otros"
//   const [previousPrice, setPreviousPrice] = useState(null); // guarda el precio antes de Gio

//   useEffect(() => {
//     if (selectedPerson === "carol") {
//       setCliente("vinted (carol)");
//       if (previousPrice !== null) {
//         setPrecioVenta(previousPrice);
//         setPreviousPrice(null);
//       }
//     } else if (selectedPerson === "gio") {
//       setCliente("vinted (gio)");
//       if (precioVenta !== 0) setPreviousPrice(precioVenta);
//       setPrecioVenta(0);
//     } else if (selectedPerson === "otros") {
//       setCliente("");
//       if (previousPrice !== null) {
//         setPrecioVenta(previousPrice);
//         setPreviousPrice(null);
//       }
//     } else {
//       setCliente("");
//     }
//   }, [selectedPerson, setCliente, setPrecioVenta]);

//   if (!isOpen || !selectedProduct) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-100">
//         <h2 className="text-lg font-semibold mb-1">
//           Charm: {selectedProduct.nombre}
//         </h2>
//         <span className="text-xs text-gray-500 mb-4 block">
//           Lugar: {selectedProduct.lugar}
//         </span>

//         {selectedProduct.foto && (
//           <img
//             src={selectedProduct.foto}
//             alt={selectedProduct.nombre}
//             className="w-full max-w-xs rounded-full mx-auto sm:w-48 sm:h-48 object-cover mb-4"
//           />
//         )}

//         {/* Cantidad */}
//         <label className="block text-sm font-medium mb-1">
//           Cantidad a vender (Stock: {selectedProduct.cantidad})
//         </label>
//         <input
//           type="number"
//           min="1"
//           value={cantidadVenta}
//           onChange={(e) => setCantidadVenta(Number(e.target.value))}
//           className="border border-gray-300 rounded-md p-2 w-full mb-4"
//         />

//         {/* Selector de cliente */}
//         <label className="block text-sm font-medium mb-1">Cliente:</label>
//         <select
//           value={selectedPerson}
//           onChange={(e) => setSelectedPerson(e.target.value)}
//           className="border border-gray-300 rounded-md p-2 w-full mb-3"
//         >
//           <option value="">Seleccionar cliente...</option>
//           <option value="carol">Carol</option>
//           <option value="gio">Gio</option>
//           <option value="otros">Otros</option>
//         </select>

//         {/* Mostrar input solo cuando hay selección */}
//         {selectedPerson && (
//           <div className="mb-3">
//             <label className="block text-sm font-medium mb-1">
//               Nombre Cliente:
//             </label>
//             <input
//               type="text"
//               value={cliente}
//               onChange={(e) => setCliente(e.target.value)}
//               placeholder="John Doe"
//               readOnly={selectedPerson !== "otros"}
//               className={`border border-gray-300 rounded-md p-2 w-full ${selectedPerson !== "otros"
//                   ? "bg-gray-100 text-gray-600 cursor-not-allowed"
//                   : ""
//                 }`}
//             />
//           </div>
//         )}

//         {/* Precio */}
//         <label className="block text-sm font-medium mb-1">
//           Precio de Venta (€)
//         </label>
//         <input
//           type="text"
//           value={precioVenta}
//           onChange={(e) => {
//             const value = e.target.value.replace(",", ".");
//             setPrecioVenta(value);
//           }}
//           placeholder="Precio de venta"
//           readOnly={selectedPerson === "gio"}
//           className={`border border-gray-300 rounded-md p-2 w-full mb-3 ${selectedPerson === "gio"
//               ? "bg-gray-100 text-gray-600 cursor-not-allowed"
//               : ""
//             }`}
//         />

//         {/* Error */}
//         {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

//         {/* Botones — SIEMPRE visibles */}
//         <div className="flex justify-end space-x-2 mt-3">
//           <button
//             onClick={() => setIsModalOpen(false)}
//             className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
//           >
//             Cancelar
//           </button>

//           <button
//             onClick={confirmSale}
//             disabled={!selectedPerson} // ✅ Bloquea si no se eligió cliente
//             className={`px-4 py-2 rounded-md text-white ${!selectedPerson
//                 ? "bg-green-300 cursor-not-allowed"
//                 : "bg-green-500 hover:bg-green-600"
//               }`}
//           >
//             Confirmar
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";

export default function VentaIndividualModal({
  isOpen,
  selectedProduct,
  cantidadVenta,
  setCantidadVenta,
  cliente,
  setCliente,
  precioVenta,
  setPrecioVenta,
  error,
  confirmSale,
  setIsModalOpen,
}) {
  const [selectedPerson, setSelectedPerson] = useState(""); // "carol", "gio", "otros"
  const [previousPrice, setPreviousPrice] = useState(null); // guarda el precio anterior si pasa por Gio

  useEffect(() => {
    if (selectedPerson === "carol") {
      setCliente("vinted (carol)");
      if (previousPrice !== null) {
        setPrecioVenta(previousPrice);
        setPreviousPrice(null);
      }
    } else if (selectedPerson === "gio") {
      setCliente("vinted (gio)");
      if (precioVenta !== 0) setPreviousPrice(precioVenta);
      setPrecioVenta(0);
    } else if (selectedPerson === "otros") {
      setCliente("");
      if (previousPrice !== null) {
        setPrecioVenta(previousPrice);
        setPreviousPrice(null);
      }
    } else {
      setCliente("");
    }
  }, [selectedPerson]);

  if (!isOpen || !selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[95vh] overflow-y-auto">
        <h2 className="text-4xl text-center font-semibold mb-4">
          Venta Individual
        </h2>
        {/* Información del producto */}
        <div className="flex items-center gap-3 mb-4">
          {selectedProduct.foto ? (
            <img
              src={selectedProduct.foto}
              alt={selectedProduct.nombre}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xs">
              No foto
            </div>
          )}
          <div>
            <p className="font-medium">{selectedProduct.nombre} <span className="text-yellow-600">(Stock: {selectedProduct.cantidad})</span></p>
            <p className="text-xs text-gray-500">{selectedProduct.lugar}</p>
          </div>
        </div>
        {/* Cantidad */}
        <label className="block text-sm font-medium mb-1">
          Cantidad a vender
        </label>
        <input
          type="number"
          min="1"
          value={cantidadVenta}
          onChange={(e) => setCantidadVenta(Number(e.target.value))}
          className="border border-gray-300 rounded-md p-2 w-full mb-4"
        />
        {/* Selector de cliente */}
        <label className="block text-sm font-medium mb-1">Cliente</label>
        <select
          value={selectedPerson}
          onChange={(e) => setSelectedPerson(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full mb-3"
        >
          <option value="">Seleccionar cliente...</option>
          <option value="carol">Carol</option>
          <option value="gio">Gio</option>
          <option value="otros">Otros</option>
        </select>
        {/* Campo cliente (solo aparece si se selecciona) */}
        {selectedPerson && (
          <div className="mb-4">
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
        {/* Precio */}
        <label className="block text-sm font-medium mb-1">
          Precio de Venta (€)
        </label>
        <input
          type="text"
          value={precioVenta}
          onChange={(e) => {
            const value = e.target.value.replace(",", ".");
            setPrecioVenta(value);
          }}
          placeholder="Precio de venta"
          readOnly={selectedPerson === "gio"}
          className={`border border-gray-300 rounded-md p-2 w-full mb-4 ${selectedPerson === "gio"
            ? "bg-gray-100 text-gray-600 cursor-not-allowed"
            : ""
            }`}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        {/* Botones (mismo diseño que lote) */}
        <div className="flex justify-center text-center items-center mt-6 gap-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-md"
          >
            <i className="fa-solid fa-xmark mx-2"></i>
            Cancelar
          </button>

          <button
            onClick={confirmSale}
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

