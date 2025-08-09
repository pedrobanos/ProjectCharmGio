// import React, { useState, useMemo, useEffect } from "react";
// import { Link } from "react-router-dom";

// const EditableCell = ({ value, onChange }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempValue, setTempValue] = useState(value);

//   useEffect(() => {
//     if (!isEditing) {
//       setTempValue(value);
//     }
//   }, [value, isEditing]);

//   const handleDoubleClick = () => setIsEditing(true);

//   const handleBlur = () => {
//     setIsEditing(false);
//     onChange(tempValue);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       setIsEditing(false);
//       onChange(tempValue);
//     } else if (e.key === "Escape") {
//       setIsEditing(false);
//       setTempValue(value);
//     }
//   };

//   return isEditing ? (
//     <input
//       type="text"
//       className="border rounded px-2 py-1 w-full"
//       value={tempValue}
//       onChange={(e) => setTempValue(e.target.value)}
//       onBlur={handleBlur}
//       onKeyDown={handleKeyDown}
//       autoFocus
//     />
//   ) : (
//     <span
//       onDoubleClick={handleDoubleClick}
//       className="cursor-pointer block"
//       title={value}
//     >
//       {value}
//     </span>
//   );
// };

// const SortableHeader = ({
//   label,
//   columnKey,
//   orderBy,
//   orderDirection,
//   onSort,
// }) => {
//   const isActive = orderBy === columnKey;
//   const arrow = isActive ? (orderDirection === "asc" ? "↑" : "↓") : "";

//   return (
//     <th
//       className="px-4 py-3 text-center cursor-pointer select-none"
//       onClick={() => onSort(columnKey)}
//     >
//       <div className="flex items-center justify-center space-x-1">
//         <span>{label}</span>
//         <span>{arrow}</span>
//       </div>
//     </th>
//   );
// };

// const TableElement = ({
//   products,
//   onView,
//   onEditCell,
//   onDelete,
//   onSale,
//   orderBy,
//   orderDirection,
//   onSort,
// }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const totalPages = Math.ceil(products.length / itemsPerPage);

//   const paginatedProducts = useMemo(() => {
//     const startIdx = (currentPage - 1) * itemsPerPage;
//     return products.slice(startIdx, startIdx + itemsPerPage);
//   }, [products, currentPage]);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   // const handlePrev = () => { servia para ir a la página anterior y siguiente
//   //   setCurrentPage((p) => Math.max(p - 1, 1));
//   //   window.scrollTo({ top: 0, behavior: "smooth" });
//   // };

//   // const handleNext = () => {
//   //   setCurrentPage((p) => Math.min(p + 1, totalPages));
//   //   window.scrollTo({ top: 0, behavior: "smooth" });
//   // };

//   return (
//     <>
//       <div className="w-full overflow-x-auto lg:overflow-visible lg:max-w-6xl lg:mx-auto">
//         <table className="min-w-[900px] w-full table-auto border-collapse text-[12px] sm:text-sm">
//           <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] sm:text-sm">
//             <tr>
//               <th className="px-2 py-2 text-center">Foto</th>
//               <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Precio" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Lugar" columnKey="lugar" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Proveedor" columnKey="proveedor" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="URL" columnKey="url" {...{ orderBy, orderDirection, onSort }} />
//               <th className="px-2 py-2 text-center">Acciones</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 text-gray-800">
//             {paginatedProducts.map((product) => (
//               <tr key={product.id} className="text-center">
//                 <td className="px-2 py-3">
//                   {product.foto ? (
//                     <img
//                       src={product.foto}
//                       alt={`Foto de ${product.nombre}`}
//                       className="h-10 w-10 object-cover rounded-full mx-auto hover:scale-110 transition-transform duration-200"
//                     />
//                   ) : (
//                     <span className="text-xs">Sin foto</span>
//                   )}
//                 </td>
//                 {[
//                   "nombre",
//                   "cantidad",
//                   "precio",
//                   "lugar",
//                   "proveedor",
//                   "codigoProveedor",
//                   "url",
//                 ].map((field) => {
//                   const isLowStock = field === "cantidad" && parseInt(product[field], 10) <= 5;
//                   const isUrl = field === "url";

