alter table orders add column if not exists customer_access_token_hash text;
create index if not exists orders_customer_access_token_hash_idx on orders(customer_access_token_hash) where customer_access_token_hash is not null;

create or replace function public.release_expired_inventory_reservations()
returns integer
language plpgsql
security definer
set search_path=public
as $$
declare n integer;
begin
  update inventory_reservations r
  set status='expired', released_at=now()
  where r.status='active' and r.expires_at <= now()
    and not exists (
      select 1 from bank_transfer_submissions b
      where b.order_id=r.order_id and b.status in ('under_review','confirmed')
    );
  get diagnostics n = row_count;
  update orders o set status='cancelled', updated_at=now()
  where o.payment_method='bank_transfer' and o.payment_status='pending'
    and exists(select 1 from inventory_reservations r where r.order_id=o.id and r.status='expired')
    and not exists(select 1 from bank_transfer_submissions b where b.order_id=o.id and b.status in ('under_review','confirmed'));
  return n;
end $$;