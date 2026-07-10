"use client";

import { useActionState, useState } from "react";
import L2Icon from "../../_components/L2Icon";
import {
  requestPayoutAction,
  cancelListingAction,
  type WalletState,
} from "./actions";

/** Anúncio no formato enxuto que o client precisa (mapeado na page server). */
export type WalletListing = {
  id: number;
  itemId: number;
  enchant: number;
  count: number;
  charName: string;
  priceCents: number;
  commissionPct: number;
  status: string;
};

/** "US$ 12.50" a partir de cents inteiros. */
function usd(cents: number): string {
  return "US$ " + (cents / 100).toFixed(2);
}

const nf = new Intl.NumberFormat("pt-BR");

const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]";
const labelCls =
  "mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]";

/** Rótulo + cor por status do anúncio. */
const STATUS_META: Record<string, { label: string; cls: string }> = {
  active: { label: "Ativo", cls: "text-[#8fe19b] border-[rgba(94,194,106,0.4)] bg-[rgba(94,194,106,0.08)]" },
  pending_escrow: { label: "Em custódia", cls: "text-[var(--color-gold)] border-[rgba(201,162,75,0.4)] bg-[rgba(201,162,75,0.08)]" },
  sold: { label: "Vendido", cls: "text-[var(--color-gold-bright)] border-[rgba(201,162,75,0.4)] bg-[rgba(201,162,75,0.08)]" },
  delivering: { label: "Entregando", cls: "text-[var(--color-gold)] border-[rgba(201,162,75,0.4)] bg-[rgba(201,162,75,0.08)]" },
  delivered: { label: "Entregue", cls: "text-[var(--color-muted)] border-[var(--color-line)] bg-[rgba(7,7,10,0.4)]" },
  cancelled: { label: "Cancelado", cls: "text-[var(--color-crimson)] border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.08)]" },
};

function statusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status,
      cls: "text-[var(--color-muted)] border-[var(--color-line)] bg-[rgba(7,7,10,0.4)]",
    }
  );
}

function Feedback({ state }: { state: WalletState }) {
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

/* ---- Seção "Sacar" (form de saque em USD) ---- */
function PayoutForm({ balanceCents }: { balanceCents: number }) {
  const [state, action, pending] = useActionState<WalletState, FormData>(
    requestPayoutAction,
    {}
  );
  const [method, setMethod] = useState("PayPal");

  const destLabel =
    method === "Cripto"
      ? "Endereço da carteira"
      : method === "Stripe"
        ? "Conta / e-mail Stripe"
        : "E-mail PayPal";
  const destPlaceholder =
    method === "Cripto" ? "0x… ou endereço da carteira" : "voce@exemplo.com";

  return (
    <section className="panel rounded-sm">
      <div className="border-b border-[var(--color-line)] bg-[rgba(201,162,75,0.05)] px-5 py-3.5">
        <h2 className="font-display text-lg uppercase tracking-[0.12em] text-[var(--color-gold-bright)]">
          Sacar
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Saque mínimo de US$ 5,00. Disponível:{" "}
          <span className="text-[var(--color-gold-bright)]">{usd(balanceCents)}</span>
        </p>
      </div>
      <form action={action} className="space-y-3 p-5">
        <div>
          <label className={labelCls} htmlFor="po-amount">
            Valor (US$)
          </label>
          <input
            id="po-amount"
            name="amount"
            type="number"
            min={5}
            step="0.01"
            required
            placeholder="5.00"
            className={inputCls}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="po-method">
              Método
            </label>
            <select
              id="po-method"
              name="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={inputCls}
            >
              <option value="PayPal">PayPal</option>
              <option value="Stripe">Stripe</option>
              <option value="Cripto">Cripto</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="po-dest">
              {destLabel}
            </label>
            <input
              id="po-dest"
              name="destination"
              required
              autoComplete="off"
              placeholder={destPlaceholder}
              className={inputCls}
            />
          </div>
        </div>
        <Feedback state={state} />
        <button
          type="submit"
          disabled={pending || balanceCents < 500}
          className="btn-gold w-full px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Processando…"
            : balanceCents < 500
              ? "Saldo abaixo do mínimo (US$ 5,00)"
              : "Solicitar saque"}
        </button>
        <p className="text-[0.7rem] leading-snug text-[var(--color-faint)]">
          A liquidação real (transferência ao provedor) entra no deploy. Por ora o
          pedido move o valor para "Pendente".
        </p>
      </form>
    </section>
  );
}

