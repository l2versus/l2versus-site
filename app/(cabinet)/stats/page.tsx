import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { overallStats, type OverallStats } from "@/lib/repos/stats";
import {
  topByPvp,
  topByPk,
  topClans,
  type CharRankRow,
  type ClanRankRow,
} from "@/lib/repos/rankings";
import {
  currentHeroes,
  olympiadRanking,
  type HeroRow,
  type OlyRow,
} from "@/lib/repos/ladder";
import { castleStatus, type CastleStatus } from "@/lib/repos/castles";
import { className } from "@/lib/l2/classes";

// A base da rev muda o tempo todo; nunca renderizar estático nem tocar o DB no build.
export const dynamic = "force-dynamic";

/* ---------------------------------------------------------------- helpers */

type TabKey =
  | "general"
  | "pvp"
  | "pk"
  | "clans"
  | "heroes"
  | "olympiad"
  | "castles";

const TABS: { key: TabKey; label: string }[] = [
  { key: "general", label: "Geral" },
  { key: "pvp", label: "PvP" },
  { key: "pk", label: "PK" },
  { key: "clans", label: "Clãs" },
  { key: "heroes", label: "Heróis" },
  { key: "olympiad", label: "Olympíada" },
  { key: "castles", label: "Cercos" },
];

const SUBTITLE: Record<TabKey, string> = {
  general: "O panorama vivo do reino de Aden.",
  pvp: "Os cem duelistas mais letais em combate justo.",
  pk: "Os cem assassinos mais temidos do servidor.",
  clans: "As ordens mais poderosas em ascensão.",
  heroes: "Os campeões coroados na arena da Olympíada.",
  olympiad: "Os cem nobres de maior pontuação na Olympíada.",
  castles: "O domínio dos castelos e os cercos que se aproximam.",
};

const RACES = ["Humano", "Elfo", "Dark Elf", "Orc", "Anão"] as const;

function raceName(race: number): string {
  return RACES[race] ?? "—";
}

function fmt(n: number | string): string {
  return Number(n).toLocaleString("pt-BR");
}

function pct(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

function isTab(v: string | undefined): v is TabKey {
  return (
    v === "general" ||
    v === "pvp" ||
    v === "pk" ||
    v === "clans" ||
    v === "heroes" ||
    v === "olympiad" ||
    v === "castles"
  );
}

/** Formata timestamp (ms) para data/hora pt-BR; "—" quando não agendado. */
function fmtSiege(ms: number): string {
  if (!ms || ms <= 0) return "—";
  return new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

/** Destaque dourado sutil no top 3, zebra no resto. */
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

/* ----------------------------------------------------------- general tab */

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="panel rounded-sm px-5 py-6 text-center">
      <div
        className={`font-display text-3xl md:text-4xl ${
          accent ? "text-glow-gold" : "text-[var(--color-gold-bright)]"
        }`}
      >
        {fmt(value)}
      </div>
      <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
        {accent && (
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ec26a] shadow-[0_0_6px_rgba(94,194,106,0.7)]" />
        )}
        {label}
      </div>
    </div>
  );
}

/** Barra de proporção simples (usada nas raças). */
function RatioBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const p = pct(value, total);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="text-[var(--color-muted)]">{label}</span>
        <span className="text-[0.7rem] uppercase tracking-[0.15em] text-[var(--color-faint)]">
          {fmt(value)} · {p.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-sm bg-[rgba(255,255,255,0.05)]">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${p}%`,
            background:
              "linear-gradient(90deg, var(--color-gold), var(--color-gold-bright))",
          }}
        />
      </div>
    </div>
  );
}

