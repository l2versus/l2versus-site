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
    // DB_SSL=true: exigido por MySQL gerenciado na nuvem (TiDB Cloud etc.),
    // que só aceita conexão TLS. rejectUnauthorized fica ligado de propósito:
    // esses provedores usam certificado de CA pública, e aceitar cert inválido
    // aqui abriria a porta para MITM na credencial do banco. O MariaDB local
    // da rev não usa TLS — basta não definir a variável.
    ssl:
      process.env.DB_SSL === "true"
        ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForDb._l2pool = pool;

/**
 * `LIMIT ?` / `OFFSET ?` NÃO sobrevivem a prepared statement fora do MariaDB.
 *
 * O MariaDB aceita o placeholder no LIMIT e converte sozinho. MySQL 8 e TiDB
 * não: devolvem ER_WRONG_ARGUMENTS ("Incorrect arguments to LIMIT") — medido
 * contra o TiDB, e falha tanto passando número quanto string, então não é
 * questão de converter o valor. Só o protocolo de TEXTO funciona, porque aí o
 * mysql2 interpola o valor já escapado e o servidor recebe `LIMIT 20` literal.
 *
 * Importa porque o site nasceu contra MariaDB: todo ranking usava LIMIT ? e
 * sumia em silêncio na vitrine (os repos têm try/catch tolerante, então a
 * página mostrava "ranking vazio" em vez de erro — parecia servidor novo, era
 * consulta quebrada). Resolver aqui conserta os 9 call-sites de uma vez e
 * continua correto no MariaDB de produção.
 */
const LIMITE_PARAMETRIZADO = /\b(limit|offset)\s+(\?|:[a-z_])/i;

/** SELECT tipado — retorna array de linhas. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: Record<string, unknown> | unknown[]
): Promise<T[]> {
  const [rows] = LIMITE_PARAMETRIZADO.test(sql)
    ? await pool.query(sql, params as never)
    : await pool.execute(sql, params as never);
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
