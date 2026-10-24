import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { getProductById } from "../services/productServices";
import { listSales } from "../services/salesServices"; // 👈 usamos listSales
import { formatDateTime } from "../Constants";
import Loading from "./Loading";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [sales, setSales] = useState([]); // 👈 guardamos las ventas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await getProductById(Number(id));
        const { data: salesData } = await listSales({ productId: Number(id) }); // 👈 obtenemos ventas con clienteNombre
        setProduct(productData);
        setSales(salesData);
      } catch (err) {
        console.error("Error al cargar producto/ventas:", err);
        setError("Producto o ventas no encontradas.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleBack = () => {
    const fromSearch = location.state?.fromSearch;
    if (fromSearch) {
      navigate(`/products${fromSearch}`, { replace: true });
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/products");
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>Producto no existe.</p>;

  const Info = ({ icon, label, children, accent }) => (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5 min-w-0">
      <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 flex items-center gap-1.5">
        <i className={`${icon} text-gray-400`}></i>
        {label}
      </p>
      <p className={`font-semibold mt-0.5 truncate ${accent || "text-gray-900"}`}>{children || "—"}</p>
    </div>
  );

  const totalVendidas = sales.reduce((acc, s) => acc + (Number(s.cantidad) || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-2 pb-10">
      {/* Barra superior */}
      <div className="flex items-center justify-between gap-3 mt-12 mb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Atrás
        </button>
        <Link
          to={`/products/edit/${product.id}`}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          <i className="fa-solid fa-pen-to-square"></i>
          Editar
        </Link>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5">
          {product.foto ? (
            <img
              src={product.foto}
              alt={product.nombre}
              className="w-full max-w-xs mx-auto sm:w-56 sm:h-56 object-cover rounded-2xl border border-gray-100"
            />
          ) : (
            <div className="w-full max-w-xs mx-auto sm:w-56 sm:h-56 aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
              <i className="fa-solid fa-image text-5xl"></i>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-gem text-red-500 text-xl"></i>
              {product.nombre}
            </h1>
            <p className="text-sm text-gray-500 mb-4">Producto #{product.id}</p>
            <div className="grid grid-cols-2 gap-2">
              <Info
                icon="fa-solid fa-boxes-stacked"
                label="Stock"
                accent={Number(product.cantidad) <= 5 ? "text-red-600" : "text-gray-900"}
              >
                {product.cantidad} uds
              </Info>
              <Info icon="fa-solid fa-euro-sign" label="Precio">
                {product.precio} €
              </Info>
              <Info icon="fa-solid fa-location-dot" label="Lugar">
                {product.lugar}
              </Info>
              <Info icon="fa-solid fa-chart-line" label="Vendidas">
                {totalVendidas} uds
              </Info>
              <Info icon="fa-solid fa-truck" label="Proveedor">
                {product.proveedor}
              </Info>
              <Info icon="fa-solid fa-barcode" label="Código proveedor">
                {product.codigoProveedor}
              </Info>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-align-left text-gray-400"></i>Descripción
            </p>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl px-3 py-2.5">
              {product.descripcion || <span className="text-gray-400">Sin descripción</span>}
            </p>
          </div>
          {product.url && (
            <p className="flex items-center gap-2 min-w-0">
              <i className="fa-solid fa-link text-gray-400"></i>
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline break-all"
              >
                {product.url}
              </a>
            </p>
          )}
        </div>

        {/* Histórico de ventas */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-yellow-700 text-white flex items-center justify-center text-sm">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </span>
            Histórico de ventas
          </h2>
          {sales.length === 0 ? (
            <p className="text-gray-500">No hay ventas registradas para este producto.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <th className="px-3 py-2.5"><i className="fa-regular fa-clock mr-1.5 text-gray-400"></i>Fecha</th>
                    <th className="px-3 py-2.5"><i className="fa-solid fa-user mr-1.5 text-gray-400"></i>Cliente</th>
                    <th className="px-3 py-2.5"><i className="fa-solid fa-boxes-stacked mr-1.5 text-gray-400"></i>Cantidad</th>
                    <th className="px-3 py-2.5"><i className="fa-solid fa-euro-sign mr-1.5 text-gray-400"></i>Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-center">{formatDateTime(s.created_at)}</td>
                      <td className="px-3 py-2 text-center">{s.clienteNombre}</td>
                      <td className="px-3 py-2 text-center">{s.cantidad} uds</td>
                      <td className="px-3 py-2 text-center font-semibold">{s.precio_venta} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;



