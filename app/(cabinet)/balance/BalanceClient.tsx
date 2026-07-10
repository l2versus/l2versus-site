"use client";

import { useActionState, useEffect, useState } from "react";
import { topUpAction, type TopUpState } from "./actions";

const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]";
const labelCls =
  "mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]";
const chipCls =
  "rounded-full border border-[var(--color-line)] px-3 py-1 text-xs text-[var(--color-muted)]";

const SLIDER_MIN = 10;
const SLIDER_MAX = 500;
const BRL_PER_USD = 5.5; // referência aproximada — só para exibição das moedas

/** MANTER EM SINCRONIA com bonusRate() em actions.ts */
const BONUS_TIERS = [
  { min: 70, max: 99, pct: 6 },
  { min: 100, max: 149, pct: 9 },
  { min: 150, max: 199, pct: 12 },
  { min: 200, max: 249, pct: 15 },
  { min: 250, max: 499, pct: 20 },
  { min: 500, max: Infinity, pct: 25 },
] as const;

const METHODS = [
  { id: "pix", label: "Pix" },
  { id: "card", label: "Cartão" },
  { id: "mercadopago", label: "Mercado Pago" },
  { id: "paypal", label: "PayPal" },
  { id: "crypto", label: "Cripto" },
] as const;

const nf = new Intl.NumberFormat("pt-BR");

function tierPct(amount: number): number {
  let pct = 0;
  for (const t of BONUS_TIERS) if (amount >= t.min) pct = t.pct;
  return pct;
}

function Feedback({ state }: { state: TopUpState }) {
  if (state.error)
    return (
      <p className="mt-4 rounded-sm border border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.08)] px-3 py-2 text-sm text-[var(--color-crimson)]">
        {state.error}
      </p>
    );
  if (state.ok && state.message)
    return (
      <p className="mt-4 rounded-sm border border-[rgba(94,194,106,0.4)] bg-[rgba(94,194,106,0.08)] px-3 py-2 text-sm text-[#8fe19b]">
        {state.message}
      </p>
    );
  return null;
}

