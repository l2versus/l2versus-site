import "server-only";
import { pool, query, queryOne, execute } from "@/lib/db";

/**
 * RMT Market — núcleo. REGRAS DE SEGURANÇA:
 *  - O site NUNCA move itens na tabela `items` do servidor rodando. Ele grava
 *    ops em `rmt_item_ops` (escrow/deliver/restore); um worker/NPC do servidor
 *    consome com guarda de offline. Evita corromper obj_id/estado.
 *  - Comissão e valores são SEMPRE derivados no servidor (nunca do cliente).
 *  - A liquidação (settleSale) é atômica e credita o vendedor após a comissão.
 *  - Pagamento em USD do comprador e saque do vendedor são seams de provedor.
 */

export const COMMISSION_PCT = 12;

export type SellerItem = {
  object_id: number;
  item_id: number;
  enchant: number;
  count: number;
  char_obj_id: number;
  char_name: string;
  online: number;
};

export type Listing = {
  id: number;
  seller_uid: number;
  seller_char_name: string;
  item_object_id: number;
  item_id: number;
  enchant: number;
  count: number;
  price_cents: number;
  commission_pct: number;
  status: string;
  created_at: Date | string;
};

export type Wallet = {
  balance_cents: number;
  pending_cents: number;
  lifetime_cents: number;
};

/** Itens negociáveis das contas do usuário (inventário/warehouse). */
export function listSellerItems(uid: number): Promise<SellerItem[]> {
  return query<SellerItem>(
    `SELECT i.object_id, i.item_id, i.enchant_level AS enchant, i.count,
            c.obj_Id AS char_obj_id, c.char_name, c.online
       FROM items i
       JOIN characters c ON c.obj_Id = i.owner_id
       JOIN accounts a ON a.login COLLATE utf8mb4_general_ci = c.account_name
      WHERE a.site_user_id = ?
        AND i.loc IN ('INVENTORY','WAREHOUSE')
        AND (c.deletetime = 0 OR c.deletetime IS NULL)
      ORDER BY i.item_id`,
    [uid]
  );
}

/** Vitrine: anúncios ativos (opcionalmente escondendo os do próprio usuário). */
export function browseListings(limit = 100): Promise<Listing[]> {
  return query<Listing>(
    `SELECT id, seller_uid, seller_char_name, item_object_id, item_id, enchant,
            count, price_cents, commission_pct, status, created_at
       FROM rmt_listings WHERE status = 'active' ORDER BY id DESC LIMIT ?`,
    [limit]
  );
}

/** Meus anúncios (todos os status). */
export function myListings(uid: number): Promise<Listing[]> {
  return query<Listing>(
    `SELECT id, seller_uid, seller_char_name, item_object_id, item_id, enchant,
            count, price_cents, commission_pct, status, created_at
       FROM rmt_listings WHERE seller_uid = ? ORDER BY id DESC`,
    [uid]
  );
}

async function itemOwnedBy(
  uid: number,
  objectId: number
): Promise<SellerItem | null> {
  return queryOne<SellerItem>(
    `SELECT i.object_id, i.item_id, i.enchant_level AS enchant, i.count,
            c.obj_Id AS char_obj_id, c.char_name, c.online
       FROM items i
       JOIN characters c ON c.obj_Id = i.owner_id
       JOIN accounts a ON a.login COLLATE utf8mb4_general_ci = c.account_name
      WHERE a.site_user_id = ? AND i.object_id = ?
        AND i.loc IN ('INVENTORY','WAREHOUSE') LIMIT 1`,
    [uid, objectId]
  );
}

