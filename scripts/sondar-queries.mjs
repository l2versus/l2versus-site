/**
 * Cronometra as queries que a home dispara, uma a uma.
 *
 * A home levava 80s+ em "application-code" com o banco respondendo SELECT 1
 * em 1,5s e o Discord em 0,5s. Este script isola qual chamada come o tempo,
 * em vez de deduzir por eliminacao.
 *
 *   node scripts/sondar-queries.mjs
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const env = {};
for (const arq of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), arq);
  if (!fs.existsSync(p)) continue;
  for (const linha of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

const pool = mysql.createPool({
  host: env.DB_HOST ?? "127.0.0.1",
  port: Number(env.DB_PORT ?? 3306),
  user: env.DB_USER ?? "root",
  password: env.DB_PASSWORD ?? "",
  database: env.DB_NAME ?? "l2versus",
  connectionLimit: 10,
  charset: "utf8mb4",
  namedPlaceholders: true, // igual ao lib/db.ts
});

const LEGIT = "c.accesslevel = 0 AND (c.deletetime = 0 OR c.deletetime IS NULL)";
const CHAR_SELECT = `
  SELECT c.char_name, c.level, c.exp, c.race, c.clanid,
         c.online, c.onlinetime, c.pvpkills, c.pkkills,
         cd.clan_name
    FROM characters c
    LEFT JOIN clan_data cd ON cd.clan_id = c.clanid
   WHERE ${LEGIT}`;

const casos = [
  ["onlineCount", `SELECT COUNT(*) AS n FROM characters c WHERE ${LEGIT} AND c.online = 1`, []],
  ["topByPvp(7)", `${CHAR_SELECT} ORDER BY c.pvpkills DESC, c.level DESC LIMIT ?`, [7]],
  ["contagem characters", "SELECT COUNT(*) AS n FROM characters", []],
];

for (const [nome, sql, params] of casos) {
  const t = Date.now();
  try {
    const [linhas] = await pool.execute(sql, params);
    const n = Array.isArray(linhas) ? linhas.length : 0;
    console.log(`${nome.padEnd(22)} ok   ${String(Date.now() - t).padStart(7)}ms  (${n} linha(s))`);
  } catch (e) {
    console.log(`${nome.padEnd(22)} FALHOU ${e.code ?? ""} ${e.message}  (${Date.now() - t}ms)`);
  }
}

/* repetir onlineCount: mede se o custo e por chamada ou so na 1a (handshake) */
for (let i = 0; i < 3; i++) {
  const t = Date.now();
  try {
    await pool.execute(`SELECT COUNT(*) AS n FROM characters c WHERE ${LEGIT} AND c.online = 1`, []);
    console.log(`onlineCount repeticao ${i + 1}: ${Date.now() - t}ms`);
  } catch (e) {
    console.log(`onlineCount repeticao ${i + 1}: FALHOU ${e.code}`);
  }
}

await pool.end();
