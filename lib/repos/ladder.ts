import "server-only";
import { query } from "@/lib/db";

/**
 * Rankings "extras" (acima do Lin2Web) lidos direto da rev:
 * Heróis atuais, ranking de Olympíada e lojas offline (offline trade).
 * Toda função é tolerante a falha (retorna [] e loga).
 *
 * PORT H5: além das renomeações de coluna (charId), este arquivo tinha DUAS
 * diferenças de comportamento entre Interlude e High Five — ver os comentários
 * em currentHeroes() e offlineStores(). Não eram simples alias.
 */

async function safe<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  try {
    return await query<T>(sql, params);
  } catch (e) {
    console.error("[ladder] query falhou:", e);
    return [];
  }
}

/* ---------------- Heróis ---------------- */
export type HeroRow = {
  char_id: number;
  char_name: string;
  class_id: number;
  count: number;
  clan_name: string | null;
};

/**
 * PORT H5 — a tabela `heroes` do Mobius NÃO tem a coluna `active` que a rev
 * Interlude tinha. No H5 a tabela guarda os heróis do período corrente e é
 * limpa/repovoada a cada virada de Olympíada, então "estar na tabela" já é o
 * critério de herói ativo. O filtro `WHERE h.active = 1` foi removido — mantê-lo
 * traduzido para `claimed` seria errado: `claimed` marca quem já resgatou o
 * circlet/recompensa, não quem é herói.
 */
export function currentHeroes(): Promise<HeroRow[]> {
  return safe<HeroRow>(
    `SELECT h.charId AS char_id, c.char_name, h.class_id, h.count, cd.clan_name
       FROM heroes h
       JOIN characters c ON c.charId = h.charId
       LEFT JOIN clan_data cd ON cd.clan_id = c.clanid
      ORDER BY h.count DESC, c.char_name ASC`
  );
}

/* ---------------- Olympíada ---------------- */
export type OlyRow = {
  char_id: number;
  char_name: string;
  class_id: number;
  olympiad_points: number;
  competitions_done: number;
  competitions_won: number;
  competitions_lost: number;
};

export function olympiadRanking(limit = 100): Promise<OlyRow[]> {
  return safe<OlyRow>(
    `SELECT o.charId AS char_id, c.char_name, o.class_id, o.olympiad_points,
            o.competitions_done, o.competitions_won, o.competitions_lost
       FROM olympiad_nobles o
       JOIN characters c ON c.charId = o.charId
      ORDER BY o.olympiad_points DESC, o.competitions_won DESC
      LIMIT ?`,
    [limit]
  );
}

/* ---------------- Lojas offline (market) ---------------- */
export type StoreItem = {
  item: number;
  count: number;
  price: number;
  /**
   * PORT H5: sempre 0. A tabela `character_offline_trade_items` do Mobius High
   * Five guarda só (charId, item, count, price) — não persiste o encantamento,
   * que a rev Interlude gravava. O MarketClient só desenha o selo "+N" quando
   * enchant > 0, então a ausência degrada sem quebrar layout nem mentir um "+0"
   * na tela de um item que pode estar encantado.
   */
  enchant: number;
};
export type OfflineStore = {
  charId: number;
  char_name: string;
  /** 1=venda, 3=compra, etc. (offline trade type da rev) */
  type: number;
  title: string;
  items: StoreItem[];
};

export async function offlineStores(limit = 60): Promise<OfflineStore[]> {
  const stores = await safe<{
    charId: number;
    char_name: string;
    type: number;
    title: string;
  }>(
    `SELECT t.charId, c.char_name, t.type, t.title
       FROM character_offline_trade t
       JOIN characters c ON c.charId = t.charId
      ORDER BY t.time DESC
      LIMIT ?`,
    [limit]
  );
  if (stores.length === 0) return [];

  const ids = stores.map((s) => s.charId);
  const placeholders = ids.map(() => "?").join(",");
  // PORT H5: sem `enchant` no SELECT — a coluna não existe nesta tabela no
  // Mobius High Five (ver o comentário em StoreItem.enchant).
  const items = await safe<{
    charId: number;
    item: number;
    count: number;
    price: number;
  }>(
    `SELECT charId, item, count, price
       FROM character_offline_trade_items
      WHERE charId IN (${placeholders})`,
    ids
  );

  const byChar = new Map<number, StoreItem[]>();
  for (const it of items) {
    const arr = byChar.get(it.charId) ?? [];
    arr.push({
      item: it.item,
      count: Number(it.count),
      price: Number(it.price),
      enchant: 0,
    });
    byChar.set(it.charId, arr);
  }

  return stores.map((s) => ({
    charId: s.charId,
    char_name: s.char_name,
    type: s.type,
    title: s.title,
    items: byChar.get(s.charId) ?? [],
  }));
}
