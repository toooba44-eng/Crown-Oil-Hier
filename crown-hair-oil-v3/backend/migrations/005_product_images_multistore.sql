create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  unique(product_id, position)
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);
alter table public.product_images enable row level security;

insert into public.product_images(product_id,url,alt_text,position)
select p.id,'/Crown-Oil-Hier/assets/hero-detail.jpg','Crown Hair Oil',0
from public.products p
where p.slug='crown-hair-oil'
and not exists(select 1 from public.product_images i where i.product_id=p.id);
