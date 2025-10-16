import { Link } from "react-router-dom";

const NavBar = ({ user, onLogout }) => {

    const userRole = user.email?.toLowerCase() === "test@test.com" ? "admin" : "user";
    const admin = user.email?.toLowerCase() === "test@test.com" ? "Pedro Baños" : user.email;

    return (
        <nav className="w-full h-full bg-gray-800 text-white px-4 py-3">
            <div className="flex items-center justify-between max-w-8xl ">
                <div className="text-xl font-bold flex-shrink-0">
                    <Link to="/products"><span className="mx-2">💍</span> Charm Gio <span className="mx-2">💍</span></Link>
                </div>

                <ul className="flex space-x-4 whitespace-nowrap">
                    <li className="flex items-center flex-shrink-0">
                        <span className="mr-2">Hola, {admin}</span>
                    </li>
                    <li className="flex-shrink-0">
                        <Link
                            to="/stats"
                            className="hover:text-yellow-400 rounded"
                            title="Estadisticas"
                        >
                            <i className="fa-solid fa-chart-simple"></i>
                        </Link>
                    </li>
                    {userRole && (
                        <li className="flex-shrink-0">
                            <Link
                                to="/orders"
                                className="hover:text-yellow-400 rounded"
                            >
                                <i className="fas fa-shopping-cart"></i>
                            </Link>
                        </li>
                    )}
                    <li className="flex-shrink-0">
                        <button
                            onClick={onLogout}
                            className="hover:text-red-600 rounded cursor-pointer"
                            title="Cerrar sesión"
                        >
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;