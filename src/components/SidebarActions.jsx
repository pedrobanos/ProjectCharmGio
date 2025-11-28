// import { Link } from "react-router-dom";

// const SidebarActions = ({ userRole }) => {
//   return (
//     <aside className="h-full fixed left-0 top-13 z-20 w-14 bg-gray-200 shadow-md overflow-visible hidden md:block flex-shrink-0">
//       <div className="p-2 flex flex-col gap-5 mt-4">

//         {/* Crear nuevo */}
//         <div className="relative group">
//           <Link
//             to="/create-product"
//             className="flex items-center gap-2 px-2 py-2 rounded-lg bg-blue-700 text-white"
//           >
//             <i className="fa-solid fa-plus w-5 text-white"></i>
//           </Link>
//           <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 whitespace-nowrap">
//             <Link
//               to="/create-product"
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white shadow-lg"
//             >
//               <i className="fa-solid fa-plus w-5 text-white"></i>
//               <span>Crear nuevo</span>
//             </Link>
//           </div>
//         </div>

//         {/* Productos */}
//         <div className="relative group">
//           <Link
//             to="/products"
//             className="flex items-center gap-2 px-2 py-2 rounded-lg bg-red-500 text-white"
//           >
//             <i className="fa-solid fa-table-list w-5 text-white"></i>
//           </Link>
//           <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 whitespace-nowrap">
//             <Link
//               to="/products"
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white shadow-lg"
//             >
//               <i className="fa-solid fa-table-list w-5 text-white"></i>
//               <span>Productos</span>
//             </Link>
//           </div>
//         </div>

//         {/* Ventas */}
//         <div className="relative group">
//           <Link
//             to="/sales"
//             className="flex items-center gap-2 px-2 py-2 rounded-lg bg-yellow-800 text-white"
//           >
//             <i className="fa-solid fa-cart-shopping text-white"></i>
//           </Link>
//           <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 whitespace-nowrap">
//             <Link
//               to="/sales"
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-800 text-white shadow-lg"
//             >
//               <i className="fa-solid fa-cart-shopping text-white"></i>
//               <span>Ventas</span>
//             </Link>
//           </div>
//         </div>

//         {/* Estadísticas */}
//         <div className="relative group">
//           <Link
//             to="/stats"
//             className="flex items-center gap-2 px-2 py-2 rounded-lg bg-pink-800 text-white"
//           >
//             <i className="fa-solid fa-chart-simple w-5 text-white"></i>
//           </Link>
//           <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 whitespace-nowrap">
//             <Link
//               to="/stats"
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-800 text-white shadow-lg"
//             >
//               <i className="fa-solid fa-chart-simple w-5 text-white"></i>
//               <span>Estadísticas</span>
//             </Link>
//           </div>
//         </div>

//         {/* BlackList */}
//         <div className="relative group">
//           <Link
//             to="/black-list"
//             className="flex items-center gap-2 px-2 py-2 rounded-lg bg-black text-white"
//           >
//             <i className="fa-solid fa-skull-crossbones w-5 text-white"></i>
//           </Link>
//           <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 whitespace-nowrap">
//             <Link
//               to="/black-list"
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white shadow-lg"
//             >
//               <i className="fa-solid fa-skull-crossbones w-5 text-white"></i>
//               <span>BlackList</span>
//             </Link>
//           </div>
//         </div>

//         {/* Mis Pedidos (solo admin) */}
//         {userRole === "admin" && (
//           <div className="relative group">
//             <Link
//               to="/purchases"
//               className="flex items-center gap-2 px-2 py-2 rounded-lg bg-green-600 text-white"
//             >
//               <i className="fa-solid fa-bag-shopping text-white"></i>
//             </Link>
//             <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 whitespace-nowrap">
//               <Link
//                 to="/purchases"
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white shadow-lg"
//               >
//                 <i className="fa-solid fa-bag-shopping text-white"></i>
//                 <span>Mis Pedidos</span>
//               </Link>
//             </div>
//           </div>
//         )}

