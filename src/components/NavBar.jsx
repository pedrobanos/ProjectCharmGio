import { Link } from "react-router-dom";

const NavBar = ({ user, onLogout }) => {
    return (
        <nav className="w-full bg-gray-800 text-white px-4 py-3">
            <div className="flex items-center justify-between max-w-6xl mx-auto overflow-x-auto">
                <div className="text-xl font-bold flex-shrink-0">
                    <Link to="/products"><span className="mx-2">💍</span> Charm Gio <span className="mx-2">💍</span></Link>
                </div>

                <ul className="flex space-x-4 whitespace-nowrap">
                    <li className="flex items-center flex-shrink-0">
                        <span className="mr-2">Hola, {user.email}</span>
                    </li>
                    <li className="flex-shrink-0">
                        <button
                            onClick={onLogout}
                            className="hover:bg-red-600 px-3 py-1 rounded"
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