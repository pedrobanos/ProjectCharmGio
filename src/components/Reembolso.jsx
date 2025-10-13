// import React, { useState, useEffect } from "react";
// import { registrarReembolso, getReembolsosByCliente } from "../services/reembolsoService";

// const Reembolso = ({ saldoInicial = 0, onReembolso, userRole }) => {
//     const [tipoReembolso, setTipoReembolso] = useState("");
//     const [reembolsoParcial, setReembolsoParcial] = useState("");
//     const [saldoPendiente, setSaldoPendiente] = useState(saldoInicial || 0);
//     const [historial, setHistorial] = useState([]);

//     // 🔹 Sincronizar saldoPendiente con saldoInicial
//     useEffect(() => {
//         setSaldoPendiente(saldoInicial || 0);
//     }, [saldoInicial]);

//     // 🔹 Cargar historial de reembolsos al iniciar
//     useEffect(() => {
//         const fetchHistorial = async () => {
//             try {
//                 const reembolsos = await getReembolsosByCliente("carol");
//                 const ordenados = reembolsos.sort(
//                     (a, b) => new Date(b.created_at) - new Date(a.created_at)
//                 );
//                 setHistorial(ordenados);
//             } catch (err) {
//                 console.error("Error cargando historial de reembolsos:", err);
//             }
//         };
//         fetchHistorial();
//     }, []);

//     const manejarReembolso = async () => {
//         let nuevoSaldo = saldoPendiente;
//         let importeReembolsado = 0;

//         if (tipoReembolso === "total") {
//             importeReembolsado = saldoPendiente;
//             nuevoSaldo = 0;
//         } else if (tipoReembolso === "parcial") {
//             const parcial = parseFloat(reembolsoParcial) || 0;
//             if (parcial <= 0 || parcial > saldoPendiente) {
//                 alert("El importe parcial no es válido.");
//                 return;
//             }
//             importeReembolsado = parcial;
//             nuevoSaldo = saldoPendiente - parcial;
//         } else {
//             alert("Seleccione un tipo de reembolso.");
//             return;
//         }

//         try {
//             const data = await registrarReembolso({
//                 cliente: "carol",
//                 monto: importeReembolsado,
//                 metodo_pago: "manual",
//                 nota: tipoReembolso === "total" ? "Reembolso total" : "Reembolso parcial"
//             });

//             if (data) {
//                 const nuevoReembolso = {
//                     ...data,
//                     tipo: tipoReembolso,
//                     created_at: data.created_at || new Date().toISOString()
//                 };
//                 setHistorial([nuevoReembolso, ...historial]);
//             }

//             setSaldoPendiente(nuevoSaldo);
//             setReembolsoParcial("");
//             setTipoReembolso("");

//             // 🔹 Notificar al parent del importe reembolsado
//             onReembolso && onReembolso(importeReembolsado);

//         } catch (err) {
//             console.error("Excepción al registrar reembolso:", err);
//             alert("Excepción al registrar reembolso: " + err.message);
//         }
//     };

//     return (
//         <div className="w-full h-full p-6 bg-yellow-50 border-l border-yellow-200 shadow-md flex flex-col space-y-5 overflow-y-auto">
//             <h2 className="text-5xl font-bold text-yellow-800 text-center">Reembolso de Carol</h2>
//             <p className="text-yellow-700 text-sm text-center">
//                 Control de los reembolsos realizados por Carol.
//             </p>
//             <p className="font-semibold text-yellow-900 text-center">
//                 Saldo pendiente:{" "}
//                 <span className="text-blue-600">{saldoPendiente.toFixed(2)} €</span>
//             </p>
//             {userRole !== "user" && (
//                 <>
//                     <div className="space-y-3">
//                         <label className="block font-semibold text-yellow-800">
//                             Tipo de reembolso:
//                         </label>
//                         <select
//                             value={tipoReembolso}
//                             onChange={(e) => setTipoReembolso(e.target.value)}
//                             className="border pl-3 pr-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
//                         >
//                             <option value="">Seleccione una opción</option>
//                             <option value="parcial">Reembolso parcial</option>
//                             <option value="total">Reembolso total</option>
//                         </select>
//                         {tipoReembolso && (
//                             <div>
//                                 <label className="block font-semibold text-yellow-800">
//                                     Cantidad a reembolsar
//                                 </label>
//                                 <div className="flex items-center gap-2 mt-1">
//                                     <input
//                                         type="number"
//                                         value={
//                                             tipoReembolso === "total"
//                                                 ? saldoPendiente.toFixed(2)
//                                                 : reembolsoParcial
//                                         }
//                                         onChange={(e) =>
//                                             tipoReembolso === "parcial" && setReembolsoParcial(e.target.value)
//                                         }
//                                         readOnly={tipoReembolso === "total"}
//                                         className="border pl-3 pr-3 py-2 w-2/3 rounded focus:outline-none focus:ring-2 
//                   focus:ring-yellow-500 font-bold text-yellow-900 bg-yellow-100 text-right"
//                                     />
//                                     <span className="font-bold text-2xl text-yellow-800">€</span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                     <button
//                         type="button"
//                         onClick={manejarReembolso}
//                         className="w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mx-auto"
//                     >
//                         Reembolsar
//                     </button>
//                 </>
//             )}
//             {historial.length > 0 && (
//                 <div className="mt-4 bg-yellow-100 p-4 rounded-lg max-h-48 overflow-y-auto border border-yellow-200">
//                     <h3 className="font-bold text-yellow-900 mb-4 text-center">
//                         Historial de reembolsos
//                     </h3>
//                     <ul className="text-yellow-800 text-sm space-y-1">
//                         {historial.map((r, i) => (
//                             <li key={i} className="flex justify-between">
//                                 <span>
//                                     {new Date(r.created_at).toLocaleString("es-ES")} → {r.nota || r.tipo}
//                                 </span>
//                                 <span className="font-bold">{r.monto.toFixed(2)} €</span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Reembolso;

