# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Phase 2: separate native driver app in Flutter for iOS/Android; it shares the API, not the UI code.)

## Stack

Decided with the user (2026-10-04):

- Web: Next.js (App Router, TypeScript); mobile-first responsive web app for V1.
- Backend: Supabase in EU region Frankfurt (Postgres + Row Level Security, Auth, Storage, Edge Functions).
- Frontend hosting: Vercel, region Frankfurt (fra1), with DPA.
- Native app (Phase 2): Flutter.
- Monorepo (Turborepo) with shared packages for types, validation, API client and design tokens.

## Users

- **Versicherungsmakler** (Makler-Admin, Makler-Mitarbeiter): manage many fleet customers; upload insurer data
  (claims lists, premiums, contracts, eVB numbers, expert reports); review and forward damage reports to insurers.
  Work mostly at the desktop, data-heavy.
- **Flottenbetreiber**, initially Amazon DSPs (Unternehmens-Admin / Fuhrparkleiter): see fleet, insurance status and
  claims ratio; report damages; copy and share eVB numbers; store documents. Often on the phone between operations.
- **Fahrer**: not a role in V1 (Phase 2 via Flutter app).
- **Kreativwerk** (developer and operator) has **no access to customer data**.

## Product Purpose

Fleetsurance is a multi-broker SaaS by Kreativwerk for managing fleet insurance. It gives brokers and fleet operators
one shared, always-current picture of vehicles, insurance status, damages and claims ratio, without entering data twice.
Success means: brokers no longer collect fleet data by hand, and DSPs see their insurance situation at any time.

## Positioning

- Direct vehicle and driver sync from CoDriver (Kreativwerk's own DSP app) and upload of Amazon Cortex exports.
  Fleet data comes in with no double entry.
- Built for DSP fleets (Amazon delivery partners) and the brokers who insure them.
- Privacy as a product feature: EU hosting, data minimisation, and an operator that cannot read customer data.

## Operating Context

- **Onboarding:** the broker invites the company; the fleet manager activates the account and connects one data source.
- **Data sources:** each fleet has exactly **one** leading source:
  - CoDriver push sync: the DSP grants consent in CoDriver, then signed webhooks deliver changes, plus a nightly reconciliation.
  - Cortex upload: CSV/XLSX import of vehicles and drivers, with a diff preview before applying. Vehicles are matched by VIN.
- **Insurance data:** brokers upload insurer Excel/CSV through a column-mapping wizard; mappings are saved per insurer.
  The data model follows BiPRO field semantics so BiPRO can be connected later.
- **Damage flow:** the fleet manager reports the damage. The broker reviews it and forwards it to the insurer as PDF or email,
  then enters the claim number back into Fleetsurance. The DSP sees the status throughout.
- **eVB:** the broker maintains eVB numbers. The DSP can copy and share them, and request new ones.
- **Defleeting:** the broker uploads the expert's report.
- **Notifications:** in-app, plus email without content details ("Neuer Schaden bei Kunde X – bitte einloggen"),
  sent through an EU mail provider.

## Capabilities and Constraints

V1 milestones:

1. **M1:** Flotte, Versicherungsstatus, Schadensquote dashboard, Makler-Upload with mapping wizard.
2. **M2:** Cortex upload.
3. **M3:** Damage report, eVB, document storage (Vollmacht, SEPA-Mandat, Registerauszüge).
4. **M4:** Defleeting, reports (PDF/Excel).
5. **M5:** CoDriver sync. It runs in parallel with CoDriver's EU migration. Incident photos are synced only after the
   CoDriver storage rules are fixed.

Constraints:

- Multi-tenant hierarchy: Plattform → Makler → Unternehmen → Flotte → Fahrzeug/Fahrer. Isolation is enforced by RLS.
- Co-branding per broker: Fleetsurance brand plus the broker's logo and accent colour.
- Login: Google or email. 2FA is optional, and users get an email alert on a new device.
- Kreativwerk has no data access. Sensitive fields are encrypted per tenant. Support access requires a time-limited
  grant by the customer and is fully audited.
- Driver data is minimal: name, internal ID, licence class and expiry, date of last licence check, and the damage
  assignment. No scorecards, performance KPIs, IBAN, address, tax ID or date of birth.
- Retention periods have sensible defaults and are configurable per broker; deletion is automatic and logged.
  Raw upload files are deleted right after import.
- Languages: German and English in V1.
- Billing: manual invoicing in V1; the app only counts vehicles per broker.
- Open (decide later): BiPRO connection, Stripe billing, custom domains per broker.

## Brand Commitments

- Name: **Fleetsurance**.
- Binding visual constraint from the user: white base, blue as the accent colour (oriented on sum-makler.de).
  Modern, clear, with stylish purposeful motion.

## Evidence on Hand

- sum-makler.de/amazon-dsp describes the broker offer (fleet tariffs, Cortex/CoDriver import, Fleetsurance app with
  claims ratio, eVB, documents, defleeting).
- CoDriver code (`kreativwerk/arion_logistics`, read-only) provides the vehicle, driver and incident data model.
  See `docs/codriver-analysis.md`.
- No real customer data, testimonials, figures or logos are on hand yet. Do not fabricate them.

## Product Principles

1. **Enter once, see everywhere:** data flows from sources (CoDriver, Cortex, broker uploads), never typed twice.
2. **Privacy by default:** the minimum data, EU only, no operator access, everything audited.
3. **The broker stays in the loop:** Fleetsurance supports the broker relationship and does not bypass it.
4. **Clarity over density:** a fleet manager understands the insurance status in seconds, even on a phone.

## Accessibility & Inclusion

WCAG 2.2 AA, full keyboard operation, and `prefers-reduced-motion` respected. UI in German and English.
