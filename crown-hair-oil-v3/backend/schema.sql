create extension if not exists pgcrypto;

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text,
  description_ar text,
  description_en text,
  price_sar numeric(10,2) not null check (price_sar >= 0),
  size_label text,
  sku text unique not null,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  city text not null,
  district text not null,
  street text not null,
  building text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid not null references customers(id),
  address_id uuid not null references addresses(id),
  status text not null default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled','refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  subtotal_sar numeric(10,2) not null,
  shipping_sar numeric(10,2) not null default 0,
  vat_sar numeric(10,2) not null default 0,
  total_sar numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  sku text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_sar numeric(10,2) not null,
  line_total_sar numeric(10,2) not null
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text not null,
  provider_reference text unique,
  method text,
  status text not null default 'pending',
  amount_sar numeric(10,2) not null,
  raw_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  provider text,
  tracking_number text,
  status text not null default 'pending',
  raw_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  customer_id uuid references customers(id),
  rating integer not null check (rating between 1 and 5),
  body text,
  verified_purchase boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists content_blocks (
  key text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  actor_id text,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

insert into products (slug,name_ar,name_en,description_ar,description_en,price_sar,size_label,sku,stock_qty,active)
values ('crown-hair-oil','زيت كراون للشعر','Crown Hair Oil','زيت عناية نباتي للشعر وفروة الرأس.','Botanical hair and scalp care oil.',119.00,'100 ml','CRN-OIL-100',0,true)
on conflict (sku) do nothing;
