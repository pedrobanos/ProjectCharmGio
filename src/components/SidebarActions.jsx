import { Link } from "react-router-dom";

const SidebarActions = ({ userRole }) => {



    return (
        // w-56 ancho fijo + flex-shrink-0 para que no se encoja
        <aside className="w-44 flex-shrink-0 bg-gray-200 shadow-md hidden md:block box-border">
            {/* sticky: se pega debajo del NavBar. Ajusta top-16 según la altura real de tu NavBar */}
            <div className="sticky top-16 z-10 bg-gray-200 rounded-md p-2">
                {/* botones alineados al inicio (arriba) */}
                <div className="flex flex-col gap-4">
                    <Link
                        to="/create-product"
                        className="w-full flex items-center gap-2 bg-blue-700 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-blue-600 whitespace-nowrap"
                    >
                        <i className="fa-solid fa-plus w-5 text-white" aria-hidden="true"></i>
                        <span>Crear nuevo</span>
                    </Link>
                    <Link
                        to="/products"
                        className="w-full flex items-center gap-2 bg-red-500 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-red-400 whitespace-nowrap"
                    >
                        <i className="fa-solid fa-table-list w-5"></i>
                        <span>Productos</span>
                    </Link>
                    {/* {userRole === "admin" && ( */}
                    <Link
                        to="/sales"
                        className="w-full flex items-center gap-2 bg-yellow-800 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-yellow-700 whitespace-nowrap"
                    >
                        <i className="fa-solid fa-cart-shopping"></i>
                        <span>Ventas</span>
                    </Link>
                    {/* )} */}

                    <Link
                        to="/stats"
                        className="w-full flex items-center gap-2 bg-pink-800 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-pink-700 whitespace-nowrap"
                    >
                        <i className="fa-solid fa-chart-simple w-5"></i>
                        <span>Estadísticas</span>
                    </Link>
                    <Link
                        to="/black-list"
                        className="w-full flex items-center gap-2 bg-black text-white px-2 py-2  rounded-lg hover:bg-gray-700 whitespace-nowrap"
                    >
                        <i className="fa-solid fa-skull-crossbones w-5"></i>
                        <span className="text-center">BlackList </span>
                        <i className="fa-solid fa-skull-crossbones w-5 mx-2"></i>
                    </Link>
                    {userRole === "admin" && (
                        <Link
                            to="/purchases"
                            className="w-full flex items-center gap-2 bg-green-600 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-green-700 whitespace-nowrap"
                        >
                            <i className="fa-solid fa-bag-shopping"></i>
                            <span>Mis Pedidos</span>
                        </Link>
                    )}
                    <Link
                        to="/returns"
                        className="w-full flex items-center gap-2 bg-gray-700 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-gray-800 whitespace-nowrap"
                    >
                        <i className="fa-solid fa-arrow-rotate-left"></i>
                        <span>Devoluciones</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default SidebarActions;

