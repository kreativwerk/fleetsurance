import { BarChart3, Car, FileText, LayoutGrid, Settings, ShieldAlert, Ellipsis } from "lucide-react";

export const hauptnavigation = [
  { href: "/uebersicht", label: "Übersicht", icon: LayoutGrid },
  { href: "/flotte", label: "Flotte", icon: Car },
  { href: "/schaeden", label: "Schäden", icon: ShieldAlert },
  { href: "/dokumente", label: "Dokumente", icon: FileText },
  { href: "/auswertung", label: "Auswertung", icon: BarChart3 },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
] as const;

/** Tab-Leiste mobil: nur Navigation, keine Aktionen (HIG, H1). */
export const tabs = [
  { href: "/uebersicht", label: "Übersicht", icon: LayoutGrid },
  { href: "/flotte", label: "Flotte", icon: Car },
  { href: "/schaeden", label: "Schäden", icon: ShieldAlert },
  { href: "/mehr", label: "Mehr", icon: Ellipsis },
] as const;

export function istAktiv(pfad: string, href: string): boolean {
  return pfad === href || pfad.startsWith(`${href}/`);
}
