"use client";

import { useActionState, useState } from "react";
import L2Icon from "../_components/L2Icon";
import { buyPackAction, type ActionState } from "./actions";

/** Personagem elegível para receber o pacote (vem da página server). */
export type CharOpt = { objId: number; name: string; online: boolean };

type DisplayItem = { itemId: number; name: string; count: number };
type DisplayPack = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  original: number;
  featured?: boolean;
  items: DisplayItem[];
};

/**
 * Catálogo apenas para EXIBIÇÃO. A validação de preço/itens é feita no server
 * (actions.ts é a fonte da verdade). Mantenha os dois em sincronia.
 */
const PACKS: DisplayPack[] = [
  {
    id: "noob",
    name: "NOOB",
    tagline: "O empurrão inicial para quem está começando.",
    price: 200,
    original: 217,
    items: [
      { itemId: 955, name: "Perg. Encantar Arma (D)", count: 5 },
      { itemId: 956, name: "Perg. Encantar Armadura (D)", count: 10 },
      { itemId: 1463, name: "Soulshot (D)", count: 5000 },
      { itemId: 1060, name: "Poção de Cura Menor", count: 500 },
      { itemId: 57, name: "Adena", count: 1_000_000 },
    ],
  },
  {
    id: "standart",
    name: "STANDART",
    tagline: "Progressão de grade B para o meio-game.",
    price: 300,
    original: 326,
    items: [
      { itemId: 947, name: "Perg. Encantar Arma (B)", count: 5 },
      { itemId: 948, name: "Perg. Encantar Armadura (B)", count: 10 },
      { itemId: 1465, name: "Soulshot (B)", count: 10_000 },
      { itemId: 1539, name: "Poção de Cura Maior", count: 500 },
      { itemId: 728, name: "Poção de Mana", count: 500 },
      { itemId: 57, name: "Adena", count: 5_000_000 },
    ],
  },
  {
    id: "premium",
    name: "PREMIUM",
    tagline: "Arsenal de grade A para dominar o end-game.",
    price: 500,
    original: 543,
    featured: true,
    items: [
      { itemId: 729, name: "Perg. Encantar Arma (A)", count: 5 },
      { itemId: 730, name: "Perg. Encantar Armadura (A)", count: 10 },
      { itemId: 6569, name: "Perg. Abençoado Arma (A)", count: 2 },
      { itemId: 1466, name: "Soulshot (A)", count: 20_000 },
      { itemId: 1539, name: "Poção de Cura Maior", count: 1000 },
      { itemId: 728, name: "Poção de Mana", count: 1000 },
      { itemId: 57, name: "Adena", count: 20_000_000 },
    ],
  },
];

const nf = new Intl.NumberFormat("pt-BR");

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

function PackCard({
  pack,
  charId,
  balance,
  hasChars,
  delay,
}: {
  pack: DisplayPack;
  charId: number;
  balance: number;
  hasChars: boolean;
  delay: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    buyPackAction,
    {}
  );
  const pct = Math.round((1 - pack.price / pack.original) * 100);
  const insufficient = balance < pack.price;
  const blocked = !hasChars || charId === 0;

  return (
    <div
      className={`reveal flex flex-col rounded-sm ${
        pack.featured ? "panel-gold" : "panel"
      }`}
      style={{ animationDelay: delay }}
    >
      {/* Cabeçalho do pacote */}
      <div className="border-b border-[var(--color-line)] px-6 py-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-2xl uppercase tracking-[0.14em] text-[var(--color-gold-bright)]">
            {pack.name}
          </h3>
          {pack.featured && (
            <span className="rounded-sm border border-[var(--color-gold)] bg-[rgba(201,162,75,0.12)] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-gold-bright)]">
              Recomendado
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{pack.tagline}</p>

        <div className="mt-4 flex items-end gap-3">
          <span className="font-display text-3xl text-[var(--color-parchment)]">
            {nf.format(pack.price)}
            <span className="ml-1.5 text-sm uppercase tracking-[0.15em] text-[var(--color-gold)]">
              VSCOIN
            </span>
          </span>
          <span className="mb-1 text-sm text-[var(--color-faint)] line-through">
            {nf.format(pack.original)}
          </span>
          <span className="mb-1 rounded-sm border border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.1)] px-1.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[var(--color-crimson)]">
            -{pct}% agora
          </span>
        </div>
      </div>

      {/* Itens do pacote */}
      <ul className="flex-1 space-y-2.5 px-6 py-5">
        {pack.items.map((it, i) => (
          <li key={`${it.itemId}-${i}`} className="flex items-center gap-3">
            <L2Icon itemId={it.itemId} size={30} alt={it.name} />
            <span className="flex-1 text-sm text-[var(--color-parchment)]">
              {it.name}
            </span>
            <span className="font-display text-sm text-[var(--color-gold-bright)]">
              ×{nf.format(it.count)}
            </span>
          </li>
        ))}
      </ul>

      {/* Compra */}
      <div className="border-t border-[var(--color-line)] px-6 py-5">
        <form action={action}>
          <input type="hidden" name="packId" value={pack.id} />
          <input type="hidden" name="charObjId" value={charId} />
          <button
            type="submit"
            disabled={pending || blocked || state.ok || insufficient}
            className="btn-gold w-full px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "Processando…"
              : state.ok
                ? "✓ Enviado"
                : `Comprar — ${nf.format(pack.price)} VSCOIN`}
          </button>
        </form>
        <Feedback state={state} />
        {insufficient && !state.ok && (
          <p className="mt-2 text-center text-[0.7rem] text-[var(--color-faint)]">
            Saldo insuficiente. Faltam {nf.format(pack.price - balance)} VSCOIN.
          </p>
        )}
      </div>
    </div>
  );
}

export default function PacksClient({
  balance,
  chars,
}: {
  balance: number;
  chars: CharOpt[];
}) {
  const [charId, setCharId] = useState<number>(chars[0]?.objId ?? 0);
  const hasChars = chars.length > 0;

  return (
    <section className="reveal mt-8" style={{ animationDelay: "0.05s" }}>
      {/* Seletor de personagem (destino da entrega) */}
      <div className="panel rounded-sm px-6 py-5">
        <label
          htmlFor="pack-char"
          className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]"
        >
          Personagem que receberá os itens
        </label>
        {hasChars ? (
          <select
            id="pack-char"
            value={charId}
            onChange={(e) => setCharId(Number(e.target.value))}
            className="w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors focus:border-[var(--color-gold)] md:max-w-md"
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
            personagem para comprar pacotes.
          </p>
        )}
        <p className="mt-2 text-[0.7rem] text-[var(--color-faint)]">
          A entrega é enfileirada e processada dentro do jogo. Não precisa estar
          online.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {PACKS.map((p, i) => (
          <PackCard
            key={p.id}
            pack={p}
            charId={charId}
            balance={balance}
            hasChars={hasChars}
            delay={`${0.1 + i * 0.08}s`}
          />
        ))}
      </div>
    </section>
  );
}
