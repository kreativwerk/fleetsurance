# Fleetsurance

Plattform für Flottenversicherungs-Management von Kreativwerk: Dashboards für Flottenbetreiber (z. B. Amazon DSPs)
und Versicherungsmakler. Produkt, Plan und Entscheidungen: [PRODUCT.md](PRODUCT.md) · [PLAN.md](PLAN.md) ·
[docs/DECISIONS.md](docs/DECISIONS.md).

## Stand: M0 (Oberfläche mit Testdaten)

- Übersicht: Schadensquote, Monatsbalken, Kennzahlen, Dauer-eVB (Kopieren und Teilen), Makler, letzte Schäden
- Flotte: Suche und Statusfilter, Kennzeichen wie in CoDriver
- Schäden und Schadenakte mit Chat: Details, Statusverlauf, Fotos und Dokumente, Verlauf mit Anhängen und Lesebestätigung
- Desktop mit schwarzer Icon-Leiste, mobil mit iOS-Navigation und Tab-Leiste (Apple HIG)

Es gibt **noch kein Backend**. Alle Daten sind synthetisch (`packages/domain/src/testdaten.ts`).
Neue Chat-Nachrichten leben nur im Zustand der Seite.

## Entwickeln

```bash
pnpm install
pnpm --filter @fleetsurance/web dev     # http://localhost:3000
pnpm test                               # Fachlogik (vitest)
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
