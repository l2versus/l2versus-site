"use client";

import { useActionState, useRef, useState } from "react";
import { generateReferralAction, type ReferralActionState } from "./actions";

export default function ReferralsClient({
  code,
  referredCount,
  baseUrl,
}: {
  code: string | null;
  referredCount: number;
  baseUrl: string;
}) {
  const [state, action, pending] = useActionState<ReferralActionState, FormData>(
    generateReferralAction,
    {}
  );

  // Após gerar, o código volta na state (uso imediato) até o RSC revalidar a prop.
  const effectiveCode = code ?? state.code ?? null;
  const link = effectiveCode ? `${baseUrl}/register?ref=${effectiveCode}` : "";

  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: seleciona o texto para cópia manual.
      inputRef.current?.select();
    }
  }

  return (
    <section className="reveal mt-8" style={{ animationDelay: "0.05s" }}>
      <div className="panel-gold overflow-hidden rounded-sm px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <h2 className="font-display text-xl uppercase tracking-[0.18em] text-[var(--color-gold-bright)] sm:text-2xl">
            Seu Link de Indicação
          </h2>
        </div>

        <div className="diamond-rule my-6">
          <span className="dia" />
        </div>

        {effectiveCode ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                ref={inputRef}
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]"
              />
              <button
                type="button"
                onClick={copy}
                className="btn-gold shrink-0 px-6 py-2.5 text-xs"
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 text-sm">
              <span className="text-[var(--color-faint)] uppercase tracking-[0.18em] text-[0.7rem]">
                Seu código
              </span>
              <span className="font-display text-lg tracking-[0.12em] text-[var(--color-gold-bright)]">
                {effectiveCode}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-[var(--color-muted)]">
              Você ainda não tem um código de indicação. Gere o seu para começar
              a convidar amigos.
            </p>
            <form action={action}>
              <button
                type="submit"
                disabled={pending}
                className="btn-gold px-6 py-2.5 text-xs disabled:opacity-60"
              >
                {pending ? "Gerando…" : "Gerar código"}
              </button>
            </form>
            {state.error && (
              <p className="rounded-sm border border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.08)] px-3 py-2 text-sm text-[var(--color-crimson)]">
                {state.error}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-line)] pt-6">
          <div>
            <div className="font-display text-3xl text-[var(--color-gold-bright)]">
              {referredCount}
            </div>
            <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
              Convidados
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[var(--color-muted)]">
            Você recebe{" "}
            <span className="text-[var(--color-gold-bright)]">10% em VSCOIN</span>{" "}
            de cada compra do seu indicado. Compartilhe seu link e ganhe sempre
            que ele recarregar.
          </p>
        </div>
      </div>
    </section>
  );
}
