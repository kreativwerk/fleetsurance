-- Fleetsurance Grundschema (M0)
-- Mandanten: Makler → Unternehmen → Fahrzeuge/Schäden. Zugriff ausschließlich über RLS.
-- Kreativwerk (Betreiber) hat keine Rolle mit Lesezugriff auf Fachdaten.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Aufzählungen
-- ---------------------------------------------------------------------------
create type public.rolle as enum ('makler_admin', 'makler_mitarbeiter', 'unternehmen_admin', 'fuhrparkleitung');
create type public.seite as enum ('dsp', 'makler');
create type public.halterart as enum ('arval_leasing', 'eigentum', 'miete');
create type public.fahrzeug_status as enum ('aktiv', 'werkstatt', 'defleeted');
create type public.schaden_status as enum ('gemeldet', 'geprueft', 'beim_versicherer', 'reguliert');
create type public.schuldfrage as enum ('eigen', 'gegner', 'ungeklaert');
create type public.evb_art as enum ('arval', 'allgemein');
create type public.nachricht_typ as enum ('nachricht', 'status_ereignis');
create type public.sichtbarkeit as enum ('alle', 'makler_intern');

-- ---------------------------------------------------------------------------
-- Mandanten
-- ---------------------------------------------------------------------------
create table public.makler (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  akzentfarbe text not null default '#245EED' check (akzentfarbe ~ '^#[0-9A-Fa-f]{6}$'),
  telefon text,
  email text,
  erstellt_am timestamptz not null default now()
);

create table public.unternehmen (
  id uuid primary key default gen_random_uuid(),
  makler_id uuid not null references public.makler (id) on delete restrict,
  name text not null check (length(name) between 1 and 200),
  station text,
  erstellt_am timestamptz not null default now()
);
create index on public.unternehmen (makler_id);

