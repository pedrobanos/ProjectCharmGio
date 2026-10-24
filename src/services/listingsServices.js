// services/listingsServices.js
// Anuncios publicados en Vinted / Wallapop por producto y cuenta.
import { supabase } from "../supabaseClient";
import { PLATAFORMAS } from "../Constants";

const TABLE = "listings";

/* ─── Helpers ─── */

// "Vinted", "vinted ", "VINTED" -> "Vinted". Devuelve null si no es una plataforma conocida.
export const normalizePlatform = (value) => {
  const v = String(value || "").trim().toLowerCase();
  return PLATAFORMAS.find((p) => p.toLowerCase() === v) || null;
};

export const accountLabel = (account) =>
  account?.username?.trim() || account?.mail?.trim() || `Cuenta ${account?.id ?? "?"}`;

export const isBlocked = (account) => {
  const b = account?.blocked_at;
  return b !== null && b !== undefined && String(b).trim() !== "" && b !== false;
};

/* ─── Cuentas ─── */

// Cuentas de Vinted/Wallapop que no están bloqueadas
export const getListingAccounts = async () => {
  const { data, error } = await supabase
    .from("charm_accounts")
    .select("id, username, mail, platform_app, blocked_at")
    .order("id");
  if (error) throw error;
  return (data || [])
    .map((a) => ({ ...a, platform: normalizePlatform(a.platform_app) }))
    .filter((a) => a.platform && !isBlocked(a));
};

/* ─── Anuncios ─── */

export const getActiveListings = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, product_id, account_id, estado, publicado_at")
    .eq("estado", "activo")
    .order("publicado_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createListing = async (productId, accountId) => {
  // Límite: como mucho un anuncio activo por unidad en stock
  const [{ data: prod, error: pErr }, { count, error: cErr }] = await Promise.all([
    supabase.from("products").select("cantidad").eq("id", productId).single(),
    supabase
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("estado", "activo"),
  ]);
  if (pErr) throw pErr;
  if (cErr) throw cErr;
  const stock = Number(prod?.cantidad ?? 0);
  if (stock <= 0) {
    throw new Error("No queda stock de este producto, no se puede anunciar.");
  }
  if ((count ?? 0) >= stock) {
    throw new Error(
      `Ya está anunciado en ${count} cuenta(s) y solo tienes ${stock} unidad(es). Retira un anuncio o añade stock.`
    );
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ product_id: productId, account_id: accountId }])
    .select()
    .single();
  if (error) {
    if (error.code === "23505") {
      throw new Error("Este producto ya está publicado en esa cuenta.");
    }
    if (error.code === "P0001" && error.message) {
      throw new Error(error.message); // límite de stock comprobado en la base de datos
    }
    throw error;
  }
  return data;
};

// estado: "vendido" | "retirado" | "activo"
export const updateListingStatus = async (id, estado, saleId = null) => {
  const updates = {
    estado,
    cerrado_at: estado === "activo" ? null : new Date().toISOString(),
  };
  if (saleId != null) updates.sale_id = saleId;
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Retira todos los anuncios activos de una cuenta (p. ej. al bloquearla). Devuelve cuántos.
export const retireListingsByAccount = async (accountId) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ estado: "retirado", cerrado_at: new Date().toISOString() })
    .eq("account_id", accountId)
    .eq("estado", "activo")
    .select("id");
  if (error) throw error;
  return (data || []).length;
};

// Agrupa anuncios activos por producto, con la cuenta ya resuelta:
// { [productId]: [{ ...listing, account }] }
export const groupListingsByProduct = (listings, accounts) => {
  const accById = new Map(accounts.map((a) => [String(a.id), a]));
  return listings.reduce((acc, l) => {
    const account = accById.get(String(l.account_id));
    if (!account) return acc; // cuenta bloqueada / borrada / no es de Vinted-Wallapop
    const key = String(l.product_id);
    (acc[key] ||= []).push({ ...l, account });
    return acc;
  }, {});
};

/**
 * Anuncios que conviene retirar tras una venta.
 * Si quedan menos unidades que anuncios activos, hay que borrar el sobrante
 * (si quedan 0 unidades, todos).
 */
export const listingsToRemoveAfterSale = (remainingStock, activeListings) => {
  const sobrantes = activeListings.length - Math.max(0, remainingStock);
  return sobrantes > 0 ? activeListings : [];
};

/* ─── Cola "siguiente anuncio" ─── */

// Cuenta a la que le toca: la que lleva más tiempo sin publicar (o nunca ha publicado)
export const pickAutoAccount = async (accounts) => {
  if (!accounts.length) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select("account_id, publicado_at")
    .order("publicado_at", { ascending: false })
    .limit(1000);
  if (error) throw error;

  const last = new Map();
  for (const l of data || []) {
    const k = String(l.account_id);
    if (!last.has(k)) last.set(k, new Date(l.publicado_at).getTime());
  }
  return [...accounts].sort(
    (a, b) => (last.get(String(a.id)) ?? 0) - (last.get(String(b.id)) ?? 0)
  )[0];
};

/**
 * Siguiente producto a publicar en una cuenta:
 * - con stock
 * - sin anuncio activo en esa cuenta
 * - con menos anuncios activos que unidades (para no anunciar más de lo que tienes)
 * Prioriza los que no están publicados en ninguna parte.
 */
export const getNextProductForAccount = async (accountId, skipIds = []) => {
  const candidates = await getPendingProductsForAccount(accountId, skipIds);
  return { product: candidates[0] || null, pending: candidates.length };
};

// Todos los productos pendientes de publicar en una cuenta, ya ordenados
export const getPendingProductsForAccount = async (accountId, skipIds = []) => {
  const [{ data: products, error: pErr }, listings] = await Promise.all([
    supabase
      .from("products")
      .select("id, nombre, descripcion, precio, foto, cantidad, lugar, proveedor, codigoProveedor")
      .gt("cantidad", 0)
      .order("id"),
    getActiveListings(),
  ]);
  if (pErr) throw pErr;

  const skip = new Set(skipIds.map(String));
  const countByProduct = {};
  const inThisAccount = new Set();
  for (const l of listings) {
    const k = String(l.product_id);
    countByProduct[k] = (countByProduct[k] || 0) + 1;
    if (String(l.account_id) === String(accountId)) inThisAccount.add(k);
  }

  const accountsByProduct = {};
  for (const l of listings) {
    (accountsByProduct[String(l.product_id)] ||= []).push(l.account_id);
  }

  const candidates = (products || [])
    .filter((p) => {
      const k = String(p.id);
      return !skip.has(k) && !inThisAccount.has(k) && (countByProduct[k] || 0) < p.cantidad;
    })
    // ids de las cuentas donde ya está anunciado (para mostrarlas)
    .map((p) => ({ ...p, listedAccountIds: accountsByProduct[String(p.id)] || [] }));

  candidates.sort(
    (a, b) =>
      (countByProduct[String(a.id)] || 0) - (countByProduct[String(b.id)] || 0) ||
      Number(a.id) - Number(b.id)
  );

  return candidates;
};
