create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  display_name text,
  role text not null default 'admin' check (role in ('admin','editor')),
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admins(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_admin_sessions_token on admin_sessions(token_hash);
create index if not exists idx_admin_sessions_expiry on admin_sessions(expires_at);

create table if not exists content_versions (
  id bigserial primary key,
  content_key text not null,
  version_no integer not null,
  content jsonb not null,
  status text not null check (status in ('draft','published','archived')),
  created_by uuid references admins(id),
  created_at timestamptz not null default now(),
  unique(content_key, version_no)
);
create index if not exists idx_content_versions_key_status on content_versions(content_key,status,version_no desc);

insert into content_blocks (key, content)
values (
  'site',
  '{
    "draft": {
      "hero": {
        "eyebrow": "BOTANICAL HAIR & SCALP OIL",
        "titleLine1": "العناية بشعرك",
        "titleLine2": "تبدأ من الجذور.",
        "description": "مزيج نباتي غني بزيت الأرغان والروزماري والزيتون، صُمم ليكون طقسًا بسيطًا للعناية بالشعر وفروة الرأس.",
        "primaryCta": "تسوّقي الآن",
        "secondaryCta": "اكتشفي المكونات"
      },
      "product": {"name":"Crown Hair Oil","price":"119","size":"100 ml"},
      "faq": []
    },
    "published": {
      "hero": {
        "eyebrow": "BOTANICAL HAIR & SCALP OIL",
        "titleLine1": "العناية بشعرك",
        "titleLine2": "تبدأ من الجذور.",
        "description": "مزيج نباتي غني بزيت الأرغان والروزماري والزيتون، صُمم ليكون طقسًا بسيطًا للعناية بالشعر وفروة الرأس.",
        "primaryCta": "تسوّقي الآن",
        "secondaryCta": "اكتشفي المكونات"
      },
      "product": {"name":"Crown Hair Oil","price":"119","size":"100 ml"},
      "faq": []
    },
    "publishedAt": null
  }'::jsonb
)
on conflict (key) do nothing;
