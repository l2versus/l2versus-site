import "server-only";
import { query } from "@/lib/db";

/**
 * Rankings "extras" (acima do Lin2Web) lidos direto da rev:
 * Heróis atuais, ranking de Olympíada e lojas offline (offline trade).
 * Toda função é tolerante a falha (retorna [] e loga).
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

export function currentHeroes(): Promise<HeroRow[]> {
  return safe<HeroRow>(
    `SELECT h.char_id, c.char_name, h.class_id, h.count, cd.clan_name
       FROM heroes h
       JOIN characters c ON c.obj_Id = h.char_id
       LEFT JOIN clan_data cd ON cd.clan_id = c.clanid
      WHERE h.active = 1
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
    `SELECT o.char_id, c.char_name, o.class_id, o.olympiad_points,
            o.competitions_done, o.competitions_won, o.competitions_lost
       FROM olympiad_nobles o
       JOIN characters c ON c.obj_Id = o.char_id
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
       JOIN characters c ON c.obj_Id = t.charId
      ORDER BY t.time DESC
      LIMIT ?`,
    [limit]
  );
  if (stores.length === 0) return [];

  const ids = stores.map((s) => s.charId);
  const placeholders = ids.map(() => "?").join(",");
  const items = await safe<{
    charId: number;
    item: number;
    count: number;
    price: number;
    enchant: number;
  }>(
    `SELECT charId, item, count, price, enchant
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
      enchant: Number(it.enchant),
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
