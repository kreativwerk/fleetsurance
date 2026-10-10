import Link from "next/link";
import { Logo } from "@/components/shell";
import { supabaseAktiv } from "@/lib/supabase/konfig";
import { Providers } from "@/components/providers";
import { LoginFormular } from "./formular";

export const metadata = { title: "Anmelden" };

export default async function Login({ searchParams }: { searchParams: Promise<{ fehler?: string }> }) {
  const { fehler } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-page px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex items-center gap-3">
          <Logo />
          <span className="tracking-title text-[21px] font-semibold">Fleetsurance</span>
        </div>
        <section className="rounded-card border border-hairline bg-surface p-6 md:p-8">
          <h1 className="tracking-display text-[28px] leading-tight font-bold">Anmelden</h1>
          {supabaseAktiv ? (
            <>
              <p className="mt-2 text-[16px] text-ink-2">
                Wir schicken dir einen Link per E-Mail. Ein Passwort brauchst du nicht.
              </p>
              {fehler === "link" && (
                <p role="alert" className="mt-4 rounded-[12px] bg-error-tint px-4 py-3 text-[15px] text-error">
                  Der Link ist abgelaufen oder wurde schon benutzt. Fordere einfach einen neuen an.
                </p>
              )}
              <Providers>
                <LoginFormular />
              </Providers>
            </>
          ) : (
            <>
              <p className="mt-2 text-[16px] text-ink-2">
                Es ist noch kein Supabase-Projekt verbunden. Die App läuft im Demo-Modus mit erfundenen Daten.
              </p>
              <Link
                href="/uebersicht"
                className="pressable mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-blue text-[16px] font-semibold text-on-blue hover:bg-blue-press"
              >
                Demo öffnen
              </Link>
            </>
          )}
        </section>
        <p className="mt-6 text-center text-[13px] text-muted">
          Zugang erhältst du über eine Einladung deines Maklers.
        </p>
      </div>
    </main>
  );
}
