
import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { bloquearCliente, desbloquearCliente, getClientesBlacklisted } from "../services/clientServices";
import { useFetchSales, useLowStockProducts } from "../hooks";
import ReembolsoModal from "../components/ReembolsoModal";
import { MONTHS } from "../Constants";



const SalesView = ({ productId, userRole }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [filterBy, setFilterBy] = useState("todos");
  const [showLowStock, setShowLowStock] = useState(false);
  const [isReembolsoOpen, setIsReembolsoOpen] = useState(false);
  const year = new Date().getFullYear();
  const [refreshKey, setRefreshKey] = useState(0); // 👈 Nuevo estado para forzar refresco

  const {
    loading,
    sales,
    products,
    saldoMesAnterior,
    saldoMes,
    saldoTotalPendiente,
    setSaldoMes,
  } = useFetchSales({ year, selectedMonth, productId, refreshKey });



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

  const totalVentas = filteredSales.reduce((acc, s) => acc + (s.cantidad || 0), 0);

  const beneficioTotal = filteredSales
    .filter((s) => !(s.clienteNombre || "").toLowerCase().includes("carol"))
    .reduce((acc, s) => {
      const product = products.find((p) => Number(p.id) === Number(s.product_id));
      if (product && s.precio_venta != null)
        return acc + (s.precio_venta - (product.precio || 0)) * s.cantidad;
      return acc;
    }, 0);
  return (
    <div className="max-w-screen-lg mx-auto p-4 space-y-6">
      <h1 className="text-5xl text-center font-bold mb-8 text-blue-500">
        Ventas de {MONTHS[selectedMonth]} - {year}
      </h1>

      {/* Botones meses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
        {MONTHS.map((name, index) => (
          <button
            key={name}
            onClick={() => setSelectedMonth(index)}
            className={`px-3 py-2 rounded-lg border font-semibold transition ${selectedMonth === index
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-blue-100"
              }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Filtro cliente + checkbox stock */}
      <div className="flex flex-row items-center gap-4 w-full mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="filtroCliente" className="font-semibold text-gray-700" hidden={showLowStock}>
            Vendido por:
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

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
          />
          <span className="text-sm">Ver productos con stock bajo</span>
        </label>

        {filterBy === "carol" && saldoTotalPendiente > 0 && !showLowStock &&
          (
            userRole === "admin" ?
              (
                <button
                  type="button"
                  onClick={() => setIsReembolsoOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer font-semibold hover:bg-green-700 transition"
                >
                  Iniciar reembolso
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReembolsoOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer font-semibold hover:bg-green-700 transition"
                >
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

        {/* {showLowStock && (
          <Link
            to="/orders"
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md 
             hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Tramitar Pedido</span>
          </Link>
        )} */}
      </div>

      {/* Tabla */}
      <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-md">
        {!showLowStock ? (
          <table className="table-fixed w-full border-collapse text-sm sm:text-base">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
              <tr>
                <th className="w-16 px-2 py-2 text-center">Foto</th>
                <th className="w-40 px-2 py-2 text-center">Producto</th>
                <th className="w-12 px-2 py-2 text-center">Cantidad</th>
                <th className="w-24 px-2 py-2 text-center">Precio Venta</th>
                <th className="w-28 px-2 py-2 text-center">Fecha</th>
                <th className="w-28 px-2 py-2 text-center">Cliente</th>
                <th className="w-20 px-2 py-2 text-center">Blacklist</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {filteredSales.map((s) => {
                const isBlacklisted = blacklistedClientes.has(s.cliente_id);
                return (
                  <tr key={s.id} className="text-center hover:bg-gray-50">
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
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-800 sticky bottom-0">
              <tr className="border-t border-gray-300">
                <td colSpan={5} className="px-4 py-2 text-start">
                  Total de ventas:
                </td>
                <td colSpan={2} className="px-4 py-2 text-center text-blue-600">
                  {totalVentas} unds
                </td>
              </tr>

              {filteredSales.some((s) => !(s.clienteNombre || "").toLowerCase().includes("carol")) && (
                <tr className="border-t border-gray-300">
                  <td colSpan={5} className="px-4 py-2 text-start">Beneficio:</td>
                  <td colSpan={2} className={`px-4 py-2 text-center ${beneficioTotal >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                    {beneficioTotal.toFixed(2)} €
                  </td>
                </tr>
              )}
              {filteredSales.some((s) => (s.clienteNombre || "").toLowerCase().includes("carol")) && (
                <>
                  <tr className="border-t border-gray-300">
                    <td colSpan={5} className="px-4 py-2 text-start">
                      Saldo mes anterior (Carol):
                    </td>
                    <td colSpan={2} className="px-4 py-2 text-center text-yellow-600">
                      {saldoMesAnterior.toFixed(2)} €
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td colSpan={5} className="px-4 py-2 text-start">
                      Saldo del mes actual (Carol):
                    </td>
                    <td colSpan={2} className="px-4 py-2 text-center text-blue-600">
                      {saldoMes.toFixed(2)} €
                    </td>
                  </tr>
                  <tr className="border-t border-gray-300">
                    <td colSpan={5} className="px-4 py-2 text-start">
                      Saldo total pendiente (Carol):
                    </td>
                    <td colSpan={2} className="px-4 py-2 text-center text-red-600">
                      {saldoTotalPendiente.toFixed(2)} €
                    </td>
                  </tr>
                </>
              )}

            </tfoot>
          </table>
        ) : (
          // 🔹 Tabla de stock bajo
          <table className="table-fixed w-full border-collapse text-sm sm:text-base">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
              <tr>
                <th className="w-16 px-2 py-2 text-center">Foto</th>
                <th className="w-40 px-2 py-2 text-center">Producto</th>
                <th className="w-16 px-2 py-2 text-center">Stock</th>
                <th className="w-24 px-2 py-2 text-center">Total Vendido</th>
                <th className="w-24 px-2 py-2 text-center">Lugar</th>
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
    </div>
  );
};

export default SalesView;