export default function BalanceClient({
  coinName,
  initialPromo = "",
}: {
  coinName: string;
  initialPromo?: string;
}) {
  const [amount, setAmount] = useState(100);
  const [method, setMethod] = useState<string>("pix");
  const [state, action, pending] = useActionState<TopUpState, FormData>(
    topUpAction,
    {}
  );

  // Cupom vindo do card do dashboard (?promo=CODE): rola até o campo já preenchido
  useEffect(() => {
    if (initialPromo)
      document
        .getElementById("promo")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [initialPromo]);

  const safeAmount =
    Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
  const pct = tierPct(safeAmount);
  const bonus = Math.floor((safeAmount * pct) / 100);
  const total = safeAmount + bonus;
  const usd = (safeAmount / BRL_PER_USD).toFixed(2);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      {/* ESQUERDA — recarga */}
      <section
        className="reveal panel rounded-sm p-6 md:p-7"
        style={{ animationDelay: "0.05s" }}
      >
        <h2 className="font-display text-xl uppercase tracking-[0.15em] text-[var(--color-parchment)]">
          Recarregar Saldo
        </h2>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          1 {coinName} ≈ R$ 1,00. Arraste ou digite o valor desejado.
        </p>

        <form action={action} className="mt-6">
          <input type="hidden" name="amount" value={safeAmount} />
          <input type="hidden" name="method" value={method} />

          {/* Valor + moedas de referência */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className={labelCls}>Valor da recarga</span>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={SLIDER_MIN}
                  max={100000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-32 rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-3 py-2 font-display text-2xl text-[var(--color-gold-bright)] outline-none transition-colors focus:border-[var(--color-gold)]"
                />
                <span className="text-sm uppercase tracking-[0.2em] text-[var(--color-faint)]">
                  {coinName}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span className={chipCls}>R$ {nf.format(safeAmount)}</span>
              <span className={chipCls}>US$ {usd}</span>
              <span className={chipCls}>{usd} USDT</span>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={10}
            value={Math.min(Math.max(safeAmount, SLIDER_MIN), SLIDER_MAX)}
            onChange={(e) => setAmount(Number(e.target.value))}
            aria-label="Valor da recarga"
            className="mt-4 w-full cursor-pointer"
            style={{ accentColor: "var(--color-gold)" }}
          />
          <div className="mt-1 flex justify-between text-[0.65rem] text-[var(--color-faint)]">
            <span>{SLIDER_MIN}</span>
            <span>{SLIDER_MAX}+</span>
          </div>

          {/* Código promo */}
          <div id="promo" className="mt-6 scroll-mt-24">
            <label className={labelCls} htmlFor="promo-input">
              Código promo
            </label>
            <input
              id="promo-input"
              name="promo"
              type="text"
              autoComplete="off"
              maxLength={32}
              defaultValue={initialPromo}
              placeholder="Opcional"
              className={`${inputCls} uppercase`}
            />
          </div>

          {/* Forma de pagamento */}
          <div className="mt-6">
            <span className={labelCls}>Forma de pagamento</span>
            <div className="flex flex-wrap gap-2.5">
              {METHODS.map((m) => {
                const active = m.id === method;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    aria-pressed={active}
                    className={`rounded-sm border px-4 py-2 text-sm transition-colors ${
                      active
                        ? "border-[var(--color-gold)] bg-[rgba(201,162,75,0.12)] text-[var(--color-gold-bright)]"
                        : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-gold)]"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Você recebe */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.05)] px-4 py-3.5">
            <div>
              <div className="text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                Você recebe
              </div>
              <div className="font-display text-2xl text-[var(--color-gold-bright)]">
                {nf.format(total)} {coinName}
              </div>
            </div>
            <div className="text-right text-xs text-[var(--color-muted)]">
              <div>
                {nf.format(safeAmount)} {coinName}
              </div>
              <div
                className={bonus > 0 ? "text-[#8fe19b]" : "text-[var(--color-faint)]"}
              >
                {bonus > 0
                  ? `+ ${nf.format(bonus)} de bônus (${pct}%)`
                  : "sem bônus abaixo de 70"}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || safeAmount < SLIDER_MIN}
            className="btn-gold mt-6 w-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "PROCESSANDO…"
              : `PAGAR · R$ ${nf.format(safeAmount)}`}
          </button>

          <Feedback state={state} />

          <p className="mt-3 text-center text-[0.7rem] text-[var(--color-faint)]">
            Pagamento processado por gateway externo. O saldo é liberado após a
            confirmação.
          </p>
        </form>
      </section>

      {/* DIREITA — faixas de bônus */}
      <aside
        className="reveal panel-gold rounded-sm p-6 md:p-7"
        style={{ animationDelay: "0.12s" }}
      >
        <h2 className="font-display text-lg uppercase tracking-[0.15em] text-[var(--color-gold-bright)]">
          Bônus por Volume
        </h2>
        <p className="mt-1 text-sm text-[var(--color-faint)]">
          Quanto mais você recarrega, mais {coinName} extra ganha.
        </p>

        <ul className="mt-5 space-y-2">
          {BONUS_TIERS.map((tier) => {
            const active = safeAmount >= tier.min && safeAmount <= tier.max;
            const label =
              tier.max === Infinity
                ? `${tier.min}+`
                : `${tier.min}–${tier.max}`;
            return (
              <li key={tier.min}>
                <button
                  type="button"
                  onClick={() => setAmount(tier.min)}
                  className={`flex w-full items-center justify-between rounded-sm border px-4 py-2.5 text-left transition-colors ${
                    active
                      ? "border-[var(--color-gold)] bg-[rgba(201,162,75,0.12)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-gold)]"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      active
                        ? "text-[var(--color-parchment)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {label} {coinName}
                  </span>
                  <span
                    className={`font-display text-sm ${
                      active
                        ? "text-[var(--color-gold-bright)]"
                        : "text-[var(--color-gold)]"
                    }`}
                  >
                    +{tier.pct}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="diamond-rule mt-6">
          <span className="dia" />
        </div>
        <p className="mt-4 text-[0.7rem] leading-relaxed text-[var(--color-faint)]">
          O bônus é creditado junto com a recarga assim que o pagamento for
          confirmado pelo gateway.
        </p>
      </aside>
    </div>
  );
}
