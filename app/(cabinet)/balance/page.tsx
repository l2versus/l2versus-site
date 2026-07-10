import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBalance } from "@/lib/repos/economy";
import BalanceClient from "./BalanceClient";

const COIN = process.env.NEXT_PUBLIC_COIN_NAME ?? "VSCOIN";

export default async function BalancePage({
  searchParams,
}: {
  searchParams: Promise<{ promo?: string }>;
}) {
  const s = await getSession();
  if (!s) redirect("/login");

  const [balance, params] = await Promise.all([getBalance(s.uid), searchParams]);
  const initialPromo = (params.promo ?? "").trim().toUpperCase().slice(0, 32);

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            Carteira
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            Recarregar <span className="text-glow-gold">Saldo</span>
          </h1>
        </div>
        <div className="rounded-sm border border-[var(--color-line)] bg-[rgba(201,162,75,0.04)] px-5 py-3 text-center">
          <div className="font-display text-2xl text-[var(--color-gold-bright)]">
            {new Intl.NumberFormat("pt-BR").format(balance)}
          </div>
          <div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
            Saldo atual · {COIN}
          </div>
        </div>
      </header>

      <BalanceClient coinName={COIN} initialPromo={initialPromo} />
    </>
  );
}
