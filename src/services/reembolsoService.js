
import { supabase } from "../supabaseClient";

export async function registrarReembolso({
  cliente,
  sale_id = null,
  monto,
  metodo_pago = "manual",
  nota = ""
}) {
  const { data, error } = await supabase
    .from("reembolsos")
    .insert([{ cliente, sale_id, monto, metodo_pago, nota }])
    .select();

  if (error) {
    console.error("Error al registrar reembolso:", error.message);
    throw error;
  }
  // Retornamos directamente el objeto insertado
  return data[0];
}


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
