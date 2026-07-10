import "server-only";
import mysql from "mysql2/promise";

/**
 * Pool de conexao com o MariaDB da rev L2 (l2versus).
 * Reutilizado entre hot-reloads em dev via globalThis.
 */
const globalForDb = globalThis as unknown as { _l2pool?: mysql.Pool };

export const pool: mysql.Pool =
  globalForDb._l2pool ??
  mysql.createPool({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "l2versus",
    connectionLimit: 10,
    charset: "utf8mb4",
    namedPlaceholders: true,
  });

if (process.env.NODE_ENV !== "production") globalForDb._l2pool = pool;

/** SELECT tipado — retorna array de linhas. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, unknown> | unknown[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params as never);
  return rows as T[];
}

/** SELECT de uma linha (ou null). */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, unknown> | unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/** INSERT/UPDATE/DELETE — retorna metadados (insertId, affectedRows). */
export async function execute(
  sql: string,
  params?: Record<string, unknown> | unknown[]
): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params as never);
  return result as mysql.ResultSetHeader;
}
