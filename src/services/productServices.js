import { supabase } from "../supabaseClient";

export const getAllProducts = async () => {
  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};
export const createProduct = async (product) => {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();
  if (error) throw error;
  return data;
};


export const getProductById = async (id) => {
  const parsedId = Number(id);
  const { data, error } = await supabase
    .from("products_with_sales")
    .select("*")
    .eq("id", parsedId)
    .single();

  if (error) throw error;
  // opcional: camelCase
  return { ...data, historicoVentas: data.historico_ventas };
};


export const searchProducts = async (searchTerm) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${searchTerm}%`)
    .order("id");
  if (error) throw error;
  return data;
};
export const getProductsByCategory = async (category) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("id");
  if (error) throw error;
  return data;
};
export const getProductsByUser = async (userId) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("id");
  if (error) throw error;
  return data;
};
export const getProductsByUserAndCategory = async (userId, category) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .eq("category", category)
    .order("id");
  if (error) throw error;
  return data;
};