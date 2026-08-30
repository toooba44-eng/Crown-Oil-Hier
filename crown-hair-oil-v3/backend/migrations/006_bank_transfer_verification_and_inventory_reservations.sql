create table if not exists inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  status text not null default 'active' check (status in ('active','converted_to_sale','released','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  released_at timestamptz
);
create index if not exists inventory_reservations_product_active_idx on inventory_reservations(product_id,status,expires_at);
create index if not exists inventory_reservations_order_idx on inventory_reservations(order_id);

create table if not exists bank_transfer_submissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  receipt_path text not null,
  original_filename text,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  sender_name text,
  sender_account_last4 text,
  status text not null default 'under_review' check (status in ('under_review','confirmed','rejected')),
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by_admin_id uuid references admins(id),
  rejection_reason text,
  admin_note text
);
create index if not exists bank_transfer_submissions_status_idx on bank_transfer_submissions(status,submitted_at desc);

alter table orders add column if not exists payment_method text;
alter table orders add column if not exists reservation_expires_at timestamptz;

alter table inventory_reservations enable row level security;
alter table bank_transfer_submissions enable row level security;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('bank-transfer-receipts','bank-transfer-receipts',false,5242880,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.release_expired_inventory_reservations()
returns integer language plpgsql security definer set search_path=public as $$
declare n integer;
begin
  update inventory_reservations set status='expired',released_at=now() where status='active' and expires_at<=now();
  get diagnostics n=row_count;
  return n;
end $$;

create or replace function public.reserve_inventory_for_order(p_order_id uuid,p_ttl_hours integer default 24)
returns timestamptz language plpgsql security definer set search_path=public as $$
declare item record; available integer; expiry timestamptz:=now()+make_interval(hours=>p_ttl_hours);
begin
  perform public.release_expired_inventory_reservations();
  for item in select product_id,quantity from order_items where order_id=p_order_id loop
    select p.stock_qty-coalesce((select sum(r.quantity) from inventory_reservations r where r.product_id=p.id and r.status='active' and r.expires_at>now()),0)
      into available from products p where p.id=item.product_id for update;
    if available is null or available<item.quantity then raise exception 'insufficient_stock:%',item.product_id using errcode='P0001'; end if;
    insert into inventory_reservations(order_id,product_id,quantity,status,expires_at) values(p_order_id,item.product_id,item.quantity,'active',expiry);
  end loop;
  update orders set reservation_expires_at=expiry,updated_at=now() where id=p_order_id;
  return expiry;
end $$;

create or replace function public.confirm_bank_transfer_payment(p_order_id uuid,p_admin_id uuid,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
declare r record;
begin
  perform 1 from orders where id=p_order_id for update;
  if not exists(select 1 from bank_transfer_submissions where order_id=p_order_id and status='under_review') then raise exception 'bank_submission_not_under_review'; end if;
  for r in select * from inventory_reservations where order_id=p_order_id and status='active' for update loop
    update products set stock_qty=stock_qty-r.quantity,updated_at=now() where id=r.product_id and stock_qty>=r.quantity;
    if not found then raise exception 'insufficient_physical_stock'; end if;
  end loop;
  update inventory_reservations set status='converted_to_sale',confirmed_at=now() where order_id=p_order_id and status='active';
  update bank_transfer_submissions set status='confirmed',verified_at=now(),verified_by_admin_id=p_admin_id,admin_note=p_note,rejection_reason=null where order_id=p_order_id;
  update payments set status='paid',updated_at=now(),raw_metadata=coalesce(raw_metadata,'{}'::jsonb)||jsonb_build_object('manually_verified',true,'verified_at',now(),'verified_by',p_admin_id) where order_id=p_order_id and method='bank_transfer';
  update orders set payment_status='paid',status='processing',updated_at=now() where id=p_order_id;
end $$;

create or replace function public.reject_bank_transfer_payment(p_order_id uuid,p_admin_id uuid,p_reason text,p_note text default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  update bank_transfer_submissions set status='rejected',verified_at=now(),verified_by_admin_id=p_admin_id,rejection_reason=p_reason,admin_note=p_note where order_id=p_order_id;
  update payments set status='failed',updated_at=now(),raw_metadata=coalesce(raw_metadata,'{}'::jsonb)||jsonb_build_object('manual_rejection',true,'rejected_at',now(),'rejected_by',p_admin_id,'reason',p_reason) where order_id=p_order_id and method='bank_transfer';
  update inventory_reservations set status='released',released_at=now() where order_id=p_order_id and status='active';
  update orders set payment_status='failed',status='cancelled',updated_at=now() where id=p_order_id;
end $$;

create or replace function public.available_stock_for_product(p_product_id uuid)
returns integer language sql stable security definer set search_path=public as $$
select greatest(0,p.stock_qty-coalesce((select sum(r.quantity) from inventory_reservations r where r.product_id=p.id and r.status='active' and r.expires_at>now()),0))::integer from products p where p.id=p_product_id
$$;

do $$ begin create extension if not exists pg_cron; exception when others then null; end $$;
do $$ begin
  perform cron.unschedule('crown-release-expired-reservations') where exists(select 1 from cron.job where jobname='crown-release-expired-reservations');
  perform cron.schedule('crown-release-expired-reservations','*/5 * * * *','select public.release_expired_inventory_reservations();');
exception when others then null; end $$;