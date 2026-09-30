"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/dict";
import { setLocaleAction } from "@/lib/i18n/actions";

/**
 * Seletor de idioma global (todas as páginas).
 * O menu é renderizado num PORTAL direto no <body> com position:fixed —
 * headers com backdrop-blur criam stacking context próprio e prendiam o
 * dropdown atrás de modais (bug do "Resgatar Cupom"). No portal, o menu
 * vive acima de tudo (z-[290]) sem depender do contexto do header.
 */
export default function LanguageSwitcher({
  current,
  compact = false,
}: {
  current: Locale;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const active = LOCALES.find((l) => l.code === current) ?? LOCALES[0];

  function toggle() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({
        top: r.bottom + 8,
        right: Math.max(8, window.innerWidth - r.right),
      });
    }
    setOpen((v) => !v);
  }

  // O menu é fixed: se a página rolar ou redimensionar, fecha para não órfã-lo.
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function pick(code: Locale) {
    setOpen(false);
    if (code === current) return;
    start(async () => {
      await setLocaleAction(code);
      router.refresh();
    });
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          compact
            ? "flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]"
            : "flex items-center gap-2 rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.5)] px-3 py-2 text-xs uppercase tracking-widest text-[var(--color-muted)] transition-colors hover:border-[rgba(201,162,75,0.4)] hover:text-[var(--color-gold-bright)]"
        }
      >
        <span className={compact ? "text-xs leading-none" : "text-sm leading-none"}>
          {active.flag}
        </span>
        {active.code.toUpperCase()}
        <svg width={compact ? 10 : 12} height={compact ? 10 : 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && pos && typeof document !== "undefined"
        ? createPortal(
            <>
              <div className="fixed inset-0 z-[280]" onClick={() => setOpen(false)} />
              <div
                role="listbox"
                style={{ top: pos.top, right: pos.right }}
                className="fixed z-[290] w-44 overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-panel)] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
              >
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    role="option"
                    aria-selected={l.code === current}
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
            </>,
            document.body
          )
        : null}
    </>
  );
}
