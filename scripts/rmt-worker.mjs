// ============================================================
//  RMT Worker — executor de escrow/deliver/restore do RMT Market.
//
//  POR QUE EXISTE: o site nunca muta a tabela `items` do servidor de jogo.
//  Ele só enfileira intenções em `rmt_item_ops`. Este worker é o ÚNICO
//  processo que move itens de verdade — e só quando é seguro fazê-lo.
//
//  REGRA DE OURO (offline-guard): o servidor L2, com o personagem ONLINE,
//  mantém o inventário em memória e regrava no banco ao salvar/deslogar.
//  Escrever em `items` de um char online = desync / o item volta / dupe.
//  Então TODA operação exige o(s) personagem(s) envolvido(s) OFFLINE.
//
//  ESCROW = tirar o item da bag no momento do anúncio. Movemos para uma
//  location `RMTHOLD` com owner_id=0: o gameserver carrega itens por
//  owner_id + loc IN ('INVENTORY','WAREHOUSE',...); com owner 0 e loc
//  desconhecida, o item some de todos os inventários no jogo — fecha o
//  buraco de vender no site e dropar/vender in-game o mesmo item (double-spend).
//
//  Uso:
//    node scripts/rmt-worker.mjs            # loop contínuo (poll 5s)
//    node scripts/rmt-worker.mjs --once     # processa a fila uma vez e sai
//    node scripts/rmt-worker.mjs --interval 3   # poll a cada 3s
// ============================================================

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/* ---- carrega .env.local (o site usa Next; aqui é Node puro) ---- */
function loadEnv() {
  const file = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnv();

/* ---- args ---- */
const args = process.argv.slice(2);
const ONCE = args.includes("--once");
const INTERVAL_S = (() => {
  const i = args.indexOf("--interval");
  return i !== -1 ? Math.max(1, Number(args[i + 1]) || 5) : 5;
})();

/* ---- constantes de local ---- */
// Location de custódia: fora de qualquer inventário que o gameserver carrega.
const HOLD_LOC = "RMTHOLD";
// Locais de onde um item pode ser retirado para escrow.
const SELLABLE_LOCS = ["INVENTORY", "WAREHOUSE"];
// Ao entregar/devolver, cai no depósito (seguro com o char offline).
const RETURN_LOC = "WAREHOUSE";

const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "l2versus",
  connectionLimit: 4,
  charset: "utf8mb4",
});

const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);
const log = (...a) => console.log(`[${now()}]`, ...a);

/** Um char está offline (ou nem existe mais)? online=1 => bloqueia. */
async function charOffline(conn, objId) {
  if (!objId) return true;
  const [rows] = await conn.execute(
    "SELECT online FROM characters WHERE obj_Id = ? LIMIT 1",
    [objId]
  );
  if (!rows.length) return true; // char apagado -> não há inventário em memória
  return Number(rows[0].online) === 0;
}

async function finishOp(conn, opId, status) {
  await conn.execute(
    "UPDATE rmt_item_ops SET status = ?, done_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, opId]
  );
}

/**
 * ESCROW: tira o item da bag/depósito do vendedor -> custódia (owner 0).
 * Guarda: vendedor offline; item ainda pertence a ele em local vendável.
 */
async function doEscrow(conn, op) {
  // Guarda de listing: só faz sentido escrow para um anúncio vivo. Se a
  // listing já foi cancelada/vendida (ops são um journal cronológico), o
  // escrow virou obsoleto — no-op, para nunca prender item de anúncio morto.
  const [ls] = await conn.execute(
    "SELECT status FROM rmt_listings WHERE id = ? LIMIT 1",
    [op.listing_id]
  );
  const st = ls[0]?.status;
  if (!st || !["active", "pending_escrow", "sold", "delivering"].includes(st)) {
    await finishOp(conn, op.id, "done");
    log(`escrow SKIP op#${op.id} listing#${op.listing_id} status=${st ?? "inexistente"} (obsoleto)`);
    return "done";
  }

  if (!(await charOffline(conn, op.from_char_obj_id))) return "skip"; // tenta depois

  const inList = SELLABLE_LOCS.map(() => "?").join(",");
  const [res] = await conn.execute(
    `UPDATE items SET owner_id = 0, loc = ?, loc_data = 0
       WHERE object_id = ? AND owner_id = ? AND loc IN (${inList})`,
    [HOLD_LOC, op.item_object_id, op.from_char_obj_id, ...SELLABLE_LOCS]
  );

  if (res.affectedRows === 1) {
    await finishOp(conn, op.id, "done");
    log(`escrow OK  op#${op.id} item ${op.item_object_id} <- char ${op.from_char_obj_id}`);
    return "done";
  }

  // Item já pertence à custódia? (op reprocessada) => idempotente.
  const [held] = await conn.execute(
    "SELECT 1 FROM items WHERE object_id = ? AND owner_id = 0 AND loc = ? LIMIT 1",
    [op.item_object_id, HOLD_LOC]
  );
  if (held.length) {
    await finishOp(conn, op.id, "done");
    return "done";
  }

  // Item sumiu / foi movido in-game (vendedor logou e dropou/vendeu). Aborta seguro.
  await finishOp(conn, op.id, "failed");
  await conn.execute(
    "UPDATE rmt_listings SET status = 'cancelled' WHERE id = ? AND status IN ('active','pending_escrow')",
    [op.listing_id]
  );
  log(`escrow FAIL op#${op.id} item ${op.item_object_id} não está mais com o vendedor -> anúncio cancelado`);
  return "failed";
}

