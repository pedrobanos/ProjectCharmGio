
// services/salesServices.js
import { supabase } from "../supabaseClient";

/**
 * Crear venta llamando a la RPC confirm_sale (con cliente y precio opcionales)
 */
export async function createSale({ productId, cantidad, dia = null, cliente = null, precioVenta = null }) {
  const { data, error } = await supabase.rpc("confirm_sale", {
    p_product_id: Number(productId),
    p_cantidad: Number(cantidad),
    p_dia: dia,                  // 'YYYY-MM-DD' o null
    p_cliente: cliente || null,  // string o null
    p_precio_venta: Number(precioVenta) || null, // decimal
  });

  if (error) throw error;
  return data; // fila de sales
}

export async function listSales({ from, to, productId } = {}) {
  let q = supabase
    .from("sales")
    .select(`
      id,
      product_id,
      cantidad,
      precio_venta,
      dia,
      cliente_id,
      created_at,
      clientes ( nombre )
    `, { count: "exact" }) // 👈 join con la tabla clientes
    .order("created_at", { ascending: true });

  if (productId) q = q.eq("product_id", Number(productId));

  // Filtrado por created_at
  if (from) q = q.gte("created_at", from);
  if (to) q = q.lte("created_at", to);

  const { data, error, count } = await q;
  if (error) throw error;

  // 👇 Aseguramos que cada venta tenga clienteNombre
  const mapped = data.map(s => ({
    ...s,
    clienteNombre: s.clientes?.nombre || "Sin cliente"
  }));

  return { data: mapped, count };
}

export async function getDailySummary({ from, to, productId } = {}) {
  let q = supabase.from("sales").select(`
    dia,
    cantidad,
    precio_venta,
    product_id,
    cliente_id,
    clientes ( nombre )
  `);

  if (productId) q = q.eq("product_id", Number(productId));
  if (from) q = q.gte("dia", from);
  if (to) q = q.lte("dia", to);

  const { data, error } = await q;
  if (error) throw error;

  return data.map(s => ({
    dia: s.dia,
    total_vendido: (s.cantidad || 0) * (s.precio_venta || 0),
    clienteNombre: s.clientes?.nombre || "Sin cliente"
  }));
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

// Top 10 productos más vendidos con stock < 5
// export const getTopLowStockProducts = async () => {
//   // 1. Traer productos
//   const { data: products, error: prodError } = await supabase
//     .from("products")
//     .select("id, nombre, cantidad, foto, lugar");

//   if (prodError) throw prodError;

//   // 2. Traer ventas
//   const { data: sales, error: salesError } = await supabase
//     .from("sales")
//     .select("product_id, cantidad");

//   if (salesError) throw salesError;

//   // 3. Calcular total vendido por producto
//   const ventasPorProducto = sales.reduce((acc, sale) => {
//     acc[sale.product_id] = (acc[sale.product_id] || 0) + sale.cantidad;
//     return acc;
//   }, {});

//   // 4. Enriquecer productos con total vendido
//   const enriched = products.map((p) => ({
//     ...p,
//     total_vendido: ventasPorProducto[p.id] || 0,
//   }));

//   // 5. Filtrar stock bajo (<5) y ordenar por más vendidos
//   return enriched
//     .filter((p) => p.cantidad <= 5)
//     .sort((a, b) => b.total_vendido - a.total_vendido)
//     .slice(0, 20); //filtrar por numero
// };

export const getTopLowStockProducts = async (page = 1, pageSize = 20) => {
  // 1. Traer productos
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, nombre, cantidad, foto, lugar");

  if (prodError) throw prodError;

  // 2. Traer ventas
  const { data: sales, error: salesError } = await supabase
    .from("sales")
    .select("product_id, cantidad");

  if (salesError) throw salesError;

  // 3. Calcular total vendido por producto
  const ventasPorProducto = sales.reduce((acc, sale) => {
    acc[sale.product_id] = (acc[sale.product_id] || 0) + sale.cantidad;
    return acc;
  }, {});

  // 4. Enriquecer productos con total vendido
  const enriched = products.map((p) => ({
    ...p,
    total_vendido: ventasPorProducto[p.id] || 0,
  }));

  // 5. Filtrar stock bajo (<5) y ordenar
  const lowStock = enriched
    .filter((p) => p.cantidad <= 5)
    .sort((a, b) => b.total_vendido - a.total_vendido);

  // 6. Paginación
  const total = lowStock.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: lowStock.slice(start, end),
    total,
    totalPages,
  };
};


