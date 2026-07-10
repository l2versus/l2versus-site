import Link from "next/link";
import type { Metadata } from "next";
import BrandLogo from "@/components/BrandLogo";
import {
  topByLevel,
  topByPvp,
  topByPk,
  topClans,
  type CharRankRow,
  type ClanRankRow,
} from "@/lib/repos/rankings";

// A base da rev muda o tempo todo; nunca renderizar estático nem chamar o DB no build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rankings — L2 Versus",
  description:
    "Salão da Fama do L2 Versus: melhores por nível, PvP, PK e os clãs mais poderosos de Aden.",
};

/* ---------------------------------------------------------------- helpers */

type TabKey = "level" | "pvp" | "pk" | "clans";

const TABS: { key: TabKey; label: string }[] = [
  { key: "level", label: "Nível" },
  { key: "pvp", label: "PvP" },
  { key: "pk", label: "PK" },
  { key: "clans", label: "Clãs" },
];

const SUBTITLE: Record<TabKey, string> = {
  level: "Os heróis de maior nível do servidor.",
  pvp: "Os duelistas mais letais em combate justo.",
  pk: "Os assassinos mais temidos de Aden.",
  clans: "As ordens mais poderosas do reino.",
};

const RACES = ["Humano", "Elfo", "Dark Elf", "Orc", "Anão"] as const;

function raceName(race: number): string {
  return RACES[race] ?? "—";
}

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
  return v === "level" || v === "pvp" || v === "pk" || v === "clans";
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
}: {
  rows: CharRankRow[];
  highlight: "level" | "pvp" | "pk";
}) {
  return (
    <table className="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={`${TH} text-center`}>#</th>
          <th className={TH}>Jogador</th>
          <th className={TH}>Nível</th>
          <th className={TH}>Raça</th>
          <th className={TH}>Clã</th>
          <th className={TH}>PvP</th>
          <th className={TH}>PK</th>
          <th className={TH}>Tempo online</th>
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
              <td className={`${TD} text-[var(--color-muted)]`}>{raceName(r.race)}</td>
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

function ClanTable({ rows }: { rows: ClanRankRow[] }) {
  return (
    <table className="w-full min-w-[760px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={`${TH} text-center`}>#</th>
          <th className={TH}>Clã</th>
          <th className={TH}>Nível</th>
          <th className={TH}>Reputação</th>
          <th className={TH}>Membros</th>
          <th className={TH}>Líder</th>
          <th className={TH}>Aliança</th>
          <th className={TH}>Castelo</th>
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
                  <span className="text-[var(--color-gold)]">◈ Sim</span>
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

function EmptyState({ isClan }: { isClan: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <Diamond />
      <p className="max-w-md text-[var(--color-muted)]">
        {isClan
          ? "Nenhum clã registrado ainda — funde o primeiro."
          : "Nenhum herói registrado ainda — seja o primeiro."}
      </p>
      <Link href="/register" className="btn-gold mt-2 px-6 py-3 text-xs">
        ⚔ Criar Conta
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
  const tabParam = typeof sp.tab === "string" ? sp.tab : undefined;
  const active: TabKey = isTab(tabParam) ? tabParam : "level";

  // Busca só a categoria ativa.
  let charRows: CharRankRow[] = [];
  let clanRows: ClanRankRow[] = [];
  if (active === "level") charRows = await topByLevel();
  else if (active === "pvp") charRows = await topByPvp();
  else if (active === "pk") charRows = await topByPk();
  else clanRows = await topClans();

  const isClan = active === "clans";
  const isEmpty = isClan ? clanRows.length === 0 : charRows.length === 0;

  return (
    <main className="min-h-screen">
      {/* NAV — replica da landing, com "Rankings" ativo */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[rgba(7,7,10,0.72)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Diamond />
            <BrandLogo className="w-[124px] sm:w-[144px]" priority />
          </Link>
          <nav className="hidden items-center gap-8 text-sm uppercase tracking-widest text-[var(--color-muted)] md:flex">
            <Link href="/" className="transition-colors hover:text-[var(--color-gold-bright)]">
              Início
            </Link>
            <Link
              href="/rankings"
              aria-current="page"
              className="text-[var(--color-gold-bright)]"
            >
              Rankings
            </Link>
            <Link
              href="/download"
              className="transition-colors hover:text-[var(--color-gold-bright)]"
            >
              Downloads
            </Link>
            <Link
              href="/donate"
              className="transition-colors hover:text-[var(--color-gold-bright)]"
            >
              Doar
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost px-4 py-2 text-xs">
              Entrar
            </Link>
            <Link href="/register" className="btn-gold px-4 py-2 text-xs">
              Registrar
            </Link>
          </div>
        </div>
      </header>

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
            Salão da Fama
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
          {TABS.map((t) => {
            const isActive = t.key === active;
            return (
              <Link
                key={t.key}
                href={t.key === "level" ? "/rankings" : `/rankings?tab=${t.key}`}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-sm border px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all ${
                  isActive
                    ? "border-[var(--color-gold)] bg-[rgba(201,162,75,0.12)] text-[var(--color-gold-bright)] shadow-[inset_0_1px_0_rgba(240,212,136,0.12)]"
                    : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[rgba(201,162,75,0.5)] hover:text-[var(--color-gold-bright)]"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        {/* Tabela / estado vazio */}
        <div className="panel panel-gold rounded-sm">
          {isEmpty ? (
            <EmptyState isClan={isClan} />
          ) : (
            <div className="overflow-x-auto">
              {isClan ? (
                <ClanTable rows={clanRows} />
              ) : (
                <CharTable
                  rows={charRows}
                  highlight={active as "level" | "pvp" | "pk"}
                />
              )}
            </div>
          )}
        </div>

        {!isEmpty && (
          <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-[var(--color-faint)]">
            {isClan
              ? `${clanRows.length} clã${clanRows.length === 1 ? "" : "s"} classificado${
                  clanRows.length === 1 ? "" : "s"
                }`
              : `${charRows.length} jogador${charRows.length === 1 ? "" : "es"} classificado${
                  charRows.length === 1 ? "" : "s"
                }`}
          </p>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--color-line)] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-[var(--color-faint)] md:flex-row">
          <div className="flex items-center gap-3">
            <Diamond />
            <BrandLogo className="w-[112px]" />
          </div>
          <p>
            © {new Date().getFullYear()} L2 Versus. Lineage II é marca da NCSoft. Projeto
            sem fins lucrativos.
          </p>
        </div>
      </footer>
    </main>
  );
}