/* ---- Linha da tabela de anúncios (dona do estado de cancelamento) ---- */
function ListingRow({ listing }: { listing: WalletListing }) {
  const [state, action, pending] = useActionState<WalletState, FormData>(
    cancelListingAction,
    {}
  );
  const meta = statusMeta(listing.status);
  const cancellable =
    !state.ok &&
    (listing.status === "active" || listing.status === "pending_escrow");

  return (
    <tr className="border-b border-[var(--color-line)] align-middle last:border-b-0">
      <td className="px-5 py-3">
        <span className="flex items-center gap-2.5">
          <L2Icon itemId={listing.itemId} size={30} />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-[var(--color-parchment)]">
              Item #{listing.itemId}
              {listing.enchant > 0 && (
                <span className="ml-1 text-[var(--color-gold-bright)]">
                  +{listing.enchant}
                </span>
              )}
            </span>
            <span className="block text-[0.68rem] text-[var(--color-faint)]">
              {listing.count > 1 ? `${nf.format(listing.count)}x • ` : ""}
              {listing.charName}
            </span>
          </span>
        </span>
      </td>
      <td className="px-3 py-3 font-display text-sm text-[var(--color-gold-bright)]">
        {usd(listing.priceCents)}
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-block whitespace-nowrap rounded-sm border px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] ${
            state.ok ? statusMeta("cancelled").cls : meta.cls
          }`}
        >
          {state.ok ? statusMeta("cancelled").label : meta.label}
        </span>
      </td>
      <td className="px-5 py-3 text-right">
        {cancellable ? (
          <form action={action} className="inline-flex flex-col items-end gap-1">
            <input type="hidden" name="listingId" value={listing.id} />
            <button
              type="submit"
              disabled={pending}
              className="btn-ghost px-3 py-1.5 text-[0.68rem] disabled:opacity-50"
            >
              {pending ? "…" : "Cancelar"}
            </button>
            {state.error && (
              <span className="max-w-[12rem] text-right text-[0.6rem] leading-tight text-[var(--color-crimson)]">
                {state.error}
              </span>
            )}
          </form>
        ) : (
          <span className="text-[0.68rem] text-[var(--color-faint)]">—</span>
        )}
      </td>
    </tr>
  );
}

/* ---- Seção "Meus anúncios" ---- */
function MyListings({ listings }: { listings: WalletListing[] }) {
  return (
    <section className="panel overflow-hidden rounded-sm">
      <div className="border-b border-[var(--color-line)] bg-[rgba(201,162,75,0.05)] px-5 py-3.5">
        <h2 className="font-display text-lg uppercase tracking-[0.12em] text-[var(--color-gold-bright)]">
          Meus anúncios
        </h2>
      </div>
      {listings.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-[var(--color-faint)]">
          Você ainda não anunciou nenhum item.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--color-faint)]">
                <th className="px-5 py-2.5 font-medium">Item</th>
                <th className="px-3 py-2.5 font-medium">Preço</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 text-right font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <ListingRow key={l.id} listing={l} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function WalletClient({
  balanceCents,
  listings,
}: {
  balanceCents: number;
  listings: WalletListing[];
}) {
  return (
    <div className="reveal mt-6 grid gap-5 lg:grid-cols-2" style={{ animationDelay: "0.1s" }}>
      <PayoutForm balanceCents={balanceCents} />
      <MyListings listings={listings} />
    </div>
  );
}
