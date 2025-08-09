import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productServices";

const Product = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log("Buscando producto con id:", id);
                const data = await getProductById(Number(id));
                setProduct(data);
            } catch (err) {
                console.error("Error al cargar producto:", err);
                setError("Producto no encontrado o error al cargar.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) return <p>Cargando...</p>;
    if (error) return <p className="text-red-600">{error}</p>;
    if (!product) return <p>Producto no existe.</p>;

    return (
        <div className="min-h-[auto] sm:min-h-screen flex flex-col sm:justify-center items-center p-4 bg-gray-50">
            <div className="bg-white shadow rounded p-6 w-full max-w-full sm:max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] sm:gap-6">
                    {/* Columna izquierda: foto */}
                    {product.foto && (
                        <img
                            src={product.foto}
                            alt={product.nombre}
                            className="w-full max-w-xs mx-auto sm:w-48 sm:h-48 object-cover rounded"
                        />
                    )}

                    {/* Columna derecha: datos principales */}
                    <div className="mt-4 sm:mt-0">
                        <h1 className="text-2xl text-center font-bold mb-4">{product.nombre}</h1>
                        <p><strong>Cantidad:</strong> {product.cantidad} unds</p>
                        <p><strong>Precio:</strong> {product.precio} €</p>
                        <p><strong>Lugar del producto:</strong> {product.lugar}</p>
                        <p><strong>Proveedor:</strong> {product.proveedor}</p>
                        <p><strong>Código proveedor:</strong> {product.codigoProveedor}</p>
                    </div>

                    {/* Segunda fila: descripción y URL ocupan toda la tarjeta */}
                    <div className="mt-4 sm:col-span-2">
                        <p className="mb-2">
                            <strong>Descripción:</strong> {product.descripcion}
                        </p>
                        <p>
                            <strong>URL:</strong>{" "}
                            <a
                                href={product.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline break-all "
                            >
                                {product.url}
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Botón de volver */}
            <div className="flex justify-center mt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full p-3"
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