create table public.mitgliedschaften (
  user_id uuid not null references auth.users (id) on delete cascade,
  makler_id uuid not null references public.makler (id) on delete cascade,
  -- Makler-Rollen haben kein Unternehmen, DSP-Rollen genau eines.
  unternehmen_id uuid references public.unternehmen (id) on delete cascade,
  rolle public.rolle not null,
  vorname text,
  nachname text,
  erstellt_am timestamptz not null default now(),
  constraint mitgliedschaft_rolle_passt check (
    (rolle in ('makler_admin', 'makler_mitarbeiter') and unternehmen_id is null)
    or (rolle in ('unternehmen_admin', 'fuhrparkleitung') and unternehmen_id is not null)
  )
);
create unique index mitgliedschaften_eindeutig
  on public.mitgliedschaften (user_id, makler_id, coalesce(unternehmen_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index on public.mitgliedschaften (user_id);

create table public.einladungen (
  id uuid primary key default gen_random_uuid(),
  makler_id uuid not null references public.makler (id) on delete cascade,
  unternehmen_id uuid references public.unternehmen (id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  rolle public.rolle not null,
  -- Angenommen wird per bestätigter E-Mail-Adresse (Login-Link), kein eigenes Token nötig.
  gueltig_bis timestamptz not null default now() + interval '7 days',
  angenommen_am timestamptz,
  erstellt_von uuid references auth.users (id) on delete set null,
  erstellt_am timestamptz not null default now(),
  constraint einladung_rolle_passt check (
    (rolle in ('makler_admin', 'makler_mitarbeiter') and unternehmen_id is null)
    or (rolle in ('unternehmen_admin', 'fuhrparkleitung') and unternehmen_id is not null)
  )
);

-- ---------------------------------------------------------------------------
-- Fachdaten (makler_id wird per Trigger aus dem Unternehmen abgeleitet)
-- ---------------------------------------------------------------------------
create table public.fahrzeuge (
  id uuid primary key default gen_random_uuid(),
  unternehmen_id uuid not null references public.unternehmen (id) on delete cascade,
  makler_id uuid not null references public.makler (id),
  kennzeichen text not null check (kennzeichen ~ '^[A-ZÄÖÜ0-9]{2,10}$'),
  kennzeichen_ort text check (kennzeichen_ort ~ '^[A-ZÄÖÜ]{1,3}$'),
  fin text check (fin ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  hersteller text not null,
  modell text not null,
  baujahr int check (baujahr between 1990 and 2100),
  antrieb text,
  halterart public.halterart not null,
  status public.fahrzeug_status not null default 'aktiv',
  standort text,
  erstellt_am timestamptz not null default now(),
  unique (unternehmen_id, kennzeichen)
);
create unique index fahrzeuge_fin_je_unternehmen on public.fahrzeuge (unternehmen_id, fin) where fin is not null;
create index on public.fahrzeuge (makler_id);

create table public.schaeden (
  id uuid primary key default gen_random_uuid(),
  nummer text not null unique,
  unternehmen_id uuid not null references public.unternehmen (id) on delete cascade,
  makler_id uuid not null references public.makler (id),
  fahrzeug_id uuid not null references public.fahrzeuge (id) on delete restrict,
  am timestamptz not null,
  ort text,
  art text not null,
  schuldfrage public.schuldfrage not null default 'ungeklaert',
  polizei boolean not null default false,
  status public.schaden_status not null default 'gemeldet',
  schadensnummer_versicherer text,
  aufwand_geschaetzt_cent bigint check (aufwand_geschaetzt_cent >= 0),
  erstellt_von uuid references auth.users (id) on delete set null,
  erstellt_am timestamptz not null default now()
);
create index on public.schaeden (unternehmen_id, am desc);
create index on public.schaeden (makler_id);

create table public.schaden_statusverlauf (
  id bigint generated always as identity primary key,
  schaden_id uuid not null references public.schaeden (id) on delete cascade,
  status public.schaden_status not null,
  am timestamptz not null default now(),
  geaendert_von uuid references auth.users (id) on delete set null
);
create index on public.schaden_statusverlauf (schaden_id, am);

create table public.schaden_nachrichten (
  id uuid primary key default gen_random_uuid(),
  schaden_id uuid not null references public.schaeden (id) on delete cascade,
  unternehmen_id uuid not null references public.unternehmen (id) on delete cascade,
  makler_id uuid not null references public.makler (id),
  typ public.nachricht_typ not null default 'nachricht',
  autor_id uuid references auth.users (id) on delete set null,
  seite public.seite,
  text text not null default '' check (length(text) <= 5000),
  sichtbarkeit public.sichtbarkeit not null default 'alle',
  anhang_pfad text,
  anhang_name text,
  anhang_groesse_kb int,
  erstellt_am timestamptz not null default now(),
  zurueckgezogen_am timestamptz,
  constraint nachricht_hat_inhalt check (typ = 'status_ereignis' or length(text) > 0 or anhang_pfad is not null)
);
create index on public.schaden_nachrichten (schaden_id, erstellt_am);

create table public.schaden_lesestatus (
  schaden_id uuid not null references public.schaeden (id) on delete cascade,
  seite public.seite not null,
  gelesen_bis timestamptz not null default now(),
  primary key (schaden_id, seite)
);

create table public.dauer_evb (
  unternehmen_id uuid not null references public.unternehmen (id) on delete cascade,
  makler_id uuid not null references public.makler (id),
  art public.evb_art not null,
  nummer text not null check (nummer ~ '^[A-Z0-9]{7}$'),
  aktualisiert_am timestamptz not null default now(),
  primary key (unternehmen_id, art)
);

create table public.monatsquoten (
  unternehmen_id uuid not null references public.unternehmen (id) on delete cascade,
  makler_id uuid not null references public.makler (id),
  jahr int not null check (jahr between 2000 and 2100),
  monat int not null check (monat between 1 and 12),
  quote numeric(5, 1) not null check (quote >= 0),
  quelle text not null default 'makler_upload',
  primary key (unternehmen_id, jahr, monat)
);

-- Prüfprotokoll: nur über Trigger beschrieben, für niemanden per API lesbar.
create table public.audit_log (
  id bigint generated always as identity primary key,
  user_id uuid,
  aktion text not null,
  tabelle text not null,
  datensatz_id text,
  am timestamptz not null default now()
);
