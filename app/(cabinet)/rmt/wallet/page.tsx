import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getWallet, myListings, listPayouts } from "@/lib/repos/rmt";
import WalletClient, { type WalletListing } from "./WalletClient";

// Saldo e anúncios mudam a todo momento; nunca renderizar estático.
export const dynamic = "force-dynamic";

/** "US$ 12.50" a partir de cents inteiros. */
function usd(cents: number): string {
  return "US$ " + (cents / 100).toFixed(2);
}

type PayoutRow = {
  id: number;
  amount_cents: number;
  method: string;
  destination: string;
  status: string;
  created_at: Date | string;
};

const PAYOUT_STATUS_LABEL: Record<string, string> = {
  requested: "Solicitado",
  pending: "Pendente",
  processing: "Processando",
  paid: "Pago",
  rejected: "Recusado",
  cancelled: "Cancelado",
};

function fmtDate(v: Date | string): string {
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="panel rounded-sm px-5 py-4">
      <div className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
        {label}
      </div>
      <div
        className={`mt-1.5 font-display text-2xl ${
          accent ? "text-glow-gold text-[var(--color-gold-bright)]" : "text-[var(--color-parchment)]"
        }`}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[0.68rem] text-[var(--color-faint)]">{hint}</div>}
    </div>
  );
}

export default async function WalletPage() {
  const s = await getSession();
  if (!s) redirect("/login");

  const [wallet, listings, payouts] = await Promise.all([
    getWallet(s.uid),
    myListings(s.uid),
    listPayouts(s.uid) as Promise<PayoutRow[]>,
  ]);

  const listingView: WalletListing[] = listings.map((l) => ({
    id: Number(l.id),
    itemId: Number(l.item_id),
    enchant: Number(l.enchant),
    count: Number(l.count),
    charName: l.seller_char_name,
    priceCents: Number(l.price_cents),
    commissionPct: Number(l.commission_pct),
    status: l.status,
  }));

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            RMT Market
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            Carteira <span className="text-glow-gold">RMT</span>{" "}
            <span className="text-[var(--color-muted)]">(USD)</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Acompanhe seus ganhos com vendas de itens, gerencie seus anúncios e
            solicite saques em dólar.
          </p>
        </div>
      </header>

      <section
        className="reveal mt-8 grid gap-4 sm:grid-cols-3"
        style={{ animationDelay: "0.05s" }}
      >
        <StatCard
          label="Saldo disponível"
          value={usd(wallet.balance_cents)}
          hint="Pronto para saque"
          accent
        />
        <StatCard
          label="Pendente"
          value={usd(wallet.pending_cents)}
          hint="Saques em processamento"
        />
        <StatCard
          label="Total ganho"
          value={usd(wallet.lifetime_cents)}
          hint="Acumulado desde sempre"
        />
      </section>

      <WalletClient balanceCents={wallet.balance_cents} listings={listingView} />

      <section
        className="reveal panel mt-5 overflow-hidden rounded-sm"
        style={{ animationDelay: "0.15s" }}
      >
        <div className="border-b border-[var(--color-line)] bg-[rgba(201,162,75,0.05)] px-5 py-3.5">
          <h2 className="font-display text-lg uppercase tracking-[0.12em] text-[var(--color-gold-bright)]">
            Saques
          </h2>
        </div>
        {payouts.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--color-faint)]">
            Nenhum saque solicitado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-line)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--color-faint)]">
                  <th className="px-5 py-2.5 font-medium">Data</th>
                  <th className="px-3 py-2.5 font-medium">Valor</th>
                  <th className="px-3 py-2.5 font-medium">Método</th>
                  <th className="px-3 py-2.5 font-medium">Destino</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--color-line)] last:border-b-0"
                  >
                    <td className="px-5 py-3 text-[var(--color-muted)]">
                      {fmtDate(p.created_at)}
                    </td>
                    <td className="px-3 py-3 font-display text-[var(--color-gold-bright)]">
                      {usd(Number(p.amount_cents))}
                    </td>
                    <td className="px-3 py-3 text-[var(--color-muted)]">{p.method}</td>
                    <td className="max-w-[14rem] truncate px-3 py-3 text-[var(--color-faint)]">
                      {p.destination}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-parchment)]">
                      {PAYOUT_STATUS_LABEL[p.status] ?? p.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
