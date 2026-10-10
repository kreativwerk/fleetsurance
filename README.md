# Fleetsurance

Plattform für Flottenversicherungs-Management von Kreativwerk: Dashboards für Flottenbetreiber (z. B. Amazon DSPs)
und Versicherungsmakler. Produkt, Plan und Entscheidungen: [PRODUCT.md](PRODUCT.md) · [PLAN.md](PLAN.md) ·
[docs/DECISIONS.md](docs/DECISIONS.md).

## Stand: M0 (Oberfläche mit Testdaten)

- Übersicht: Schadensquote, Monatsbalken, Kennzahlen, Dauer-eVB (Kopieren und Teilen), Makler, letzte Schäden
- Flotte: Suche und Statusfilter, Kennzeichen wie in CoDriver
- Schäden und Schadenakte mit Chat: Details, Statusverlauf, Fotos und Dokumente, Verlauf mit Anhängen und Lesebestätigung
- Desktop mit schwarzer Icon-Leiste, mobil mit iOS-Navigation und Tab-Leiste (Apple HIG)

Ohne Supabase-Verbindung läuft die App im **Demo-Modus** mit synthetischen Daten (`packages/domain/src/testdaten.ts`).
Mit Verbindung gilt: Login per E-Mail-Link, Daten aus Supabase, Zugriff ausschließlich über RLS.

## Supabase verbinden (einmalig)

1. Im Supabase-Dashboard ein Projekt „Fleetsurance“ anlegen: Organisation „Kreativwerk Agentur“, Region **Central EU (Frankfurt)**.
2. Unter *Authentication → Sign In / Providers* **„Allow new users to sign up“ ausschalten**. Konten entstehen nur über Einladungen.
3. Unter *Authentication → URL Configuration* die Site-URL und `…/auth/callback` als Redirect-URL eintragen.
4. Migrationen einspielen: Inhalt von `supabase/migrations/*.sql` der Reihe nach (oder `supabase db push`).
5. `.env.example` nach `apps/web/.env.local` kopieren und URL sowie den öffentlichen Schlüssel eintragen.

**Ersten Makler-Admin anlegen** (einmalig, im SQL-Editor):

```sql
insert into public.makler (name) values ('Name des Maklers') returning id;
insert into public.einladungen (makler_id, email, rolle) values ('<makler-id>', 'admin@makler.de', 'makler_admin');
```

Dann die Person unter *Authentication → Users → Invite user* einladen. Nach dem Klick auf den Link wird die Einladung automatisch angenommen.

## Entwickeln

```bash
pnpm install
pnpm --filter @fleetsurance/web dev     # http://localhost:3000
pnpm test                               # Fachlogik (vitest)
pnpm test:db                            # Migrationen + RLS-Tests gegen lokales Postgres 16
pnpm typecheck && pnpm lint
```

Screenshots für Desktop (1440 px) und Mobil (390 px) liegen danach in `.impeccable/review/`.
Das Skript braucht einen laufenden Server (`pnpm --filter @fleetsurance/web start`):

```bash
node scripts/screenshots.mjs
```

## Aufbau

```
apps/web          Next.js 15 (App Router), Tailwind v4, motion
packages/ui       Design-Tokens (SUM-Blau #245EED, Inter), <LicensePlate />
packages/domain   Typen, Kennzeichen-Logik, Schadensquote, Chat-Regeln, Testdaten
```
