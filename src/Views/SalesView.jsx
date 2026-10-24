
import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { bloquearCliente, desbloquearCliente, getClientesBlacklisted } from "../services/clientServices";
import { useFetchSales, useLowStockProducts } from "../hooks";
import PageHeader from "../components/PageHeader";
import ReembolsoModal from "../components/ReembolsoModal";
import { MONTHS } from "../Constants";
import { processReturn } from "../services/salesServices";
import { Link } from "react-router-dom";


const SalesView = ({ productId, userRole }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  //NEW FEATURE: Filtrado por año
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); 
  const [filterBy, setFilterBy] = useState("todos");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isReembolsoOpen, setIsReembolsoOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 👈 Nuevo estado para forzar refresco

  //DEVOLUCION
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loadingReturn, setLoadingReturn] = useState(false);

  const {
    loading,
    sales,
    products,
    saldoMesAnterior,
    saldoMes,
    saldoTotalPendiente,
    setSaldoMes,
  } = useFetchSales({ selectedMonth, selectedYear, productId, refreshKey });


  const { loading: loadingLowStock, lowStockProducts } = useLowStockProducts(showLowStock);

  const [blacklistedClientes, setBlacklistedClientes] = useState(new Set());

  // 🔹 Blacklist
  const fetchBlacklist = async () => {
    try {
      const clientesIds = await getClientesBlacklisted();
      setBlacklistedClientes(new Set(clientesIds));
    } catch (err) {
      console.error("Error cargando blacklist:", err);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  useEffect(() => {
    if (userRole === "user") {
      setFilterBy("carol");
    }
  }, [userRole]);

  if (loading || (showLowStock && loadingLowStock)) return <Loading />;

  // 🔹 Filtros clientes
  const filteredSales = sales.filter((s) => {
    const cliente = (s.clienteNombre || "").toLowerCase().trim();
    if (filterBy === "gio") return cliente.includes("gio");
    if (filterBy === "carol") return cliente.includes("carol");
    if (filterBy === "otros")
      return !cliente.includes("gio") && !cliente.includes("carol");
    return true;
  });


  const activeSales = filteredSales.filter((s) => s.estado !== "devuelta");
  // Total de unidades vendidas (solo activas)
  const totalVentas = activeSales.reduce((acc, s) => acc + (s.cantidad || 0), 0);
  // Beneficio total (sin Carol y sin devueltas)
  const beneficioTotal = activeSales
    .filter((s) => !(s.clienteNombre || "").toLowerCase().includes("carol"))
    .reduce((acc, s) => {
      const product = products.find((p) => Number(p.id) === Number(s.product_id));
      if (product && s.precio_venta != null)
        return acc + (s.precio_venta - (product.precio || 0)) * s.cantidad;
      return acc;
    }, 0);


  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 pb-10 space-y-5">
      <PageHeader
        icon="fa-solid fa-cart-shopping"
        tone="amber"
        title={`Ventas de ${MONTHS[selectedMonth]} ${selectedYear}`}
        subtitle={`${filteredSales.length} ventas · ${totalVentas} unidades`}
        className="mb-2"
      />

      {/* Botones meses */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {MONTHS.map((name, index) => (
          <button
            key={name}
            onClick={() => setSelectedMonth(index)}
            className={`px-2 py-2 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-1.5 ${selectedMonth === index
              ? "bg-yellow-700 text-white border-yellow-700 shadow-sm"
              : "bg-white border-gray-200 text-gray-700 hover:bg-yellow-50"
              }`}
          >
            <i className="fa-regular fa-calendar text-xs opacity-70"></i>
            {name}
          </button>
        ))}
      </div>

      {/* Filtro cliente + checkbox stock */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-3">
        <div className="flex items-center gap-2">
          <label htmlFor="filtroCliente" className="font-semibold text-gray-700 text-sm" hidden={showLowStock}>
            <i className="fa-solid fa-user-tag mr-1.5 text-gray-400"></i>Vendido por:
          </label>
          {userRole === "admin" ? (
            // 🔹 Admin puede seleccionar cualquier cliente
            <select
              id="filtroCliente"
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="border pl-3 pr-3 py-2 w-48 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              hidden={showLowStock}
            >
              <option value="todos">Todos</option>
              <option value="gio">Gio</option>
              <option value="carol">Carol</option>
              <option value="otros">Pedro</option>
            </select>
          ) : (
            // 🔒 User normal solo puede ver la vista de Carol, sin opción a cambiar
            <select
              id="filtroCliente"
              value="carol"
              disabled
              className="border pl-3 pr-3 py-2 w-48 rounded bg-gray-100 text-gray-600 cursor-not-allowed font-bold"
            >
              <option value="carol">Carol</option>
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
     <label htmlFor="filtroAno" className="font-semibold text-gray-700 text-sm">
            <i className="fa-solid fa-calendar-days mr-1.5 text-gray-400"></i>Año:
     </label>
       <select
              id="filtroAno"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border pl-3 pr-3 py-2 w-48 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            >
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
      </select>
        </div>


        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
          />
          <span className="text-sm"><i className="fa-solid fa-triangle-exclamation mr-1 text-orange-500"></i>Ver productos con stock bajo</span>
        </label>

        {filterBy === "carol" && saldoTotalPendiente > 0 && !showLowStock &&
          (
            userRole === "admin" ?
              (
                <button
                  type="button"
                  onClick={() => setIsReembolsoOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer font-semibold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-hand-holding-dollar"></i>
                  Iniciar reembolso
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReembolsoOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer font-semibold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-receipt"></i>
                  Ver Reembolso
                </button>
              )
          )
        }
        <ReembolsoModal
          userRole={userRole}
          isOpen={isReembolsoOpen}
          saldoInicial={saldoTotalPendiente}
          onClose={() => setIsReembolsoOpen(false)}
          onReembolso={(importe) =>
            setSaldoMes((prev) => Math.max(prev - importe, 0))
          }
          onRefresh={() => setRefreshKey((prev) => prev + 1)} // 👈 esto refresca los datos sin reload
        />

        {showLowStock && (
          <Link
            to="/orders"
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md 
             hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Tramitar Pedido</span>
          </Link>
        )}
      </div>
      {/* Tabla */}
      <div className="max-h-[700px] overflow-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
        {!showLowStock ? (
          <table className="table-fixed w-full min-w-[820px] border-collapse text-sm sm:text-base">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
              <tr>
                <th className="w-16 px-2 py-2 text-center"><i className="fa-solid fa-image mr-1 text-gray-400"></i>Foto</th>
                <th className="w-40 px-2 py-2 text-center"><i className="fa-solid fa-gem mr-1 text-gray-400"></i>Producto</th>
                <th className="w-16 px-2 py-2 text-center"><i className="fa-solid fa-boxes-stacked mr-1 text-gray-400"></i>Cant.</th>
                <th className="w-24 px-2 py-2 text-center"><i className="fa-solid fa-euro-sign mr-1 text-gray-400"></i>Precio</th>
                <th className="w-28 px-2 py-2 text-center"><i className="fa-regular fa-clock mr-1 text-gray-400"></i>Fecha</th>
                <th className="w-28 px-2 py-2 text-center"><i className="fa-solid fa-user mr-1 text-gray-400"></i>Cliente</th>
                <th className="w-20 px-2 py-2 text-center"><i className="fa-solid fa-skull-crossbones mr-1 text-gray-400"></i>Blacklist</th>
                <th className="w-20 px-2 py-2 text-center"><i className="fa-solid fa-arrow-rotate-left mr-1 text-gray-400"></i>Devol.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {filteredSales.map((s) => {
                const isBlacklisted = blacklistedClientes.has(s.cliente_id);
                return (
                  <tr
                    key={s.id}
                    className={`text-center transition-colors duration-200 ${s.estado === "devuelta"
                      ? "bg-red-100 text-red-400 line-through bg-[repeating-linear-gradient(45deg,#f3f4f6,#f3f4f6_10px,#e5e7eb_10px,#e5e7eb_20px)]"
                      : "hover:bg-gray-50"
                      }`}
                  >
                    <td className="px-2 py-3">
                      {s.foto ? (
                        <img
                          src={s.foto}
                          alt={s.productName}
                          className="h-14 w-14 object-cover rounded-full mx-auto hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <span className="text-xs">Sin foto</span>
                      )}
                    </td>
                    <td className="px-2 py-2 break-words whitespace-normal text-left">
                      {s.productName}
                    </td>
                    <td className="px-2 py-2 text-green-600 font-bold">{s.cantidad}</td>
                    <td className="px-2 py-2">
                      {s.precio_venta != null ? `${s.precio_venta} €` : "-"}
                    </td>
                    <td className="px-2 py-2 text-left whitespace-nowrap">
                      {new Date(s.created_at).toLocaleString("es-ES")}
                    </td>
                    <td className="px-2 py-2 truncate">{s.clienteNombre}</td>
                    <td className="px-2 py-2">
                      <button
                        onClick={async () => {
                          try {
                            if (isBlacklisted) {
                              await desbloquearCliente(s.clienteNombre);
                            } else {
                              await bloquearCliente(s.clienteNombre);
                            }
                            fetchBlacklist();
                          } catch (err) {
                            console.error("Error cambiando blacklist:", err);
                          }
                        }}
                        className={`p-2 rounded-full w-10 h-10 cursor-pointer transition-colors ${isBlacklisted
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                      >
                        <i className="fa-solid fa-skull-crossbones"></i>
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        disabled={s.estado === "devuelta"}
                        onClick={() => {
                          if (s.estado !== "devuelta") {
                            setSelectedSale(s);
                            setShowConfirmModal(true);
                          }
                        }}
                        className={`p-2 rounded-full w-10 h-10  transition-colors ${s.estado === "devuelta"
                          ? " text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-600 hover:bg-blue-100 cursor-pointer hover:text-blue-700"
                          }`}
                        title={s.estado === "devuelta" ? "Venta devuelta" : "Procesar devolución"}
                      >
                        <i className="fa-solid fa-arrow-rotate-left"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-800 sticky bottom-0">
              <tr className="border-t border-gray-300">
                <td colSpan={5} className="px-4 py-2 text-right">
                  <i className="fa-solid fa-boxes-stacked mr-2 text-blue-500"></i>Total de ventas:
                </td>
                <td colSpan={3} className="px-4 py-2 text-end text-blue-600">
                  {totalVentas} unds
                </td>
              </tr>

              {filteredSales.some((s) => !(s.clienteNombre || "").toLowerCase().includes("carol")) && (
                <tr className="border-t border-gray-300">
                  <td colSpan={5} className="px-4 py-2 text-right"><i className="fa-solid fa-sack-dollar mr-2 text-green-600"></i>Beneficio:</td>
                  <td colSpan={3} className={`px-4 py-2 text-end ${beneficioTotal >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                    {beneficioTotal.toFixed(2)} €
                  </td>
                </tr>
              )}
              {filteredSales.some((s) => (s.clienteNombre || "").toLowerCase().includes("carol")) && (
                <>
                  <tr className="border-t border-gray-300">
                    <td colSpan={5} className="px-4 py-2 text-right">
                      <i className="fa-solid fa-clock-rotate-left mr-2 text-yellow-600"></i>Saldo mes anterior (Carol):
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-end text-yellow-600">
                      {saldoMesAnterior.toFixed(2)} €
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td colSpan={5} className="px-4 py-2 text-right">
                      <i className="fa-solid fa-calendar-check mr-2 text-blue-600"></i>Saldo del mes actual (Carol):
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-end text-blue-600">
                      {saldoMes.toFixed(2)} €
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td colSpan={5} className="px-4 py-2 text-right">
                      <i className="fa-solid fa-hourglass-half mr-2 text-red-600"></i>Saldo total pendiente (Carol):
                    </td>
                    <td colSpan={3} className="px-4 py-2 text-end text-red-600">
                      {saldoTotalPendiente.toFixed(2)} €
                    </td>
                  </tr>
                </>
              )}

            </tfoot>
          </table>
        ) : (
          // 🔹 Tabla de stock bajo
          <table className="table-fixed w-full min-w-[640px] border-collapse text-sm sm:text-base">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
              <tr>
                <th className="w-16 px-2 py-2 text-center"><i className="fa-solid fa-image mr-1 text-gray-400"></i>Foto</th>
                <th className="w-40 px-2 py-2 text-center"><i className="fa-solid fa-gem mr-1 text-gray-400"></i>Producto</th>
                <th className="w-16 px-2 py-2 text-center"><i className="fa-solid fa-boxes-stacked mr-1 text-gray-400"></i>Stock</th>
                <th className="w-24 px-2 py-2 text-center"><i className="fa-solid fa-chart-line mr-1 text-gray-400"></i>Vendido</th>
                <th className="w-24 px-2 py-2 text-center"><i className="fa-solid fa-location-dot mr-1 text-gray-400"></i>Lugar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {lowStockProducts?.data?.map((p) => (
                <tr key={p.id} className="text-center hover:bg-gray-50">
                  <td className="px-2 py-2">
                    {p.foto ? (
                      <img
                        src={p.foto}
                        alt={p.nombre}
                        className="h-14 w-14 object-cover rounded-full mx-auto"
                      />
                    ) : (
                      <span className="text-xs">Sin foto</span>
                    )}
                  </td>
                  <td className="px-2 py-2">{p.nombre}</td>
                  <td className="px-2 py-2 text-red-600 font-bold">{p.cantidad}</td>
                  <td className="px-2 py-2">{p.total_vendido}</td>
                  <td className="px-2 py-2">{p.lugar || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showConfirmModal && selectedSale && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 text-center space-y-4">
            <h2 className="text-lg font-bold text-gray-800">
              ¿Está seguro de devolver este producto?
            </h2>
            <p className="text-gray-600 text-sm">
              Producto: <span className="font-semibold">{selectedSale.productName}</span><br />
              Cantidad: {selectedSale.cantidad} unidad(es)
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-xmark"></i>
                Cancelar
              </button>
              <button
                disabled={loadingReturn}
                onClick={async () => {
                  try {
                    setLoadingReturn(true);
                    await processReturn(selectedSale.id);
                    setShowConfirmModal(false);
                    setSelectedSale(null);
                    setRefreshKey((prev) => prev + 1); // refresca ventas
                    alert("✅ Devolución procesada correctamente");
                  } catch (err) {
                    console.error("Error al procesar devolución:", err);
                    alert("❌ Error al procesar la devolución");
                  } finally {
                    setLoadingReturn(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {loadingReturn ? "Procesando..." : "Sí, devolver"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesView;
