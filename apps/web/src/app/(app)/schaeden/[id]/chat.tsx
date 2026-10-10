"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUp, FileText, Paperclip, X } from "lucide-react";
import {
  formatDatumKurz,
  formatGroesse,
  formatZeit,
  sichtbareNachrichten,
  vonGegenseiteGelesen,
  type Dokument,
  type Lesestatus,
  type Nachricht,
  type Seite,
} from "@fleetsurance/domain";
import { useToast } from "@/components/toast";
import { markiereGelesen, sendeNachricht } from "./actions";

const gegenseiteName: Record<Seite, string> = { dsp: "DSP", makler: "Makler" };

/**
 * Chat pro Schadensfall (D26). Live: Nachrichten werden in Supabase gespeichert (RLS, Trigger setzen Seite/Autor).
 * Demo: Nachrichten leben nur im Zustand der Seite. Anhänge im privaten Storage und Realtime folgen in M3.
 */
export function SchadenChat({
  schadenId,
  start,
  lesestatus,
  seite,
  autor,
  live,
}: {
  schadenId: string;
  start: Nachricht[];
  lesestatus: Lesestatus[];
  seite: Seite;
  autor: string;
  live: boolean;
}) {
  const { zeige } = useToast();
  const [, starte] = useTransition();
  const [nachrichten, setNachrichten] = useState(start);
  const [text, setText] = useState("");
  const [anhang, setAnhang] = useState<Dokument | null>(null);
  const ende = useRef<HTMLLIElement>(null);
  const datei = useRef<HTMLInputElement>(null);
  const reduziert = useReducedMotion();

  const sichtbar = sichtbareNachrichten(
    nachrichten.filter((n) => n.schadenId === schadenId),
    seite,
  );
  const gelesenId = vonGegenseiteGelesen(nachrichten, lesestatus, seite, schadenId);

  useEffect(() => {
    void markiereGelesen(schadenId);
  }, [schadenId]);

  useEffect(() => {
    ende.current?.scrollIntoView({ behavior: reduziert ? "auto" : "smooth", block: "end" });
  }, [sichtbar.length, reduziert]);

  function senden() {
    const inhalt = text.trim();
    if (!inhalt && !anhang) return;
    const lokaleId = `lokal-${crypto.randomUUID()}`;
    setNachrichten((alt) => [
      ...alt,
      {
        id: lokaleId,
        schadenId,
        typ: "nachricht",
        seite,
        autor,
        text: inhalt,
        am: new Date().toISOString(),
        sichtbarkeit: "alle",
        anhang: anhang ?? undefined,
      },
    ]);
    setText("");
    setAnhang(null);
    if (!inhalt) return;

    starte(async () => {
      const ergebnis = await sendeNachricht(schadenId, inhalt);
      if (ergebnis.ok) {
        setNachrichten((alt) => alt.map((n) => (n.id === lokaleId ? { ...n, id: ergebnis.id, am: ergebnis.am } : n)));
      } else {
        setNachrichten((alt) => alt.filter((n) => n.id !== lokaleId));
        setText(inhalt);
        zeige(ergebnis.fehler);
      }
    });
  }

  return (
    <section aria-label="Verlauf" className="flex h-full min-h-0 flex-col">
      <h2 className="tracking-title hidden px-6 pt-5 pb-2 text-[19px] font-semibold md:block">Verlauf</h2>
      <ol className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-6" aria-live="polite">
        {sichtbar.map((n, i) => {
          const vorher = sichtbar[i - 1];
          const neuerTag = !vorher || formatDatumKurz(vorher.am) !== formatDatumKurz(n.am);
          return (
            <li key={n.id}>
              {neuerTag && (
                <p className="tabular mb-3 text-center text-[12.5px] font-semibold text-muted">{formatDatumKurz(n.am)}</p>
              )}
              {n.typ === "status_ereignis" ? (
                <p className="text-center text-[13px] text-muted">
                  {n.text} · {formatZeit(n.am)}
                </p>
              ) : (
                <Blase n={n} eigen={n.seite === seite} gelesen={n.id === gelesenId} gegenseite={gegenseiteName[seite === "dsp" ? "makler" : "dsp"]} />
              )}
            </li>
          );
        })}
        <li ref={ende} aria-hidden className="h-px" />
      </ol>

      <form
        className="material-bar border-t border-separator px-3 py-2.5 md:rounded-b-card md:px-4"
        onSubmit={(e) => {
          e.preventDefault();
          senden();
        }}
      >
        <AnimatePresence>
          {anhang && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex items-center gap-2 overflow-hidden rounded-[12px] bg-fill-subtle px-3 py-2 text-[14px]"
            >
              <FileText className="size-4 shrink-0 text-blue" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{anhang.name}</span>
              <button
                type="button"
                onClick={() => setAnhang(null)}
                className="-my-1.5 -mr-1.5 grid size-11 place-items-center rounded-full text-muted hover:bg-fill"
                aria-label="Anhang entfernen"
              >
                <X className="size-4" aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end gap-2">
          <input
            ref={datei}
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setAnhang({ name: f.name, groesseKb: Math.max(1, Math.round(f.size / 1024)) });
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => (live ? zeige("Anhänge folgen mit dem sicheren Dateispeicher (M3).") : datei.current?.click())}
            className="pressable grid size-11 shrink-0 place-items-center rounded-full bg-fill-subtle text-ink-2 hover:bg-fill"
            aria-label="Foto oder Dokument anhängen"
            aria-disabled={live || undefined}
          >
            <Paperclip className="size-5" aria-hidden />
          </button>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Nachricht</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  senden();
                }
              }}
              rows={1}
              placeholder="Nachricht"
              className="block max-h-36 min-h-11 w-full resize-none rounded-[22px] border border-hairline bg-surface px-4 py-[10px] text-[16px] leading-[22px] placeholder:text-muted focus:border-blue focus:outline-none md:text-[15px]"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
          </label>
          <button
            type="submit"
            disabled={!text.trim() && !anhang}
            className="pressable grid size-11 shrink-0 place-items-center rounded-full bg-blue text-on-blue hover:bg-blue-press disabled:bg-fill disabled:text-muted"
            aria-label="Senden"
          >
            <ArrowUp className="size-5" strokeWidth={2.4} aria-hidden />
          </button>
        </div>
      </form>
    </section>
  );
}

