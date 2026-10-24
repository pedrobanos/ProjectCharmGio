-- ============================================================
--  Anuncios (Vinted / Wallapop) por producto y cuenta
--  Ejecutar UNA vez en Supabase → SQL Editor → New query → Run
-- ============================================================

-- Crea la tabla usando el mismo tipo de id que ya tienen
-- products, charm_accounts y sales (bigint, integer o uuid).
do $$
declare
  t_product text;
  t_account text;
  t_sale    text;
begin
  select format_type(atttypid, atttypmod) into t_product
    from pg_attribute where attrelid = 'public.products'::regclass and attname = 'id';
  select format_type(atttypid, atttypmod) into t_account
    from pg_attribute where attrelid = 'public.charm_accounts'::regclass and attname = 'id';
  select format_type(atttypid, atttypmod) into t_sale
    from pg_attribute where attrelid = 'public.sales'::regclass and attname = 'id';

  execute format($sql$
    create table if not exists public.listings (
      id            bigint generated always as identity primary key,
      product_id    %s not null references public.products(id)       on delete cascade,
      account_id    %s not null references public.charm_accounts(id) on delete cascade,
      estado        text not null default 'activo'
                    check (estado in ('activo', 'vendido', 'retirado')),
      publicado_at  timestamptz not null default now(),
      cerrado_at    timestamptz,
      sale_id       %s references public.sales(id) on delete set null
    )
  $sql$, t_product, t_account, t_sale);
end $$;

-- Un producto solo puede tener UN anuncio activo por cuenta
create unique index if not exists listings_un_activo_por_cuenta
  on public.listings (product_id, account_id)
  where estado = 'activo';

create index if not exists listings_product_idx on public.listings (product_id);
create index if not exists listings_account_idx on public.listings (account_id, publicado_at desc);

-- Acceso: solo usuarios con sesión iniciada en la app
alter table public.listings enable row level security;

drop policy if exists "listings_usuarios_autenticados" on public.listings;
create policy "listings_usuarios_autenticados"
  on public.listings
  for all
  to authenticated
  using (true)
  with check (true);