//                   return (
//                     <td
//                       key={field}
//                       className={[
//                         "px-2 py-2",
//                         isUrl
//                           ? "whitespace-normal break-all max-w-[750px]" // <-- clave para URLs largas
//                           : "whitespace-normal break-words",
//                         isLowStock ? "text-red-600 font-semibold" : "",
//                       ].join(" ")}
//                       title={product[field]}
//                     >
//                       <EditableCell
//                         value={product[field]}
//                         onChange={(val) => onEditCell(product.id, field, val)}
//                       />
//                     </td>
//                   );
//                 })}

//                 <td className="px-2 py-2 flex flex-col sm:flex-row gap-2 justify-center items-center">
//                   <button
//                     type="button"
//                     className="text-green-500 hover:text-green-600 text-base sm:text-lg cursor-pointer"
//                     onClick={() => onView(product)}
//                     title="Ver"
//                   >
//                     <i className="fa-solid fa-circle-info"></i>
//                   </button>
//                   <Link to={`/products/edit/${product.id}`} className="text-blue-500 hover:text-blue-600 text-base sm:text-lg">
//                     <i className="fa-solid fa-pen-to-square"></i>
//                   </Link>
//                   <button
//                     type="button"
//                     className="text-yellow-500 hover:text-yellow-600 text-base sm:text-lg cursor-pointer"
//                     onClick={() => onSale(product)}
//                     title="Venta"
//                   >
//                     <i className="fa-solid fa-cash-register"></i>
//                   </button>
//                   <button
//                     type="button"
//                     className="text-red-500 hover:text-red-600 text-base sm:text-lg cursor-pointer"
//                     onClick={() => onDelete(product)}
//                     title="Eliminar"
//                   >
//                     <i className="fa-solid fa-trash"></i>
//                   </button>

//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
//         {Array.from({ length: totalPages }, (_, index) => {
//           const pageNumber = index + 1;
//           return (
//             <button
//               key={pageNumber}
//               type="button"
//               onClick={() => handlePageChange(pageNumber)}
//               className={`px-3 py-1 rounded cursor-pointer ${currentPage === pageNumber
//                 ? "text-red-500 font-bold underline"
//                 : "text-blue-600 hover:text-blue-900"
//                 }`}
//             >
//               {pageNumber}
//             </button>
//           );
//         })}
//       </div>
//     </>
//   );
// };

// export default TableElement;

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

const EditableCell = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    if (!isEditing) setTempValue(value);
  }, [value, isEditing]);

  const handleDoubleClick = () => setIsEditing(true);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onChange(tempValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTempValue(value);
    }
  };

  return isEditing ? (
    <input
      type="text"
      className="border rounded px-2 py-1 w-full"
      value={tempValue}
      onChange={(e) => setTempValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  ) : (
    <span
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer block"
      title={value}
    >
      {value}
    </span>
  );
};

const SortableHeader = ({
  label,
  columnKey,
  orderBy,
  orderDirection,
  onSort,
}) => {
  const isActive = orderBy === columnKey;
  const arrow = isActive ? (orderDirection === "asc" ? "↑" : "↓") : "";
  return (
    <th
      className="px-4 py-3 text-center cursor-pointer select-none"
      onClick={() => onSort(columnKey)}
    >
      <div className="flex items-center justify-center space-x-1">
        <span>{label}</span>
        <span>{arrow}</span>
      </div>
    </th>
  );
};

