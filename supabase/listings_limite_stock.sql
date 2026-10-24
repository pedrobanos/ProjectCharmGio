-- ============================================================
--  Límite de anuncios: como mucho UN anuncio activo por unidad en stock
--  (si hay 2 unidades, se puede anunciar en 2 cuentas a la vez)
--  Ejecutar UNA vez en Supabase → SQL Editor → New query → Run
--  (después de listings.sql)
-- ============================================================

create or replace function public.listings_check_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock   numeric;
  v_activos integer;
begin
  -- Solo se comprueba cuando el anuncio queda (o pasa a estar) activo
  if new.estado <> 'activo' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.estado = 'activo' and old.product_id = new.product_id then
    return new;
  end if;

  -- Bloquea el producto para que dos publicaciones a la vez no se cuelen
  select cantidad into v_stock
    from public.products
   where id = new.product_id
   for update;

  select count(*) into v_activos
    from public.listings
   where product_id = new.product_id
     and estado = 'activo'
     and id is distinct from new.id;

  if coalesce(v_stock, 0) <= 0 then
    raise exception 'No queda stock de este producto, no se puede anunciar.';
  end if;

  if v_activos >= v_stock then
    raise exception 'Ya está anunciado en % cuenta(s) y solo tienes % unidad(es). Retira un anuncio o añade stock.',
      v_activos, v_stock;
  end if;

  return new;
end;
$$;

drop trigger if exists listings_check_stock on public.listings;
create trigger listings_check_stock
  before insert or update of estado, product_id on public.listings
  for each row execute function public.listings_check_stock();
