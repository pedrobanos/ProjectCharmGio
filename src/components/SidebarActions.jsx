import { Link } from "react-router-dom";

const SidebarActions = () => {
    return (
        // w-56 ancho fijo + flex-shrink-0 para que no se encoja
        <aside className="w-44 flex-shrink-0 bg-gray-100 shadow-md hidden md:block box-border">
            {/* sticky: se pega debajo del NavBar. Ajusta top-16 según la altura real de tu NavBar */}
            <div className="sticky top-16 z-10 bg-gray-100 rounded-md p-2">
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
                    <Link
                        to="/sales"
                        className="w-full flex items-center gap-2 bg-yellow-800 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-yellow-700 whitespace-nowrap"
                    >
                        <i className="fa-solid fa-cart-shopping"></i>
                        <span>Ventas</span>
                    </Link>
                    <Link
                        to="/stats"
                        className="w-full flex items-center gap-2 bg-pink-800 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-pink-700 whitespace-nowrap"
                    >
                        <i className="fa-solid fa-chart-simple w-5"></i>
                        <span>Estadísticas</span>
                    </Link>
                    {/* <Link
            to="/promoter-profiles"
            className="w-full flex items-center gap-2 bg-pink-800 opacity-80 text-white px-2 py-2 rounded-lg hover:bg-pink-700 whitespace-nowrap"
          >
            <i className="fa-solid fa-magnifying-glass w-5"></i>
            <span>Buscar</span>
          </Link> */}
                </div>
            </div>
        </aside>
    );
};

export default SidebarActions;

