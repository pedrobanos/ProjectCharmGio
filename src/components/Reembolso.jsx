// import React, { useState, useEffect } from "react";
// import { createRefund, listRefunds } from "../services/refundServices";

// const Reembolso = ({ saleId, saldoInicial = 0 }) => {
//   const [tipoReembolso, setTipoReembolso] = useState("");
//   const [reembolsoParcial, setReembolsoParcial] = useState("");
//   const [saldoPendiente, setSaldoPendiente] = useState(saldoInicial);
//   const [historial, setHistorial] = useState([]);

//   useEffect(() => {
//     if (saleId) {
//       listRefunds(saleId).then(setHistorial).catch(console.error);
//     }
//   }, [saleId]);

//   const manejarReembolso = async () => {
//     let nuevoSaldo = saldoPendiente;
//     let importeReembolsado = 0;

//     if (tipoReembolso === "total") {
//       importeReembolsado = saldoPendiente;
//       nuevoSaldo = 0;
//     } else if (tipoReembolso === "parcial") {
//       const parcial = parseFloat(reembolsoParcial) || 0;
//       if (parcial <= 0 || parcial > saldoPendiente) {
//         alert("El importe parcial no es válido.");
//         return;
//       }
//       importeReembolsado = parcial;
//       nuevoSaldo = saldoPendiente - parcial;
//     } else {
//       alert("Seleccione un tipo de reembolso.");
//       return;
//     }

//     try {
//       const refund = await createRefund({
//         saleId,
//         tipo: tipoReembolso,
//         importe: importeReembolsado,
//       });

//       setSaldoPendiente(nuevoSaldo);
//       setHistorial([refund, ...historial]); // prepend
//       setReembolsoParcial("");
//       setTipoReembolso("");
//     } catch (err) {
//       console.error("Error creando reembolso:", err);
//       alert("Error guardando el reembolso");
//     }
//   };

//   return (
//     <form className="p-6 bg-yellow-50 border border-yellow-200 w-full rounded-lg shadow-md mx-auto space-y-4">
//       <h2 className="text-xl font-bold text-yellow-800">Reembolso a Carol</h2>
//       <p className="text-yellow-700 text-sm">
//         Aquí se lleva control de los reembolsos realizados a Carol.
//       </p>

//       <p className="font-semibold text-yellow-900">
//         Saldo pendiente:{" "}
//         <span className="text-blue-600">{saldoPendiente.toFixed(2)} €</span>
//       </p>

//       <label className="block font-semibold text-yellow-800 mt-2">
//         Tipo de reembolso
//       </label>
//       <select
//         value={tipoReembolso}
//         onChange={(e) => setTipoReembolso(e.target.value)}
//         className="border pl-3 pr-3 py-2 w-1/2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
//       >
//         <option value="">Seleccione una opción</option>
//         <option value="parcial">Reembolso parcial</option>
//         <option value="total">Reembolso total</option>
//       </select>

//       {tipoReembolso && (
//         <div className="mt-2">
//           <label className="block font-semibold text-yellow-800">
//             Cantidad a reembolsar
//           </label>
//           <div className="flex items-center">
//             <input
//               type="number"
//               value={
//                 tipoReembolso === "total"
//                   ? saldoPendiente.toFixed(2)
//                   : reembolsoParcial
//               }
//               onChange={(e) =>
//                 tipoReembolso === "parcial" && setReembolsoParcial(e.target.value)
//               }
//               readOnly={tipoReembolso === "total"}
//               className="border pl-3 pr-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 font-bold text-yellow-900 bg-yellow-100"
//             />
//             <span className="ml-2 font-bold text-yellow-800">€</span>
//           </div>
//         </div>
//       )}

//       <button
//         type="button"
//         onClick={manejarReembolso}
//         className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
//       >
//         Reembolsar
//       </button>

//       {historial.length > 0 && (
//         <div className="mt-4 bg-yellow-100 p-3 rounded-lg max-h-40 overflow-y-auto border border-yellow-200">
//           <h3 className="font-bold text-yellow-900 mb-2">
//             Historial de reembolsos
//           </h3>
//           <ul className="text-yellow-800 text-sm space-y-1">
//             {historial.map((r) => (
//               <li key={r.id}>
//                 {new Date(r.fecha).toLocaleString("es-ES")} → {r.tipo} de{" "}
//                 <span className="font-bold">{r.importe.toFixed(2)} €</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </form>
//   );
// };

// export default Reembolso;
import React, { useState, useEffect } from "react";
import { registrarReembolso, getReembolsosByCliente } from "../services/reembolsoService";

