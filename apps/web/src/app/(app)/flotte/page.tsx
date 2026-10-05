import { testdaten } from "@fleetsurance/domain";
import { Seitenkopf } from "@/components/ui";
import { FlotteListe } from "./flotte-liste";

export const metadata = { title: "Flotte" };

export default function Flotte() {
  const fahrzeuge = testdaten.fahrzeuge;
  return (
    <>
      <Seitenkopf titel="Flotte" untertitel={`${fahrzeuge.length} Fahrzeuge · Quelle: Testdaten`} />
      <FlotteListe fahrzeuge={fahrzeuge} />
    </>
  );
}
