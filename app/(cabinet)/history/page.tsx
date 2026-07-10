import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listTransactions } from "@/lib/repos/transactions";
import { listDeliveries } from "@/lib/repos/deliveries";
import type { TxKind } from "@/lib/repos/economy";

export const dynamic = "force-dynamic";

type TabKey = "all" | "topup" | "spend" | "referral_bonus" | "deliveries";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Tudo" },
  { key: "topup", label: "Recargas" },
  { key: "spend", label: "Gastos" },
  { key: "referral_bonus", label: "Bônus" },
  { key: "deliveries", label: "Entregas" },
];

const TX_KIND_LABEL: Record<TxKind, string> = {
  topup: "Recarga",
  spend: "Gasto",
  referral_bonus: "Bônus indicação",
  transfer_in: "Transf. recebida",
  transfer_out: "Transf. enviada",
  service: "Serviço",
  pack: "Pacote",
  send_to_game: "Envio ao jogo",
};

const DELIVERY_KIND_LABEL: Record<"coins" | "pack" | "item", string> = {
  coins: "Moedas",
  pack: "Pacote",
  item: "Item",
};

type Tone = "ok" | "pending" | "fail";

const TX_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Pendente", tone: "pending" },
  done: { label: "Concluído", tone: "ok" },
  failed: { label: "Falhou", tone: "fail" },
};

const DELIVERY_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Pendente", tone: "pending" },
  delivered: { label: "Entregue", tone: "ok" },
  failed: { label: "Falhou", tone: "fail" },
};

const nf = new Intl.NumberFormat("pt-BR");

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Row = {
  id: number;
  date: Date | string;
  typeLabel: string;
  value: string;
  valueClass: string;
  method: string;
  status: { label: string; tone: Tone };
};

function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const cls =
    tone === "ok"
      ? "border-[rgba(94,194,106,0.4)] bg-[rgba(94,194,106,0.08)] text-[#8fe19b]"
      : tone === "pending"
        ? "border-[rgba(201,162,75,0.4)] bg-[rgba(201,162,75,0.08)] text-[var(--color-gold-bright)]"
        : "border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.08)] text-[var(--color-crimson)]";
  return (
    <span
      className={`inline-block rounded-sm border px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.14em] ${cls}`}
    >
      {label}
    </span>
  );
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const s = await getSession();
  if (!s) redirect("/login");

  const sp = await searchParams;
  const raw = sp.tab;
  const tabParam = Array.isArray(raw) ? raw[0] : raw;
  const tab: TabKey = TABS.some((x) => x.key === tabParam)
    ? (tabParam as TabKey)
    : "all";

  let rows: Row[];
  if (tab === "deliveries") {
    const dels = await listDeliveries(s.uid);
    rows = dels.map((d) => ({
      id: d.id,
      date: d.created_at,
      typeLabel: DELIVERY_KIND_LABEL[d.kind] ?? d.kind,
      value:
        d.kind === "coins"
          ? `${nf.format(d.amount)} VSCOIN`
          : `×${nf.format(d.amount)}`,
      valueClass: "text-[var(--color-gold-bright)]",
      method: d.char_name,
      status: DELIVERY_STATUS[d.status] ?? { label: d.status, tone: "pending" },
    }));
  } else {
    const kind: TxKind | undefined = tab === "all" ? undefined : tab;
    const txs = await listTransactions(s.uid, kind);
    rows = txs.map((t) => {
      const positive = t.amount >= 0;
      return {
        id: t.id,
        date: t.created_at,
        typeLabel: TX_KIND_LABEL[t.kind] ?? t.kind,
        value: `${positive ? "+" : "−"}${nf.format(Math.abs(t.amount))} VSCOIN`,
        valueClass: positive ? "text-[#8fe19b]" : "text-[var(--color-crimson)]",
        method: t.method ?? "—",
        status: TX_STATUS[t.status] ?? { label: t.status, tone: "pending" },
      };
    });
  }

  return (
    <>
      <header className="reveal">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
          Minha Conta
        </p>
        <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
          <span className="text-glow-gold">Histórico</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Recargas, gastos, bônus e entregas no jogo — tudo em um só lugar.
        </p>
      </header>

      <nav
        className="reveal mt-8 flex flex-wrap gap-1 border-b border-[var(--color-line)]"
        style={{ animationDelay: "0.05s" }}
      >
        {TABS.map((x) => {
          const active = x.key === tab;
          return (
            <Link
              key={x.key}
              href={`/history?tab=${x.key}`}
              className={`-mb-px border-b-2 px-4 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors ${
                active
                  ? "border-[var(--color-gold)] text-[var(--color-gold-bright)]"
                  : "border-transparent text-[var(--color-faint)] hover:text-[var(--color-muted)]"
              }`}
            >
              {x.label}
            </Link>
          );
        })}
      </nav>

      <section className="reveal mt-6" style={{ animationDelay: "0.1s" }}>
        {rows.length === 0 ? (
          <div className="panel rounded-sm px-6 py-12 text-center text-[var(--color-muted)]">
            Nenhum registro.
          </div>
        ) : (
          <div className="panel overflow-hidden rounded-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-line)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--color-faint)]">
                    <th className="px-5 py-3 font-medium">Data</th>
                    <th className="px-3 py-3 font-medium">Tipo</th>
                    <th className="px-3 py-3 font-medium">Valor</th>
                    <th className="px-3 py-3 font-medium">Método</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[var(--color-line)] last:border-b-0"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--color-muted)]">
                        {fmtDate(r.date)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-block rounded-sm border border-[var(--color-line)] bg-[rgba(201,162,75,0.06)] px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                          {r.typeLabel}
                        </span>
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-3 font-display ${r.valueClass}`}
                      >
                        {r.value}
                      </td>
                      <td className="px-3 py-3 text-[var(--color-muted)]">
                        {r.method}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge label={r.status.label} tone={r.status.tone} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
