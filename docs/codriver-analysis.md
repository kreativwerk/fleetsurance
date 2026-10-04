# CoDriver: Datenmodell für den Sync

Quelle: `kreativwerk/arion_logistics` (nur gelesen), Stand 2026-10-04.
Diese Datei beschreibt nur Feldnamen. Sie enthält keine personenbezogenen Daten.
Die Sicherheitsbefunde zu CoDriver sind bewusst nicht hier dokumentiert.

## Plattform

- Flutter-App `flutter_app/kpi_admin`: Admin- und Fahreransicht in einer App. Läuft im Web, auf Android und iOS.
- Firebase: Firestore, Auth, Storage, Functions v2, Hosting.
- Region heute: Firestore `nam5` (USA), Functions `us-central1`. Der Parser-Dienst läuft auf Cloud Run in `europe-west3`.
  Der Code verweist auf ein Projekt `codriver-eu` (Migration geplant).

## Mandant

Ein Mandant ist ein DSP-Inhaber, die Firebase-Auth-UID dient als Mandanten-ID. Alle Daten liegen unter `users/{dspUid}/…`.

## Für Fleetsurance relevante Collections

### Fahrzeuge: `users/{dspUid}/vehicles/{PLATE}`

| Feld | Übernahme |
|---|---|
| `plateNumber`, `vinNumber`, `brand`, `model`, `manufacturingYear`, `fuelType` | ✅ |
| `category` (ARMADA, AMAZON_PAID_RENTAL, SELF_SOURCED_RENTAL, SELF_OWNED_RENTAL) | ✅ |
| `status` (ACTIVE, GROUNDED, IN_SERVICE, DEFLEETED), `serviceEndDate` | ✅ |
| `metadata` (Vertrags- und Mietfelder) | prüfen |
| `notes` | ❌ (Freitext) |
| Untercollection `events`, Typ ACCIDENT: `location`, `damageLevel`, `policeReportNumber`, `insuranceClaimNumber` | ✅ |
| Untercollection `documents`: `documentType`, `documentNumber`, `expiryDate` | prüfen |

### Fahrer: `users/{dspUid}/drivers/{transporterId}`

| Feld | Übernahme |
|---|---|
| `transporterId`, `driverName`, `active` | ✅ |
| `onboarding.licence*` (Klasse und Ablaufdatum) | ✅ (nur diese Felder) |
| `onboarding` sonst (Geburtsdatum, Adresse, IBAN, Steuer-ID, Ausweis, Notfallkontakt) | ❌ **nie** |
| `scores`, `reports`, `academy_*`, `shifts`, `absence_requests` | ❌ **nie** |

### Vorfälle: `users/{dspUid}/incident_reports/{id}`

| Feld | Übernahme |
|---|---|
| `reportId`, `accidentAt`, `submittedAt`, `status` | ✅ |
| `driverTransporterId` (Verweis auf den Fahrer) | ✅ |
| `location` (Freitext oder „lat,lng“) | ✅ |
| `faultOpinion`, `policeInvolved`, `damageType`, `description` | ✅ |
| `platePhotoUrl`, `damagePhotoUrls[]` | ⏸ erst übernehmen, wenn der CoDriver-Speicher abgesichert ist |
| `company{}`, `insurance{}` (Momentaufnahmen) | ❌ (Fleetsurance verwaltet das selbst) |

## Lücken, die CoDriver für den Sync schließen muss

1. **Vorfall ohne Fahrzeugbezug:** Ein Bericht enthält nur ein Kennzeichen-Foto. Nötig ist ein Feld `vehiclePlate` oder `vehicleId`.
2. **Keine Felder für den Unfallgegner:** Es fehlen Name, Kennzeichen und Versicherung des Gegners.
3. **GPS nur als Freitext:** Nötig ist ein strukturiertes Feld `geo: {lat, lng}`.
4. **Keine Sync-Schnittstelle:** Es fehlen der Freigabe-Ablauf, signierte Webhooks und ein Endpunkt für den Abgleich (alles neu zu bauen).
5. **Region:** Die Migration nach `codriver-eu` muss abgeschlossen werden.
