import { supabase } from "../supabaseClient";

const TABLE = "charm_accounts";

export const getAllAccounts = async () => {
  const { data, error } = await supabase.from(TABLE).select("*").order("id");
  if (error) throw error;
  return data;
};

export const createAccount = async (account = {}) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([account])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAccount = async (id, updates) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAccount = async (id) => {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
};

/* ─── Multicuentas del iPad ─── */
const IPAD_TABLE = "ipad_multicuentas";

export const getAllIpadAccounts = async () => {
  const { data, error } = await supabase.from(IPAD_TABLE).select("*").order("id");
  if (error) throw error;
  return data;
};

export const createIpadAccount = async (account = {}) => {
  const { data, error } = await supabase.from(IPAD_TABLE).insert([account]).select().single();
  if (error) throw error;
  return data;
};

export const updateIpadAccount = async (id, updates) => {
  const { data, error } = await supabase
    .from(IPAD_TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteIpadAccount = async (id) => {
  const { error } = await supabase.from(IPAD_TABLE).delete().eq("id", id);
  if (error) throw error;
};