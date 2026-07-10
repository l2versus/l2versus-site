"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/dict";
import { setLocaleAction } from "../actions";

export default function LanguageSwitcher({ current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const active = LOCALES.find((l) => l.code === current) ?? LOCALES[0];

  function pick(code: Locale) {
    setOpen(false);
    if (code === current) return;
    start(async () => {
      await setLocaleAction(code);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="flex items-center gap-2 rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.5)] px-3 py-2 text-xs uppercase tracking-widest text-[var(--color-muted)] transition-colors hover:border-[rgba(201,162,75,0.4)] hover:text-[var(--color-gold-bright)]"
      >
        <span className="text-sm leading-none">{active.flag}</span>
        {active.code}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => pick(l.code)}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[rgba(201,162,75,0.08)] ${
                  l.code === current
                    ? "text-[var(--color-gold-bright)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
