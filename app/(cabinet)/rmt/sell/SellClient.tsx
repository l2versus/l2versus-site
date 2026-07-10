"use client";

import { useActionState, useState } from "react";
import L2Icon from "../../_components/L2Icon";
import { createListingAction, type SellState } from "./actions";

/** Item negociável do usuário (mapeado da página server). */
export type SellItem = {
  objectId: number;
  itemId: number;
  enchant: number;
  count: number;
  charObjId: number;
  charName: string;
  online: boolean;
};

const nf = new Intl.NumberFormat("pt-BR");

function Feedback({ state }: { state: SellState }) {
  if (state.error)
    return (
      <p className="mt-2 rounded-sm border border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.08)] px-3 py-1.5 text-xs text-[var(--color-crimson)]">
        {state.error}
      </p>
    );
  if (state.ok && state.message)
    return (
      <p className="mt-2 rounded-sm border border-[rgba(94,194,106,0.4)] bg-[rgba(94,194,106,0.08)] px-3 py-1.5 text-xs text-[#8fe19b]">
        {state.message}
      </p>
    );
  return null;
}

/* ---- Linha de um item (dono do próprio estado de preço e anúncio) ---- */
function ItemRow({ item }: { item: SellItem }) {
  const [state, action, pending] = useActionState<SellState, FormData>(
    createListingAction,
    {}
  );
  const [price, setPrice] = useState("");

  const parsed = parseFloat(price);
  const cents = Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  const validPrice = Number.isInteger(cents) && cents >= 100;
  const blocked = item.online;
  const disabled = pending || blocked || !validPrice || Boolean(state.ok);

  return (
    <li className="flex flex-col gap-3 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Identidade do item */}
        <div className="flex min-w-0 items-center gap-3">
          <L2Icon itemId={item.itemId} size={38} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-parchment)]">
              <span className="truncate">Item #{item.itemId}</span>
              {item.enchant > 0 && (
                <span className="shrink-0 font-display text-[var(--color-gold-bright)]">
                  +{item.enchant}
                </span>
              )}
              {item.count > 1 && (
                <span className="shrink-0 text-[0.72rem] text-[var(--color-muted)]">
                  x{nf.format(item.count)}
                </span>
              )}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[0.7rem] text-[var(--color-faint)]">
              <span className="text-[var(--color-muted)]">{item.charName}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 uppercase tracking-[0.12em] ${
                  item.online
                    ? "border-[rgba(94,194,106,0.4)] text-[#8fe19b]"
                    : "border-[var(--color-line)] text-[var(--color-faint)]"
                }`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    item.online
                      ? "bg-[#5ec26a] shadow-[0_0_8px_#5ec26a]"
                      : "bg-[var(--color-faint)]"
                  }`}
                />
                {item.online ? "online" : "offline"}
              </span>
            </p>
          </div>
        </div>

        {/* Preço + Anunciar */}
        <form action={action} className="flex shrink-0 items-center gap-2">
          <input type="hidden" name="objectId" value={item.objectId} />
          <input
            type="hidden"
            name="priceCents"
            value={validPrice ? cents : ""}
          />
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] text-[var(--color-faint)]">
              US$
            </span>
            <input
              type="number"
              min="1"
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              disabled={blocked}
              className="w-28 rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] py-2 pl-10 pr-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={disabled}
            title={
              blocked
                ? "O personagem precisa estar offline"
                : !validPrice
                  ? "Preço mínimo de US$ 1,00"
                  : undefined
            }
            className="btn-gold min-w-[6.5rem] px-4 py-2 text-[0.7rem] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "…"
              : state.ok
                ? "✓ Anunciado"
                : blocked
                  ? "Offline p/ vender"
                  : "Anunciar"}
          </button>
        </form>
      </div>

      <Feedback state={state} />
    </li>
  );
}

export default function SellClient({ items }: { items: SellItem[] }) {
  return (
    <section className="reveal mt-6" style={{ animationDelay: "0.1s" }}>
      <div className="panel rounded-sm">
        <div className="border-b border-[var(--color-line)] bg-[rgba(201,162,75,0.05)] px-5 py-3.5">
          <h2 className="font-display text-lg uppercase tracking-[0.12em] text-[var(--color-gold-bright)]">
            Seus itens negociáveis
          </h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Defina o preço em dólar e publique. A casa retém 12% de comissão na
            venda; você recebe 88%.
          </p>
        </div>
        <ul className="divide-y divide-[var(--color-line)]">
          {items.map((it) => (
            <ItemRow key={it.objectId} item={it} />
          ))}
        </ul>
      </div>
    </section>
  );
}
