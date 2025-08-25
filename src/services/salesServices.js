// services/salesServices.js
import { supabase } from "../supabaseClient";

/**
 * Crear venta llamando a la RPC confirm_sale (con cliente opcional)
 */
export async function createSale({ productId, cantidad, dia = null, cliente = null }) {
  const { data, error } = await supabase.rpc("confirm_sale", {
    p_product_id: Number(productId),
    p_cantidad: Number(cantidad),
    p_dia: dia,         // 'YYYY-MM-DD' o null
    p_cliente: cliente, // string o null
  });
  if (error) throw error;
  return data; // fila de sales
}

/**
 * Listar ventas con filtros opcionales
 */
export async function listSales({ from, to, productId, limit = 100, offset = 0 } = {}) {
  let q = supabase
    .from("sales")
    .select("id, product_id, cantidad, dia, cliente, created_at", { count: "exact" })
    .order("created_at", { ascending: false }) // fecha+hora reales
    .range(offset, offset + limit - 1);

  if (productId) q = q.eq("product_id", Number(productId));
  if (from) q = q.gte("dia", from);
  if (to) q = q.lte("dia", to);

  const { data, error, count } = await q;
  if (error) throw error;
  return { data, count };
}

/**
 * Resumen diario (agregado rápido en cliente)
 */
export async function getDailySummary({ from, to, productId } = {}) {
  let q = supabase.from("sales").select("dia, cantidad, product_id");

  if (productId) q = q.eq("product_id", Number(productId));
  if (from) q = q.gte("dia", from);
  if (to) q = q.lte("dia", to);

  const { data, error } = await q;
  if (error) throw error;

  const map = new Map();
  for (const r of data) {
    map.set(r.dia, (map.get(r.dia) ?? 0) + (r.cantidad || 0));
  }
  return [...map.entries()]
    .map(([dia, total_vendido]) => ({ dia, total_vendido }))
    .sort((a, b) => (a.dia < b.dia ? 1 : -1));
}

/**
 * Ventas de un producto (para mostrar histórico en el detalle)
 */
export const getSalesByProduct = async (productId) => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};




