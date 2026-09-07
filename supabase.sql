create table if not exists site_settings (id bigint generated always as identity primary key, key text unique not null, value jsonb not null default '{}'::jsonb, updated_at timestamptz default now());
create table if not exists media_library (id uuid primary key default gen_random_uuid(), url text not null, title text, alt_text text, credit text, media_type text default 'image', usage text[], active boolean default true, created_at timestamptz default now());
create table if not exists hotels (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, zone text, type text, description text, price_from numeric, rating numeric, review_count int default 0, available_rooms int default 0, cover_image text, tags text[], services text[], active boolean default true, featured boolean default false, seo_title text, seo_description text, created_at timestamptz default now());
create table if not exists hotel_photos (id uuid primary key default gen_random_uuid(), hotel_id uuid references hotels(id) on delete cascade, url text not null, alt_text text, credit text, sort_order int default 0, active boolean default true);
create table if not exists motorbikes (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, type text, description text, price_from numeric, cover_image text, active boolean default true, seo_title text, seo_description text);
create table if not exists ferry_schedules (id uuid primary key default gen_random_uuid(), route text not null, boat_name text, departure_time time not null, contact_name text, contact_phone text, notes text, active boolean default true, sort_order int default 0);
create table if not exists ground_transport (id uuid primary key default gen_random_uuid(), slug text unique not null, route text not null, transport_type text, schedule_text text, notes text, active boolean default true);
create table if not exists destinations (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, category text, description text, cover_image text, active boolean default true, seo_title text, seo_description text);
create table if not exists activities (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, category text, description text, cover_image text, price_from numeric, active boolean default true, seo_title text, seo_description text);
create table if not exists blog_posts (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, excerpt text, content text, category text, cover_image text, status text default 'draft', seo_title text, seo_description text, published_at timestamptz, created_at timestamptz default now());
create table if not exists events_promotions (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, type text, description text, start_date date, end_date date, cover_image text, active boolean default true, seo_title text, seo_description text);
create table if not exists travelers (id uuid primary key default gen_random_uuid(), traveler_code text unique not null, name text, email text, created_at timestamptz default now());
create table if not exists reservations (id uuid primary key default gen_random_uuid(), traveler_id uuid references travelers(id), hotel_id uuid references hotels(id), status text default 'pending', check_in date, check_out date, guests int, created_at timestamptz default now());
create table if not exists hotel_reviews (id uuid primary key default gen_random_uuid(), traveler_id uuid references travelers(id), hotel_id uuid references hotels(id), reservation_id uuid references reservations(id), rating int check (rating between 1 and 5), comment text, status text default 'pending', created_at timestamptz default now());
create table if not exists newsletter_subscribers (id uuid primary key default gen_random_uuid(), name text, email text unique not null, source text default 'website', created_at timestamptz default now());
create table if not exists contact_messages (id uuid primary key default gen_random_uuid(), type text, name text, email text, message text, created_at timestamptz default now());

-- ===============================
-- Reserva Ometepe V22 Architecture Layer
-- No cambia diseño ni UX de la landing; prepara Centro de Operaciones.
-- ===============================

create extension if not exists pgcrypto;

-- Configuración global editable desde futuro HPanel / Centro de Operaciones
create table if not exists site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  page_type text default 'page',
  is_indexable boolean default true,
  canonical_url text,
  og_image text,
  schema_json jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists seo_metadata (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  slug text,
  seo_title text,
  seo_description text,
  keywords text[],
  canonical_url text,
  og_image text,
  robots text default 'index, follow',
  schema_json jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique(entity_type, entity_id)
);

-- Capa propia de medición: no sustituye GA4/Meta/Clarity, complementa el Centro de Operaciones.
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_path text,
  page_url text,
  referrer text,
  session_id text,
  device_type text,
  language text,
  service_type text,
  service_slug text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists analytics_events_name_idx on analytics_events(event_name);
create index if not exists analytics_events_created_idx on analytics_events(created_at desc);
create index if not exists analytics_events_service_idx on analytics_events(service_type, service_slug);