//         {/* Devoluciones */}
//         <div className="relative group">
//           <Link
//             to="/returns"
//             className="flex items-center gap-2 px-2 py-2 rounded-lg bg-gray-700 text-white"
//           >
//             <i className="fa-solid fa-arrow-rotate-left text-white"></i>
//           </Link>
//           <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 whitespace-nowrap">
//             <Link
//               to="/returns"
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white shadow-lg"
//             >
//               <i className="fa-solid fa-arrow-rotate-left text-white"></i>
//               <span>Devoluciones</span>
//             </Link>
//           </div>
//         </div>

//       </div>
//     </aside>
//   );
// };

// export default SidebarActions;


import { Link } from "react-router-dom";

const SidebarActions = ({ userRole }) => {
  return (
    <aside className="h-full fixed left-0 top-13 z-20 w-14 bg-gray-200 shadow-md overflow-visible hidden md:block flex-shrink-0">
      <div className="p-2 flex flex-col gap-5 mt-4">

        {/* Crear nuevo */}
        <div className="relative group">
          <Link
            to="/create-product"
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-blue-700 text-white"
          >
            <i className="fa-solid fa-plus w-5 text-white"></i>
          </Link>
          <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 
            transition-all duration-300 z-30 whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white shadow-lg">
              <i className="fa-solid fa-plus w-5 text-white"></i>
              <span>Crear nuevo</span>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="relative group">
          <Link
            to="/products"
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-red-500 text-white"
          >
            <i className="fa-solid fa-table-list w-5 text-white"></i>
          </Link>
          <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 
            transition-all duration-300 z-30 whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white shadow-lg">
              <i className="fa-solid fa-table-list w-5 text-white"></i>
              <span>Productos</span>
            </div>
          </div>
        </div>

        {/* Ventas */}
        <div className="relative group">
          <Link
            to="/sales"
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-yellow-800 text-white"
          >
            <i className="fa-solid fa-cart-shopping text-white"></i>
          </Link>
          <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 
            transition-all duration-300 z-30 whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-800 text-white shadow-lg">
              <i className="fa-solid fa-cart-shopping text-white"></i>
              <span>Ventas</span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="relative group">
          <Link
            to="/stats"
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-pink-800 text-white"
          >
            <i className="fa-solid fa-chart-simple w-5 text-white"></i>
          </Link>
          <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 
            transition-all duration-300 z-30 whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-800 text-white shadow-lg">
              <i className="fa-solid fa-chart-simple w-5 text-white"></i>
              <span>Estadísticas</span>
            </div>
          </div>
        </div>

        {/* BlackList */}
        <div className="relative group">
          <Link
            to="/black-list"
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-black text-white"
          >
            <i className="fa-solid fa-skull-crossbones w-5 text-white"></i>
          </Link>
          <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 
            transition-all duration-300 z-30 whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white shadow-lg">
              <i className="fa-solid fa-skull-crossbones w-5 text-white"></i>
              <span>BlackList</span>
            </div>
          </div>
        </div>

        {/* Mis Pedidos (solo admin) */}
        {userRole === "admin" && (
          <div className="relative group">
            <Link
              to="/purchases"
              className="flex items-center gap-2 px-2 py-2 rounded-lg bg-green-600 text-white"
            >
              <i className="fa-solid fa-bag-shopping text-white"></i>
            </Link>
            <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 
              transition-all duration-300 z-30 whitespace-nowrap pointer-events-none">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white shadow-lg">
                <i className="fa-solid fa-bag-shopping text-white"></i>
                <span>Mis Pedidos</span>
              </div>
            </div>
          </div>
        )}

        {/* Devoluciones */}
        <div className="relative group">
          <Link
            to="/returns"
            className="flex items-center gap-2 px-2 py-2 rounded-lg bg-gray-700 text-white"
          >
            <i className="fa-solid fa-arrow-rotate-left text-white"></i>
          </Link>
          <div className="absolute left-full top-0 ml-2 opacity-0 group-hover:opacity-100 
            transition-all duration-300 z-30 whitespace-nowrap pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white shadow-lg">
              <i className="fa-solid fa-arrow-rotate-left text-white"></i>
              <span>Devoluciones</span>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default SidebarActions;