/**
 * DELIVER: custódia -> personagem do comprador (depósito).
 * Guarda: comprador offline. Marca o anúncio como entregue.
 */
async function doDeliver(conn, op) {
  if (!(await charOffline(conn, op.to_char_obj_id))) return "skip";

  const [res] = await conn.execute(
    `UPDATE items SET owner_id = ?, loc = ?, loc_data = 0
       WHERE object_id = ? AND owner_id = 0 AND loc = ?`,
    [op.to_char_obj_id, RETURN_LOC, op.item_object_id, HOLD_LOC]
  );

  if (res.affectedRows === 1) {
    await finishOp(conn, op.id, "done");
    await conn.execute(
      "UPDATE rmt_listings SET status = 'delivered' WHERE id = ?",
      [op.listing_id]
    );
    log(`deliver OK op#${op.id} item ${op.item_object_id} -> char ${op.to_char_obj_id}`);
    return "done";
  }

  // Já entregue (owner = comprador)? idempotente.
  const [done] = await conn.execute(
    "SELECT 1 FROM items WHERE object_id = ? AND owner_id = ? LIMIT 1",
    [op.item_object_id, op.to_char_obj_id]
  );
  if (done.length) {
    await finishOp(conn, op.id, "done");
    await conn.execute("UPDATE rmt_listings SET status = 'delivered' WHERE id = ?", [op.listing_id]);
    return "done";
  }

  await finishOp(conn, op.id, "failed");
  log(`deliver FAIL op#${op.id} item ${op.item_object_id} não está em custódia`);
  return "failed";
}

/**
 * RESTORE: custódia -> de volta ao vendedor (cancelamento).
 * Guarda: vendedor offline.
 */
async function doRestore(conn, op) {
  if (!(await charOffline(conn, op.to_char_obj_id))) return "skip";

  const [res] = await conn.execute(
    `UPDATE items SET owner_id = ?, loc = ?, loc_data = 0
       WHERE object_id = ? AND owner_id = 0 AND loc = ?`,
    [op.to_char_obj_id, RETURN_LOC, op.item_object_id, HOLD_LOC]
  );

  if (res.affectedRows === 1) {
    await finishOp(conn, op.id, "done");
    log(`restore OK op#${op.id} item ${op.item_object_id} -> char ${op.to_char_obj_id}`);
    return "done";
  }

  // Nunca chegou a entrar em custódia (escrow falhou antes) OU já devolvido.
  const [back] = await conn.execute(
    "SELECT 1 FROM items WHERE object_id = ? AND owner_id = ? LIMIT 1",
    [op.item_object_id, op.to_char_obj_id]
  );
  await finishOp(conn, op.id, back.length ? "done" : "failed");
  return back.length ? "done" : "failed";
}

/** Processa uma op numa transação isolada (uma op ruim não derruba a fila). */
async function processOp(op) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Trava a op: garante que só um worker a pega (SKIP LOCKED = MariaDB 10.6+).
    const [locked] = await conn.execute(
      "SELECT * FROM rmt_item_ops WHERE id = ? AND status = 'pending' FOR UPDATE SKIP LOCKED",
      [op.id]
    );
    if (!locked.length) {
      await conn.rollback();
      return "taken";
    }
    const row = locked[0];

    let outcome;
    if (row.op === "escrow") outcome = await doEscrow(conn, row);
    else if (row.op === "deliver") outcome = await doDeliver(conn, row);
    else if (row.op === "restore") outcome = await doRestore(conn, row);
    else {
      await finishOp(conn, row.id, "failed");
      outcome = "failed";
    }

    // "skip": deixa como pending (char online) -> não persiste mudança de status.
    if (outcome === "skip") await conn.rollback();
    else await conn.commit();
    return outcome;
  } catch (e) {
    await conn.rollback();
    log(`ERRO op#${op.id}:`, e.message);
    return "error";
  } finally {
    conn.release();
  }
}

async function drainOnce() {
  const [ops] = await pool.execute(
    "SELECT id, op, listing_id, item_object_id, from_char_obj_id, to_char_obj_id FROM rmt_item_ops WHERE status = 'pending' ORDER BY id ASC LIMIT 100"
  );
  let done = 0, skipped = 0, failed = 0;
  for (const op of ops) {
    const r = await processOp(op);
    if (r === "done") done++;
    else if (r === "skip") skipped++;
    else if (r === "failed" || r === "error") failed++;
  }
  if (ops.length) log(`fila: ${ops.length} ops -> ${done} feitas, ${skipped} adiadas (char online), ${failed} falhas`);
  return { total: ops.length, done, skipped, failed };
}

async function main() {
  log(`RMT worker iniciado (db=${process.env.DB_NAME ?? "l2versus"}, hold=${HOLD_LOC}, ${ONCE ? "once" : `loop ${INTERVAL_S}s`})`);
  // valida conexão cedo (falha clara em vez de loop silencioso)
  await pool.query("SELECT 1");

  if (ONCE) {
    await drainOnce();
    await pool.end();
    return;
  }

  let stop = false;
  const bye = async () => {
    if (stop) return;
    stop = true;
    log("encerrando...");
    await pool.end();
    process.exit(0);
  };
  process.on("SIGINT", bye);
  process.on("SIGTERM", bye);

  while (!stop) {
    try {
      await drainOnce();
    } catch (e) {
      log("erro no ciclo:", e.message);
    }
    await new Promise((r) => setTimeout(r, INTERVAL_S * 1000));
  }
}

main().catch(async (e) => {
  log("FATAL:", e.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
