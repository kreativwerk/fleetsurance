"use client";

import { MotionConfig } from "motion/react";
import { ToastProvider } from "./toast";

/** Motion respektiert die Systemeinstellung „Bewegung reduzieren“ (auch für layoutId-Federn). */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>{children}</ToastProvider>
    </MotionConfig>
  );
}
