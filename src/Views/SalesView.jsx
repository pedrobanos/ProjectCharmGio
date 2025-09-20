
// import React, { useState, useEffect } from "react";
// import Loading from "../components/Loading";
// import { listSales } from "../services/salesServices";
// import { getAllProducts } from "../services/productServices";
// import ReembolsoModal from "../components/ReembolsoModal";



// const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// const SalesView = ({ productId }) => {
//     const [sales, setSales] = useState([]);
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//     const [filterBy, setFilterBy] = useState("todos");
//     const year = new Date().getFullYear();

//     const [totalCarolImporte, setTotalCarolImporte] = useState(0);
//     const [isReembolsoOpen, setIsReembolsoOpen] = useState(false);


//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const allProducts = await getAllProducts();
//                 setProducts(allProducts);

//                 const from = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-01T00:00:00Z`;
//                 const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
//                 const to = `${year}-${String(selectedMonth + 1).padStart(2, "0")}-${lastDay}T23:59:59Z`;

//                 const { data: salesData } = await listSales({ from, to, ...(productId && { productId }) });
//                 const salesWithName = salesData.map(s => {
//                     const product = allProducts.find(p => Number(p.id) === Number(s.product_id));
//                     return { ...s, productName: product ? product.nombre : "Desconocido", foto: product ? product.foto : null };
//                 });

//                 const uniqueSalesMap = new Map();
//                 salesWithName.forEach(s => uniqueSalesMap.set(s.id, s));
//                 const uniqueSales = [...uniqueSalesMap.values()];
//                 setSales(uniqueSales);

//                 const carolSales = uniqueSales.filter(s => (s.cliente || "").toLowerCase().includes("carol"));
//                 const totalCarol = carolSales.reduce((acc, s) => acc + ((s.precio_venta || 0) * (s.cantidad || 0)), 0);
//                 setTotalCarolImporte(totalCarol || 0);

//             } catch (err) {
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [selectedMonth, productId, year]);

//     if (loading) return <Loading />;

//     const filteredSales = sales.filter(s => {
//         const cliente = (s.cliente || "").toLowerCase().trim();
//         if (filterBy === "gio") return cliente.includes("gio");
//         if (filterBy === "carol") return cliente.includes("carol");
//         if (filterBy === "otros") return !cliente.includes("gio") && !cliente.includes("carol");
//         return true;
//     });

//     const totalVentas = filteredSales.reduce((acc, s) => acc + (s.cantidad || 0), 0);

//     const beneficioTotal = filteredSales
//         .filter(s => !(s.cliente || "").toLowerCase().includes("carol"))
//         .reduce((acc, s) => {
//             const product = products.find(p => Number(p.id) === Number(s.product_id));
//             if (product && s.precio_venta != null) return acc + (s.precio_venta - (product.precio || 0)) * s.cantidad;
//             return acc;
//         }, 0);

//     return (
//         <div className="max-w-screen-lg mx-auto p-4 space-y-6">
//             <h1 className="text-5xl text-center font-bold mb-8 text-blue-500">
//                 Ventas de {MONTHS[selectedMonth]} - {year}
//             </h1>

//             {/* Botones meses */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
//                 {MONTHS.map((name, index) => (
//                     <button
//                         key={name}
//                         onClick={() => setSelectedMonth(index)}
//                         className={`px-3 py-2 rounded-lg border font-semibold transition ${selectedMonth === index ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-blue-100"}`}
//                     >{name}</button>
//                 ))}
//             </div>

//             {/* Filtro cliente */}
//             <div className="flex flex-row items-center gap-4 w-2/3 mb-4">
//                 <label
//                     htmlFor="filtroCliente"
//                     className="font-semibold text-gray-700 w-1/6"
//                 >
//                     Vendido por:
//                 </label>

