"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import L2Icon from "../_components/L2Icon";
import type { Listing } from "@/lib/repos/rmt";
import { buyAction, type BuyState } from "./actions";

export type RmtChar = { objId: number; name: string; online: boolean };

/** US$ a partir de centavos (int). Regra do projeto: "US$ " + (cents/100).toFixed(2). */
function usd(cents: number): string {
  return "US$ " + (cents / 100).toFixed(2);
}

const selectCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors focus:border-[var(--color-gold)] md:max-w-md";

function Feedback({ state }: { state: BuyState }) {
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

/* ---- Card de um anúncio (dono do próprio estado de compra) ---- */
function ListingCard({
  listing,
  buyerCharObjId,
  isOwn,
  hasChars,
}: {
  listing: Listing;
  buyerCharObjId: number;
  isOwn: boolean;
  hasChars: boolean;
}) {
  const [state, action, pending] = useActionState<BuyState, FormData>(
    buyAction,
    {}
  );
  const houseCents = Math.round(
    (listing.price_cents * listing.commission_pct) / 100
  );
  const blocked = isOwn || !hasChars || buyerCharObjId === 0;
  const disabled = pending || blocked || state.ok;

  return (
    <li className="panel flex flex-col rounded-sm">
      <div className="flex items-start gap-3 border-b border-[var(--color-line)] bg-[rgba(201,162,75,0.05)] px-4 py-3.5">
        <L2Icon itemId={listing.item_id} size={38} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 font-display text-base text-[var(--color-gold-bright)]">
            <span>#{listing.item_id}</span>
            {listing.enchant > 0 && (
              <span className="text-[var(--color-gold)]">+{listing.enchant}</span>
            )}
            {listing.count > 1 && (
              <span className="text-sm text-[var(--color-muted)]">
                x{listing.count.toLocaleString("pt-BR")}
              </span>
            )}
          </p>
          <p className="mt-0.5 truncate text-[0.72rem] text-[var(--color-faint)]">
            Vendedor:{" "}
            <span className="text-[var(--color-muted)]">
              {listing.seller_char_name}
            </span>
          </p>
        </div>
        {isOwn && (
          <span className="shrink-0 rounded-sm border border-[rgba(201,162,75,0.35)] px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.16em] text-[var(--color-gold)]">
            Seu anúncio
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-display text-2xl text-[var(--color-parchment)]">
              {usd(listing.price_cents)}
            </div>
            <div className="mt-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--color-faint)]">
              taxa {listing.commission_pct}% • {usd(houseCents)}
            </div>
          </div>
        </div>

        <Feedback state={state} />

        <form action={action} className="mt-3">
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="buyerCharObjId" value={buyerCharObjId} />
          <button
            type="submit"
            disabled={disabled}
            title={
              isOwn
                ? "Você não pode comprar o próprio anúncio"
                : !hasChars || buyerCharObjId === 0
                  ? "Selecione um personagem receptor"
                  : undefined
            }
            className="btn-gold w-full px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "Liquidando…"
              : state.ok
                ? "✓ Comprado"
                : isOwn
                  ? "Seu anúncio"
                  : "Comprar"}
          </button>
        </form>
      </div>
    </li>
  );
}

export default function RmtMarketClient({
  listings,
  chars,
  myUid,
}: {
  listings: Listing[];
  chars: RmtChar[];
  myUid: number;
}) {
  const [charId, setCharId] = useState<number>(chars[0]?.objId ?? 0);
  const hasChars = chars.length > 0;

  return (
    <section className="reveal mt-8" style={{ animationDelay: "0.05s" }}>
      {/* Abas / navegação do RMT */}
      <nav className="mb-6 flex flex-wrap gap-2">
        <span className="btn-gold px-4 py-2 text-[0.7rem]">Mercado</span>
        <Link href="/rmt/sell" className="btn-ghost px-4 py-2 text-[0.7rem]">
          Vender
        </Link>
        <Link href="/rmt/wallet" className="btn-ghost px-4 py-2 text-[0.7rem]">
          Carteira
        </Link>
      </nav>

      {/* Seletor do personagem que recebe o item comprado */}
      <div className="panel rounded-sm px-6 py-5">
        <label
          htmlFor="rmt-char"
          className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]"
        >
          Personagem que receberá o item comprado
        </label>
        {hasChars ? (
          <select
            id="rmt-char"
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
            personagem para receber itens comprados no mercado.
          </p>
        )}
        <p className="mt-2 text-[0.7rem] text-[var(--color-faint)]">
          A entrega é enfileirada e processada dentro do jogo após a liquidação.
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="panel mt-6 rounded-sm px-6 py-14 text-center">
          <p className="font-display text-lg text-[var(--color-gold-bright)]">
            Nenhum anúncio ativo
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Seja o primeiro a anunciar um item.{" "}
            <Link
              href="/rmt/sell"
              className="text-[var(--color-gold)] underline-offset-2 hover:underline"
            >
              Ir para Vender
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              buyerCharObjId={charId}
              isOwn={l.seller_uid === myUid}
              hasChars={hasChars}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
