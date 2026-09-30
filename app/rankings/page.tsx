import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getT } from "@/lib/i18n/server";
import {
  topByLevel,
  topByPvp,
  topByPk,
  topClans,
  castles,
  type CharRankRow,
  type ClanRankRow,
  type CastleRow,
} from "@/lib/repos/rankings";

// A base da rev muda o tempo todo; nunca renderizar estático nem chamar o DB no build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rankings — L2 Versus",
  description:
    "Salão da Fama do L2 Versus: melhores por nível, PvP, PK e os clãs mais poderosos de Aden.",
};

/* ---------------------------------------------------------------- helpers */

type TabKey = "level" | "pvp" | "pk" | "clans" | "castles";
type T = (key: string) => string;

/** Tabela castle não tem nome — id 1..9 (ordem oficial Interlude). */
const CASTLE_NAMES = [
  "Gludio", "Dion", "Giran", "Oren", "Aden",
  "Innadril", "Goddard", "Rune", "Schuttgart",
];

function fmt(n: number | string): string {
  return Number(n).toLocaleString("pt-BR");
}

/** Segundos -> "Xd Yh" (ou "Yh" / "0h"). */
function formatOnline(seconds: number): string {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

function isTab(v: string | undefined): v is TabKey {
  return v === "level" || v === "pvp" || v === "pk" || v === "clans" || v === "castles";
}

/** siegeDate (millis) -> data local, ou "—" se não agendado. */
function formatSiege(ms: number | string): string {
  const n = Number(ms);
  if (!n) return "—";
  const d = new Date(n);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Diamond() {
  return (
    <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]" />
  );
}

function OnlineDot({ online }: { online: number }) {
  return online === 1 ? (
    <span
      title="Online"
      className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#5ec26a] align-middle shadow-[0_0_8px_rgba(94,194,106,0.7)]"
    />
  ) : (
    <span
      title="Offline"
      className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--color-faint)] align-middle opacity-50"
    />
  );
}

/** Classe da linha: destaque dourado sutil no top 3, zebra no resto. */
function rowClass(rank: number): string {
  if (rank <= 3) return "bg-[rgba(201,162,75,0.06)]";
  return rank % 2 === 0 ? "bg-[rgba(255,255,255,0.015)]" : "";
}

const TH =
  "px-4 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-faint)] whitespace-nowrap";
const TD = "px-4 py-3 align-middle whitespace-nowrap";

function RankCell({ rank }: { rank: number }) {
  return (
    <td className={`${TD} w-14 text-center`}>
      <span
        className={`font-display text-lg ${
          rank <= 3 ? "text-glow-gold" : "text-[var(--color-gold)]"
        }`}
      >
        {rank}
      </span>
    </td>
  );
}

/* ---------------------------------------------------------------- tables */

