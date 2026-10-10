"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MailCheck } from "lucide-react";
import { sendeLoginLink, type LoginZustand } from "./actions";

const start: LoginZustand = { status: "leer" };

export function LoginFormular() {
  const [zustand, absenden, laeuft] = useActionState(sendeLoginLink, start);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {zustand.status === "gesendet" ? (
        <motion.div
          key="gesendet"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex gap-3 rounded-[14px] bg-blue-tint p-4"
          role="status"
        >
          <MailCheck className="mt-0.5 size-6 shrink-0 text-blue" aria-hidden />
          <div>
            <p className="text-[16px] font-semibold">Prüfe dein Postfach</p>
            <p className="mt-1 text-[15px] text-ink-2">
              Wenn die Adresse bei uns hinterlegt ist, kommt gleich eine E-Mail mit dem Login-Link. Er gilt eine Stunde.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.form key="formular" action={absenden} className="mt-6" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          <label htmlFor="email" className="text-[14px] font-semibold text-ink-2">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-invalid={zustand.status === "fehler" || undefined}
            aria-describedby={zustand.status === "fehler" ? "email-fehler" : undefined}
            className="mt-1.5 h-12 w-full rounded-[12px] border border-separator bg-surface px-4 text-[17px] placeholder:text-muted focus:border-blue focus:outline-none aria-invalid:border-error"
            placeholder="name@firma.de"
          />
          {zustand.status === "fehler" && (
            <p id="email-fehler" role="alert" className="mt-2 text-[14px] text-error">
              {zustand.meldung}
            </p>
          )}
          <button
            type="submit"
            disabled={laeuft}
            className="pressable mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-blue text-[17px] font-semibold text-on-blue hover:bg-blue-press disabled:bg-fill disabled:text-muted"
          >
            {laeuft ? "Wird gesendet …" : "Login-Link senden"}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
