-- Run this once in the Supabase Dashboard SQL Editor for the Levo project.
create table if not exists public.gift_orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  recipient text not null check (char_length(btrim(recipient)) between 1 and 40),
  occasion text not null check (char_length(btrim(occasion)) between 2 and 120),
  package_id text not null check (package_id in ('digital', 'card', 'couple', 'deluxe')),
  package_name text not null check (char_length(btrim(package_name)) between 1 and 80),
  package_contents jsonb not null
    check (jsonb_typeof(package_contents) = 'array' and jsonb_array_length(package_contents) between 1 and 8),
  recipient_name text not null check (char_length(btrim(recipient_name)) between 2 and 100),
  sender_name text not null default '' check (char_length(sender_name) <= 100),
  notes text not null default '' check (char_length(notes) <= 4000),
  features jsonb not null default '[]'::jsonb
    check (jsonb_typeof(features) = 'array' and jsonb_array_length(features) <= 10),
  cards_count smallint not null check (
    (package_id = 'digital' and cards_count = 0) or
    (package_id = 'card' and cards_count = 1) or
    (package_id in ('couple', 'deluxe') and cards_count = 2)
  ),
  style text not null check (style in ('مبهج وكارتوني', 'هادئ وراقي', 'دافئ وذكريات', 'مش متأكد')),
  contact text not null check (char_length(btrim(contact)) between 3 and 254),
  contact_preference text not null default 'غير محدد'
    check (contact_preference in ('واتساب', 'مكالمة', 'إيميل', 'رسالة على السوشيال', 'غير محدد'))
);

alter table public.gift_orders
  alter column contact_preference set default 'غير محدد',
  drop constraint if exists gift_orders_contact_preference_check,
  drop constraint if exists gift_orders_contact_preference_allowed;

alter table public.gift_orders
  add constraint gift_orders_contact_preference_allowed
  check (contact_preference in ('واتساب', 'مكالمة', 'إيميل', 'رسالة على السوشيال', 'غير محدد'));

alter table public.gift_orders enable row level security;

grant usage on schema public to anon;
revoke all on table public.gift_orders from public, anon, authenticated;
grant insert on table public.gift_orders to anon;

drop policy if exists "Anyone can submit a gift order" on public.gift_orders;
create policy "Anyone can submit a gift order"
  on public.gift_orders
  for insert
  to anon
  with check (true);

comment on table public.gift_orders is
  'Gift requests submitted through the public Levo website. Public visitors may insert only; they cannot read, update, or delete orders.';

notify pgrst, 'reload schema';
