
// import React, { useState, useMemo, useEffect } from "react";
// import { Link } from "react-router-dom";

// const EditableCell = ({ value, onChange }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempValue, setTempValue] = useState(value);

//   useEffect(() => {
//     if (!isEditing) setTempValue(value);
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

// // Fuera del JSX (arriba del componente o al inicio del archivo)
// const COLS = [
//   "w-16",     // Foto
//   "w-[18%]",  // Producto
//   "w-[7%]",   // Cantidad
//   "w-[9%]",   // Precio
//   "w-[15%]",  // Lugar
//   "w-[12%]",  // Proveedor
//   "w-[9%]",   // Cod. Proveedor
//   "w-[24%]",  // URL
//   "w-[10%]",  // Acciones
// ];

// const TableElement = ({
//   products,
//   // onView,
//   onEditCell,
//   onDelete,
//   onSale,
//   orderBy,
//   orderDirection,
//   onSort
// }) => {

//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 15;
//   const totalPages = Math.ceil(products.length / itemsPerPage);

//   const paginatedProducts = useMemo(() => {
//     const startIdx = (currentPage - 1) * itemsPerPage;
//     return products.slice(startIdx, startIdx + itemsPerPage);
//   }, [products, currentPage]);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   return (
//     <>
//       {/* Contenedor: mantiene scroll horizontal y centra en pantallas grandes */}
//       <div className="w-full overflow-x-auto max-w-screen-xl mx-auto px-4">
//         {/* // ANTES
//         // DESPUÉS (solo cambia esta línea): */}
//         <table className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[12px] sm:text-sm">
//           {/* Anchos fijos por columna para evitar “bailes” entre páginas */}
//           <colgroup>
//             {COLS.map((cls, i) => <col key={i} className={cls} />)}
//           </colgroup>
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
//                   const isLowStock =
//                     field === "cantidad" &&
//                     parseInt(product[field], 10) <= 5;
//                   const isUrl = field === "url";

//                   return (
//                     <td
//                       key={field}
//                       className={[
//                         "px-2 py-2 whitespace-normal",
//                         isUrl ? "break-all" : "break-words",
//                         isLowStock ? "text-red-600 font-semibold" : "",
//                       ].join(" ")}
//                       title={product[field]}
//                     >
//                       {/* Limita y fuerza corte en URL para evitar desbordes */}
//                       <div
//                         className={
//                           isUrl
//                             ? "block max-w-[28rem] [overflow-wrap:anywhere]"
//                             : "block"
//                         }
//                       >
//                         <EditableCell
//                           value={product[field]}
//                           onChange={(val) =>
//                             onEditCell(product.id, field, val)
//                           }
//                         />
//                       </div>
//                     </td>
//                   );
//                 })}
//                 <td className="px-2 py-2 whitespace-nowrap flex flex-col sm:flex-row gap-2 justify-center items-center">
//                   <Link
//                     to={`/products/${product.id}`}
//                     className="text-green-500 hover:text-green-600 text-base sm:text-lg"
//                     title="Detalle"
//                   >
//                      <i className="fa-solid fa-circle-info"></i>
//                   </Link>

//                   <Link
//                     to={`/products/edit/${product.id}`}
//                     className="text-blue-500 hover:text-blue-600 text-base sm:text-lg"
//                     title="Editar"
//                   >
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
//       {/* Paginación */}
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
import { Link, useLocation, useSearchParams } from "react-router-dom";

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
      onClick={() => onSort?.(columnKey)}
    >
      <div className="flex items-center justify-center space-x-1">
        <span>{label}</span>
        <span>{arrow}</span>
      </div>
    </th>
  );
};

const COLS = [
  "w-16",     // Foto
  "w-[18%]",  // Producto
  "w-[7%]",   // Cantidad
  "w-[9%]",   // Precio
  "w-[15%]",  // Lugar
  "w-[12%]",  // Proveedor
  "w-[9%]",   // Cod. Proveedor
  "w-[24%]",  // URL
  "w-[10%]",  // Acciones
];

const TableElement = ({
  products,
  onEditCell,
  onDelete,
  onSale,
  orderBy,
  orderDirection,
  onSort,
}) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = 15;
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));

  const [currentPage, setCurrentPage] = useState(1);

  // Sincroniza la página con ?page= en la URL
  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    const safe = Number.isNaN(p) ? 1 : Math.min(Math.max(p, 1), totalPages);
    setCurrentPage(safe);
  }, [searchParams, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return products.slice(startIdx, startIdx + itemsPerPage);
  }, [products, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(pageNumber));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="w-full overflow-x-auto max-w-screen-xl mx-auto px-4">
        <table className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[12px] sm:text-sm">
          <colgroup>
            {COLS.map((cls, i) => (
              <col key={i} className={cls} />
            ))}
          </colgroup>
          <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] sm:text-sm">
            <tr>
              <th className="px-2 py-2 text-center">Foto</th>
              <SortableHeader
                label="Producto"
                columnKey="nombre"
                {...{ orderBy, orderDirection, onSort }}
              />
              <SortableHeader
                label="Cantidad"
                columnKey="cantidad"
                {...{ orderBy, orderDirection, onSort }}
              />
              <SortableHeader
                label="Precio"
                columnKey="precio"
                {...{ orderBy, orderDirection, onSort }}
              />
              <SortableHeader
                label="Lugar"
                columnKey="lugar"
                {...{ orderBy, orderDirection, onSort }}
              />
              <SortableHeader
                label="Proveedor"
                columnKey="proveedor"
                {...{ orderBy, orderDirection, onSort }}
              />
              <SortableHeader
                label="Cod. Proveedor"
                columnKey="codigoProveedor"
                {...{ orderBy, orderDirection, onSort }}
              />
              <SortableHeader
                label="URL"
                columnKey="url"
                {...{ orderBy, orderDirection, onSort }}
              />
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

                  // ✅ Evaluar descripción por producto
                  const hasLongDescription =
                    product.descripcion &&
                    product.descripcion.length > 10;

                  // ✅ Solo colorear la celda "nombre" según la longitud de la descripción
                  const nameColorClass =
                    field === "nombre"
                      ? hasLongDescription
                        ? "text-grey-600"
                        : "text-red-600"
                      : "";

                  return (
                    <td
                      key={field}
                      className={[
                        "px-2 py-2 whitespace-normal",
                        isUrl ? "break-all" : "break-words",
                        isLowStock ? "text-red-600 font-semibold" : "",
                        nameColorClass,
                      ].join(" ")}
                      title={product[field]}
                    >
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
                  {/* Detalle: pasa fromSearch para volver a la misma página */}
                  <Link
                    to={`/products/${product.id}`}
                    state={{ fromSearch: location.search }}
                    className="text-green-500 hover:text-green-600 text-base sm:text-lg"
                    title="Detalle"
                  >
                    <i className="fa-solid fa-circle-info"></i>
                  </Link>

                  <Link
                    to={`/products/edit/${product.id}${location.search}`}
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