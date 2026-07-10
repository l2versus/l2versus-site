import "server-only";
import { query } from "@/lib/db";
import type { TxKind } from "./economy";

export type Transaction = {
  id: number;
  kind: TxKind;
  amount: number;
  method: string | null;
  status: "pending" | "done" | "failed";
  description: string | null;
  created_at: Date | string;
};

/** Histórico do usuário, opcionalmente filtrado por tipo. Mais recentes primeiro. */
export function listTransactions(
  uid: number,
  kind?: TxKind,
  limit = 100
): Promise<Transaction[]> {
  if (kind) {
    return query<Transaction>(
      "SELECT id, kind, amount, method, status, description, created_at FROM web_transactions WHERE user_id = ? AND kind = ? ORDER BY id DESC LIMIT ?",
      [uid, kind, limit]
    );
  }
  return query<Transaction>(
    "SELECT id, kind, amount, method, status, description, created_at FROM web_transactions WHERE user_id = ? ORDER BY id DESC LIMIT ?",
    [uid, limit]
  );
}
