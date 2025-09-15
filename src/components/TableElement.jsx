// import React, { useState, useMemo, useEffect, useRef, useLayoutEffect, useCallback } from "react";
// import { Link, useLocation, useSearchParams } from "react-router-dom";
// import Loading from "./Loading";

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
//       scope="col"
//       className="px-4 py-3 text-center cursor-pointer select-none"
//       onClick={() => onSort?.(columnKey)}
//     >
//       <div className="flex items-center justify-center space-x-1">
//         <span>{label}</span>
//         <span>{arrow}</span>
//       </div>
//     </th>
//   );
// };

// const COLS = [
//   "w-[7%]",   // ID (si es lote)
//   "w-16",     // Foto
//   "w-[21%]",  // Producto
//   "w-[9%]",   // Cantidad
//   "w-[11%]",   // Precio
//   "w-[15%]",  // Lugar
//   "w-[12%]",  // Proveedor
//   "w-[11%]",   // Cod. Proveedor
//   "w-[15%]",  // Acciones
// ];


// const TableElement = ({
//   products,
//   onEditCell,
//   onDelete,
//   onSale,
//   orderBy,
//   orderDirection,
//   onSort,
//   onLote,
//   isLote,
//   selectedIds,
//   setSelectedIds,
// }) => {
//   const location = useLocation();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const itemsPerPage = 15;
//   const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
//   const [currentPage, setCurrentPage] = useState(1);

//   const [loading, setLoading] = useState(false);

//   // Refs para header fijo y contenedor
//   const containerRef = useRef(null);   // div que scrollea en X (tiene px-4)
//   const bodyTableRef = useRef(null);   // tabla principal
//   const fixedWrapRef = useRef(null);   // contenedor fixed del header
//   const fixedScrollRef = useRef(null); // scroller horizontal del header fijo
//   const fixedTableRef = useRef(null);  // tabla del header fijo

//   // Ajustar si tienes navbar fija (en px)
//   const HEADER_OFFSET = 0;

//   // Helper: padding horizontal del contenedor
//   const getPadding = (el) => {
//     const cs = getComputedStyle(el);
//     const pl = parseFloat(cs.paddingLeft || "0");
//     const pr = parseFloat(cs.paddingRight || "0");
//     return { pl, pr };
//   };

//   // Sincroniza la página con ?page= en la URL
//   useEffect(() => {
//     const p = parseInt(searchParams.get("page") || "1", 10);
//     const safe = Number.isNaN(p) ? 1 : Math.min(Math.max(p, 1), totalPages);
//     setCurrentPage(safe);
//   }, [searchParams, totalPages]);

//   const paginatedProducts = useMemo(() => {
//     const startIdx = (currentPage - 1) * itemsPerPage;
//     return products.slice(startIdx, startIdx + itemsPerPage);
//   }, [products, currentPage]);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     const next = new URLSearchParams(searchParams);
//     next.set("page", String(pageNumber));
//     setSearchParams(next);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   // Sincroniza anchos de columnas del header fijo con la tabla real
//   const syncHeaderWidths = useCallback(() => {
//     const bodyTable = bodyTableRef.current;
//     const fixedTable = fixedTableRef.current;
//     if (!bodyTable || !fixedTable) return;

//     const firstRow = bodyTable.querySelector("tbody tr");
//     const srcCells = firstRow ? Array.from(firstRow.children) : [];
//     const fixedHeaderRow = fixedTable.querySelector("thead tr");
//     const destCells = fixedHeaderRow ? Array.from(fixedHeaderRow.children) : [];

//     if (srcCells.length !== destCells.length || destCells.length === 0) {
//       // Fallback: iguala el ancho total si no hay filas todavía
//       fixedTable.style.width = `${bodyTable.clientWidth}px`;
//     } else {
//       destCells.forEach((cell, i) => {
//         const w = srcCells[i].getBoundingClientRect().width;
//         cell.style.width = `${w}px`;
//         cell.style.minWidth = `${w}px`;
//         cell.style.maxWidth = `${w}px`;
//       });
//       fixedTable.style.width = `${bodyTable.clientWidth}px`;
//     }

