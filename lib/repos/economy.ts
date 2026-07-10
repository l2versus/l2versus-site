import "server-only";
import { pool, queryOne } from "@/lib/db";

/**
 * Economia VSCOIN do site (tabela web_users.balance) + histórico (web_transactions).
 * debit/credit são atômicos (transação SQL) e sempre registram no histórico.
 */

export type TxKind =
  | "topup"
  | "spend"
  | "referral_bonus"
  | "transfer_in"
  | "transfer_out"
  | "service"
  | "pack"
  | "send_to_game";

export async function getBalance(uid: number): Promise<number> {
  const row = await queryOne<{ balance: number }>(
    "SELECT balance FROM web_users WHERE id = ?",
    [uid]
  );
  return Number(row?.balance ?? 0);
}

/**
 * Debita `amount` (positivo) do saldo, de forma atômica. Falha se saldo < amount.
 * Registra transação com amount negativo.
 */
export async function debit(
  uid: number,
  amount: number,
  kind: TxKind,
  description: string,
  method: string | null = "internal"
): Promise<{ ok: boolean; balance?: number; error?: string }> {
  if (amount <= 0) return { ok: false, error: "Valor inválido." };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.execute(
      "UPDATE web_users SET balance = balance - ? WHERE id = ? AND balance >= ?",
      [amount, uid, amount]
    );
    if ((res as { affectedRows: number }).affectedRows === 0) {
      await conn.rollback();
      return { ok: false, error: "Saldo insuficiente." };
    }
    await conn.execute(
      "INSERT INTO web_transactions (user_id, kind, amount, method, status, description) VALUES (?, ?, ?, ?, 'done', ?)",
      [uid, kind, -Math.abs(amount), method, description]
    );
    const [rows] = await conn.execute(
      "SELECT balance FROM web_users WHERE id = ?",
      [uid]
    );
    await conn.commit();
    const balance = Number((rows as { balance: number }[])[0]?.balance ?? 0);
    return { ok: true, balance };
  } catch (e) {
    await conn.rollback();
    console.error("[economy.debit]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}

/** Credita `amount` (positivo) no saldo e registra transação positiva. */
export async function credit(
  uid: number,
  amount: number,
  kind: TxKind,
  description: string,
  method: string | null = "internal"
): Promise<{ ok: boolean; balance?: number; error?: string }> {
  if (amount <= 0) return { ok: false, error: "Valor inválido." };
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      "UPDATE web_users SET balance = balance + ? WHERE id = ?",
      [amount, uid]
    );
    await conn.execute(
      "INSERT INTO web_transactions (user_id, kind, amount, method, status, description) VALUES (?, ?, ?, ?, 'done', ?)",
      [uid, kind, Math.abs(amount), method, description]
    );
    const [rows] = await conn.execute(
      "SELECT balance FROM web_users WHERE id = ?",
      [uid]
    );
    await conn.commit();
    const balance = Number((rows as { balance: number }[])[0]?.balance ?? 0);
    return { ok: true, balance };
  } catch (e) {
    await conn.rollback();
    console.error("[economy.credit]", e);
    return { ok: false, error: "Erro no servidor." };
  } finally {
    conn.release();
  }
}
