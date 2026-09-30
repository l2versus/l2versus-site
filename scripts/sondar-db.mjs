/**
 * Sonda de conexao com o MariaDB — diagnostico, nao expoe credenciais.
 *
 * Imprime SO: host/porta/base (nao a senha), quanto tempo o TCP leva para
 * abrir e quanto tempo um SELECT 1 leva. Existe porque uma pagina que demora
 * 2 minutos pode ser compilacao, pool pendurado ou DNS — e chutar qual e
 * desperdicio.
 *
 *   node scripts/sondar-db.mjs
 */
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

// .env.local na marra: este script roda fora do Next
const env = {};
for (const arquivo of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), arquivo);
  if (!fs.existsSync(p)) continue;
  for (const linha of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

const host = env.DB_HOST ?? "127.0.0.1";
const port = Number(env.DB_PORT ?? 3306);
const base = env.DB_NAME ?? "l2versus";
const user = env.DB_USER ?? "root";

console.log(`host=${host}  port=${port}  database=${base}  user=${user}`);
console.log(`senha definida: ${env.DB_PASSWORD ? "sim" : "NAO"}`);

/* 1) o TCP abre? */
const t0 = Date.now();
const tcp = await new Promise((resolve) => {
  const s = new net.Socket();
  s.setTimeout(5000);
  s.once("connect", () => { s.destroy(); resolve("ok"); });
  s.once("timeout", () => { s.destroy(); resolve("TIMEOUT (5s)"); });
  s.once("error", (e) => { s.destroy(); resolve(`ERRO ${e.code}`); });
  s.connect(port, host);
});
console.log(`TCP  : ${tcp}  (${Date.now() - t0}ms)`);

/* 2) o handshake MySQL fecha e um SELECT responde? */
const t1 = Date.now();
try {
  const mysql = await import("mysql2/promise");
  const con = await mysql.createConnection({
    host, port, user, password: env.DB_PASSWORD ?? "", database: base,
    connectTimeout: 5000,
  });
  const [linhas] = await con.query("SELECT 1 AS ok");
  await con.end();
  console.log(`MySQL: ok, SELECT 1 => ${JSON.stringify(linhas)}  (${Date.now() - t1}ms)`);
} catch (e) {
  console.log(`MySQL: FALHOU ${e.code ?? ""} ${e.message}  (${Date.now() - t1}ms)`);
}
