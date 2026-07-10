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

/** Top clãs por reputação (desempate por nível do clã). */
export function topClans(limit = 50): Promise<ClanRankRow[]> {
  return safeQuery<ClanRankRow>(
    `SELECT c.clan_id, c.clan_name, c.clan_level, c.reputation_score,
            c.ally_name, c.hasCastle,
            (SELECT COUNT(*) FROM characters m WHERE m.clanid = c.clan_id) AS members,
            (SELECT ch.char_name FROM characters ch WHERE ch.obj_Id = c.leader_id) AS leader
       FROM clan_data c
      ORDER BY c.reputation_score DESC, c.clan_level DESC
      LIMIT ?`,
    [limit]
  );
}
