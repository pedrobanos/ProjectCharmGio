
import { supabase } from "../supabaseClient";
import { listSales } from "./salesServices";

//version que funcionaba antes de los cambios
// export async function registrarReembolso({
//   cliente,
//   sale_id = null,
//   monto,
//   metodo_pago = "manual",
//   nota = ""
// }) {
//   const { data, error } = await supabase
//     .from("reembolsos")
//     .insert([{ cliente, sale_id, monto, metodo_pago, nota }])
//     .select();

//   if (error) {
//     console.error("Error al registrar reembolso:", error.message);
//     throw error;
//   }
//   // Retornamos directamente el objeto insertado
//   return data[0];
// }



// export async function getReembolsosByCliente(cliente) {
//   const { data, error } = await supabase
//     .from("reembolsos")
//     .select("*")
//     .ilike("cliente", `%${cliente}%`);

//   if (error) {
//     console.error("Error al obtener reembolsos:", error);
//     throw error;
//   }
//   return data;
// }


// export async function getPendienteMesAnterior(cliente, year, month, listSales) {
//   try {
//     // Calcular el mes anterior (ej: si month=9 => septiembre)
//     const mesAnterior = month === 0 ? 11 : month - 1;
//     const yearAnterior = month === 0 ? year - 1 : year;

//     const mesAnteriorStr = `${yearAnterior}-${String(mesAnterior + 1).padStart(2, "0")}`;

//     // Fechas del mes anterior
//     const from = `${yearAnterior}-${String(mesAnterior + 1).padStart(2, "0")}-01T00:00:00Z`;
//     const lastDay = new Date(yearAnterior, mesAnterior + 1, 0).getDate();
//     const to = `${yearAnterior}-${String(mesAnterior + 1).padStart(2, "0")}-${lastDay}T23:59:59Z`;

//     // 🔹 Ventas del mes anterior
//     const { data: ventasData, error: ventasError } = await listSales({
//       from,
//       to,
//     });
//     if (ventasError) throw ventasError;
//     const ventasCliente = ventasData.filter((v) =>
//       (v.clienteNombre || "").toLowerCase().includes(cliente.toLowerCase())
//     );
//     const totalVentasMesAnterior = ventasCliente.reduce(
//       (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
//       0
//     );
//     // 🔹 Reembolsos del mes anterior
//     const { data: reembolsos, error: reembError } = await supabase
//       .from("reembolsos")
//       .select("*")
//       .ilike("cliente", `%${cliente}%`)
//       .eq("mes_aplicado", mesAnteriorStr);

//     if (reembError) throw reembError;

//     const totalReembolsosMesAnterior = reembolsos.reduce(
//       (acc, r) => acc + (r.monto || 0),
//       0
//     );
//     // 🔹 Calcular pendiente
//     const pendiente = Math.max(totalVentasMesAnterior - totalReembolsosMesAnterior, 0);
//     return pendiente; // si quieres que devuelva true/false, usa: pendiente > 0
//   } catch (error) {
//     console.error("Error al calcular pendiente del mes anterior:", error);
//     return 0;
//   }
// }



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
export async function getPendienteMesAnterior(cliente, year, month, listSalesFn = listSales) {
  try {
    const mesAnterior = month === 0 ? 11 : month - 1;
    const anioAnterior = month === 0 ? year - 1 : year;
    const keyMes = `${anioAnterior}-${String(mesAnterior + 1).padStart(2, "0")}`;

    // Fechas de inicio y fin del mes anterior
    const from = `${anioAnterior}-${String(mesAnterior + 1).padStart(2, "0")}-01T00:00:00Z`;
    const lastDay = new Date(anioAnterior, mesAnterior + 1, 0).getDate();
    const to = `${anioAnterior}-${String(mesAnterior + 1).padStart(2, "0")}-${lastDay}T23:59:59Z`;

    // 🔹 Ventas Carol mes anterior
    const { data: ventasMesAnterior } = await listSalesFn({ from, to });
    const ventasCarol = (ventasMesAnterior || []).filter((s) =>
      (s.clienteNombre || "").toLowerCase().includes(cliente.toLowerCase())
    );
    const totalVentas = ventasCarol.reduce(
      (acc, s) => acc + (s.precio_venta || 0) * (s.cantidad || 0),
      0
    );

    // 🔹 Reembolsos Carol aplicados al mes anterior
    const { data: reembolsos } = await supabase
      .from("reembolsos")
      .select("*")
      .ilike("cliente", `%${cliente}%`)
      .eq("mes_aplicado", keyMes);

    const totalReembolsado = (reembolsos || []).reduce(
      (acc, r) => acc + (r.monto || 0),
      0
    );

    const pendiente = Math.max(totalVentas - totalReembolsado, 0);
    return pendiente;
  } catch (error) {
    console.error("Error al calcular pendiente mes anterior:", error);
    return 0;
  }
}
