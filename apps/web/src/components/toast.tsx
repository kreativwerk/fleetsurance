"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";

type ToastApi = { zeige: (text: string) => void };
const ToastKontext = createContext<ToastApi>({ zeige: () => {} });

export function useToast() {
  return useContext(ToastKontext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduziert = useReducedMotion();

  const zeige = useCallback((neu: string) => {
    setText(neu);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setText(null), 2200);
    navigator.vibrate?.(8);
  }, []);

  return (
    <ToastKontext.Provider value={{ zeige }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-50 flex justify-center md:bottom-8">
        <AnimatePresence>
          {text && (
            <motion.div
              key={text}
              initial={reduziert ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduziert ? 0 : 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[14px] font-medium text-white"
            >
              <Check className="size-4 text-blue-soft" strokeWidth={2.5} aria-hidden />
              {text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastKontext.Provider>
  );
}