function CharTable({
  rows,
  highlight,
  t,
}: {
  rows: CharRankRow[];
  highlight: "level" | "pvp" | "pk";
  t: T;
}) {
  const races = [
    t("site.race.human"),
    t("site.race.elf"),
    t("site.race.darkelf"),
    t("site.race.orc"),
    t("site.race.dwarf"),
  ];
  return (
    <table className="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={`${TH} text-center`}>#</th>
          <th className={TH}>{t("site.rk.h.player")}</th>
          <th className={TH}>{t("site.rk.h.level")}</th>
          <th className={TH}>{t("site.rk.h.race")}</th>
          <th className={TH}>{t("site.rk.h.clan")}</th>
          <th className={TH}>PvP</th>
          <th className={TH}>PK</th>
          <th className={TH}>{t("site.rk.h.online")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const rank = i + 1;
          return (
            <tr
              key={`${r.char_name}-${i}`}
              className={`border-b border-[var(--color-line)] transition-colors hover:bg-[rgba(201,162,75,0.05)] ${rowClass(
                rank
              )}`}
            >
              <RankCell rank={rank} />
              <td className={TD}>
                <span className="flex items-center gap-2">
                  <OnlineDot online={r.online} />
                  <span className="font-semibold text-[var(--color-parchment)]">
                    {r.char_name}
                  </span>
                </span>
              </td>
              <td
                className={`${TD} font-display ${
                  highlight === "level"
                    ? "text-lg text-[var(--color-gold-bright)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                {r.level}
              </td>
              <td className={`${TD} text-[var(--color-muted)]`}>{races[r.race] ?? "—"}</td>
              <td className={`${TD} text-[var(--color-muted)]`}>
                {r.clan_name ?? <span className="text-[var(--color-faint)]">—</span>}
              </td>
              <td
                className={`${TD} ${
                  highlight === "pvp"
                    ? "font-display text-lg text-[var(--color-gold-bright)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                {fmt(r.pvpkills)}
              </td>
              <td
                className={`${TD} ${
                  highlight === "pk"
                    ? "font-display text-lg text-[var(--color-crimson)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                {fmt(r.pkkills)}
              </td>
              <td className={`${TD} text-[var(--color-faint)]`}>
                {formatOnline(r.onlinetime)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ClanTable({ rows, t }: { rows: ClanRankRow[]; t: T }) {
  return (
    <table className="w-full min-w-[760px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={`${TH} text-center`}>#</th>
          <th className={TH}>{t("site.rk.h.clan")}</th>
          <th className={TH}>{t("site.rk.h.level")}</th>
          <th className={TH}>{t("site.rk.h.reputation")}</th>
          <th className={TH}>{t("site.rk.h.members")}</th>
          <th className={TH}>{t("site.rk.h.leader")}</th>
          <th className={TH}>{t("site.rk.h.ally")}</th>
          <th className={TH}>{t("site.rk.h.castle")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const rank = i + 1;
          return (
            <tr
              key={`${r.clan_id}-${i}`}
              className={`border-b border-[var(--color-line)] transition-colors hover:bg-[rgba(201,162,75,0.05)] ${rowClass(
                rank
              )}`}
            >
              <RankCell rank={rank} />
              <td className={`${TD} font-semibold text-[var(--color-parchment)]`}>
                {r.clan_name}
              </td>
              <td className={`${TD} font-display text-[var(--color-muted)]`}>
                {r.clan_level}
              </td>
              <td className={`${TD} font-display text-lg text-[var(--color-gold-bright)]`}>
                {fmt(r.reputation_score)}
              </td>
              <td className={`${TD} text-[var(--color-muted)]`}>{fmt(r.members)}</td>
              <td className={`${TD} text-[var(--color-muted)]`}>
                {r.leader ?? <span className="text-[var(--color-faint)]">—</span>}
              </td>
              <td className={`${TD} text-[var(--color-muted)]`}>
                {r.ally_name ? (
                  r.ally_name
                ) : (
                  <span className="text-[var(--color-faint)]">—</span>
                )}
              </td>
              <td className={TD}>
                {r.hasCastle > 0 ? (
                  <span className="text-[var(--color-gold)]">◈ {t("site.rk.yes")}</span>
                ) : (
                  <span className="text-[var(--color-faint)]">—</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CastleTable({ rows, t }: { rows: CastleRow[]; t: T }) {
  return (
    <table className="w-full min-w-[680px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={`${TH} text-center`}>#</th>
          <th className={TH}>{t("site.rk.h.castlename")}</th>
          <th className={TH}>{t("site.rk.h.owner")}</th>
          <th className={TH}>{t("site.rk.h.ally")}</th>
          <th className={TH}>{t("site.rk.h.tax")}</th>
          <th className={TH}>{t("site.rk.h.siege")}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className={`border-b border-[var(--color-line)] transition-colors hover:bg-[rgba(201,162,75,0.05)] ${
              r.clan_name ? "bg-[rgba(201,162,75,0.06)]" : ""
            }`}
          >
            <td className={`${TD} w-14 text-center`}>
              <span className="font-display text-lg text-[var(--color-gold)]">{r.id}</span>
            </td>
            <td className={`${TD} font-semibold text-[var(--color-parchment)]`}>
              ⚑ {CASTLE_NAMES[r.id - 1] ?? `#${r.id}`}
            </td>
            <td className={TD}>
              {r.clan_name ? (
                <span className="font-semibold text-[var(--color-gold-bright)]">{r.clan_name}</span>
              ) : (
                <span className="text-[var(--color-faint)]">{t("site.rk.free_castle")}</span>
              )}
            </td>
            <td className={`${TD} text-[var(--color-muted)]`}>
              {r.ally_name ?? <span className="text-[var(--color-faint)]">—</span>}
            </td>
            <td className={`${TD} font-display text-[var(--color-parchment)]`}>
              {Number(r.currentTaxPercent)}%
            </td>
            <td className={`${TD} text-[var(--color-muted)]`}>{formatSiege(r.siegeDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EmptyState({ isClan, t }: { isClan: boolean; t: T }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <Diamond />
      <p className="max-w-md text-[var(--color-muted)]">
        {isClan ? t("site.rk.empty_clan") : t("site.rk.empty_char")}
      </p>
      <Link href="/register" className="btn-gold mt-2 px-6 py-3 text-xs">
        ⚔ {t("site.rk.create")}
      </Link>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const t = await getT();
  const tabParam = typeof sp.tab === "string" ? sp.tab : undefined;
  const active: TabKey = isTab(tabParam) ? tabParam : "level";

  const TABS: { key: TabKey; label: string }[] = [
    { key: "level", label: t("site.rk.tab.level") },
    { key: "pvp", label: t("site.rk.tab.pvp") },
    { key: "pk", label: t("site.rk.tab.pk") },
    { key: "clans", label: t("site.rk.tab.clans") },
    { key: "castles", label: t("site.rk.tab.castles") },
  ];

  const SUBTITLE: Record<TabKey, string> = {
    level: t("site.rk.sub.level"),
    pvp: t("site.rk.sub.pvp"),
    pk: t("site.rk.sub.pk"),
    clans: t("site.rk.sub.clans"),
    castles: t("site.rk.sub.castles"),
  };

  // Busca só a categoria ativa.
  let charRows: CharRankRow[] = [];
  let clanRows: ClanRankRow[] = [];
  let castleRows: CastleRow[] = [];
  if (active === "level") charRows = await topByLevel();
  else if (active === "pvp") charRows = await topByPvp();
  else if (active === "pk") charRows = await topByPk();
  else if (active === "clans") clanRows = await topClans();
  else castleRows = await castles();

  const isClan = active === "clans";
  const isCastle = active === "castles";
  const isEmpty = isCastle
    ? castleRows.length === 0
    : isClan
      ? clanRows.length === 0
      : charRows.length === 0;

  return (
    <main className="min-h-screen">
      <SiteHeader active="rankings" />

      {/* BANNER */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/art/scene-siege.png')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[rgba(7,7,10,0.55)] via-[rgba(7,7,10,0.82)] to-[var(--color-abyss)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
          <p className="mb-5 text-xs uppercase tracking-[0.5em] text-[var(--color-gold)]">
            {t("site.rk.kicker")}
          </p>
          <h1 className="font-display text-glow-gold text-5xl leading-none tracking-[0.08em] sm:text-6xl md:text-7xl">
            RANKINGS
          </h1>
          <div className="diamond-rule mx-auto my-7 w-full max-w-md">
            <span className="dia" />
          </div>
          <p className="mx-auto max-w-xl text-lg text-[var(--color-muted)]">
            {SUBTITLE[active]}
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        {/* Abas (pílulas) */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {TABS.map((tb) => {
            const isActive = tb.key === active;
            return (
              <Link
                key={tb.key}
                href={tb.key === "level" ? "/rankings" : `/rankings?tab=${tb.key}`}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-sm border px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                  isActive
                    ? "border-[var(--color-gold)] bg-[rgba(201,162,75,0.12)] text-[var(--color-gold-bright)] shadow-[inset_0_1px_0_rgba(240,212,136,0.12)]"
                    : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[rgba(201,162,75,0.5)] hover:text-[var(--color-gold-bright)]"
                }`}
              >
                {tb.label}
              </Link>
            );
          })}
        </div>

        {/* Tabela / estado vazio */}
        <div className="panel panel-gold rounded-sm">
          {isEmpty ? (
            <EmptyState isClan={isClan || isCastle} t={t} />
          ) : (
            <div className="overflow-x-auto">
              {isCastle ? (
                <CastleTable rows={castleRows} t={t} />
              ) : isClan ? (
                <ClanTable rows={clanRows} t={t} />
              ) : (
                <CharTable
                  rows={charRows}
                  highlight={active as "level" | "pvp" | "pk"}
                  t={t}
                />
              )}
            </div>
          )}
        </div>

        {!isEmpty && !isCastle && (
          <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-[var(--color-faint)]">
            {isClan
              ? `${clanRows.length} ${t("site.rk.listed_clans")}`
              : `${charRows.length} ${t("site.rk.listed_players")}`}
          </p>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
