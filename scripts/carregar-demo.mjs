/**
 * Carrega o BANCO DE DEMONSTRAÇÃO: schema da rev + migrations do site + seed.
 *
 * Serve para os dois alvos:
 *   - ensaio local  -> cria/recria `l2versus_demo` no MariaDB desta máquina,
 *                      usando as credenciais do .env.local.
 *   - nuvem         -> se existir `.env.demo` (gitignored), usa ele e NÃO tenta
 *                      criar o banco (provedor gerenciado já entrega um).
 *
 * É destrutivo por natureza: cada arquivo começa com DROP/DELETE. Por isso
 * recusa rodar contra o banco de produção — ver a guarda logo abaixo.
 *
 * Uso: node scripts/carregar-demo.mjs
 */
import { createConnection } from "mysql2/promise";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function lerEnv(arquivo) {
  const caminho = resolve(raiz, arquivo);
  if (!existsSync(caminho)) return null;
  const env = {};
  for (const linha of readFileSync(caminho, "utf8").split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const naNuvem = existsSync(resolve(raiz, ".env.demo"));
const env = naNuvem ? lerEnv(".env.demo") : lerEnv(".env.local");
if (!env) {
  console.error("Preciso de .env.demo (nuvem) ou .env.local (ensaio local).");
  process.exit(1);
}

const alvo = {
  host: env.DB_HOST || "127.0.0.1",
  port: Number(env.DB_PORT || 3306),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  banco: naNuvem ? env.DB_NAME : "l2versus_demo",
  ssl: env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
};

/**
 * Guarda: este script apaga tabelas. Se alguém apontar o .env.demo para o
 * banco do servidor que está rodando, perde o servidor. O nome do banco de
 * produção é conhecido — recusar explicitamente custa uma linha.
 */
if (/^l2jversush5$|^l2versus$/i.test(alvo.banco)) {
  console.error(
    `RECUSADO: '${alvo.banco}' é o banco da rev em produção e este script apaga tabelas.\n` +
      "O banco de demonstração tem que ser um banco separado."
  );
  process.exit(1);
}

const arquivos = [
  "db/demo/schema-rev.sql",
  "db/migrations/001_web_users.sql",
  "db/migrations/002_cms.sql",
  "db/migrations/003_rmt.sql",
  "db/migrations/004_streams.sql",
  "db/demo/seed.sql",
];
// 005_port_h5.sql é pulado de propósito: ele só enxerta `site_user_id` em
// `accounts`, coluna que o schema-rev.sql já traz pronta (foi extraída do banco
// que já tinha a migration aplicada). Rodá-lo de novo seria inócuo, mas o
// ALTER ... ADD INDEX IF NOT EXISTS não existe em MySQL 8 — só em MariaDB —
// e quebraria o carregamento num provedor de nuvem que rode MySQL.

console.log(`Alvo: ${alvo.user}@${alvo.host}:${alvo.port}/${alvo.banco}`);

let con = await createConnection({
  host: alvo.host,
  port: alvo.port,
  user: alvo.user,
  password: alvo.password,
  ssl: alvo.ssl,
  multipleStatements: true,
});

// TiDB e MySQL gerenciado comum deixam criar database; quem não deixa
// (usuário sem privilégio) cai no catch e usa o banco que o provedor entregou.
try {
  await con.query(`CREATE DATABASE IF NOT EXISTS \`${alvo.banco}\`
                   CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
  console.log(`  banco ${alvo.banco} pronto`);
} catch (e) {
  console.log(`  (sem privilégio de CREATE DATABASE: ${e.code} — usando o existente)`);
}
await con.changeUser({ database: alvo.banco });

for (const arq of arquivos) {
  const sql = readFileSync(resolve(raiz, arq), "utf8");
  try {
    await con.query(sql);
    console.log(`  ok  ${arq}`);
  } catch (e) {
    // 1060/1061 = coluna/índice já existe. Acontece só ao RECARREGAR num MySQL 8
    // puro, que não entende o `ADD COLUMN IF NOT EXISTS` (MariaDB/TiDB) da
    // migration 002. É seguro seguir porque esses ALTERs são o ÚLTIMO statement
    // dos seus arquivos — nada depois deles é perdido quando o lote aborta.
    if (e.errno === 1060 || e.errno === 1061) {
      console.log(`  ok  ${arq} (já aplicado: ${e.sqlMessage})`);
      continue;
    }
    console.error(`  ERRO em ${arq}: ${e.sqlMessage ?? e.message}`);
    await con.end();
    process.exit(1);
  }
}

const [[{ chars }]] = await con.query("SELECT COUNT(*) AS chars FROM characters");
const [[{ users }]] = await con.query("SELECT COUNT(*) AS users FROM web_users");
const [[{ online }]] = await con.query(
  "SELECT COUNT(*) AS online FROM characters WHERE online = 1 AND accesslevel = 0"
);
await con.end();

console.log(`\nCarregado: ${chars} personagens (${online} online), ${users} usuários de site.`);
console.log("Login de demonstração: teste / teste@2026");
