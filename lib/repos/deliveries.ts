import "server-only";
import { query, execute } from "@/lib/db";

/**
 * Fila de entrega no jogo. Em vez de inserir em `items` (obj_id colide com o
 * IdFactory do servidor rodando), gravamos aqui; o servidor/rotina consome
 * 'pending' e entrega (ex.: via mail/items_delayed) marcando 'delivered'.
 */

export type Delivery = {
  id: number;
  char_obj_id: number;
  char_name: string;
  kind: "coins" | "pack" | "item";
  item_id: number | null;
  amount: number;
  payload: string | null;
  status: "pending" | "delivered" | "failed";
  created_at: Date | string;
  delivered_at: Date | string | null;
};

export async function queueDelivery(input: {
  uid: number;
  charObjId: number;
  charName: string;
  kind: "coins" | "pack" | "item";
  itemId?: number | null;
  amount?: number;
  payload?: unknown;
}): Promise<number> {
  const res = await execute(
    "INSERT INTO web_deliveries (user_id, char_obj_id, char_name, kind, item_id, amount, payload) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      input.uid,
      input.charObjId,
      input.charName,
      input.kind,
      input.itemId ?? null,
      input.amount ?? 1,
      input.payload ? JSON.stringify(input.payload) : null,
    ]
  );
  return res.insertId;
}

export function listDeliveries(uid: number, limit = 100): Promise<Delivery[]> {
  return query<Delivery>(
    "SELECT id, char_obj_id, char_name, kind, item_id, amount, payload, status, created_at, delivered_at FROM web_deliveries WHERE user_id = ? ORDER BY id DESC LIMIT ?",
    [uid, limit]
  );
}