const TableElement = ({
  products,
  onView,
  onEditCell,
  onDelete,
  onSale,
  orderBy,
  orderDirection,
  onSort,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return products.slice(startIdx, startIdx + itemsPerPage);
  }, [products, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Contenedor: mantiene scroll horizontal y centra en pantallas grandes */}
      <div className="w-full overflow-x-auto max-w-screen-xl mx-auto px-4">
        <table className="w-full table-fixed border-collapse text-[12px] sm:text-sm">
          {/* Anchos fijos por columna para evitar “bailes” entre páginas */}
          <colgroup>
            <col className="w-16" />            {/* Foto */}
            <col className="w-[18%]" />         {/* Producto */}
            <col className="w-[7%]" />          {/* Cantidad */}
            <col className="w-[9%]" />         {/* Precio */}
            <col className="w-[15%]" />         {/* Lugar */}
            <col className="w-[12%]" />         {/* Proveedor */}
            <col className="w-[9%]" />         {/* Cod. Proveedor */}
            <col className="w-[24%]" />         {/* URL */}
            <col className="w-[10%]" />         {/* Acciones */}
          </colgroup>

          <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] sm:text-sm">
            <tr>
              <th className="px-2 py-2 text-center">Foto</th>
              <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Precio" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Lugar" columnKey="lugar" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Proveedor" columnKey="proveedor" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="URL" columnKey="url" {...{ orderBy, orderDirection, onSort }} />
              <th className="px-2 py-2 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-gray-800">
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="text-center">
                <td className="px-2 py-3">
                  {product.foto ? (
                    <img
                      src={product.foto}
                      alt={`Foto de ${product.nombre}`}
                      className="h-10 w-10 object-cover rounded-full mx-auto hover:scale-110 transition-transform duration-200"
                    />
                  ) : (
                    <span className="text-xs">Sin foto</span>
                  )}
                </td>

                {[
                  "nombre",
                  "cantidad",
                  "precio",
                  "lugar",
                  "proveedor",
                  "codigoProveedor",
                  "url",
                ].map((field) => {
                  const isLowStock =
                    field === "cantidad" &&
                    parseInt(product[field], 10) <= 5;
                  const isUrl = field === "url";

                  return (
                    <td
                      key={field}
                      className={[
                        "px-2 py-2 whitespace-normal",
                        isUrl ? "break-all" : "break-words",
                        isLowStock ? "text-red-600 font-semibold" : "",
                      ].join(" ")}
                      title={product[field]}
                    >
                      {/* Limita y fuerza corte en URL para evitar desbordes */}
                      <div
                        className={
                          isUrl
                            ? "block max-w-[28rem] [overflow-wrap:anywhere]"
                            : "block"
                        }
                      >
                        <EditableCell
                          value={product[field]}
                          onChange={(val) =>
                            onEditCell(product.id, field, val)
                          }
                        />
                      </div>
                    </td>
                  );
                })}

                <td className="px-2 py-2 whitespace-nowrap flex flex-col sm:flex-row gap-2 justify-center items-center">
                  <button
                    type="button"
                    className="text-green-500 hover:text-green-600 text-base sm:text-lg cursor-pointer"
                    onClick={() => onView(product)}
                    title="Ver"
                  >
                    <i className="fa-solid fa-circle-info"></i>
                  </button>

                  <Link
                    to={`/products/edit/${product.id}`}
                    className="text-blue-500 hover:text-blue-600 text-base sm:text-lg"
                    title="Editar"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </Link>

                  <button
                    type="button"
                    className="text-yellow-500 hover:text-yellow-600 text-base sm:text-lg cursor-pointer"
                    onClick={() => onSale(product)}
                    title="Venta"
                  >
                    <i className="fa-solid fa-cash-register"></i>
                  </button>

                  <button
                    type="button"
                    className="text-red-500 hover:text-red-600 text-base sm:text-lg cursor-pointer"
                    onClick={() => onDelete(product)}
                    title="Eliminar"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => handlePageChange(pageNumber)}
              className={`px-3 py-1 rounded cursor-pointer ${
                currentPage === pageNumber
                  ? "text-red-500 font-bold underline"
                  : "text-blue-600 hover:text-blue-900"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default TableElement;



