# FLEETSURANCE: Umsetzungsplan V1

Grundlagen: [PRODUCT.md](PRODUCT.md) (was und für wen), [docs/DECISIONS.md](docs/DECISIONS.md) (warum),
[docs/codriver-analysis.md](docs/codriver-analysis.md) (Daten aus CoDriver), [CLAUDE.md](CLAUDE.md) (Arbeitsregeln).

## Architektur

```
apps/
  web/            Next.js (App Router, TS): Dashboard für Makler und Unternehmen, Deutsch/Englisch
  mobile/         Flutter (Phase 2): Fahrer-App
packages/
  db/             Supabase-Migrationen, RLS-Policies, generierte Typen
  domain/         Zod-Schemas, Fachlogik (Schadensquote, FIN-Abgleich, BiPRO-nahe Typen)
  importers/      Cortex-Parser, Spalten-Zuordnung für Makler-Uploads
  ui/             Design-Tokens, Komponenten (shadcn/ui-Basis), Motion-Presets
supabase/
  functions/      Edge Functions: codriver-webhook, import-commit, notify, retention-job
```

- **Mandantentrennung:** Jede fachliche Tabelle hat die Spalte `makler_id` und, wo nötig, `unternehmen_id`.
  RLS-Policies leiten die Rechte aus der Tabelle `memberships(user_id, makler_id, unternehmen_id, rolle)` ab.
  Für jede Policy gibt es automatisierte Tests.
- **Kein Zugriff für Kreativwerk:** Es gibt keine Service-Role im Frontend und keine Plattform-Rolle mit Lesezugriff
  auf Fachdaten. Für Support gibt es die Tabelle `support_grants` (Freigabe durch den Kunden, mit Ablaufdatum).
  Jeder Zugriff wird in `audit_log` protokolliert.
- **Verschlüsselung:** Sensible Felder (z. B. Führerscheindaten, Vertragsnummern) werden auf Anwendungsebene
  verschlüsselt (Envelope Encryption). Jeder Mandant hat einen eigenen Schlüssel (DEK), der wiederum durch einen
  Hauptschlüssel (KEK) in einem KMS in der EU geschützt ist.
- **Storage:** Nur private Buckets. Zugriff über signierte URLs mit kurzer Laufzeit, Pfade getrennt nach Mandant.
  Rohdateien aus Uploads werden nach dem Import gelöscht.

## Kern-Datenmodell (Entwurf)

`makler` · `unternehmen` · `memberships` · `invitations` · `flotten` (mit `datenquelle`: codriver | cortex) ·
`fahrzeuge` (FIN eindeutig pro Flotte) · `fahrer` (nur Mindestfelder) · `versicherer` · `vertraege` ·
`praemien` · `schaeden` (Status: gemeldet → geprüft → beim Versicherer → reguliert/abgelehnt) ·
`evb_nummern` · `evb_anfragen` · `dokumente` · `defleetings` · `import_jobs` (mit Diff-Vorschau) ·
`import_mappings` (pro Versicherer) · `codriver_connections` · `support_grants` · `audit_log` ·
`retention_policies`

**Schadensquote** = Schadenaufwand (Zahlungen + Reserven) ÷ verdiente Prämie, pro Zeitraum und Ebene
(Flotte, Unternehmen, Makler). Die offizielle Quote kommt aus dem Makler-Upload. Aus App-Meldungen wird nur eine
„vorläufige“ Quote berechnet und als solche gekennzeichnet.

## Meilensteine

| M | Inhalt | Fertig, wenn |
|---|---|---|
| **M0** | Monorepo, CI (Lint, Typecheck, Tests, RLS-Tests), Supabase-Projekt in Frankfurt, Vercel fra1, Auth (Google/E-Mail), Einladungs-Ablauf, i18n, Design-System (`DESIGN.md` und Tokens) | Ein Makler kann ein Unternehmen einladen und sich in beiden Sprachen anmelden. |
| **M1** | Flottenübersicht, Versicherungsstatus, Dashboard für die Schadensquote, Makler-Upload mit Zuordnungs-Assistent | Ein Makler lädt eine Schadenliste hoch, und das Unternehmen sieht seine Quote. |
| **M2** | Cortex-Upload (Fahrzeuge und Fahrer) mit Diff-Vorschau und FIN-Abgleich | Ein DSP spielt seine Flotte ohne Handeingabe ein. |
| **M3** | Schadenmeldung und Makler-Ablauf, eVB (Pflege, Kopieren, Anfrage), Dokumentenablage, E-Mail-Benachrichtigungen | Ein Schaden durchläuft den ganzen Status-Ablauf. |
| **M4** | Defleeting (Gutachten-Upload), Berichte als PDF und Excel, Löschfristen-Job | Der Makler exportiert einen Kundenbericht. |
| **M5** | CoDriver-Verbindung: Freigabe, signierte Webhooks, nächtlicher Abgleich. Fotos erst nach dem Speicher-Fix in CoDriver. | Ein DSP verbindet CoDriver, und die Fahrzeuge erscheinen automatisch. |

## Qualitätsregeln pro Meilenstein

- Vor dem Bauen: Plan-Review aus CEO-, Engineering- und Design-Sicht (gstack-Methode), dann `/impeccable shape`
  für jede neue Oberfläche.
- Vor jedem Push: `/review`. Bei Themen rund um Auth, RLS, Uploads und Verschlüsselung zusätzlich `/security-review` bzw. `/cso`.
- UI: Vor jeder Änderung `impeccable` und `craft-floor.md` laden. Motion nur mit einem
  `prefers-reduced-motion`-Pfad. Am Ende `/impeccable audit` und `polish`.
- Testdaten sind ausschließlich synthetisch.

## Abhängigkeiten außerhalb des Codes

Siehe Abschnitt „Offen“ in [docs/DECISIONS.md](docs/DECISIONS.md).
