import Link from "next/link";
import { getT } from "@/lib/i18n/server";

/**
 * Strip de stats fixo no topo de TODAS as páginas do cabinet
 * (Saldo / Indicações / Cupom) — port fiel do mockup Stitch "Painel do
 * Jogador": 3 cards separados, kicker com ícone, número grande em display
 * e botões de largura total. O card de cupom tem input real: submete GET
 * para /balance com ?promo=CODE (o formulário de recarga chega pré-preenchido).
 */

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel panel-lit group flex flex-col rounded-sm p-5 transition-colors hover:border-[rgba(201,162,75,0.35)] md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[rgba(201,162,75,0.05)] opacity-0 transition-opacity group-hover:opacity-100" />
      {children}
    </div>
  );
}

function Kicker({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        {icon}
      </svg>
      <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
        {label}
      </h3>
    </div>
  );
}

export default async function QuickStats({
  balance,
  referralCount,
  coinName,
}: {
  balance: number;
  referralCount: number;
  coinName: string;
}) {
  const t = await getT();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {/* Saldo */}
      <CardShell>
        <Kicker
          icon={
            <>
              <rect x="3" y="6" width="18" height="13" rx="1.5" />
              <path d="M3 10h18M16.5 15h1.5" />
            </>
          }
          label={t("stat.balance")}
        />
        <div className="mb-5 flex-1 font-display text-3xl tracking-wide text-glow-gold">
          {balance.toLocaleString("pt-BR")}
          <span className="ml-1.5 text-sm tracking-normal text-[var(--color-faint)]">
            {coinName}
          </span>
        </div>
        <div className="relative z-10 flex gap-2.5">
          <Link
            href="/balance"
            className="btn-gold flex-1 justify-center px-3 py-2.5 text-[0.68rem]"
          >
            {t("stat.buy")}
          </Link>
          <Link
            href="/warehouse"
            className="btn-ghost flex-1 justify-center px-3 py-2.5 text-[0.68rem]"
          >
            {t("stat.send_to_game")}
          </Link>
        </div>
      </CardShell>

      {/* Indicações */}
      <CardShell>
        <Kicker
          icon={
            <>
              <circle cx="9" cy="8" r="3.2" />
              <path d="M2.5 20c0-3 2.9-5 6.5-5s6.5 2 6.5 5" />
              <path d="M17 8.5a3 3 0 0 0 0-5.8M18.5 20c0-2.4-1.2-4-3-4.6" />
            </>
          }
          label={t("stat.referrals")}
        />
        <div className="mb-5 flex-1 font-display text-3xl tracking-wide text-[var(--color-gold-bright)]">
          {referralCount}
          <span className="ml-1.5 text-sm uppercase tracking-normal text-[var(--color-faint)]">
            {t("stat.friends")}
          </span>
        </div>
        <Link
          href="/referrals"
          className="btn-gold relative z-10 w-full justify-center px-3 py-2.5 text-[0.68rem]"
        >
          {t("stat.referrals_cta")}
        </Link>
      </CardShell>

      {/* Cupom — input real; GET /balance?promo=CODE pré-preenche a recarga */}
      <CardShell>
        <Kicker
          icon={
            <>
              <rect x="3" y="8" width="18" height="13" rx="1.5" />
              <path d="M3 12h18M12 8v13M8.5 8S7 4.5 9.5 3.5 12 6.5 12 8M15.5 8S17 4.5 14.5 3.5 12 6.5 12 8" />
            </>
          }
          label={t("stat.promo")}
        />
        <form
          action="/balance"
          method="GET"
          className="relative z-10 flex flex-1 flex-col"
        >
          <div className="mb-5 flex flex-1 items-center">
            <input
              type="text"
              name="promo"
              maxLength={32}
              autoComplete="off"
              placeholder={t("stat.promo_placeholder")}
              className="w-full border-0 border-b border-[var(--color-line)] bg-transparent px-0 py-2 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]"
            />
          </div>
          <button
            type="submit"
            className="btn-gold w-full justify-center px-3 py-2.5 text-[0.68rem]"
          >
            {t("stat.promo_activate")}
          </button>
        </form>
      </CardShell>
    </div>
  );
}
