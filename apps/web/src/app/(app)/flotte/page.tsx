import { Seitenkopf } from "@/components/ui";
import { ladeFahrzeuge, ladeKontext } from "@/lib/daten";
import { FlotteListe } from "./flotte-liste";

export const metadata = { title: "Flotte" };

export default async function Flotte() {
  const [fahrzeuge, kontext] = await Promise.all([ladeFahrzeuge(), ladeKontext()]);
  const quelle = kontext.modus === "demo" ? "Testdaten" : "Fleetsurance";
  return (
    <>
      <Seitenkopf titel="Flotte" untertitel={`${fahrzeuge.length} Fahrzeuge · Quelle: ${quelle}`} />
      <FlotteListe fahrzeuge={fahrzeuge} />
    </>
  );
}
