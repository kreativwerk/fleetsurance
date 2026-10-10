import { notFound } from "next/navigation";
import { ladeAkte, ladeKontext } from "@/lib/daten";
import { SchadenAkte } from "./akte";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Schaden ${id}` };
}

export default async function SchadenSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [akte, kontext] = await Promise.all([ladeAkte(decodeURIComponent(id)), ladeKontext()]);
  if (!akte) notFound();

  return (
    <SchadenAkte
      schaden={akte.schaden}
      fahrzeug={akte.schaden.fahrzeug}
      nachrichten={akte.nachrichten}
      lesestatus={akte.lesestatus}
      seite={kontext.nutzer.seite}
      autor={kontext.nutzer.name}
      live={kontext.modus === "live"}
    />
  );
}
