create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  path text unique not null,
  url text not null,
  alt_text text,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references admins(id),
  created_at timestamptz not null default now()
);

alter table media_assets enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'crown-media',
  'crown-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/avif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];
