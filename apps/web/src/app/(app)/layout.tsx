import { Seitenleiste, TabLeiste } from "@/components/shell";
import { Providers } from "@/components/providers";
import { DemoHinweis } from "@/components/demo-hinweis";
import { ladeKontext } from "@/lib/daten";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const kontext = await ladeKontext();
  return (
    <Providers>
      <a
        href="#inhalt"
        className="sr-only z-50 rounded-md bg-surface px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Zum Inhalt springen
      </a>
      <Seitenleiste nutzer={kontext.nutzer} />
      <main id="inhalt" className="pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0 md:pl-[92px]">
        <div className="mx-auto w-full max-w-[1480px] px-4 pt-3 pb-8 sm:px-6 md:px-8 md:pt-7">
          {kontext.modus === "demo" && <DemoHinweis />}
          {children}
        </div>
      </main>
      <TabLeiste />
    </Providers>
  );
}