//     // Ajuste fino contra redondeos subpixel
//     fixedTable.style.boxSizing = "border-box";
//     fixedTable.style.maxWidth = `${bodyTable.clientWidth}px`;
//   }, []);

//   // Posición/visibilidad del header fijo y scroll horizontal sincronizado
//   const syncPosition = useCallback(() => {
//     const container = containerRef.current;
//     const bodyTable = bodyTableRef.current;
//     const wrap = fixedWrapRef.current;
//     const fixedScroll = fixedScrollRef.current;
//     if (!container || !bodyTable || !wrap || !fixedScroll) return;

//     const crect = container.getBoundingClientRect();
//     const { pl, pr } = getPadding(container);

//     // Alinea con el área de contenido (excluye padding del contenedor)
//     const left = crect.left + pl;
//     const width = Math.max(0, crect.width - pl - pr);

//     wrap.style.left = `${left}px`;
//     wrap.style.width = `${width}px`;

//     // Mostrar/ocultar como navbar según scroll vertical
//     const trect = bodyTable.getBoundingClientRect();
//     const headerHeight = wrap.offsetHeight || 40;
//     const shouldShow = trect.top < HEADER_OFFSET && trect.bottom > HEADER_OFFSET + headerHeight;
//     wrap.style.display = shouldShow ? "block" : "none";

//     // Sincroniza scroll horizontal del header con el contenedor
//     fixedScroll.scrollLeft = container.scrollLeft;
//   }, []);

//   // Efectos: medir y sincronizar en render/updates
//   useLayoutEffect(() => {
//     syncHeaderWidths();
//     syncPosition();
//   }, [syncHeaderWidths, syncPosition, paginatedProducts, orderBy, orderDirection]);

//   useEffect(() => {
//     const onResize = () => { syncHeaderWidths(); syncPosition(); };
//     const onWindowScroll = () => { syncPosition(); };
//     const onContainerScroll = () => { syncPosition(); };
//     const onFixedScroll = () => {
//       const container = containerRef.current;
//       const fixedScroll = fixedScrollRef.current;
//       if (!container || !fixedScroll) return;
//       if (container.scrollLeft !== fixedScroll.scrollLeft) {
//         container.scrollLeft = fixedScroll.scrollLeft; // scroll bidireccional
//       }
//     };

//     window.addEventListener("resize", onResize);
//     window.addEventListener("scroll", onWindowScroll, { passive: true });

//     const container = containerRef.current;
//     const fixedScroll = fixedScrollRef.current;

//     if (container) container.addEventListener("scroll", onContainerScroll, { passive: true });
//     if (fixedScroll) fixedScroll.addEventListener("scroll", onFixedScroll, { passive: true });

//     return () => {
//       window.removeEventListener("resize", onResize);
//       window.removeEventListener("scroll", onWindowScroll);
//       if (container) container.removeEventListener("scroll", onContainerScroll);
//       if (fixedScroll) fixedScroll.removeEventListener("scroll", onFixedScroll);
//     };
//   }, [syncHeaderWidths, syncPosition]);

//   const toggleCheckbox = (id) => {
//     setSelectedIds((prev) =>
//       prev.includes(id)
//         ? prev.filter((pid) => pid !== id)
//         : [...prev, id]
//     );
//   };

//   if (loading) return <Loading />;