/** Cria um anúncio + enfileira o escrow (servidor/NPC executa a retirada segura). */
export async function createListing(
  uid: number,
  objectId: number,
  priceCents: number
): Promise<{ ok: boolean; error?: string; id?: number }> {
  if (!Number.isInteger(priceCents) || priceCents < 100)
    return { ok: false, error: "Preço mínimo de US$ 1,00." };

  const item = await itemOwnedBy(uid, objectId);
  if (!item) return { ok: false, error: "Item não encontrado ou não é seu." };
  if (item.online === 1)
    return { ok: false, error: "O personagem precisa estar offline para anunciar." };

  const dup = await queryOne<{ id: number }>(
    "SELECT id FROM rmt_listings WHERE item_object_id = ? AND status IN ('pending_escrow','active','sold','delivering') LIMIT 1",
    [objectId]
  );
  if (dup) return { ok: false, error: "Este item já está anunciado." };

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.execute(
      `INSERT INTO rmt_listings
        (seller_uid, seller_char_obj_id, seller_char_name, item_object_id, item_id, enchant, count, price_cents, commission_pct, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [uid, item.char_obj_id, item.char_name, item.object_id, item.item_id, item.enchant, item.count, priceCents, COMMISSION_PCT]
    );
    const id = (res as { insertId: number }).insertId;
    await conn.execute(
      "INSERT INTO rmt_item_ops (listing_id, op, item_object_id, from_char_obj_id) VALUES (?, 'escrow', ?, ?)",
      [id, item.object_id, item.char_obj_id]
    );
    await conn.commit();
    return { ok: true, id };
  } catch (e) {
    await conn.rollback();
    console.error("[rmt.createListing]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

/** Cancela um anúncio próprio e enfileira a devolução do item. */
export async function cancelListing(
  uid: number,
  listingId: number
): Promise<{ ok: boolean; error?: string }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT id, seller_char_obj_id, item_object_id, status FROM rmt_listings WHERE id = ? AND seller_uid = ? FOR UPDATE",
      [listingId, uid]
    );
    const l = (rows as { seller_char_obj_id: number; item_object_id: number; status: string }[])[0];
    if (!l) { await conn.rollback(); return { ok: false, error: "Anúncio não encontrado." }; }
    if (l.status !== "active" && l.status !== "pending_escrow") {
      await conn.rollback();
      return { ok: false, error: "Só dá para cancelar anúncios ativos." };
    }
    await conn.execute("UPDATE rmt_listings SET status = 'cancelled' WHERE id = ?", [listingId]);
    await conn.execute(
      "INSERT INTO rmt_item_ops (listing_id, op, item_object_id, to_char_obj_id) VALUES (?, 'restore', ?, ?)",
      [listingId, l.item_object_id, l.seller_char_obj_id]
    );
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    console.error("[rmt.cancelListing]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

/**
 * Liquida uma venda (chamada após o pagamento USD confirmado — seam de gateway).
 * Atômico: marca vendido, credita o vendedor (100% - comissão), enfileira a
 * entrega do item ao personagem do comprador. Comissão fica com a casa.
 */
export async function settleSale(
  listingId: number,
  buyerUid: number,
  buyerCharObjId: number
): Promise<{ ok: boolean; error?: string; sellerNetCents?: number; houseCents?: number }> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(
      "SELECT * FROM rmt_listings WHERE id = ? FOR UPDATE",
      [listingId]
    );
    const l = (rows as {
      seller_uid: number; item_object_id: number; price_cents: number;
      commission_pct: number; status: string;
    }[])[0];
    if (!l) { await conn.rollback(); return { ok: false, error: "Anúncio inexistente." }; }
    if (l.status !== "active") { await conn.rollback(); return { ok: false, error: "Anúncio indisponível." }; }
    if (l.seller_uid === buyerUid) { await conn.rollback(); return { ok: false, error: "Não pode comprar o próprio item." }; }

    const houseCents = Math.round((l.price_cents * l.commission_pct) / 100);
    const sellerNet = l.price_cents - houseCents;

    await conn.execute(
      "UPDATE rmt_listings SET status = 'delivering', buyer_uid = ?, buyer_char_obj_id = ?, sold_at = CURRENT_TIMESTAMP WHERE id = ?",
      [buyerUid, buyerCharObjId, listingId]
    );
    // carteira do vendedor (upsert)
    await conn.execute(
      `INSERT INTO rmt_wallet (user_id, balance_cents, lifetime_cents)
         VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE balance_cents = balance_cents + VALUES(balance_cents),
                               lifetime_cents = lifetime_cents + VALUES(lifetime_cents)`,
      [l.seller_uid, sellerNet, sellerNet]
    );
    // entrega do item ao comprador (worker/NPC executa)
    await conn.execute(
      "INSERT INTO rmt_item_ops (listing_id, op, item_object_id, to_char_obj_id) VALUES (?, 'deliver', ?, ?)",
      [listingId, l.item_object_id, buyerCharObjId]
    );
    await conn.commit();
    return { ok: true, sellerNetCents: sellerNet, houseCents };
  } catch (e) {
    await conn.rollback();
    console.error("[rmt.settleSale]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

/** Carteira USD do vendedor. */
export async function getWallet(uid: number): Promise<Wallet> {
  const row = await queryOne<Wallet>(
    "SELECT balance_cents, pending_cents, lifetime_cents FROM rmt_wallet WHERE user_id = ?",
    [uid]
  );
  return {
    balance_cents: Number(row?.balance_cents ?? 0),
    pending_cents: Number(row?.pending_cents ?? 0),
    lifetime_cents: Number(row?.lifetime_cents ?? 0),
  };
}

/** Pede um saque: move do saldo p/ pendente e registra (liquidação = seam). */
export async function requestPayout(
  uid: number,
  amountCents: number,
  method: string,
  destination: string
): Promise<{ ok: boolean; error?: string }> {
  if (amountCents < 500) return { ok: false, error: "Saque mínimo de US$ 5,00." };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.execute(
      "UPDATE rmt_wallet SET balance_cents = balance_cents - ?, pending_cents = pending_cents + ? WHERE user_id = ? AND balance_cents >= ?",
      [amountCents, amountCents, uid, amountCents]
    );
    if ((res as { affectedRows: number }).affectedRows === 0) {
      await conn.rollback();
      return { ok: false, error: "Saldo insuficiente." };
    }
    await conn.execute(
      "INSERT INTO rmt_payouts (user_id, amount_cents, method, destination) VALUES (?, ?, ?, ?)",
      [uid, amountCents, method, destination]
    );
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    console.error("[rmt.requestPayout]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

export function listPayouts(uid: number) {
  return query(
    "SELECT id, amount_cents, method, destination, status, created_at FROM rmt_payouts WHERE user_id = ? ORDER BY id DESC",
    [uid]
  );
}