const Reembolso = ({ saldoInicial = 0, onReembolso }) => {
    const [tipoReembolso, setTipoReembolso] = useState("");
    const [reembolsoParcial, setReembolsoParcial] = useState("");
    const [saldoPendiente, setSaldoPendiente] = useState(saldoInicial || 0);
    const [historial, setHistorial] = useState([]);

    // 🔹 Sincronizar saldoPendiente con saldoInicial
    useEffect(() => {
        setSaldoPendiente(saldoInicial || 0);
    }, [saldoInicial]);

    // 🔹 Cargar historial de reembolsos al iniciar
    useEffect(() => {
        const fetchHistorial = async () => {
            try {
                const reembolsos = await getReembolsosByCliente("carol");
                const ordenados = reembolsos.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setHistorial(ordenados);
            } catch (err) {
                console.error("Error cargando historial de reembolsos:", err);
            }
        };
        fetchHistorial();
    }, []);

    const manejarReembolso = async () => {
        let nuevoSaldo = saldoPendiente;
        let importeReembolsado = 0;

        if (tipoReembolso === "total") {
            importeReembolsado = saldoPendiente;
            nuevoSaldo = 0;
        } else if (tipoReembolso === "parcial") {
            const parcial = parseFloat(reembolsoParcial) || 0;
            if (parcial <= 0 || parcial > saldoPendiente) {
                alert("El importe parcial no es válido.");
                return;
            }
            importeReembolsado = parcial;
            nuevoSaldo = saldoPendiente - parcial;
        } else {
            alert("Seleccione un tipo de reembolso.");
            return;
        }

        try {
            const data = await registrarReembolso({
                cliente: "carol",
                monto: importeReembolsado,
                metodo_pago: "manual",
                nota: tipoReembolso === "total" ? "Reembolso total" : "Reembolso parcial"
            });

            if (data) {
                const nuevoReembolso = {
                    ...data,
                    tipo: tipoReembolso,
                    created_at: data.created_at || new Date().toISOString()
                };
                setHistorial([nuevoReembolso, ...historial]);
            }

            setSaldoPendiente(nuevoSaldo);
            setReembolsoParcial("");
            setTipoReembolso("");

            // 🔹 Notificar al parent del importe reembolsado
            onReembolso && onReembolso(importeReembolsado);

        } catch (err) {
            console.error("Excepción al registrar reembolso:", err);
            alert("Excepción al registrar reembolso: " + err.message);
        }
    };

    return (
        <div className="w-full h-full p-6 bg-yellow-50 border-l border-yellow-200 shadow-md flex flex-col space-y-5 overflow-y-auto">
            <h2 className="text-5xl font-bold text-yellow-800 text-center">Reembolso de Carol</h2>
            <p className="text-yellow-700 text-sm text-center">
                Control de los reembolsos realizados por Carol.
            </p>

            <p className="font-semibold text-yellow-900 text-center">
                Saldo pendiente:{" "}
                <span className="text-blue-600">{saldoPendiente.toFixed(2)} €</span>
            </p>

            <div className="space-y-3">
                <label className="block font-semibold text-yellow-800">
                    Tipo de reembolso:
                </label>
                <select
                    value={tipoReembolso}
                    onChange={(e) => setTipoReembolso(e.target.value)}
                    className="border pl-3 pr-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                >
                    <option value="">Seleccione una opción</option>
                    <option value="parcial">Reembolso parcial</option>
                    <option value="total">Reembolso total</option>
                </select>

                {tipoReembolso && (
                    <div>
                        <label className="block font-semibold text-yellow-800">
                            Cantidad a reembolsar
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="number"
                                value={
                                    tipoReembolso === "total"
                                        ? saldoPendiente.toFixed(2)
                                        : reembolsoParcial
                                }
                                onChange={(e) =>
                                    tipoReembolso === "parcial" && setReembolsoParcial(e.target.value)
                                }
                                readOnly={tipoReembolso === "total"}
                                className="border pl-3 pr-3 py-2 w-2/3 rounded focus:outline-none focus:ring-2 
                  focus:ring-yellow-500 font-bold text-yellow-900 bg-yellow-100 text-right"
                            />
                            <span className="font-bold text-2xl text-yellow-800">€</span>
                        </div>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={manejarReembolso}
                className="w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mx-auto"
            >
                Reembolsar
            </button>

            {historial.length > 0 && (
                <div className="mt-4 bg-yellow-100 p-4 rounded-lg max-h-48 overflow-y-auto border border-yellow-200">
                    <h3 className="font-bold text-yellow-900 mb-4 text-center">
                        Historial de reembolsos
                    </h3>
                    <ul className="text-yellow-800 text-sm space-y-1">
                        {historial.map((r, i) => (
                            <li key={i} className="flex justify-between">
                                <span>
                                    {new Date(r.created_at).toLocaleString("es-ES")} → {r.nota || r.tipo}
                                </span>
                                <span className="font-bold">{r.monto.toFixed(2)} €</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Reembolso;




