
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getProductById } from "../services/productServices";
import { getSalesByProduct } from "../services/salesServices"; // 👈 nuevo
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
        const salesData = await getSalesByProduct(Number(id));
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

  return (
    <div className="min-h-[auto] sm:min-h-screen flex flex-col sm:justify-center items-center p-4 bg-gray-50">
      <div className="bg-white shadow rounded p-6 w-full max-w-full sm:max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] sm:gap-6">
          {product.foto && (
            <img
              src={product.foto}
              alt={product.nombre}
              className="w-full max-w-xs mx-auto sm:w-48 sm:h-48 object-cover rounded"
            />
          )}

          <div className="mt-4 sm:mt-0">
            <h1 className="text-2xl text-center font-bold mb-4">{product.nombre}</h1>
            <p><strong>Cantidad:</strong> {product.cantidad} unds</p>
            <p><strong>Precio:</strong> {product.precio} €</p>
            <p><strong>Lugar del producto:</strong> {product.lugar}</p>
            <p><strong>Proveedor:</strong> {product.proveedor}</p>
            <p><strong>Código proveedor:</strong> {product.codigoProveedor}</p>
          </div>

          <div className="mt-4 sm:col-span-2">
            <p className="mb-2"><strong>Descripción:</strong> {product.descripcion}</p>
            <p>
              <strong>URL:</strong>{" "}
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline break-all"
              >
                {product.url}
              </a>
            </p>
          </div>
        </div>

        {/* 👇 Nueva sección: Histórico de ventas */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Histórico de ventas:</h2>
          {sales.length === 0 ? (
            <p>No hay ventas registradas para este producto.</p>
          ) : (
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Fecha de Venta</th>
                  <th className="border px-2 py-1">Cliente</th>
                  <th className="border px-2 py-1">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="border px-2 py-1 text-center">{formatDateTime(s.created_at)}</td>
                    <td className="border px-2 py-1 text-center">{s.cliente} </td>
                    <td className="border px-2 py-1 text-center">{s.cantidad} unds</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Botón volver */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700
           dark:hover:bg-gray-600 rounded-full p-3 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-gray-700 dark:text-gray-300 text-lg"></i>
          <span className="hidden sm:inline text-gray-700 dark:text-gray-300 font-medium">
            Atrás
          </span>
        </button>
      </div>
    </div>
  );
};

export default Product;


