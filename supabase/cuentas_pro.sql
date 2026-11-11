-- ============================================================
--  Cuentas PRO (Vinted Pro / Wallapop PRO)
--  Ejecutar UNA vez en Supabase → SQL Editor → New query → Run
-- ============================================================
alter table public.charm_accounts
  add column if not exists is_pro boolean;
