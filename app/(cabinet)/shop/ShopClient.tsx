"use client";

import { useActionState, useState } from "react";
import type {
  DonateCategory,
  DonateItem,
} from "@/lib/l2/donate-catalog";
import { buyDonateItemAction, type ShopState } from "./actions";

/** Personagem elegível para receber a entrega (vem da página server). */
export type ShopChar = { objId: number; name: string; online: boolean };

type CategoryMeta = { key: DonateCategory; label: string; blurb?: string };

const nf = new Intl.NumberFormat("pt-BR");

const selectCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors focus:border-[var(--color-gold)] md:max-w-md";

function Feedback({ state }: { state: ShopState }) {
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

/* ---- Linha de um item do catálogo (dono do próprio estado de compra) ---- */
function ItemRow({
  item,
  charId,
  balance,
  hasChars,
}: {
  item: DonateItem;
  charId: number;
  balance: number;
  hasChars: boolean;
}) {
  const [state, action, pending] = useActionState<ShopState, FormData>(
    buyDonateItemAction,
    {}
  );
  const insufficient = balance < item.price;
  const blocked = !hasChars || charId === 0;
  const disabled = pending || blocked || insufficient || state.ok;

  return (
    <li className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-parchment)]">
          {item.name}
        </p>
        {item.note && (
          <p className="mt-0.5 text-[0.72rem] leading-snug text-[var(--color-faint)]">
            {item.note}
          </p>
        )}
        <Feedback state={state} />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="whitespace-nowrap font-display text-sm text-[var(--color-gold-bright)]">
          {nf.format(item.price)}
          <span className="ml-1 text-[0.62rem] uppercase tracking-[0.15em] text-[var(--color-gold)]">
            VSCOIN
          </span>
        </span>
        <form action={action}>
          <input type="hidden" name="catalogId" value={item.id} />
          <input type="hidden" name="charObjId" value={charId} />
          <button
            type="submit"
            disabled={disabled}
            title={
              insufficient
                ? `Faltam ${nf.format(item.price - balance)} VSCOIN`
                : blocked
                  ? "Selecione um personagem"
                  : undefined
            }
            className="btn-gold min-w-[6.5rem] px-4 py-2 text-[0.7rem] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "…"
              : state.ok
                ? "✓ Enviado"
                : insufficient
                  ? "Sem saldo"
                  : "Comprar"}
          </button>
        </form>
      </div>
    </li>
  );
}

/* ---- Seção de uma categoria ---- */
function CategorySection({
  meta,
  items,
  charId,
  balance,
  hasChars,
  delay,
}: {
  meta: CategoryMeta;
  items: DonateItem[];
  charId: number;
  balance: number;
  hasChars: boolean;
  delay: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="panel reveal rounded-sm" style={{ animationDelay: delay }}>
      <div className="border-b border-[var(--color-line)] bg-[rgba(201,162,75,0.05)] px-5 py-3.5">
        <h2 className="font-display text-lg uppercase tracking-[0.12em] text-[var(--color-gold-bright)]">
          {meta.label}
        </h2>
        {meta.blurb && (
          <p className="mt-1 text-xs text-[var(--color-muted)]">{meta.blurb}</p>
        )}
      </div>
      <ul className="divide-y divide-[var(--color-line)]">
        {items.map((it) => (
          <ItemRow
            key={it.id}
            item={it}
            charId={charId}
            balance={balance}
            hasChars={hasChars}
          />
        ))}
      </ul>
    </section>
  );
}

export default function ShopClient({
  balance,
  chars,
  catalog,
  categories,
}: {
  balance: number;
  chars: ShopChar[];
  catalog: DonateItem[];
  categories: CategoryMeta[];
}) {
  const [charId, setCharId] = useState<number>(chars[0]?.objId ?? 0);
  const hasChars = chars.length > 0;

  return (
    <section className="reveal mt-8" style={{ animationDelay: "0.05s" }}>
      {/* Seletor de personagem (destino da entrega) */}
      <div className="panel rounded-sm px-6 py-5">
        <label
          htmlFor="shop-char"
          className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]"
        >
          Personagem que receberá os itens
        </label>
        {hasChars ? (
          <select
            id="shop-char"
            value={charId}
            onChange={(e) => setCharId(Number(e.target.value))}
            className={selectCls}
          >
            {chars.map((c) => (
              <option key={c.objId} value={c.objId}>
                {c.name}
                {c.online ? " (online)" : ""}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            Você ainda não tem personagens. Crie uma conta de jogo e um
            personagem para comprar itens da Donate Shop.
          </p>
        )}
        <p className="mt-2 text-[0.7rem] text-[var(--color-faint)]">
          A entrega é enfileirada e processada dentro do jogo. Não precisa estar
          online.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {categories.map((meta, i) => (
          <CategorySection
            key={meta.key}
            meta={meta}
            items={catalog.filter((it) => it.category === meta.key)}
            charId={charId}
            balance={balance}
            hasChars={hasChars}
            delay={`${0.1 + i * 0.05}s`}
          />
        ))}
      </div>
    </section>
  );
}
