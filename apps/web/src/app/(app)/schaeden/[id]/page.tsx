import { notFound } from "next/navigation";
import { testdaten } from "@fleetsurance/domain";
import { aktuelleSeite, fahrzeugZu, schadenNachId } from "@/lib/daten";
import { SchadenAkte } from "./akte";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Schaden ${id}` };
}

export default async function SchadenSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const schaden = schadenNachId(id);
  if (!schaden) notFound();

  // Interne Makler-Notizen verlassen den Server nicht, wenn ein DSP schaut (in M3 per RLS).
  const nachrichten = testdaten.nachrichten.filter(
    (n) => n.schadenId === id && (n.sichtbarkeit === "alle" || aktuelleSeite === "makler"),
  );
  const { vorname, nachname } = testdaten.nutzer;

  return (
    <SchadenAkte
      schaden={schaden}
      fahrzeug={fahrzeugZu(schaden)}
      nachrichten={nachrichten}
      lesestatus={testdaten.lesestatus}
      seite={aktuelleSeite}
      autor={`${vorname} ${nachname}`}
    />
  );
}