create table if not exists conversion_funnel_events (
  id uuid primary key default gen_random_uuid(),
  funnel_name text not null default 'traveler_request',
  step text not null,
  page_path text,
  session_id text,
  service_type text,
  service_slug text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists funnel_events_name_step_idx on conversion_funnel_events(funnel_name, step);
create index if not exists funnel_events_created_idx on conversion_funnel_events(created_at desc);

-- Solicitudes inteligentes de la landing: alojamiento, moto, experiencia o servicio general.
create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  request_code text unique default ('RO-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  service_type text not null,
  service_label text not null,
  service_slug text,
  traveler_name text not null,
  traveler_email text not null,
  traveler_whatsapp text not null,
  country text,
  start_date date,
  end_date date,
  adults int default 1,
  children int default 0,
  notes text,
  status text not null default 'solicitud_recibida',
  source_page text,
  proposal_sent_at timestamptz,
  accepted_at timestamptz,
  payment_sent_at timestamptz,
  payment_confirmed_at timestamptz,
  reservation_confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists service_requests_status_idx on service_requests(status);
create index if not exists service_requests_service_idx on service_requests(service_type, service_slug);
create index if not exists service_requests_created_idx on service_requests(created_at desc);

-- Tabla lista para futuras experiencias administrables desde Centro de Operaciones.
create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text,
  description text,
  duration text,
  ideal_for text,
  difficulty text,
  cover_image text,
  active boolean default true,
  featured boolean default false,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Relación futura para que alojamientos recomienden experiencias cercanas.
create table if not exists accommodation_experiences (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references hotels(id) on delete cascade,
  experience_id uuid references experiences(id) on delete cascade,
  distance_text text,
  note text,
  sort_order int default 0,
  unique(hotel_id, experience_id)
);

-- Log de auditoría para Centro de Operaciones.
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text not null,
  entity_type text,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- RLS base: lectura pública de contenido activo; escritura solo vía políticas privadas del Centro de Operaciones.
alter table site_settings enable row level security;
alter table site_pages enable row level security;
alter table seo_metadata enable row level security;
alter table analytics_events enable row level security;
alter table conversion_funnel_events enable row level security;
alter table service_requests enable row level security;
alter table experiences enable row level security;
alter table accommodation_experiences enable row level security;
alter table audit_logs enable row level security;

create policy if not exists "Public read site settings" on site_settings for select using (true);
create policy if not exists "Public read site pages" on site_pages for select using (is_indexable = true);
create policy if not exists "Public read seo metadata" on seo_metadata for select using (true);
create policy if not exists "Public insert analytics events" on analytics_events for insert with check (true);
create policy if not exists "Public insert funnel events" on conversion_funnel_events for insert with check (true);
create policy if not exists "Public insert service requests" on service_requests for insert with check (true);
create policy if not exists "Public read active experiences" on experiences for select using (active = true);
create policy if not exists "Public read accommodation experiences" on accommodation_experiences for select using (true);

-- Configuración inicial editable después desde HPanel.
insert into site_settings(key,value) values
('site_name','"Reserva Ometepe"'::jsonb),
('public_site_url','"https://reservaometepe.com"'::jsonb),
('ga4_id','"G-VQ1DWJ789S"'::jsonb),
('meta_pixel_id','"1340688658236763"'::jsonb),
('clarity_id','"xcbnbregcb"'::jsonb),
('support_email','"soporte@reservaometepe.com"'::jsonb),
('alliances_email','"alianzas@reservaometepe.com"'::jsonb),
('default_seo_title','"Reserva Ometepe | Planifica tu viaje"'::jsonb),
('default_seo_description','"Planifica tu viaje a Isla de Ometepe con alojamientos, horarios de barcos, transporte, motos, experiencias, eventos y guías locales."'::jsonb),
('default_og_image','"/RO.png"'::jsonb)
on conflict (key) do update set value=excluded.value, updated_at=now();


-- ===============================
-- Motor de Beneficios Exclusivos
-- Controlado desde Centro de Operaciones. La landing solo muestra beneficios activos.
-- target_type: accommodation, experience, motorbike, global
-- target_slug: slug del alojamiento/experiencia/moto; null si aplica a todos.
-- ===============================
create table if not exists benefits (
  id uuid primary key default gen_random_uuid(),
  target_type text not null default 'accommodation',
  target_slug text,
  applies_to_all boolean default false,
  badge_text text default 'Beneficio exclusivo',
  title text not null,
  description text,
  benefit_type text default 'benefit',
  discount_percent numeric,
  value_text text,
  start_date date,
  end_date date,
  active boolean default true,
  show_on_card boolean default true,
  show_on_detail boolean default true,
  priority int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_benefits_target on benefits(target_type, target_slug);
create index if not exists idx_benefits_active on benefits(active, start_date, end_date);

alter table benefits enable row level security;

drop policy if exists public_read_active_benefits on benefits;
create policy public_read_active_benefits
on benefits
for select
using (
  active = true
  and (start_date is null or start_date <= current_date)
  and (end_date is null or end_date >= current_date)
);

drop policy if exists auth_manage_benefits on benefits;
create policy auth_manage_benefits
on benefits
for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

insert into benefits(target_type,target_slug,badge_text,title,description,benefit_type,discount_percent,active,priority)
values
('accommodation','volcan-view-eco-lodge','Beneficio exclusivo','5% de descuento','Obtén 5% de descuento al solicitar este alojamiento desde Reserva Ometepe. Beneficio sujeto a disponibilidad y confirmación del alojamiento.','discount',5,true,10),
('accommodation','casa-cocibolca','Beneficio exclusivo','Desayuno incluido','Reserva desde Reserva Ometepe y consulta disponibilidad con desayuno incluido según temporada y tipo de habitación.','included',null,true,9),
('accommodation','playa-santo-domingo-inn','Beneficio exclusivo','Late check-out sujeto a disponibilidad','Al solicitar por Reserva Ometepe puedes consultar late check-out sujeto a disponibilidad del alojamiento.','benefit',null,true,8)
on conflict do nothing;