//                 <select
//                     id="filtroCliente"
//                     value={filterBy}
//                     onChange={e => setFilterBy(e.target.value)}
//                     className="border pl-3 pr-3 py-2 w-48 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
//                 >
//                     <option value="todos">Todos</option>
//                     <option value="gio">Gio</option>
//                     <option value="carol">Carol</option>
//                     <option value="otros">Pedro</option>
//                 </select>
//                 {filterBy === "carol" && totalCarolImporte > 0 && (
//                     <button
//                         onClick={() => setIsReembolsoOpen(true)}
//                         className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
//                     >
//                         Iniciar reembolso
//                     </button>
//                 )}
//                 <ReembolsoModal
//                     isOpen={isReembolsoOpen}
//                     onClose={() => setIsReembolsoOpen(false)}
//                     saldoInicial={totalCarolImporte || 0}
//                 />
//             </div>
//             {/* Tabla de ventas */}
//             <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-md">
//                 <table className="table-fixed min-w-full border-collapse text-sm sm:text-base">
//                     <colgroup>
//                         <col className="w-16" />
//                         <col className="w-52" />
//                         <col className="w-10" />
//                         <col className="w-10" />
//                         <col className="w-24" />
//                     </colgroup>
//                     <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
//                         <tr>
//                             <th className="px-2 py-2 text-center">Foto</th>
//                             <th className="px-2 py-2 text-center">Producto</th>
//                             <th className="px-2 py-2 text-center">Cantidad</th>
//                             <th className="px-2 py-2 text-center">Precio Venta</th>
//                             <th className="px-2 py-2 text-center">Fecha</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 text-gray-800">
//                         {filteredSales.map(s => (
//                             <tr key={s.id} className="text-center hover:bg-gray-50">
//                                 <td className="px-2 py-3">{s.foto ? <img src={s.foto} alt={s.productName} className="h-14 w-14 object-cover rounded-full mx-auto hover:scale-140 transition-transform duration-200" /> : <span className="text-xs">Sin foto</span>}</td>
//                                 <td className="px-2 py-2 break-words whitespace-normal text-left">{s.productName}</td>
//                                 <td className="px-2 py-2 text-green-600 font-bold">{s.cantidad}</td>
//                                 <td className="px-2 py-2">{s.precio_venta != null ? `${s.precio_venta} €` : "-"}</td>
//                                 <td className="px-2 py-2 text-left">{new Date(s.created_at).toLocaleString("es-ES")}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                     <tfoot className="bg-gray-100 font-bold text-gray-800 sticky bottom-0">
//                         <tr className="border-t border-gray-300">
//                             <td colSpan={2} className="px-2 py-2 text-start">Total de ventas:</td>
//                             <td className="px-2 py-2 text-start text-blue-600">{totalVentas} unds</td>
//                             <td colSpan={2}></td>
//                         </tr>
//                         {filteredSales.some(s => !(s.cliente || "").toLowerCase().includes("carol")) && (
//                             <tr className="border-t border-gray-300">
//                                 <td colSpan={2} className="px-2 py-2 text-start">Beneficio:</td>
//                                 <td className={`px-2 py-2 text-start ${beneficioTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                     {beneficioTotal.toFixed(2)} €
//                                 </td>
//                                 <td colSpan={2}></td>
//                             </tr>
//                         )}
//                         {/* Total a abonar solo para Carol */}
//                         {filteredSales.some(s => (s.cliente || "").toLowerCase().includes("carol")) && (
//                             <tr className="border-t border-gray-300">
//                                 <td colSpan={2} className="px-2 py-2 text-start">Total a abonar:</td>
//                                 <td className="px-2 py-2 text-start text-blue-600">{totalCarolImporte.toFixed(2)} €</td>
//                                 <td colSpan={2}></td>
//                             </tr>
//                         )}
//                     </tfoot>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default SalesView;
import React, { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { listSales } from "../services/salesServices";
import { getAllProducts } from "../services/productServices";
import { getReembolsosByCliente } from "../services/reembolsoService";
import ReembolsoModal from "../components/ReembolsoModal";

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const SalesView = ({ productId }) => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [filterBy, setFilterBy] = useState("todos");
  const year = new Date().getFullYear();

  const [totalCarolImporte, setTotalCarolImporte] = useState(0);
  const [isReembolsoOpen, setIsReembolsoOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allProducts = await getAllProducts();
      setProducts(allProducts);

      const from = `${year}-${String(selectedMonth + 1).padStart(2,"0")}-01T00:00:00Z`;
      const lastDay = new Date(year, selectedMonth + 1, 0).getDate();
      const to = `${year}-${String(selectedMonth + 1).padStart(2,"0")}-${lastDay}T23:59:59Z`;

      const { data: salesData } = await listSales({ from, to, ...(productId && { productId }) });

      const salesWithName = salesData.map((s) => {
        const product = allProducts.find((p) => Number(p.id) === Number(s.product_id));
        return {
          ...s,
          productName: product ? product.nombre : "Desconocido",
          foto: product ? product.foto : null,
        };
      });

      const uniqueSalesMap = new Map();
      salesWithName.forEach((s) => uniqueSalesMap.set(s.id, s));
      const uniqueSales = [...uniqueSalesMap.values()];
      setSales(uniqueSales);

      // 🔹 Filtrar ventas de Carol
      const carolSales = uniqueSales.filter((s) => (s.cliente || "").toLowerCase().includes("carol"));
      const totalCarol = carolSales.reduce((acc,s) => acc + (s.precio_venta || 0) * (s.cantidad || 0), 0);

      // 🔹 Consultar reembolsos de Carol
      const reembolsos = await getReembolsosByCliente("carol");
      const totalReembolsado = reembolsos.reduce((acc,r) => acc + (r.monto || 0), 0);

      setTotalCarolImporte(Math.max(totalCarol - totalReembolsado, 0));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, productId, year]);

  if (loading) return <Loading />;

  const filteredSales = sales.filter((s) => {
    const cliente = (s.cliente || "").toLowerCase().trim();
    if (filterBy === "gio") return cliente.includes("gio");
    if (filterBy === "carol") return cliente.includes("carol");
    if (filterBy === "otros") return !cliente.includes("gio") && !cliente.includes("carol");
    return true;
  });

  const totalVentas = filteredSales.reduce((acc, s) => acc + (s.cantidad || 0), 0);

  const beneficioTotal = filteredSales
    .filter((s) => !(s.cliente || "").toLowerCase().includes("carol"))
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
        {MONTHS.map((name,index) => (
          <button
            key={name}
            onClick={() => setSelectedMonth(index)}
            className={`px-3 py-2 rounded-lg border font-semibold transition ${
              selectedMonth===index ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-blue-100"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Filtro cliente */}
      <div className="flex flex-row items-center gap-4 w-2/3 mb-4">
        <label htmlFor="filtroCliente" className="font-semibold text-gray-700 w-1/6">Vendido por:</label>
        <select
          id="filtroCliente"
          value={filterBy}
          onChange={(e)=>setFilterBy(e.target.value)}
          className="border pl-3 pr-3 py-2 w-48 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
        >
          <option value="todos">Todos</option>
          <option value="gio">Gio</option>
          <option value="carol">Carol</option>
          <option value="otros">Pedro</option>
        </select>

        {filterBy==="carol" && totalCarolImporte>0 && (
          <button
            type="button"
            onClick={()=>setIsReembolsoOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Iniciar reembolso
          </button>
        )}

        <ReembolsoModal
          isOpen={isReembolsoOpen}
          saldoInicial={totalCarolImporte}
          onClose={() => setIsReembolsoOpen(false)}
          onReembolso={(importe) => setTotalCarolImporte(prev => Math.max(prev - importe, 0))}
        />
      </div>

      {/* Tabla de ventas */}
      <div className="max-h-[600px] overflow-y-auto border border-gray-200 rounded-md">
        <table className="table-fixed min-w-full border-collapse text-sm sm:text-base">
          <colgroup>
            <col className="w-16"/>
            <col className="w-52"/>
            <col className="w-10"/>
            <col className="w-10"/>
            <col className="w-24"/>
          </colgroup>
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2 text-center">Foto</th>
              <th className="px-2 py-2 text-center">Producto</th>
              <th className="px-2 py-2 text-center">Cantidad</th>
              <th className="px-2 py-2 text-center">Precio Venta</th>
              <th className="px-2 py-2 text-center">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-800">
            {filteredSales.map(s => (
              <tr key={s.id} className="text-center hover:bg-gray-50">
                <td className="px-2 py-3">
                  {s.foto ? <img src={s.foto} alt={s.productName} className="h-14 w-14 object-cover rounded-full mx-auto hover:scale-140 transition-transform duration-200"/>
                    : <span className="text-xs">Sin foto</span>}
                </td>
                <td className="px-2 py-2 break-words whitespace-normal text-left">{s.productName}</td>
                <td className="px-2 py-2 text-green-600 font-bold">{s.cantidad}</td>
                <td className="px-2 py-2">{s.precio_venta!=null ? `${s.precio_venta} €` : "-"}</td>
                <td className="px-2 py-2 text-left">{new Date(s.created_at).toLocaleString("es-ES")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-bold text-gray-800 sticky bottom-0">
            <tr className="border-t border-gray-300">
              <td colSpan={2} className="px-2 py-2 text-start">Total de ventas:</td>
              <td className="px-2 py-2 text-start text-blue-600">{totalVentas} unds</td>
              <td colSpan={2}></td>
            </tr>
            {filteredSales.some(s => !(s.cliente||"").toLowerCase().includes("carol")) && (
              <tr className="border-t border-gray-300">
                <td colSpan={2} className="px-2 py-2 text-start">Beneficio:</td>
                <td className={`px-2 py-2 text-start ${beneficioTotal>=0?"text-green-600":"text-red-600"}`}>{beneficioTotal.toFixed(2)} €</td>
                <td colSpan={2}></td>
              </tr>
            )}
            {filteredSales.some(s => (s.cliente||"").toLowerCase().includes("carol")) && (
              <tr className="border-t border-gray-300">
                <td colSpan={2} className="px-2 py-2 text-start">Saldo pendiente (Carol):</td>
                <td className="px-2 py-2 text-start text-blue-600">{totalCarolImporte.toFixed(2)} €</td>
                <td colSpan={2}></td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default SalesView;
