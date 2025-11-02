
import { supabase } from "../supabaseClient";
import { listSales } from "./salesServices";



// ✅ Registrar reembolso con mes_aplicado
export async function registrarReembolso({
  cliente,
  sale_id = null,
  monto,
  metodo_pago = "manual",
  nota = "",
  mes_aplicado = null,
}) {
  const { data, error } = await supabase
    .from("reembolsos")
    .insert([{ cliente, sale_id, monto, metodo_pago, nota, mes_aplicado }])
    .select();

  if (error) {
    console.error("Error al registrar reembolso:", error.message);
    throw error;
  }

  return data[0];
}

// ✅ Obtener todos los reembolsos del cliente
export async function getReembolsosByCliente(cliente) {
  const { data, error } = await supabase
    .from("reembolsos")
    .select("*")
    .ilike("cliente", `%${cliente}%`);

  if (error) {
    console.error("Error al obtener reembolsos:", error);
    throw error;
  }

  return data;
}

// ✅ NUEVA FUNCIÓN: Calcula el pendiente del mes anterior REAL
// export async function getPendienteMesAnterior(cliente, year, month, listSalesFn = listSales) {
//   try {
//     const mesAnterior = month === 0 ? 11 : month - 1;
//     const anioAnterior = month === 0 ? year - 1 : year;
//     const keyMes = `${anioAnterior}-${String(mesAnterior + 1).padStart(2, "0")}`;

//     // Fechas de inicio y fin del mes anterior
//     const from = `${anioAnterior}-${String(mesAnterior + 1).padStart(2, "0")}-01T00:00:00Z`;
//     const lastDay = new Date(anioAnterior, mesAnterior + 1, 0).getDate();
//     const to = `${anioAnterior}-${String(mesAnterior + 1).padStart(2, "0")}-${lastDay}T23:59:59Z`;

//     // 🔹 Ventas Carol mes anterior
//     const { data: ventasMesAnterior } = await listSalesFn({ from, to });
//     const ventasCarol = (ventasMesAnterior || []).filter((s) =>
//       (s.clienteNombre || "").toLowerCase().includes(cliente.toLowerCase())
//     );
//     const totalVentas = ventasCarol.reduce(
//       (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
//       0
//     );

//     // 🔹 Reembolsos Carol aplicados al mes anterior
//     const { data: reembolsos } = await supabase
//       .from("reembolsos")
//       .select("*")
//       .ilike("cliente", `%${cliente}%`)
//       .eq("mes_aplicado", keyMes);

//     const totalReembolsado = (reembolsos || []).reduce(
//       (acc, r) => acc + (r.monto || 0),
//       0
//     );

//     const pendiente = Math.max(totalVentas - totalReembolsado, 0);
//     return pendiente;
//   } catch (error) {
//     console.error("Error al calcular pendiente mes anterior:", error);
//     return 0;
//   }
// }


export async function getPendienteMesAnterior(cliente, year, month, listSalesFn = listSales) {
  try {
    const fechaCorte = new Date(year, month, 0);
    const from = "2020-01-01T00:00:00Z";
    const to = fechaCorte.toISOString();

    // 🔹 Ventas
    const { data: ventasHastaMesAnterior } = await listSalesFn({ from, to });
    const ventasCarol = (ventasHastaMesAnterior || []).filter(
      (s) =>
        (s.clienteNombre || "").toLowerCase().includes(cliente.toLowerCase()) &&
        s.estado !== "devuelta"
    );

    const totalVentas = ventasCarol.reduce(
      (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
      0
    );
    console.log("➡️ Total ventas hasta", fechaCorte.toISOString(), "=", totalVentas);

    // 🔹 Reembolsos
    const { data: reembolsos } = await supabase
      .from("reembolsos")
      .select("*")
      .ilike("cliente", `%${cliente}%`);

    const reembolsosFiltrados = (reembolsos || []).filter((r) => {
      const fechaReembolso = new Date(`${r.mes_aplicado}-01T00:00:00Z`);
      return fechaReembolso <= fechaCorte;
    });

    const totalReembolsado = reembolsosFiltrados.reduce(
      (acc, r) => acc + (r.monto || 0),
      0
    );
    const pendienteAcumulado = Math.max(totalVentas - totalReembolsado, 0);

    return pendienteAcumulado;
  } catch (error) {
    console.error("❌ Error al calcular pendiente mes anterior:", error);
    return 0;
  }
}