import React, { useState, useEffect } from "react";
import {
    registrarReembolso,
    getReembolsosByCliente,
    getPendienteMesAnterior,
} from "../services/reembolsoService";
import { listSales } from "../services/salesServices";


const Reembolso = ({ saldoInicial = 0, onReembolso, userRole }) => {
    const [tipoReembolso, setTipoReembolso] = useState("");
    const [reembolsoParcial, setReembolsoParcial] = useState("");
    const [saldoPendiente, setSaldoPendiente] = useState(saldoInicial || 0);
    const [historial, setHistorial] = useState([]);
    const [pendienteAnterior, setPendienteAnterior] = useState(0);
    const [loading, setLoading] = useState(false);

    // 🔹 Sincronizar saldo inicial (viene del hook padre)
    useEffect(() => {
        setSaldoPendiente(saldoInicial || 0);
    }, [saldoInicial]);

    // 🔹 Cargar historial + pendientes desde Supabase al montar (persistencia)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await refrescarPendienteAnterior();
                await cargarHistorial();
            } catch (err) {
                console.error("Error inicializando reembolsos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 🔹 Refrescar pendiente anterior (desde Supabase)
    const refrescarPendienteAnterior = async () => {
        const fecha = new Date();
        const year = fecha.getFullYear();
        const month = fecha.getMonth();
        const pendiente = await getPendienteMesAnterior("carol", year, month, listSales);
        setPendienteAnterior(pendiente);
    };

    // 🔹 Cargar historial de reembolsos
    const cargarHistorial = async () => {
        const reembolsos = await getReembolsosByCliente("carol");
        const ordenados = reembolsos.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setHistorial(ordenados);
    };

    const manejarReembolso = async () => {
        let importeReembolsado = 0;
        let restante = 0;

        if (tipoReembolso === "total") {
            importeReembolsado = saldoPendiente;
            restante = importeReembolsado;
        } else if (tipoReembolso === "parcial") {
            const parcial = parseFloat(reembolsoParcial) || 0;
            if (parcial <= 0 || parcial > saldoPendiente) {
                alert("El importe parcial no es válido.");
                return;
            }
            importeReembolsado = parcial;
            restante = parcial;
        } else {
            alert("Seleccione un tipo de reembolso.");
            return;
        }

        setLoading(true);
        try {
            const fecha = new Date();
            const year = fecha.getFullYear();
            const mesActual = `${year}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
            const mesAnterior = `${year}-${String(fecha.getMonth()).padStart(2, "0")}`;

            // 🧠 1️⃣ Si hay deuda anterior, cubrirla primero
            if (pendienteAnterior > 0) {
                const montoParaAnterior = Math.min(restante, pendienteAnterior);

                await registrarReembolso({
                    cliente: "carol",
                    monto: montoParaAnterior,
                    metodo_pago: "manual",
                    nota: "Reembolso aplicado a mes anterior",
                    mes_aplicado: mesAnterior,
                });

                restante -= montoParaAnterior;
            }

            // 🧠 2️⃣ Si sobra, aplicarlo al mes actual
            if (restante > 0) {
                await registrarReembolso({
                    cliente: "carol",
                    monto: restante,
                    metodo_pago: "manual",
                    nota:
                        tipoReembolso === "total"
                            ? "Reembolso total mes actual"
                            : "Reembolso parcial mes actual",
                    mes_aplicado: mesActual,
                });
            }

            // 🔁 3️⃣ Refrescar datos persistentes desde Supabase
            await refrescarPendienteAnterior();
            await cargarHistorial();

            // 🧮 4️⃣ Actualizar saldos locales
            const nuevoSaldo = Math.max(saldoPendiente - importeReembolsado, 0);
            setSaldoPendiente(nuevoSaldo);
            setReembolsoParcial("");
            setTipoReembolso("");

            onReembolso && onReembolso(importeReembolsado);
        } catch (err) {
            console.error("Excepción al registrar reembolso:", err);
            alert("Excepción al registrar reembolso: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full p-6 bg-yellow-50 border-l border-yellow-200 shadow-md flex flex-col space-y-5 overflow-y-auto">
            <h2 className="text-5xl font-bold text-yellow-800 text-center">Reembolso de Carol</h2>
            <p className="text-yellow-700 text-sm text-center">
                Control de los reembolsos realizados por Carol.
            </p>

            {loading ? (
                <p className="text-center text-yellow-800 font-semibold">Cargando...</p>
            ) : (
                <>
                    <p className="font-semibold text-yellow-900 text-center">
                        💰 Pendiente mes anterior:{" "}
                        <span
                            className={
                                pendienteAnterior > 0 ? "text-red-600" : "text-green-600"
                            }
                        >
                            {pendienteAnterior.toFixed(2)} €
                        </span>
                    </p>
                    <p className="font-semibold text-yellow-900 text-center">
                        💳 Saldo total pendiente:{" "}
                        <span className="text-blue-600">{saldoPendiente.toFixed(2)} €</span>
                    </p>

                    {userRole !== "user" && (
                        <>
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
                                                    tipoReembolso === "parcial" &&
                                                    setReembolsoParcial(e.target.value)
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
                                disabled={loading}
                                className="w-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mx-auto"
                            >
                                Reembolsar
                            </button>
                        </>
                    )}

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
                </>
            )}
        </div>
    );
};

export default Reembolso;
