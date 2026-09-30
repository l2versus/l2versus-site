import "server-only";
import { query } from "@/lib/db";

/**
 * Repositório de rankings — lê direto da base da rev (l2versus, MariaDB).
 *
 * Filtro obrigatório de jogadores legítimos: accesslevel = 0 e personagem
 * não deletado. GMs (accesslevel 7) NUNCA aparecem nos rankings.
 *
 * Toda função é tolerante a falha: se a conexão cair, devolve [] (a página
 * renderiza o estado vazio) e o erro sai em console.error.
 */

/** Linha de ranking de personagem (nível / pvp / pk). */
export interface CharRankRow {
  char_name: string;
  level: number;
  /** BIGINT — usado só como desempate na ordenação, não é exibido. */
  exp: number | string;
  race: number;
  clanid: number;
  clan_name: string | null;
  online: number;
  onlinetime: number;
  pvpkills: number;
  pkkills: number;
}

/** Linha de ranking de clã. */
export interface ClanRankRow {
  clan_id: number;
  clan_name: string;
  clan_level: number;
  reputation_score: number;
  ally_name: string | null;
  hasCastle: number;
  members: number;
  leader: string | null;
}

/** Filtro de jogador legítimo (sem GM, sem personagem deletado). */
const LEGIT = "c.accesslevel = 0 AND (c.deletetime = 0 OR c.deletetime IS NULL)";

/** Colunas base de personagem + nome do clã via LEFT JOIN. */
const CHAR_SELECT = `
  SELECT c.char_name, c.level, c.exp, c.race, c.clanid,
         c.online, c.onlinetime, c.pvpkills, c.pkkills,
         cd.clan_name
    FROM characters c
    LEFT JOIN clan_data cd ON cd.clan_id = c.clanid
   WHERE ${LEGIT}`;

async function safeQuery<T>(sql: string, params: unknown[]): Promise<T[]> {
  try {
    return await query<T>(sql, params);
  } catch (err) {
    console.error("[rankings] query falhou:", err);
    return [];
  }
}

/** Top por nível (desempate por exp). */
export function topByLevel(limit = 100): Promise<CharRankRow[]> {
  return safeQuery<CharRankRow>(
    `${CHAR_SELECT} ORDER BY c.level DESC, c.exp DESC LIMIT ?`,
    [limit]
  );
}

/** Top por PvP kills (desempate por nível). */
export function topByPvp(limit = 100): Promise<CharRankRow[]> {
  return safeQuery<CharRankRow>(
    `${CHAR_SELECT} ORDER BY c.pvpkills DESC, c.level DESC LIMIT ?`,
    [limit]
  );
}

/** Top por PK kills (desempate por nível). */
export function topByPk(limit = 100): Promise<CharRankRow[]> {
  return safeQuery<CharRankRow>(
    `${CHAR_SELECT} ORDER BY c.pkkills DESC, c.level DESC LIMIT ?`,
    [limit]
  );
}

/** Quantos jogadores legítimos estão online agora (inclui fake players). */
export async function onlineCount(): Promise<number> {
  const rows = await safeQuery<{ n: number | string }>(
    `SELECT COUNT(*) AS n FROM characters c WHERE ${LEGIT} AND c.online = 1`,
    []
  );
  return Number(rows[0]?.n ?? 0);
}

/** Linha de castelo (tabela castle não tem nome — id 1..9 mapeado no front). */
export interface CastleRow {
  id: number;
  currentTaxPercent: number;
  treasury: number | string;
  siegeDate: number | string;
  clan_name: string | null;
  ally_name: string | null;
}

/** Castelos de Aden + clã dono (clan_data.hasCastle). */
export function castles(): Promise<CastleRow[]> {
  return safeQuery<CastleRow>(
    `SELECT c.id, c.taxPercent AS currentTaxPercent, c.treasury, c.siegeDate,
            cd.clan_name, cd.ally_name
       FROM castle c
       LEFT JOIN clan_data cd ON cd.hasCastle = c.id
      ORDER BY c.id`,
    []
  );
}

/** Top clãs por reputação (desempate por nível do clã). */
export function topClans(limit = 50): Promise<ClanRankRow[]> {
  return safeQuery<ClanRankRow>(
    `SELECT c.clan_id, c.clan_name, c.clan_level, c.reputation_score,
            c.ally_name, c.hasCastle,
            (SELECT COUNT(*) FROM characters m WHERE m.clanid = c.clan_id) AS members,
            (SELECT ch.char_name FROM characters ch WHERE ch.charId = c.leader_id) AS leader
       FROM clan_data c
      ORDER BY c.reputation_score DESC, c.clan_level DESC
      LIMIT ?`,
    [limit]
  );
}