//   return (
//     <>
//       {/* Contenedor que scrollea horizontalmente (tiene padding x con px-4) */}
//       <div ref={containerRef} className="relative w-full overflow-x-auto max-w-screen-xl mx-auto px-4">
//         {/* HEADER FIJO como navbar (respetando padding del contenedor) */}
//         <div
//           ref={fixedWrapRef}
//           className="fixed z-40"
//           style={{ top: HEADER_OFFSET, display: "none" }}
//         >
//           <div ref={fixedScrollRef} className="overflow-x-auto bg-gray-100 shadow-sm">
//             <table
//               ref={fixedTableRef}
//               className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[11px] sm:text-sm uppercase text-gray-700"
//             >
//               <colgroup>
//                 {COLS.map((cls, i) => (
//                   <col key={`hcol-${i}`} className={cls} />
//                 ))}
//               </colgroup>
//               <thead>
//                 <tr>
//                   {/* tabla de header fijo */}
//                   <th className="px-2 py-2 text-center bg-gray-100" scope="col">Foto</th>
//                   <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Precio(€)" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Lugar" columnKey="lugar" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Proveedor" columnKey="proveedor" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" {...{ orderBy, orderDirection, onSort }} />
//                   {/* <SortableHeader label="URL" columnKey="url" {...{ orderBy, orderDirection, onSort }} /> */}
//                   <th className="px-2 py-2 text-center bg-gray-100" scope="col">Acciones</th>
//                 </tr>
//               </thead>
//             </table>
//           </div>
//         </div>
//         {/* TABLA NORMAL */}
//         <table ref={bodyTableRef} className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[12px] sm:text-sm">
//           <colgroup>
//             {COLS.map((cls, i) => (
//               <col key={`bcol-${i}`} className={cls} />
//             ))}
//           </colgroup>
//           {/* thead visible (para accesibilidad y medición inicial) */}
//           <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] sm:text-sm">
//             <tr>
//               {isLote && (<th className="px-2 py-2 text-center" scope="col">ID</th>)}
//               <th className="px-2 py-2 text-center" scope="col">Foto</th>
//               <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Precio(€)" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Lugar" columnKey="lugar" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Proveedor" columnKey="proveedor" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" {...{ orderBy, orderDirection, onSort }} />
//               {/* <SortableHeader label="URL" columnKey="url" {...{ orderBy, orderDirection, onSort }} /> */}
//               {!isLote && <th className="px-2 py-2 text-center" scope="col">Acciones</th>}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 text-gray-800">
//             {paginatedProducts.map((product) => (
//               <tr key={product.id} className="text-center">
//                 {isLote && (
//                   <td>
//                     {product.id && (
//                       <>
//                         {product.id}
//                         <input
//                           type="checkbox"
//                           className="ml-2"
//                           value={product.id}
//                           checked={selectedIds.includes(product.id)}
//                           onChange={() => toggleCheckbox(product.id)}
//                         />
//                       </>
//                     )}
//                   </td>
//                 )}
//                 <td className="px-2 py-3">
//                   {product.foto ? (
//                     <img
//                       src={product.foto}
//                       alt={`Foto de ${product.nombre}`}
//                       className="h-10 w-10 object-cover rounded-full mx-auto hover:scale-200 transition-transform duration-200"
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
//                   // "url",
//                 ].map((field) => {
//                   const isLowStock =
//                     field === "cantidad" &&
//                     parseInt(product[field], 10) <= 5;
//                   // const isUrl = field === "url";
//                   const hasLongDescription =
//                     product.descripcion &&
//                     product.descripcion.length > 10;
//                   const nameColorClass =
//                     field === "nombre"
//                       ? hasLongDescription
//                         ? "text-gray-600" // corregido (no 'grey')
//                         : "text-red-600"
//                       : "";
//                   return (
//                     <td
//                       key={field}
//                       className={[
//                         "px-2 py-2 whitespace-normal",
//                         // isUrl ? "break-all" : "break-words",
//                         isLowStock ? "text-red-600 font-semibold" : "",
//                         nameColorClass,
//                       ].join(" ")}
//                       title={product[field]}
//                     >
//                       <div
//                       // className={
//                       //   isUrl
//                       //     ? "block max-w-[28rem] [overflow-wrap:anywhere]"
//                       //     : "block"
//                       // }
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
//                 {!isLote && (
//                   <td className="px-2 py-2 whitespace-nowrap w-full h-full">
//                     <div className="flex flex-col sm:flex-row justify-center items-center gap-2 w-full h-full">
//                       {/* Detalle */}
//                       <Link
//                         to={`/products/${product.id}`}
//                         state={{ fromSearch: location.search }}
//                         className="text-green-500 hover:text-green-600 text-base sm:text-lg"
//                         title="Detalle"
//                       >
//                         <i className="fa-solid fa-circle-info"></i>
//                       </Link>
//                       <Link
//                         to={`/products/edit/${product.id}${location.search}`}
//                         className="text-blue-500 hover:text-blue-600 text-base sm:text-lg"
//                         title="Editar"
//                       >
//                         <i className="fa-solid fa-pen-to-square"></i>
//                       </Link>
//                       <button
//                         type="button"
//                         className="text-yellow-500 hover:text-yellow-600 text-base sm:text-lg cursor-pointer"
//                         onClick={() => onSale(product)}
//                         title="Venta"
//                       >
//                         <i className="fa-solid fa-cart-plus"></i>
//                       </button>
//                       <button
//                         type="button"
//                         className="text-red-500 hover:text-red-600 text-base sm:text-lg cursor-pointer"
//                         onClick={() => onDelete(product)}
//                         title="Eliminar"
//                       >
//                         <i className="fa-solid fa-trash"></i>
//                       </button>
//                     </div>
//                   </td>)}
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

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Loading from "./Loading";

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
  hiddenOnMobile = false,
}) => {
  const isActive = orderBy === columnKey;
  const arrow = isActive ? (orderDirection === "asc" ? "↑" : "↓") : "";
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-center cursor-pointer select-none ${hiddenOnMobile ? "hidden sm:table-cell" : ""
        }`}
      onClick={() => onSort?.(columnKey)}
    >
      <div className="flex items-center justify-center space-x-1">
        <span>{label}</span>
        <span>{arrow}</span>
      </div>
    </th>
  );
};

// Column configs
const COLS_WITH_LOTE = [
  "w-[7%]", // ID
  "w-16", // Foto
  "w-[26%]", // Producto
  "w-[12%]", // Cantidad
  "w-[12%]", // Precio
  "w-[14%] hidden sm:table-cell", // Lugar
  "w-[14%] hidden sm:table-cell", // Proveedor
  "w-[15%] hidden sm:table-cell", // Cod. Proveedor
];

const COLS_WITH_ACCIONES = [
  "w-16", // Foto
  "w-[24%]", // Producto
  "w-[12%]", // Cantidad
  "w-[12%]", // Precio
  "w-[14%] hidden sm:table-cell", // Lugar
  "w-[14%] hidden sm:table-cell", // Proveedor
  "w-[15%] hidden sm:table-cell", // Cod. Proveedor
  "w-[15%]", // Acciones
];
const TableElement = ({
  products,
  onEditCell,
  onDelete,
  onSale,
  orderBy,
  orderDirection,
  onSort,
  onLote,
  isLote,
  selectedIds,
  setSelectedIds,
}) => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const itemsPerPage = 15;
  const totalPages = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);

  // Refs
  const containerRef = useRef(null);
  const bodyTableRef = useRef(null);
  const fixedWrapRef = useRef(null);
  const fixedScrollRef = useRef(null);
  const fixedTableRef = useRef(null);

  const HEADER_OFFSET = 0;

  const getPadding = (el) => {
    const cs = getComputedStyle(el);
    return {
      pl: parseFloat(cs.paddingLeft || "0"),
      pr: parseFloat(cs.paddingRight || "0"),
    };
  };

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

  const syncHeaderWidths = useCallback(() => {
    const bodyTable = bodyTableRef.current;
    const fixedTable = fixedTableRef.current;
    if (!bodyTable || !fixedTable) return;

    const firstRow = bodyTable.querySelector("tbody tr");
    const srcCells = firstRow ? Array.from(firstRow.children) : [];
    const fixedHeaderRow = fixedTable.querySelector("thead tr");
    const destCells = fixedHeaderRow ? Array.from(fixedHeaderRow.children) : [];

    if (srcCells.length !== destCells.length || destCells.length === 0) {
      fixedTable.style.width = `${bodyTable.clientWidth}px`;
    } else {
      destCells.forEach((cell, i) => {
        const w = srcCells[i].getBoundingClientRect().width;
        cell.style.width = `${w}px`;
        cell.style.minWidth = `${w}px`;
        cell.style.maxWidth = `${w}px`;
      });
      fixedTable.style.width = `${bodyTable.clientWidth}px`;
    }

    fixedTable.style.boxSizing = "border-box";
    fixedTable.style.maxWidth = `${bodyTable.clientWidth}px`;
  }, []);

  const syncPosition = useCallback(() => {
    const container = containerRef.current;
    const bodyTable = bodyTableRef.current;
    const wrap = fixedWrapRef.current;
    const fixedScroll = fixedScrollRef.current;
    if (!container || !bodyTable || !wrap || !fixedScroll) return;

    const crect = container.getBoundingClientRect();
    const { pl, pr } = getPadding(container);

    const left = crect.left + pl;
    const width = Math.max(0, crect.width - pl - pr);

    wrap.style.left = `${left}px`;
    wrap.style.width = `${width}px`;

    const trect = bodyTable.getBoundingClientRect();
    const headerHeight = wrap.offsetHeight || 40;
    const shouldShow =
      trect.top < HEADER_OFFSET &&
      trect.bottom > HEADER_OFFSET + headerHeight;
    wrap.style.display = shouldShow ? "block" : "none";

    fixedScroll.scrollLeft = container.scrollLeft;
  }, []);

  useLayoutEffect(() => {
    syncHeaderWidths();
    syncPosition();
  }, [syncHeaderWidths, syncPosition, paginatedProducts, orderBy, orderDirection]);

  useEffect(() => {
    const onResize = () => {
      syncHeaderWidths();
      syncPosition();
    };
    const onWindowScroll = () => {
      syncPosition();
    };
    const onContainerScroll = () => {
      syncPosition();
    };
    const onFixedScroll = () => {
      const container = containerRef.current;
      const fixedScroll = fixedScrollRef.current;
      if (!container || !fixedScroll) return;
      if (container.scrollLeft !== fixedScroll.scrollLeft) {
        container.scrollLeft = fixedScroll.scrollLeft;
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    const container = containerRef.current;
    const fixedScroll = fixedScrollRef.current;

    if (container)
      container.addEventListener("scroll", onContainerScroll, { passive: true });
    if (fixedScroll)
      fixedScroll.addEventListener("scroll", onFixedScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onWindowScroll);
      if (container)
        container.removeEventListener("scroll", onContainerScroll);
      if (fixedScroll)
        fixedScroll.removeEventListener("scroll", onFixedScroll);
    };
  }, [syncHeaderWidths, syncPosition]);

  const toggleCheckbox = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  if (loading) return <Loading />;

  const columns = isLote ? COLS_WITH_LOTE : COLS_WITH_ACCIONES;

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full overflow-x-auto max-w-screen-xl mx-auto px-4"
      >
        {/* HEADER FIJO */}
        <div
          ref={fixedWrapRef}
          className="fixed z-40"
          style={{ top: HEADER_OFFSET, display: "none" }}
        >
          <div
            ref={fixedScrollRef}
            className="overflow-x-auto bg-gray-100 shadow-sm"
          >
            <table
              ref={fixedTableRef}
              className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[11px] sm:text-sm uppercase text-gray-700"
            >
              <colgroup>
                {columns.map((cls, i) => (
                  <col key={`hcol-${i}`} className={cls} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {isLote && (
                    <th className="px-2 py-2 text-center bg-gray-100">ID</th>
                  )}
                  <th className="px-2 py-2 text-center bg-gray-100">Foto</th>
                  <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Precio(€)" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Lugar" columnKey="lugar" hiddenOnMobile {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Proveedor" columnKey="proveedor" hiddenOnMobile {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" hiddenOnMobile {...{ orderBy, orderDirection, onSort }} />
                  {!isLote && (
                    <th className="px-2 py-2 text-center bg-gray-100">Acciones</th>
                  )}
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <table
          ref={bodyTableRef}
          className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[12px] sm:text-sm"
        >
          <colgroup>
            {columns.map((cls, i) => (
              <col key={`bcol-${i}`} className={cls} />
            ))}
          </colgroup>
          <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] sm:text-sm">
            <tr>
              {isLote && <th className="px-2 py-2 text-center">ID</th>}
              <th className="px-2 py-2 text-center">Foto</th>
              <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Precio(€)" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Lugar" columnKey="lugar" hiddenOnMobile {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Proveedor" columnKey="proveedor" hiddenOnMobile {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" hiddenOnMobile {...{ orderBy, orderDirection, onSort }} />
              {!isLote && <th className="px-2 py-2 text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {paginatedProducts.map((product) => (
              <tr key={product.id} className="text-center">
                {isLote && (
                  <td>
                    {product.id && (
                      <>
                        {product.id}
                        <input
                          type="checkbox"
                          className="ml-2"
                          value={product.id}
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleCheckbox(product.id)}
                        />
                      </>
                    )}
                  </td>
                )}
                <td className="px-2 py-3">
                  {product.foto ? (
                    <img
                      src={product.foto}
                      alt={`Foto de ${product.nombre}`}
                      className="h-10 w-10 object-cover rounded-full mx-auto hover:scale-200 transition-transform duration-200"
                    />
                  ) : (
                    <span className="text-xs">Sin foto</span>
                  )}
                </td>
                {["nombre", "cantidad", "precio", "lugar", "proveedor", "codigoProveedor"].map((field) => {
                  const isLowStock =
                    field === "cantidad" &&
                    parseInt(product[field], 10) <= 5;
                  const hasLongDescription =
                    product.descripcion &&
                    product.descripcion.length > 10;
                  const nameColorClass =
                    field === "nombre"
                      ? hasLongDescription
                        ? "text-gray-600"
                        : "text-red-600"
                      : "";
                  return (
                    <td
                      key={field}
                      className={[
                        "px-2 py-2 whitespace-normal",
                        isLowStock ? "text-red-600 font-semibold" : "",
                        nameColorClass,
                        field === "lugar" || field === "proveedor" || field === "codigoProveedor"
                          ? "hidden sm:table-cell"
                          : "",
                      ].join(" ")}
                      title={product[field]}
                    >
                      <EditableCell
                        value={product[field]}
                        onChange={(val) =>
                          onEditCell(product.id, field, val)
                        }
                      />
                    </td>
                  );
                })}
                {!isLote && (
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        state={{ fromSearch: location.search }}
                        className="text-green-500 hover:text-green-600"
                        title="Detalle"
                      >
                        <i className="fa-solid fa-circle-info"></i>
                      </Link>
                      <Link
                        to={`/products/edit/${product.id}${location.search}`}
                        className="text-blue-500 hover:text-blue-600"
                        title="Editar"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </Link>
                      <button
                        type="button"
                        className="text-yellow-500 hover:text-yellow-600"
                        onClick={() => onSale(product)}
                        title="Venta"
                      >
                        <i className="fa-solid fa-cart-plus"></i>
                      </button>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => onDelete(product)}
                        title="Eliminar"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => handlePageChange(pageNumber)}
              className={`px-3 py-1 rounded cursor-pointer ${currentPage === pageNumber
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

