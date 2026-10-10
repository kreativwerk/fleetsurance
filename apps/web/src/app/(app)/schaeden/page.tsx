import { Seitenkopf } from "@/components/ui";
import { SchadenListe } from "@/components/schaden-liste";
import { istOffen, ladeSchaeden } from "@/lib/daten";

export const metadata = { title: "Schäden" };

export default async function Schaeden() {
  const alle = await ladeSchaeden();
  return (
    <>
      <Seitenkopf titel="Schäden" untertitel={`${alle.filter(istOffen).length} offen · ${alle.length} gesamt`} />
      <section className="md:rounded-card md:border md:border-hairline md:bg-surface md:p-6">
        {alle.length === 0 ? (
          <p className="py-8 text-center text-[16px] text-muted">Noch keine Schäden gemeldet.</p>
        ) : (
          <SchadenListe schaeden={alle} />
        )}
      </section>
    </>
  );
}
