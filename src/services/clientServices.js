
import { supabase } from "../supabaseClient";

// Obtener la blacklist con el nombre del cliente
export async function getBlacklist() {
  const { data, error } = await supabase
    .from("blacklist")
    .select(`
      id,
      fecha_bloqueo,
      clientes:cliente_id ( nombre )
    `)
    .order("fecha_bloqueo", { ascending: false });

  if (error) throw error;

  // Mapeamos los campos al formato que usa tu componente
  return data.map(b => ({
    id: b.id,
    cliente: b.clientes?.nombre ?? "Desconocido",
    fecha: new Date(b.fecha_bloqueo).toLocaleString("es-ES"),
  }));
}

// Añadir cliente a la blacklist (por nombre)
export async function addClienteToBlacklistPorNombre(nombre) {
  // Paso 1: buscar cliente
  let { data: cliente, error } = await supabase
    .from("clientes")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle();

  if (error) throw error;

  // Paso 2: si no existe, crearlo
  if (!cliente) {
    const { data: nuevo, error: errNuevo } = await supabase
      .from("clientes")
      .insert([{ nombre }])
      .select()
      .single();

    if (errNuevo) throw errNuevo;
    cliente = nuevo;
  }

  // Paso 3: insertar en blacklist
  const { error: errBL } = await supabase
    .from("blacklist")
    .insert([
      {
        cliente_id: cliente.id,
        fecha_bloqueo: new Date().toISOString(),
        activo: true,
        razon: "Añadido manualmente",
      },
    ]);

  if (errBL) throw errBL;
}

// Eliminar de la blacklist
export async function removeClienteFromBlacklist(id) {
  const { error } = await supabase
    .from("blacklist")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function bloquearCliente(nombre) {
  // Buscar cliente por nombre
  let { data: cliente, error } = await supabase
    .from("clientes")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle();

  if (error) throw error;

  if (!cliente) throw new Error("Cliente no encontrado");

  // Insertar en blacklist si no existe ya
  const { error: errBL } = await supabase
    .from("blacklist")
    .insert([
      {
        cliente_id: cliente.id,
        fecha_bloqueo: new Date().toISOString(),
        activo: true,
        razon: "Bloqueado desde SalesView",
      },
    ]);

  if (errBL) throw errBL;
}

// Desbloquear cliente
export async function desbloquearCliente(nombre) {
  let { data: cliente, error } = await supabase
    .from("clientes")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle();

  if (error) throw error;
  if (!cliente) return;

  const { error: errDel } = await supabase
    .from("blacklist")
    .delete()
    .eq("cliente_id", cliente.id);

  if (errDel) throw errDel;
}

// Consultar clientes en blacklist
export async function getClientesBlacklisted() {
  const { data, error } = await supabase.from("blacklist").select("cliente_id");
  if (error) throw error;
  return data.map((b) => b.cliente_id);
}