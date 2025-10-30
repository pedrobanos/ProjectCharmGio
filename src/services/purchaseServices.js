import { supabase } from "../supabaseClient";


/**
 * 🔹 Crear un nuevo pedido
 * @param {Object} pedido - { proveedor, nota, items: [{ product_id, cantidad }] }
 */
export const createPurchaseOrder = async (pedido) => {
    const { proveedor, nota, items } = pedido;

    const total_items = items.length;
    const total_cantidad = items.reduce((sum, i) => sum + (i.cantidad ?? 0), 0);

    const { data: order, error } = await supabase
        .from("purchase_orders")
        .insert([
            {
                proveedor,
                nota,
                total_items,
                total_cantidad,
            },
        ])
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Insertar los productos del pedido
    const itemsInsert = items.map((p) => ({
        purchase_order_id: order.id,
        product_id: p.product_id,
        cantidad: p.cantidad,
    }));

    const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(itemsInsert);

    if (itemsError) throw new Error(itemsError.message);

    return order;
};

/**
 * 🔹 Obtener todos los pedidos
 */
export const getPurchaseOrders = async () => {
    const { data, error } = await supabase
        .from("purchase_orders")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

/**
 * 🔹 Obtener un pedido específico con sus productos
 * @param {number} id - ID del pedido
 */
export const getPurchaseOrderById = async (id) => {
    const { data: order, error: orderError } = await supabase
        .from("purchase_orders")
        .select("*")
        .eq("id", id)
        .single();

    if (orderError) throw new Error(orderError.message);

    const { data: items, error: itemsError } = await supabase
        .from("purchase_order_items")
        .select("*, products(nombre, foto, lugar)")
        .eq("purchase_order_id", id);

    if (itemsError) throw new Error(itemsError.message);

    return { order, items };
};

/**
 * 🔹 Actualizar estado de un producto dentro del pedido
 * @param {number} itemId - ID del item
 * @param {'pendiente'|'confirmado'|'perdido'} estado
 */
export const updateItemQuantity = async (itemId, cantidad_recibida) => {
    const { error } = await supabase
        .from("purchase_order_items")
        .update({ cantidad_recibida })
        .eq("id", itemId);
    if (error) throw new Error(error.message);
};

export const updateItemStatus = async (itemId, estado) => {
    const { error } = await supabase
        .from("purchase_order_items")
        .update({ estado })
        .eq("id", itemId);
    if (error) throw new Error(error.message);
};

export const confirmPurchaseOrder = async (purchaseId) => {
    const { error } = await supabase.rpc("confirmar_pedido", { purchase_id: purchaseId });
    if (error) throw new Error(error.message);
    return true;
};
