import Link from "next/link";
import { BarChart3, Database, FileText, Settings, UserRound } from "lucide-react";
import { Seitenkopf } from "@/components/ui";
import { DauerEvbKarte, MaklerKarte, ZeilenPfeil } from "@/components/karten";
import { nutzerKurz, testdaten } from "@/lib/daten";

export const metadata = { title: "Mehr" };

const eintraege = [
  { href: "/dokumente", label: "Dokumente", icon: FileText },
  { href: "/auswertung", label: "Auswertung", icon: BarChart3 },
  { href: "/einstellungen#datenquellen", label: "Datenquellen", icon: Database },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
] as const;

export default function Mehr() {
  return (
    <>
      <Seitenkopf titel="Mehr" />
      <div className="space-y-4">
        <DauerEvbKarte evbs={testdaten.dauerEvb} />
        <nav aria-label="Weitere Bereiche" className="overflow-hidden rounded-card border border-hairline bg-surface">
          <ul>
            {eintraege.map(({ href, label, icon: Icon }) => (
              <li key={label} className="border-b border-hairline last:border-0">
                <Link href={href} className="flex h-14 items-center gap-3 px-4 text-[17px] hover:bg-fill-subtle">
                  <span className="grid size-8 place-items-center rounded-[8px] bg-blue-tint text-blue">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="flex-1">{label}</span>
                  <ZeilenPfeil />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <MaklerKarte makler={testdaten.makler} />
        <p className="flex items-center justify-center gap-2 pt-2 text-[13px] text-muted">
          <UserRound className="size-4" aria-hidden />
          Angemeldet als {nutzerKurz().name} · {nutzerKurz().rolle}
        </p>
      </div>
    </>
  );
}
