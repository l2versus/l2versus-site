import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProfile } from "@/lib/repos/accounts";
import { getT, getLocale } from "@/lib/i18n/server";
import { logoutAction } from "./actions";
import SidebarNav, { type NavItem } from "./_components/SidebarNav";
import QuickStats from "./_components/QuickStats";
import LanguageSwitcher from "./_components/LanguageSwitcher";

const COIN = process.env.NEXT_PUBLIC_COIN_NAME ?? "VSCOIN";

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSession();
  if (!s) redirect("/login");

  const [profile, t, locale] = await Promise.all([
    getProfile(s.uid),
    getT(),
    getLocale(),
  ]);
  const initial = (s.username?.[0] ?? "V").toUpperCase();

  const nav: NavItem[] = [
    { slug: "profile", href: "/dashboard", label: t("nav.profile") },
    { slug: "services", href: "/services", label: t("nav.services") },
    { slug: "packs", href: "/packs", label: t("nav.packs") },
    { slug: "shop", href: "/shop", label: t("nav.shop") },
    { slug: "balance", href: "/balance", label: t("nav.balance") },
    { slug: "referrals", href: "/referrals", label: t("nav.referrals") },
    { slug: "rankings", href: "/stats", label: t("nav.rankings") },
    { slug: "market", href: "/market", label: t("nav.market") },
    { slug: "rmt", href: "/rmt", label: t("nav.rmt") },
    { slug: "streams", href: "/streams/connect", label: t("nav.streams") },
    { slug: "warehouse", href: "/warehouse", label: t("nav.warehouse") },
    { slug: "history", href: "/history", label: t("nav.history") },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col md:flex-row">
      {/* Cena cinematográfica fixa (cidadela obsidiana — Stitch) */}
      <div className="cabinet-scene" aria-hidden />

      {/* SIDEBAR */}
      <aside className="flex flex-col border-b border-[var(--color-line)] bg-[rgba(10,9,13,0.82)] backdrop-blur-md md:min-h-screen md:w-72 md:border-b-0 md:border-r">
        <div className="px-6 py-5">
          <Link href="/dashboard" className="flex items-center justify-center">
            <BrandLogo className="w-[148px]" priority />
          </Link>
        </div>

        {/* Identidade do usuário (linha compacta no mobile, coluna centrada no desktop) */}
        <div className="flex items-center gap-4 px-6 pb-2 md:flex-col md:gap-0 md:text-center">
          <div className="group relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-sm border border-[rgba(201,162,75,0.45)] bg-[#0C0A10] md:h-20 md:w-20">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-45"
              style={{ backgroundImage: "url(/art/crest.png)" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.08)] to-transparent" />
            <span className="relative z-10 font-display text-2xl text-[var(--color-gold-bright)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] md:text-3xl">
              {initial}
            </span>
            <div className="pointer-events-none absolute inset-0 border border-[rgba(235,193,102,0.3)] opacity-0 shadow-[inset_0_0_15px_rgba(235,193,102,0.2)] transition-opacity group-hover:opacity-100" />
          </div>
          <div className="min-w-0 md:flex md:flex-col md:items-center">
            <div className="truncate font-display text-lg tracking-wide text-[var(--color-gold-bright)] md:mt-3 md:text-xl">
              {s.username}
            </div>
            <div className="mt-0.5 text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)] md:mt-1 md:text-[0.62rem]">
              {t("chrome.member_since")} {fmtDate(profile.created_at)}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[rgba(42,37,48,0.7)] bg-[rgba(18,16,22,0.8)] px-3 py-1 md:mt-3">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ec26a] shadow-[0_0_8px_rgba(94,194,106,0.6)]" />
              <span className="text-[0.6rem] uppercase tracking-[0.18em] text-[var(--color-muted)] md:text-[0.62rem]">
                High Five · {t("chrome.online")}
              </span>
            </div>
          </div>
        </div>

        {/* Diamond rule */}
        <div className="relative mx-6 my-4 h-px bg-[var(--color-line)]">
          <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[var(--color-panel)] bg-[var(--color-gold)]" />
        </div>

        <div className="px-3 pb-3 md:flex-1">
          <SidebarNav items={nav} />
        </div>

        <div className="border-t border-[var(--color-line)] px-4 py-2.5 md:py-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-sm border border-[rgba(200,67,59,0.25)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--color-crimson)] transition-all hover:border-[rgba(200,67,59,0.5)] hover:bg-[rgba(200,67,59,0.08)] md:py-2.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
              {t("nav.logout")}
            </button>
          </form>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex h-14 items-center justify-between gap-4 border-b border-[var(--color-line)] bg-[rgba(8,7,10,0.75)] px-5 backdrop-blur-sm md:px-8">
          <nav className="flex items-center gap-6 text-[0.68rem] uppercase tracking-widest text-[var(--color-muted)]">
            <Link href="/" className="transition-colors hover:text-[var(--color-gold-bright)]">
              {t("nav.home")}
            </Link>
            <Link href="/#eventos" className="hidden transition-colors hover:text-[var(--color-gold-bright)] sm:inline">
              Eventos
            </Link>
            <Link href="/rankings" className="hidden transition-colors hover:text-[var(--color-gold-bright)] sm:inline">
              Rankings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSwitcher current={locale} />
            <Link href="/download" className="btn-gold hidden px-4 py-2 text-[0.65rem] sm:inline-flex">
              {t("nav.download")}
            </Link>
          </div>
        </div>

        <main className="flex-1 px-5 py-7 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl space-y-7">
            <QuickStats
              balance={profile.balance}
              referralCount={profile.referred_count}
              coinName={COIN}
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
