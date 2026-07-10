import "server-only";
import { query, queryOne } from "@/lib/db";

/**
 * Repositório de estatísticas globais — lê direto da base da rev (l2versus).
 *
 * Mesma filosofia de rankings.ts: cada consulta é tolerante a falha e devolve
 * 0 / [] em caso de erro (a página renderiza estado vazio) logando em console.
 *
 * Filtro obrigatório de jogadores legítimos: accesslevel = 0 e personagem não
 * deletado. GMs (accesslevel 7) NUNCA entram nas contagens de personagem.
 */

/** Contagem de personagens por raça (0 human, 1 elf, 2 dark elf, 3 orc, 4 dwarf). */
export interface RaceCount {
  race: number;
  count: number;
}

export interface OverallStats {
  accounts: number;
  characters: number;
  clans: number;
  alliances: number;
  online: number;
  genderMale: number;
  genderFemale: number;
  byRace: RaceCount[];
}

/** Filtro de personagem legítimo (sem GM, sem personagem deletado). */
const LEGIT = "accesslevel = 0 AND (deletetime = 0 OR deletetime IS NULL)";

/** COUNT tolerante — devolve 0 se a query falhar. */
async function safeCount(sql: string): Promise<number> {
  try {
    const row = await queryOne<{ n: number | string }>(sql);
    return Number(row?.n ?? 0);
  } catch (err) {
    console.error("[stats] count falhou:", err);
    return 0;
  }
}

/** Distribuição por raça, tolerante — devolve [] se falhar. */
async function safeRaces(): Promise<RaceCount[]> {
  try {
    const rows = await query<{ race: number | string; count: number | string }>(
      `SELECT race, COUNT(*) AS count
         FROM characters
        WHERE ${LEGIT}
        GROUP BY race
        ORDER BY race`
    );
    return rows.map((r) => ({ race: Number(r.race), count: Number(r.count) }));
  } catch (err) {
    console.error("[stats] byRace falhou:", err);
    return [];
  }
}

/** Panorama geral do servidor. Cada métrica é independente e tolerante. */
export async function overallStats(): Promise<OverallStats> {
  const [
    accounts,
    characters,
    clans,
    alliances,
    online,
    genderMale,
    genderFemale,
    byRace,
  ] = await Promise.all([
    safeCount(`SELECT COUNT(*) AS n FROM accounts`),
    safeCount(`SELECT COUNT(*) AS n FROM characters WHERE ${LEGIT}`),
    safeCount(`SELECT COUNT(*) AS n FROM clan_data`),
    safeCount(`SELECT COUNT(DISTINCT ally_id) AS n FROM clan_data WHERE ally_id > 0`),
    safeCount(`SELECT COUNT(*) AS n FROM characters WHERE online = 1 AND ${LEGIT}`),
    safeCount(`SELECT COUNT(*) AS n FROM characters WHERE sex = 0 AND ${LEGIT}`),
    safeCount(`SELECT COUNT(*) AS n FROM characters WHERE sex = 1 AND ${LEGIT}`),
    safeRaces(),
  ]);

  return {
    accounts,
    characters,
    clans,
    alliances,
    online,
    genderMale,
    genderFemale,
    byRace,
  };
}
