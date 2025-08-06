import React, { useState, useMemo, useEffect } from "react";

const EditableCell = ({ value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

   useEffect(() => {
    if (!isEditing) {
      setTempValue(value);
    }
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

    <span onDoubleClick={handleDoubleClick} className="cursor-pointer">
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
      <div className="flex items-center justify-center space-x-1 ">
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
  //const [isCantidadMenorQueCinco, setIsCantidadMenorQueCinco] = useState(false);

  // Productos para la página actual
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return products.slice(startIdx, startIdx + itemsPerPage);
  }, [products, currentPage]);

  const handlePrev = () => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  };

  return (
    <>
      <div className="w-full overflow-x-auto lg:overflow-visible lg:max-w-6xl lg:mx-auto">
        <table className="min-w-[900px] w-full table-auto border-collapse text-[12px] sm:text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-[11px] sm:text-sm">
            <tr>
              <th className="px-2 py-2 text-center whitespace-nowrap">Foto</th>
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
              <th className="px-2 py-2 text-center whitespace-nowrap">Acciones</th>
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
                  const isLowStock = field === "cantidad" && parseInt(product[field], 10) <= 5;
                  return (
                    <td
                      key={field}
                      className={`px-2 py-2 whitespace-nowrap ${isLowStock ? "text-red-600 font-semibold" : ""
                        }`}
                    >
                      <EditableCell
                        value={product[field]}
                        onChange={(val) => onEditCell(product.id, field, val)}
                      />
                    </td>
                  );
                })}
                <td className="px-2 py-2 flex flex-col sm:flex-row gap-2 justify-center items-center whitespace-nowrap">
                  <button
                    className="text-green-500 hover:text-green-600 text-base sm:text-lg"
                    onClick={() => onView(product)}
                    title="Ver"
                  >
                    <i className="fa-solid fa-circle-info"></i>
                  </button>
                  <button
                    className="text-yellow-500 hover:text-yellow-600 text-base sm:text-lg"
                    onClick={() => onSale(product)}
                    title="Venta"
                  >
                    <i className="fa-solid fa-cash-register"></i>
                  </button>
                  <button
                    className="text-red-500 hover:text-red-600 text-base sm:text-lg"
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

      <div className="flex items-center justify-center space-x-4 mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded bg-gray-300 disabled:opacity-50 hover:bg-gray-400 ${totalPages === 1 ? "invisible" : ""
            }`}
        >
          &lt; Anterior
        </button>

        <span>
          Página {currentPage} / {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded bg-gray-300 disabled:opacity-50 hover:bg-gray-400 ${totalPages === 1 ? "invisible" : ""
            }`}
        >
          Siguiente &gt;
        </button>
      </div>
    </>
  );
};

export default TableElement;
