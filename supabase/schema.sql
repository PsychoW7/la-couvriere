-- La Couvrière — schéma Supabase (Postgres)
-- À exécuter dans l'éditeur SQL du projet Supabase.

create extension if not exists "pgcrypto";
create extension if not exists btree_gist;

create type booking_status as enum ('pending', 'confirmed', 'cancelled');

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,            -- jour de départ, exclu
  guest_name text not null,
  email text not null,
  phone text not null,
  nights integer not null check (nights >= 1),
  total_cents integer not null check (total_cents >= 0),
  deposit_cents integer not null check (deposit_cents >= 0),
  status booking_status not null default 'pending',
  stripe_session_id text unique,
  locale text not null default 'fr',
  created_at timestamptz not null default now(),
  constraint bookings_dates_valid check (end_date > start_date),
  -- deux réservations confirmées ne peuvent jamais se chevaucher
  constraint bookings_no_overlap exclude using gist (
    daterange(start_date, end_date, '[)') with &&
  ) where (status = 'confirmed')
);

create index if not exists bookings_dates_idx on bookings (start_date, end_date);
create index if not exists bookings_status_idx on bookings (status);

create table if not exists blocked_dates (
  id uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date date not null,            -- jour de "départ", exclu
  reason text,
  created_at timestamptz not null default now(),
  constraint blocked_dates_valid check (end_date > start_date)
);

create index if not exists blocked_dates_idx on blocked_dates (start_date, end_date);

-- RLS : tout passe par la clé service_role côté serveur ; aucun accès anonyme.
alter table bookings enable row level security;
alter table blocked_dates enable row level security;
