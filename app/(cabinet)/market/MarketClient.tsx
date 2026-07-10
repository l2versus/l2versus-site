"use client";

import { useMemo, useState } from "react";
import L2Icon from "../_components/L2Icon";
import type { OfflineStore } from "@/lib/repos/ladder";

const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]";

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

/* ---- Cabeçalho da loja: nome + título + selo do tipo ---- */
function StoreHeader({ store }: { store: OfflineStore }) {
  const isSell = store.type === 1;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[rgba(201,162,75,0.05)] px-5 py-3.5">
      <div className="min-w-0">
        <h3 className="truncate font-display text-lg tracking-wide text-[var(--color-gold-bright)]">
          {store.char_name}
        </h3>
        {store.title && (
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
            &ldquo;{store.title}&rdquo;
          </p>
        )}
      </div>
      <span
        className={`shrink-0 rounded-sm border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] ${
          isSell
            ? "border-[rgba(94,194,106,0.4)] bg-[rgba(94,194,106,0.08)] text-[#8fe19b]"
            : "border-[rgba(201,162,75,0.35)] text-[var(--color-gold)]"
        }`}
      >
        {isSell ? "Vendendo" : "Comprando"}
      </span>
    </div>
  );
}

/* ---- Linha de um item ofertado ---- */
function ItemRow({ item }: { item: OfflineStore["items"][number] }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-5 py-2.5 last:border-b-0">
      <L2Icon itemId={item.item} size={26} alt={`Item ${item.item}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[var(--color-parchment)]">
            #{item.item}
          </span>
          {item.enchant > 0 && (
            <span className="text-xs font-semibold text-[var(--color-gold-bright)]">
              +{item.enchant}
            </span>
          )}
          {item.count > 1 && (
            <span className="text-xs text-[var(--color-faint)]">
              ×{fmt(item.count)}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <L2Icon itemId={57} size={16} alt="Adena" />
        <span className="font-display text-sm text-[var(--color-gold-bright)]">
          {fmt(item.price)}
        </span>
      </div>
    </div>
  );
}

/* ---- Card de uma loja ---- */
function StoreCard({ store }: { store: OfflineStore }) {
  return (
    <div className="panel flex flex-col overflow-hidden rounded-sm">
      <StoreHeader store={store} />
      {store.items.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-[var(--color-faint)]">
          Sem itens nesta loja.
        </p>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {store.items.map((it, i) => (
            <ItemRow key={`${it.item}-${i}`} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketClient({ stores }: { stores: OfflineStore[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return stores;

    return stores
      .map((store) => {
        const textMatch =
          store.char_name.toLowerCase().includes(term) ||
          (store.title ?? "").toLowerCase().includes(term);
        // Ao buscar por id do item, mostra só os itens que casam.
        const matchingItems = store.items.filter((it) =>
          String(it.item).includes(term)
        );
        if (textMatch) return store; // nome/título casa: mostra a loja inteira
        if (matchingItems.length > 0) return { ...store, items: matchingItems };
        return null;
      })
      .filter((st): st is OfflineStore => st !== null);
  }, [q, stores]);

  return (
    <section className="reveal mt-8" style={{ animationDelay: "0.08s" }}>
      <div className="mb-6 max-w-md">
        <label
          className="mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]"
          htmlFor="market-search"
        >
          Filtrar por ID do item ou vendedor
        </label>
        <input
          id="market-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          placeholder="Ex.: 1538, 6371, nome do jogador…"
          className={inputCls}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center gap-3 rounded-sm px-6 py-16 text-center">
          <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]" />
          <p className="max-w-md text-[var(--color-muted)]">
            Nenhuma loja corresponde ao filtro.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((store) => (
            <StoreCard key={store.charId} store={store} />
          ))}
        </div>
      )}
    </section>
  );
}
