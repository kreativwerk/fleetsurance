import { LogOut } from "lucide-react";

/** Abmelden als echtes Formular (POST), funktioniert auch ohne JavaScript. */
export function AbmeldenKnopf() {
  return (
    <form action="/auth/abmelden" method="post">
      <button
        type="submit"
        className="pressable inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-fill-subtle text-[16px] font-semibold text-error hover:bg-fill"
      >
        <LogOut className="size-[18px]" aria-hidden />
        Abmelden
      </button>
    </form>
  );
}
