import { Seitenkopf } from "@/components/ui";
import { SchadenListe } from "@/components/schaden-liste";
import { offeneSchaeden, schaedenNeuesteZuerst } from "@/lib/daten";

export const metadata = { title: "Schäden" };

export default function Schaeden() {
  const alle = schaedenNeuesteZuerst();
  return (
    <>
      <Seitenkopf titel="Schäden" untertitel={`${offeneSchaeden().length} offen · ${alle.length} gesamt`} />
      <section className="md:rounded-card md:border md:border-hairline md:bg-surface md:p-6">
        <SchadenListe schaeden={alle} />
      </section>
    </>
  );
}
