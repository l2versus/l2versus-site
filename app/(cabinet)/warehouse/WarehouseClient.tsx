"use client";

import { useActionState, useEffect, useState } from "react";
import { sendCoinsAction, type ActionState } from "./actions";

export type WarehouseChar = {
  objId: number;
  name: string;
  online: boolean;
};

const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]";
const labelCls =
  "mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]";

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p className="mt-3 rounded-sm border border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.08)] px-3 py-2 text-sm text-[var(--color-crimson)]">
        {state.error}
      </p>
    );
  if (state.ok && state.message)
    return (
      <p className="mt-3 rounded-sm border border-[rgba(94,194,106,0.4)] bg-[rgba(94,194,106,0.08)] px-3 py-2 text-sm text-[#8fe19b]">
        {state.message}
      </p>
    );
  return null;
}

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

export default function WarehouseClient({
  chars,
  balance,
  coinName,
}: {
  chars: WarehouseChar[];
  balance: number;
  coinName: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    sendCoinsAction,
    {}
  );
  const [amount, setAmount] = useState("");
  const [charObjId, setCharObjId] = useState(String(chars[0]?.objId ?? ""));

  useEffect(() => {
    if (state.ok) {
      setAmount("");
    }
  }, [state]);

  const numeric = Math.floor(Number(amount) || 0);
  const insufficient = numeric > balance;
  const invalid = numeric <= 0;

  return (
    <section className="reveal mt-8" style={{ animationDelay: "0.1s" }}>
      <div className="panel rounded-sm p-6 md:p-7">
        <div className="flex items-center gap-2.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v8M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" />
          </svg>
          <h2 className="font-display text-xl uppercase tracking-[0.15em] text-[var(--color-parchment)]">
            Transferir {coinName} para o jogo
          </h2>
        </div>

        <div className="diamond-rule my-5">
          <span className="dia" />
        </div>

        <div className="mb-5 flex items-center justify-between gap-4 rounded-sm border border-[var(--color-line)] bg-[rgba(201,162,75,0.04)] px-4 py-3">
          <span className="text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
            Saldo disponível
          </span>
          <span className="font-display text-xl text-[var(--color-gold-bright)]">
            {fmt(balance)}{" "}
            <span className="text-sm text-[var(--color-muted)]">{coinName}</span>
          </span>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="wh-char">
              Personagem
            </label>
            <select
              id="wh-char"
              name="charObjId"
              value={charObjId}
              onChange={(e) => setCharObjId(e.target.value)}
              required
              className={inputCls}
            >
              {chars.map((c) => (
                <option key={c.objId} value={c.objId}>
                  {c.name}
                  {c.online ? " (online)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls} htmlFor="wh-amount">
              Quantidade de {coinName}
            </label>
            <input
              id="wh-amount"
              name="amount"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              max={balance || undefined}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex.: 100"
              className={inputCls}
            />
            {insufficient && (
              <p className="mt-1.5 text-xs text-[var(--color-crimson)]">
                Saldo insuficiente para essa quantidade.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending || invalid || insufficient}
            className="btn-gold w-full px-5 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Enviando…" : "Enviar ao jogo"}
          </button>

          <Feedback state={state} />
        </form>

        <p className="mt-5 border-t border-[var(--color-line)] pt-4 text-sm leading-relaxed text-[var(--color-muted)]">
          O valor é debitado do seu saldo e entra na{" "}
          <span className="text-[var(--color-parchment)]">fila de entrega</span>.
          O servidor processa a fila e entrega os {coinName} ao personagem
          escolhido em instantes. Você pode acompanhar o status na aba{" "}
          <span className="text-[var(--color-gold-bright)]">Histórico</span>.
        </p>
      </div>
    </section>
  );
}