function Blase({ n, eigen, gelesen, gegenseite }: { n: Nachricht; eigen: boolean; gelesen: boolean; gegenseite: string }) {
  const reduziert = useReducedMotion();
  const intern = n.sichtbarkeit === "makler_intern";
  return (
    <motion.div
      initial={n.id.startsWith("lokal") && !reduziert ? { opacity: 0, y: 8, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${eigen ? "items-end" : "items-start"}`}
    >
      {!eigen && (
        <p className="mb-1 ml-1 text-[12.5px] text-muted">
          <span className="font-semibold text-ink-2">{n.autor}</span> · {formatZeit(n.am)}
          {intern && <span className="ml-1.5 font-semibold text-warn">Intern · nur Makler</span>}
        </p>
      )}
      <div
        className={`max-w-[82%] rounded-[20px] px-4 py-2.5 text-[16px] leading-[22px] md:max-w-[85%] md:text-[15px] ${
          eigen
            ? "rounded-br-[6px] bg-blue text-on-blue"
            : intern
              ? "rounded-bl-[6px] bg-warn-tint text-ink"
              : "rounded-bl-[6px] bg-fill text-ink"
        }`}
      >
        {n.text && <p className="whitespace-pre-wrap">{n.text}</p>}
        {n.anhang && (
          <span
            className="mt-2 flex items-center gap-2 rounded-[12px] bg-surface px-3 py-2 text-[14px] font-semibold text-ink"
          >
            <FileText className="size-4 shrink-0 text-error" aria-hidden />
            <span className="truncate">{n.anhang.name}</span>
            <span className="shrink-0 text-muted">· {formatGroesse(n.anhang.groesseKb)}</span>
          </span>
        )}
      </div>
      {eigen && (
        <p className="tabular mt-1 mr-1 text-[12.5px] text-muted">
          {formatZeit(n.am)}
          {gelesen && ` · Gelesen vom ${gegenseite}`}
        </p>
      )}
    </motion.div>
  );
}
