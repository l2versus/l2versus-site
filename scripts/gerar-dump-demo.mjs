/**
 * Gera o SQL do BANCO DE DEMONSTRAÇÃO (db/demo/schema-rev.sql).
 *
 * Por que existe: o site lê o MariaDB da rev em runtime (ranking, online,
 * login, painel inteiro). Esse MariaDB vive na máquina do servidor e a nuvem
 * não o alcança. Para uma vitrine hospedada (Vercel) o caminho é um MySQL
 * próprio, vazio, com o MESMO schema — daí o `SHOW CREATE TABLE` aqui, em vez
 * de alguém redigitar as colunas de cabeça e descobrir a divergência só quando
 * uma query quebrar em produção.
 *
 * Só extrai ESTRUTURA. Nenhuma linha de dado real sai daqui: os dados de
 * demonstração são inventados em db/demo/seed.sql.
 *
 * Uso: node scripts/gerar-dump-demo.mjs
 */
import { createConnection } from "mysql2/promise";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Lê .env.local sem depender de pacote externo. */
function carregarEnv() {
  const env = {};
  let bruto;
  try {
    bruto = readFileSync(resolve(raiz, ".env.local"), "utf8");
  } catch {
    console.error("Não achei .env.local — copie de .env.example e preencha.");
    process.exit(1);
  }
  for (const linha of bruto.split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

/**
 * Tabelas da REV que o site consulta. Levantadas de lib/repos/*.ts — se um
 * repositório novo tocar numa tabela nova, ela precisa entrar aqui, senão a
 * demo sobe e só quebra na página que usa a tabela faltante.
 */
const TABELAS_REV = [
  "accounts",
  "characters",
  "clan_data",
  "castle",
  "heroes",
  "items",
  "olympiad_nobles",
  "character_offline_trade",
  "character_offline_trade_items",
];

const env = carregarEnv();
const con = await createConnection({
  host: env.DB_HOST || "127.0.0.1",
  port: Number(env.DB_PORT || 3306),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

const partes = [
  "-- Schema das tabelas da REV usadas pelo site (gerado por",
  "-- scripts/gerar-dump-demo.mjs a partir do MariaDB de desenvolvimento).",
  "-- NÃO editar à mão: regenerar. Contém só estrutura, zero dado real.",
  "",
  "SET FOREIGN_KEY_CHECKS = 0;",
  "",
];

const ausentes = [];
for (const t of TABELAS_REV) {
  try {
    const [linhas] = await con.query(`SHOW CREATE TABLE \`${t}\``);
    let ddl = linhas[0]["Create Table"];
    // AUTO_INCREMENT=N carrega o estado do banco de origem; irrelevante e ruidoso.
    ddl = ddl.replace(/\s+AUTO_INCREMENT=\d+/g, "");
    // Normaliza charsets herdados (utf8mb3, latin1) para utf8mb4: o alvo deste
    // dump é um MySQL gerenciado na nuvem, e TiDB por exemplo não conhece
    // utf8mb3 nem latin1_general_ci. Num banco de demonstração isolado a
    // fidelidade de charset não compra nada — compatibilidade compra o deploy.
    ddl = ddl
      .replace(/utf8mb3/g, "utf8mb4")
      .replace(/CHARSET=latin1/g, "CHARSET=utf8mb4")
      .replace(/COLLATE[= ]latin1_general_ci/g, "COLLATE=utf8mb4_general_ci")
      .replace(/utf8mb4_unicode_ci/g, "utf8mb4_general_ci");
    partes.push(`DROP TABLE IF EXISTS \`${t}\`;`, `${ddl};`, "");
    console.log(`  ok  ${t}`);
  } catch (e) {
    ausentes.push(t);
    console.error(`  FALTA  ${t} — ${e.code ?? e.message}`);
  }
}

partes.push("SET FOREIGN_KEY_CHECKS = 1;", "");

mkdirSync(resolve(raiz, "db/demo"), { recursive: true });
writeFileSync(resolve(raiz, "db/demo/schema-rev.sql"), partes.join("\n"), "utf8");

await con.end();

if (ausentes.length) {
  console.error(
    `\n${ausentes.length} tabela(s) não existem no banco de origem: ${ausentes.join(", ")}.`
  );
  console.error("O arquivo foi gerado sem elas — a demo vai quebrar nas páginas que as usam.");
  process.exit(1);
}
console.log(`\ndb/demo/schema-rev.sql — ${TABELAS_REV.length} tabelas.`);