function GeneralTab({ stats }: { stats: OverallStats }) {
  const genderTotal = stats.genderMale + stats.genderFemale;
  const malePct = pct(stats.genderMale, genderTotal);
  const femalePct = pct(stats.genderFemale, genderTotal);
  const raceTotal = stats.byRace.reduce((n, r) => n + r.count, 0);

  return (
    <div className="space-y-8">
      {/* Cartões-resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="reveal" style={{ animationDelay: "0.02s" }}>
          <StatCard label="Contas" value={stats.accounts} />
        </div>
        <div className="reveal" style={{ animationDelay: "0.06s" }}>
          <StatCard label="Personagens" value={stats.characters} />
        </div>
        <div className="reveal" style={{ animationDelay: "0.1s" }}>
          <StatCard label="Clãs" value={stats.clans} />
        </div>
        <div className="reveal" style={{ animationDelay: "0.14s" }}>
          <StatCard label="Alianças" value={stats.alliances} />
        </div>
        <div className="reveal" style={{ animationDelay: "0.18s" }}>
          <StatCard label="Online agora" value={stats.online} accent />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Proporção de gênero */}
        <section className="panel reveal rounded-sm p-6" style={{ animationDelay: "0.22s" }}>
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-[var(--color-parchment)]">
            Gênero
          </h2>
          <div className="diamond-rule my-4">
            <span className="dia" />
          </div>

          {genderTotal === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-faint)]">
              Sem personagens registrados.
            </p>
          ) : (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-sm bg-[rgba(255,255,255,0.05)]">
                <div
                  className="h-full"
                  style={{
                    width: `${malePct}%`,
                    background:
                      "linear-gradient(90deg, var(--color-gold), var(--color-gold-bright))",
                  }}
                />
                <div
                  className="h-full"
                  style={{
                    width: `${femalePct}%`,
                    background:
                      "linear-gradient(90deg, rgba(200,67,59,0.7), var(--color-crimson))",
                  }}
                />
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ background: "var(--color-gold-bright)" }}
                  />
                  <span className="text-[var(--color-muted)]">
                    Masculino{" "}
                    <span className="text-[var(--color-parchment)]">
                      {fmt(stats.genderMale)}
                    </span>{" "}
                    <span className="text-[var(--color-faint)]">
                      ({malePct.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-sm"
                    style={{ background: "var(--color-crimson)" }}
                  />
                  <span className="text-[var(--color-muted)]">
                    Feminino{" "}
                    <span className="text-[var(--color-parchment)]">
                      {fmt(stats.genderFemale)}
                    </span>{" "}
                    <span className="text-[var(--color-faint)]">
                      ({femalePct.toFixed(1)}%)
                    </span>
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Proporção de raça */}
        <section className="panel reveal rounded-sm p-6" style={{ animationDelay: "0.26s" }}>
          <h2 className="font-display text-lg uppercase tracking-[0.15em] text-[var(--color-parchment)]">
            Raças
          </h2>
          <div className="diamond-rule my-4">
            <span className="dia" />
          </div>

          {raceTotal === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-faint)]">
              Sem personagens registrados.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.byRace.map((r) => (
                <RatioBar
                  key={r.race}
                  label={raceName(r.race)}
                  value={r.count}
                  total={raceTotal}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- tables */

function CharTable({
  rows,
  highlight,
}: {
  rows: CharRankRow[];
  highlight: "pvp" | "pk";
}) {
  return (
    <table className="w-full min-w-[640px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={`${TH} text-center`}>#</th>
          <th className={TH}>Personagem</th>
          <th className={TH}>Clã</th>
          <th className={TH}>Nível</th>
          <th className={TH}>{highlight === "pvp" ? "PvP" : "PK"}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const rank = i + 1;
          const stat = highlight === "pvp" ? r.pvpkills : r.pkkills;
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
              <td className={`${TD} text-[var(--color-muted)]`}>
                {r.clan_name ?? <span className="text-[var(--color-faint)]">—</span>}
              </td>
              <td className={`${TD} font-display text-[var(--color-muted)]`}>
                {r.level}
              </td>
              <td
                className={`${TD} font-display text-lg ${
                  highlight === "pvp"
                    ? "text-[var(--color-gold-bright)]"
                    : "text-[var(--color-crimson)]"
                }`}
              >
                {fmt(stat)}
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
          <th className={TH}>Aliança</th>
          <th className={TH}>Líder</th>
          <th className={TH}>Membros</th>
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
              <td className={`${TD} text-[var(--color-muted)]`}>
                {r.ally_name ?? <span className="text-[var(--color-faint)]">—</span>}
              </td>
              <td className={`${TD} text-[var(--color-muted)]`}>
                {r.leader ?? <span className="text-[var(--color-faint)]">—</span>}
              </td>
              <td className={`${TD} text-[var(--color-muted)]`}>{fmt(r.members)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function HeroTable({ rows }: { rows: HeroRow[] }) {
  return (
    <table className="w-full min-w-[640px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={`${TH} text-center`}>#</th>
          <th className={TH}>Personagem</th>
          <th className={TH}>Classe</th>
          <th className={TH}>Clã</th>
          <th className={TH}>Vezes Herói</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const rank = i + 1;
          return (
            <tr
              key={`${r.char_id}-${i}`}
              className={`border-b border-[var(--color-line)] transition-colors hover:bg-[rgba(201,162,75,0.05)] ${rowClass(
                rank
              )}`}
            >
              <RankCell rank={rank} />
              <td className={`${TD} font-semibold text-[var(--color-parchment)]`}>
                {r.char_name}
              </td>
              <td className={`${TD} text-[var(--color-muted)]`}>
                {className(r.class_id)}
              </td>
              <td className={`${TD} text-[var(--color-muted)]`}>
                {r.clan_name ?? (
                  <span className="text-[var(--color-faint)]">—</span>
                )}
              </td>
              <td className={`${TD} font-display text-lg text-[var(--color-gold-bright)]`}>
                {fmt(r.count)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function OlyTable({ rows }: { rows: OlyRow[] }) {
  return (
    <table className="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={`${TH} text-center`}>#</th>
          <th className={TH}>Personagem</th>
          <th className={TH}>Classe</th>
          <th className={TH}>Pontos</th>
          <th className={TH}>Vitórias / Derrotas</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const rank = i + 1;
          return (
            <tr
              key={`${r.char_id}-${i}`}
              className={`border-b border-[var(--color-line)] transition-colors hover:bg-[rgba(201,162,75,0.05)] ${rowClass(
                rank
              )}`}
            >
              <RankCell rank={rank} />
              <td className={`${TD} font-semibold text-[var(--color-parchment)]`}>
                {r.char_name}
              </td>
              <td className={`${TD} text-[var(--color-muted)]`}>
                {className(r.class_id)}
              </td>
              <td className={`${TD} font-display text-lg text-[var(--color-gold-bright)]`}>
                {fmt(r.olympiad_points)}
              </td>
              <td className={TD}>
                <span className="text-[#5ec26a]">{fmt(r.competitions_won)}</span>
                <span className="mx-1.5 text-[var(--color-faint)]">/</span>
                <span className="text-[var(--color-crimson)]">
                  {fmt(r.competitions_lost)}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CastleTable({ rows }: { rows: CastleStatus[] }) {
  return (
    <table className="w-full min-w-[640px] border-collapse text-sm">
      <thead>
        <tr className="border-b border-[var(--color-line)]">
          <th className={TH}>Castelo</th>
          <th className={TH}>Dono</th>
          <th className={TH}>Taxa %</th>
          <th className={TH}>Próx. Cerco</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            className="border-b border-[var(--color-line)] transition-colors hover:bg-[rgba(201,162,75,0.05)]"
          >
            <td className={`${TD} font-display text-lg text-[var(--color-gold-bright)]`}>
              {r.name}
            </td>
            <td className={TD}>
              {r.owner ? (
                <span className="font-semibold text-[var(--color-parchment)]">
                  {r.owner}
                </span>
              ) : (
                <span className="text-[var(--color-faint)]">NPC/Livre</span>
              )}
            </td>
            <td className={`${TD} font-display text-[var(--color-muted)]`}>
              {r.tax}%
            </td>
            <td className={`${TD} text-[var(--color-muted)]`}>
              {fmtSiege(r.siegeDate)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TableEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
      <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]" />
      <p className="max-w-md text-[var(--color-muted)]">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const s = await getSession();
  if (!s) redirect("/login");

  const sp = await searchParams;
  const tabParam = typeof sp.tab === "string" ? sp.tab : undefined;
  const active: TabKey = isTab(tabParam) ? tabParam : "general";

  // Busca só o necessário para a aba ativa.
  let stats: OverallStats | null = null;
  let charRows: CharRankRow[] = [];
  let clanRows: ClanRankRow[] = [];
  let heroRows: HeroRow[] = [];
  let olyRows: OlyRow[] = [];
  let castleRows: CastleStatus[] = [];

  if (active === "general") stats = await overallStats();
  else if (active === "pvp") charRows = await topByPvp(100);
  else if (active === "pk") charRows = await topByPk(100);
  else if (active === "clans") clanRows = await topClans(100);
  else if (active === "heroes") heroRows = await currentHeroes();
  else if (active === "olympiad") olyRows = await olympiadRanking(100);
  else castleRows = await castleStatus();

  return (
    <>
      <header className="reveal flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            Salão da Fama
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-4xl">
            <span className="text-glow-gold">Estatísticas</span>
          </h1>
          <p className="mt-2 max-w-xl text-[var(--color-muted)]">{SUBTITLE[active]}</p>
        </div>
      </header>

      {/* Abas (pílulas) */}
      <div
        className="reveal mt-7 flex flex-wrap gap-3"
        style={{ animationDelay: "0.06s" }}
      >
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              href={t.key === "general" ? "/stats" : `/stats?tab=${t.key}`}
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

      <div className="mt-7">
        {active === "general" && stats ? (
          <GeneralTab stats={stats} />
        ) : (
          (() => {
            // Conteúdo (tabela) + estado-vazio + rodapé de contagem por aba.
            let table: ReactNode = null;
            let empty = "";
            let footer = "";

            if (active === "pvp" || active === "pk") {
              empty = "Nenhum herói classificado ainda.";
              const n = charRows.length;
              footer =
                n === 0
                  ? ""
                  : `${n} jogador${n === 1 ? "" : "es"} classificado${n === 1 ? "" : "s"}`;
              if (n > 0)
                table = (
                  <CharTable rows={charRows} highlight={active as "pvp" | "pk"} />
                );
            } else if (active === "clans") {
              empty = "Nenhum clã classificado ainda.";
              const n = clanRows.length;
              footer =
                n === 0
                  ? ""
                  : `${n} clã${n === 1 ? "" : "s"} classificado${n === 1 ? "" : "s"}`;
              if (n > 0) table = <ClanTable rows={clanRows} />;
            } else if (active === "heroes") {
              empty = "Nenhum herói coroado ainda.";
              const n = heroRows.length;
              footer =
                n === 0 ? "" : `${n} herói${n === 1 ? "" : "s"} coroado${n === 1 ? "" : "s"}`;
              if (n > 0) table = <HeroTable rows={heroRows} />;
            } else if (active === "olympiad") {
              empty = "Nenhum nobre pontuou na Olympíada ainda.";
              const n = olyRows.length;
              footer =
                n === 0 ? "" : `${n} nobre${n === 1 ? "" : "s"} classificado${n === 1 ? "" : "s"}`;
              if (n > 0) table = <OlyTable rows={olyRows} />;
            } else {
              empty = "Nenhum castelo encontrado.";
              const n = castleRows.length;
              footer =
                n === 0 ? "" : `${n} castelo${n === 1 ? "" : "s"} sob domínio`;
              if (n > 0) table = <CastleTable rows={castleRows} />;
            }

            return (
              <>
                <div
                  className="panel panel-gold reveal rounded-sm"
                  style={{ animationDelay: "0.1s" }}
                >
                  {table === null ? (
                    <TableEmpty message={empty} />
                  ) : (
                    <div className="overflow-x-auto">{table}</div>
                  )}
                </div>

                {footer && (
                  <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-[var(--color-faint)]">
                    {footer}
                  </p>
                )}
              </>
            );
          })()
        )}
      </div>
    </>
  );
}
