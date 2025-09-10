import React, { useState, useMemo, useEffect, useRef, useLayoutEffect, useCallback } from "react";
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
}) => {
  const isActive = orderBy === columnKey;
  const arrow = isActive ? (orderDirection === "asc" ? "↑" : "↓") : "";
  return (
    <th
      scope="col"
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

  const [loading, setLoading] = useState(false);

  // Refs para header fijo y contenedor
  const containerRef = useRef(null);   // div que scrollea en X (tiene px-4)
  const bodyTableRef = useRef(null);   // tabla principal
  const fixedWrapRef = useRef(null);   // contenedor fixed del header
  const fixedScrollRef = useRef(null); // scroller horizontal del header fijo
  const fixedTableRef = useRef(null);  // tabla del header fijo

  // Ajustar si tienes navbar fija (en px)
  const HEADER_OFFSET = 0;

  // Helper: padding horizontal del contenedor
  const getPadding = (el) => {
    const cs = getComputedStyle(el);
    const pl = parseFloat(cs.paddingLeft || "0");
    const pr = parseFloat(cs.paddingRight || "0");
    return { pl, pr };
  };

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

  // Sincroniza anchos de columnas del header fijo con la tabla real
  const syncHeaderWidths = useCallback(() => {
    const bodyTable = bodyTableRef.current;
    const fixedTable = fixedTableRef.current;
    if (!bodyTable || !fixedTable) return;

    const firstRow = bodyTable.querySelector("tbody tr");
    const srcCells = firstRow ? Array.from(firstRow.children) : [];
    const fixedHeaderRow = fixedTable.querySelector("thead tr");
    const destCells = fixedHeaderRow ? Array.from(fixedHeaderRow.children) : [];

    if (srcCells.length !== destCells.length || destCells.length === 0) {
      // Fallback: iguala el ancho total si no hay filas todavía
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

    // Ajuste fino contra redondeos subpixel
    fixedTable.style.boxSizing = "border-box";
    fixedTable.style.maxWidth = `${bodyTable.clientWidth}px`;
  }, []);

  // Posición/visibilidad del header fijo y scroll horizontal sincronizado
  const syncPosition = useCallback(() => {
    const container = containerRef.current;
    const bodyTable = bodyTableRef.current;
    const wrap = fixedWrapRef.current;
    const fixedScroll = fixedScrollRef.current;
    if (!container || !bodyTable || !wrap || !fixedScroll) return;

    const crect = container.getBoundingClientRect();
    const { pl, pr } = getPadding(container);

    // Alinea con el área de contenido (excluye padding del contenedor)
    const left = crect.left + pl;
    const width = Math.max(0, crect.width - pl - pr);

    wrap.style.left = `${left}px`;
    wrap.style.width = `${width}px`;

    // Mostrar/ocultar como navbar según scroll vertical
    const trect = bodyTable.getBoundingClientRect();
    const headerHeight = wrap.offsetHeight || 40;
    const shouldShow = trect.top < HEADER_OFFSET && trect.bottom > HEADER_OFFSET + headerHeight;
    wrap.style.display = shouldShow ? "block" : "none";

    // Sincroniza scroll horizontal del header con el contenedor
    fixedScroll.scrollLeft = container.scrollLeft;
  }, []);

  // Efectos: medir y sincronizar en render/updates
  useLayoutEffect(() => {
    syncHeaderWidths();
    syncPosition();
  }, [syncHeaderWidths, syncPosition, paginatedProducts, orderBy, orderDirection]);

  useEffect(() => {
    const onResize = () => { syncHeaderWidths(); syncPosition(); };
    const onWindowScroll = () => { syncPosition(); };
    const onContainerScroll = () => { syncPosition(); };
    const onFixedScroll = () => {
      const container = containerRef.current;
      const fixedScroll = fixedScrollRef.current;
      if (!container || !fixedScroll) return;
      if (container.scrollLeft !== fixedScroll.scrollLeft) {
        container.scrollLeft = fixedScroll.scrollLeft; // scroll bidireccional
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    const container = containerRef.current;
    const fixedScroll = fixedScrollRef.current;

    if (container) container.addEventListener("scroll", onContainerScroll, { passive: true });
    if (fixedScroll) fixedScroll.addEventListener("scroll", onFixedScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onWindowScroll);
      if (container) container.removeEventListener("scroll", onContainerScroll);
      if (fixedScroll) fixedScroll.removeEventListener("scroll", onFixedScroll);
    };
  }, [syncHeaderWidths, syncPosition]);

  if (loading) return <Loading />;

  return (
    <>
      {/* Contenedor que scrollea horizontalmente (tiene padding x con px-4) */}
      <div ref={containerRef} className="relative w-full overflow-x-auto max-w-screen-xl mx-auto px-4">
        {/* HEADER FIJO como navbar (respetando padding del contenedor) */}
        <div
          ref={fixedWrapRef}
          className="fixed z-40"
          style={{ top: HEADER_OFFSET, display: "none" }}
        >
          <div ref={fixedScrollRef} className="overflow-x-auto bg-gray-100 shadow-sm">
            <table
              ref={fixedTableRef}
              className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[11px] sm:text-sm uppercase text-gray-700"
            >
              <colgroup>
                {COLS.map((cls, i) => (
                  <col key={`hcol-${i}`} className={cls} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="px-2 py-2 text-center bg-gray-100" scope="col">Foto</th>
                  <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Precio" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Lugar" columnKey="lugar" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Proveedor" columnKey="proveedor" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" {...{ orderBy, orderDirection, onSort }} />
                  <SortableHeader label="URL" columnKey="url" {...{ orderBy, orderDirection, onSort }} />
                  <th className="px-2 py-2 text-center bg-gray-100" scope="col">Acciones</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* TABLA NORMAL */}
        <table ref={bodyTableRef} className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[12px] sm:text-sm">
          <colgroup>
            {COLS.map((cls, i) => (
              <col key={`bcol-${i}`} className={cls} />
            ))}
          </colgroup>

          {/* thead visible (para accesibilidad y medición inicial) */}
          <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] sm:text-sm">
            <tr>
              <th className="px-2 py-2 text-center" scope="col">Foto</th>
              <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Precio(€)" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Lugar" columnKey="lugar" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Proveedor" columnKey="proveedor" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" {...{ orderBy, orderDirection, onSort }} />
              <SortableHeader label="URL" columnKey="url" {...{ orderBy, orderDirection, onSort }} />
              <th className="px-2 py-2 text-center" scope="col">Acciones</th>
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
                      className="h-10 w-10 object-cover rounded-full mx-auto hover:scale-200 transition-transform duration-200"
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

                  const hasLongDescription =
                    product.descripcion &&
                    product.descripcion.length > 10;

                  const nameColorClass =
                    field === "nombre"
                      ? hasLongDescription
                        ? "text-gray-600" // corregido (no 'grey')
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



//es con el loader 

// const TableElement = ({
//   products,
//   onEditCell,
//   onDelete,
//   onSale,
//   orderBy,
//   orderDirection,
//   onSort,
// }) => {
//   const location = useLocation();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const itemsPerPage = 15;
//   const totalPages = Math.max(1, Math.ceil((products?.length ?? 0) / itemsPerPage));
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

//   // Sincroniza la página con ?page= en la URL (sin activar loading aquí)
//   useEffect(() => {
//     const p = parseInt(searchParams.get("page") || "1", 10);
//     const safe = Number.isNaN(p) ? 1 : Math.min(Math.max(p, 1), totalPages);
//     setCurrentPage(safe);
//   }, [searchParams, totalPages]);

//   const paginatedProducts = useMemo(() => {
//     const list = Array.isArray(products) ? products : [];
//     const startIdx = (currentPage - 1) * itemsPerPage;
//     return list.slice(startIdx, startIdx + itemsPerPage);
//   }, [products, currentPage]);

//   const handlePageChange = (pageNumber) => {
//     // activamos loading solo cuando realmente cambiamos de página
//     setLoading(true);
//     setCurrentPage(pageNumber);
//     const next = new URLSearchParams(searchParams);
//     next.set("page", String(pageNumber));
//     setSearchParams(next);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   // Apaga el loading cuando los datos a pintar ya están listos
//   useEffect(() => {
//     if (loading) setLoading(false);
//   }, [paginatedProducts, orderBy, orderDirection, loading]);

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
//     if (fixedScroll) fixedScroll.addEventListener("scroll", onFixedScroll);

//     return () => {
//       window.removeEventListener("resize", onResize);
//       window.removeEventListener("scroll", onWindowScroll);
//       if (container) container.removeEventListener("scroll", onContainerScroll);
//       if (fixedScroll) fixedScroll.removeEventListener("scroll", onFixedScroll);
//     };
//   }, [syncHeaderWidths, syncPosition]);

//   if (loading) return <Loading />;

//   return (
//     <>
//       {/* Contenedor que scrollea horizontalmente (tiene padding x con px-4) */}
//       <div
//         ref={containerRef}
//         className="relative w-full overflow-x-auto max-w-screen-xl mx-auto px-4"
//       >
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
//                   <th className="px-2 py-2 text-center bg-gray-100" scope="col">Foto</th>
//                   <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Precio" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Lugar" columnKey="lugar" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Proveedor" columnKey="proveedor" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" {...{ orderBy, orderDirection, onSort }} />
//                   <SortableHeader label="URL" columnKey="url" {...{ orderBy, orderDirection, onSort }} />
//                   <th className="px-2 py-2 text-center bg-gray-100" scope="col">Acciones</th>
//                 </tr>
//               </thead>
//             </table>
//           </div>
//         </div>

//         {/* TABLA NORMAL */}
//         <table
//           ref={bodyTableRef}
//           className="min-w-[1200px] sm:min-w-full w-full table-fixed border-collapse text-[12px] sm:text-sm"
//         >
//           <colgroup>
//             {COLS.map((cls, i) => (
//               <col key={`bcol-${i}`} className={cls} />
//             ))}
//           </colgroup>

//           {/* thead visible (para accesibilidad y medición inicial) */}
//           <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] sm:text-sm">
//             <tr>
//               <th className="px-2 py-2 text-center" scope="col">Foto</th>
//               <SortableHeader label="Producto" columnKey="nombre" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Cantidad" columnKey="cantidad" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Precio" columnKey="precio" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Lugar" columnKey="lugar" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Proveedor" columnKey="proveedor" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="Cod. Proveedor" columnKey="codigoProveedor" {...{ orderBy, orderDirection, onSort }} />
//               <SortableHeader label="URL" columnKey="url" {...{ orderBy, orderDirection, onSort }} />
//               <th className="px-2 py-2 text-center" scope="col">Acciones</th>
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
//                   "url",
//                 ].map((field) => {
//                   const isLowStock =
//                     field === "cantidad" &&
//                     parseInt(product[field], 10) <= 5;
//                   const isUrl = field === "url";

//                   const hasLongDescription =
//                     product.descripcion &&
//                     product.descripcion.length > 10;

//                   const nameColorClass =
//                     field === "nombre"
//                       ? hasLongDescription
//                         ? "text-gray-600"
//                         : "text-red-600"
//                       : "";

//                   return (
//                     <td
//                       key={field}
//                       className={[
//                         "px-2 py-2 whitespace-normal",
//                         isUrl ? "break-all" : "break-words",
//                         isLowStock ? "text-red-600 font-semibold" : "",
//                         nameColorClass,
//                       ].join(" ")}
//                       title={String(product[field] ?? "")}
//                     >
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

//                 <td className="px-2 py-2 whitespace-nowrap">
//                   <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
//                     {/* Detalle: pasa fromSearch para volver a la misma página */}
//                     <Link
//                       to={`/products/${product.id}`}
//                       state={{ fromSearch: location.search }}
//                       className="text-green-500 hover:text-green-600 text-base sm:text-lg"
//                       title="Detalle"
//                     >
//                       <i className="fa-solid fa-circle-info" />
//                     </Link>

//                     <Link
//                       to={`/products/edit/${product.id}${location.search}`}
//                       className="text-blue-500 hover:text-blue-600 text-base sm:text-lg"
//                       title="Editar"
//                     >
//                       <i className="fa-solid fa-pen-to-square" />
//                     </Link>

//                     <button
//                       type="button"
//                       className="text-yellow-500 hover:text-yellow-600 text-base sm:text-lg cursor-pointer"
//                       onClick={() => onSale(product)}
//                       title="Venta"
//                     >
//                       <i className="fa-solid fa-cash-register" />
//                     </button>

//                     <button
//                       type="button"
//                       className="text-red-500 hover:text-red-600 text-base sm:text-lg cursor-pointer"
//                       onClick={() => onDelete(product)}
//                       title="Eliminar"
//                     >
//                       <i className="fa-solid fa-trash" />
//                     </button>
//                   </div>
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
//               className={`px-3 py-1 rounded cursor-pointer ${
//                 currentPage === pageNumber
//                   ? "text-red-500 font-bold underline"
//                   : "text-blue-600 hover:text-blue-900"
//               }`}
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