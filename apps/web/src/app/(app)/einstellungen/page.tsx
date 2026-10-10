import { Folgt } from "@/components/folgt";
import { AbmeldenKnopf } from "@/components/abmelden";
import { ladeKontext } from "@/lib/daten";

export const metadata = { title: "Einstellungen" };

export default async function Seite() {
  const kontext = await ladeKontext();
  return (
    <>
      <Folgt
        titel="Einstellungen"
        meilenstein="Kommt in M1"
        text="Profil, Benachrichtigungen, optionale Zwei-Faktor-Anmeldung und verbundene Datenquellen (CoDriver oder Cortex)."
      />
      {kontext.modus === "live" && (
        <div className="mt-4 max-w-[640px]">
          <AbmeldenKnopf />
        </div>
      )}
    </>
  );
}
