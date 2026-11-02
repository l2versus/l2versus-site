/**
 * Gera db/demo/seed.sql — os DADOS do banco de demonstração.
 *
 * Nada aqui vem do servidor real: personagens, clãs, saldos e anúncios são
 * inventados. O objetivo é que a vitrine hospedada mostre o painel cheio em
 * vez de uma sequência de telas vazias, sem jamais expor jogador de verdade.
 *
 * A conta de entrada é combinada e pública para o time: `teste` / `teste@2026`.
 * Ela só existe neste seed — o banco de produção nunca roda este arquivo.
 *
 * Determinístico de propósito (PRNG com semente fixa): rodar duas vezes gera
 * exatamente o mesmo SQL, então regenerar não polui o diff do git.
 *
 * Uso: node scripts/gerar-seed-demo.mjs
 */
import bcrypt from "bcryptjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const USUARIO_DEMO = "teste";
const EMAIL_DEMO = "teste@l2versus.com";
const SENHA_DEMO = "teste@2026";

/** LCG simples — previsível e suficiente para dado falso. */
let semente = 20261005;
const rnd = () => ((semente = (semente * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const inteiro = (min, max) => min + Math.floor(rnd() * (max - min + 1));
const escolher = (arr) => arr[Math.floor(rnd() * arr.length)];

const aspas = (v) =>
  v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`;

/** classid -> race (0 humano, 1 elfo, 2 dark elf, 3 orc, 4 anão). */
const CLASSES = [
  ...[88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98].map((c) => [c, 0]),
  ...[99, 100, 101, 102, 103, 104, 105].map((c) => [c, 1]),
  ...[106, 107, 108, 109, 110, 111, 112].map((c) => [c, 2]),
  ...[113, 114, 115, 116].map((c) => [c, 3]),
  ...[117, 118].map((c) => [c, 4]),
];

/** Item ids conferidos contra public/l2icons/ — todos têm PNG. */
const ITENS = [
  6578, 6579, 6580, 8190, 7575, 6371, 6372, 6373, 6374, 10170, 5577, 960, 959,
  729, 730, 947, 951, 952, 883, 890, 891, 849, 850,
];

const PREFIXOS = [
  "Dark", "Blood", "Iron", "Storm", "Shadow", "Frost", "Ember", "Silent",
  "Grim", "Wild", "Night", "Steel", "Crimson", "Ash", "Raven", "Thorn",
];
const SUFIXOS = [
  "blade", "fang", "wolf", "heart", "born", "fall", "hand", "song", "crow",
  "bane", "veil", "storm", "reign", "claw", "moon", "oath",
];

const CLAS = [
  "Obsidian", "Valhalla", "Nemesis", "Requiem", "Ascension", "Ironclad",
  "Blackmoor", "Sanctum", "Revenant", "Pandemonium", "Aegis", "Vanguard",
];
const ALIANCAS = ["Dominion", "Covenant", "Imperium", null];

const CASTELOS = [
  "Gludio", "Dion", "Giran", "Oren", "Aden",
  "Innadril", "Goddard", "Rune", "Schuttgart",
];

const sql = [];
const bloco = (titulo) => sql.push("", `-- ${"-".repeat(62)}`, `-- ${titulo}`, `-- ${"-".repeat(62)}`);

sql.push(
  "-- Dados de DEMONSTRAÇÃO do site L2 Versus (gerado por",
  "-- scripts/gerar-seed-demo.mjs). Personagens, clãs e valores são FICTÍCIOS.",
  "-- Rodar SEMPRE depois de schema-rev.sql e das migrations 001..005.",
  "-- NUNCA aplicar no banco de produção: cria a conta pública teste/teste@2026.",
  "",
  "SET FOREIGN_KEY_CHECKS = 0;",
  "SET NAMES utf8mb4;"
);

/* ---------------------------------------------------------------- usuários */
bloco("Usuários do site. uid 1 = conta de demonstração do time.");
const hash = bcrypt.hashSync(SENHA_DEMO, 10);
sql.push(
  "DELETE FROM web_users;",
  "INSERT INTO web_users (id, email, username, password, balance, referral_code, referred_by, created_at, last_login, locale) VALUES",
  `  (1, ${aspas(EMAIL_DEMO)}, ${aspas(USUARIO_DEMO)}, ${aspas(hash)}, 48500, 'VERSUS01', NULL, '2026-08-14 10:12:00', ${Date.now()}, 'pt'),`,
  `  (2, 'carlo@l2versus.com', 'carlo', ${aspas(hash)}, 12000, 'VERSUS02', 1, '2026-09-02 19:40:00', 0, 'pt'),`,
  `  (3, 'nikita@l2versus.com', 'nikita', ${aspas(hash)}, 3400, 'VERSUS03', 1, '2026-09-18 08:05:00', 0, 'ru'),`,
  `  (4, 'marek@l2versus.com', 'marek', ${aspas(hash)}, 900, 'VERSUS04', 1, '2026-09-29 22:31:00', 0, 'pl');`
);

/* ------------------------------------------------------------ contas jogo */
bloco("Contas de jogo. As 3 primeiras pertencem ao usuário demo (site_user_id=1).");
const contasDemo = ["versus_demo1", "versus_demo2", "versus_demo3"];
const contasSoltas = Array.from({ length: 16 }, (_, i) => `player_${String(i + 1).padStart(2, "0")}`);
const linhasConta = [
  ...contasDemo.map((l) => `  (${aspas(l)}, ${aspas(EMAIL_DEMO)}, ${Date.now() - inteiro(1, 72) * 3600000}, 0, 1, 1)`),
  ...contasSoltas.map((l) => `  (${aspas(l)}, ${aspas(l + "@exemplo.com")}, ${Date.now() - inteiro(1, 900) * 3600000}, 0, 1, NULL)`),
];
sql.push(
  "DELETE FROM accounts;",
  "INSERT INTO accounts (login, email, lastactive, accessLevel, lastServer, site_user_id) VALUES",
  linhasConta.join(",\n") + ";"
);

/* -------------------------------------------------------------------- clãs */
bloco("Clãs e alianças.");
const clas = CLAS.map((nome, i) => ({
  id: 100 + i,
  nome,
  nivel: inteiro(5, 11),
  rep: inteiro(2000, 180000),
  alianca: i < 8 ? escolher(ALIANCAS) : null,
  castelo: i < 9 ? i + 1 : 0,
  lider: 0, // preenchido depois de gerar personagens
}));
clas.sort((a, b) => b.rep - a.rep);

/* ------------------------------------------------------------- personagens */
bloco("Personagens. Os 5 primeiros são do usuário demo; o resto popula o ranking.");
const nomesUsados = new Set();
function nome() {
  for (;;) {
    const n = escolher(PREFIXOS) + escolher(SUFIXOS) + (rnd() < 0.3 ? inteiro(2, 99) : "");
    if (!nomesUsados.has(n)) {
      nomesUsados.add(n);
      return n;
    }
  }
}

const personagens = [];
const TOTAL_CHARS = 72;
for (let i = 0; i < TOTAL_CHARS; i++) {
  const doDemo = i < 5;
  const [classid, race] = escolher(CLASSES);
  const nivel = doDemo ? inteiro(76, 85) : inteiro(52, 85);
  const cla = rnd() < 0.72 ? escolher(clas) : null;
  personagens.push({
    charId: 268400000 + i * 7,
    conta: doDemo ? contasDemo[i % contasDemo.length] : escolher(contasSoltas),
    nome: nome(),
    nivel,
    classid,
    race,
    sex: inteiro(0, 1),
    clanid: cla ? cla.id : 0,
    online: rnd() < 0.26 ? 1 : 0,
    onlinetime: inteiro(3, 2400) * 3600,
    pvp: inteiro(0, 1400),
    pk: rnd() < 0.35 ? inteiro(1, 260) : 0,
    exp: nivel * 1000000000 + inteiro(0, 999999999),
    sp: inteiro(1000000, 900000000),
    fame: inteiro(0, 32000),
    nobless: rnd() < 0.22 ? 1 : 0,
    titulo: rnd() < 0.4 ? escolher(["", "Versus", "L2V", "PK", "Hunter"]) : "",
  });
}
// Cada clã recebe um líder entre os seus membros (fallback: o primeiro char).
for (const c of clas) {
  const membro = personagens.find((p) => p.clanid === c.id);
  c.lider = membro ? membro.charId : personagens[0].charId;
}

sql.push(
  "DELETE FROM characters;",
  "INSERT INTO characters (charId, account_name, char_name, level, classid, base_class, race, sex," +
    " clanid, online, onlinetime, pvpkills, pkkills, exp, sp, fame, karma, nobless, title," +
    " accesslevel, deletetime, createDate, maxHp, curHp, maxMp, curMp, maxCp, curCp, x, y, z) VALUES",
  personagens
    .map(
      (p) =>
        `  (${p.charId}, ${aspas(p.conta)}, ${aspas(p.nome)}, ${p.nivel}, ${p.classid}, ${p.classid},` +
        ` ${p.race}, ${p.sex}, ${p.clanid}, ${p.online}, ${p.onlinetime}, ${p.pvp}, ${p.pk},` +
        ` ${p.exp}, ${p.sp}, ${p.fame}, 0, ${p.nobless}, ${aspas(p.titulo)}, 0, 0, '2026-08-01',` +
        ` 4200, 4200, 2100, 2100, 2800, 2800, 82698, 148638, -3473)`
    )
    .join(",\n") + ";"
);

sql.push(
  "",
  "DELETE FROM clan_data;",
  "INSERT INTO clan_data (clan_id, clan_name, clan_level, reputation_score, hasCastle," +
    " ally_id, ally_name, leader_id, crest_id, crest_large_id, ally_crest_id) VALUES",
  clas
    .map(
      (c) =>
        `  (${c.id}, ${aspas(c.nome)}, ${c.nivel}, ${c.rep}, ${c.castelo},` +
        ` ${c.alianca ? 1 : 0}, ${aspas(c.alianca)}, ${c.lider}, 0, 0, 0)`
    )
    .join(",\n") + ";"
);

/* --------------------------------------------------------------- castelos */
bloco("Castelos de Aden. id 1..9 na ordem canônica da crônica.");
sql.push(
  "DELETE FROM castle;",
  "INSERT INTO castle (id, name, taxPercent, treasury, siegeDate, regTimeOver, regTimeEnd) VALUES",
  CASTELOS.map((n, i) => {
    // Próximo domingo 20h, espaçando os cercos de 15 em 15 minutos.
    const base = Date.UTC(2026, 9, 11, 23, 0, 0) + i * 15 * 60000;
    return `  (${i + 1}, ${aspas(n)}, ${inteiro(5, 15)}, ${inteiro(1, 90) * 1000000}, ${base}, 'false', ${base - 86400000})`;
  }).join(",\n") + ";"
);

/* ------------------------------------------------------- heróis e olympíada */
bloco("Heróis do período e ranking de Olympíada.");
const nobres = personagens.filter((p) => p.nobless === 1).slice(0, 22);
const herois = nobres.slice(0, 8);
sql.push(
  "DELETE FROM heroes;",
  herois.length
    ? "INSERT INTO heroes (charId, class_id, count, played, claimed, message) VALUES\n" +
      herois
        .map((h) => `  (${h.charId}, ${h.classid}, ${inteiro(1, 6)}, 1, 'true', '')`)
        .join(",\n") + ";"
    : "-- sem heróis neste seed",
  "",
  "DELETE FROM olympiad_nobles;",
  nobres.length
    ? "INSERT INTO olympiad_nobles (charId, class_id, olympiad_points, competitions_done," +
      " competitions_won, competitions_lost, competitions_drawn) VALUES\n" +
      nobres
        .map((n) => {
          const feitas = inteiro(10, 70);
          const ganhas = inteiro(0, feitas);
          return `  (${n.charId}, ${n.classid}, ${inteiro(10, 240)}, ${feitas}, ${ganhas}, ${feitas - ganhas}, 0)`;
        })
        .join(",\n") + ";"
    : "-- sem nobres neste seed"
);

/* ------------------------------------------------------------------ itens */
bloco("Inventário/warehouse dos personagens do usuário demo (alimenta o RMT).");
const charsDemo = personagens.slice(0, 5);
const itens = [];
let objId = 300000000;
for (const c of charsDemo) {
  itens.push({ obj: objId++, dono: c.charId, item: 57, qtd: inteiro(50, 900) * 1000000, ench: 0, loc: "INVENTORY" });
  for (let k = 0; k < inteiro(4, 7); k++) {
    itens.push({
      obj: objId++,
      dono: c.charId,
      item: escolher(ITENS),
      qtd: 1,
      ench: rnd() < 0.5 ? inteiro(3, 16) : 0,
      loc: rnd() < 0.7 ? "INVENTORY" : "WAREHOUSE",
    });
  }
}
sql.push(
  "DELETE FROM items;",
  "INSERT INTO items (object_id, owner_id, item_id, count, enchant_level, loc, loc_data, custom_type1, custom_type2, mana_left, time) VALUES",
  itens
    .map(
      (i) =>
        `  (${i.obj}, ${i.dono}, ${i.item}, ${i.qtd}, ${i.ench}, ${aspas(i.loc)}, ${inteiro(0, 60)}, 0, 0, -1, 0)`
    )
    .join(",\n") + ";"
);

/* --------------------------------------------------------- lojas offline */
bloco("Lojas offline — alimentam a página /market.");
const lojistas = personagens.slice(20, 32);
sql.push(
  "DELETE FROM character_offline_trade;",
  "INSERT INTO character_offline_trade (charId, time, type, title) VALUES",
  lojistas
    .map(
      (l) =>
        `  (${l.charId}, ${Date.now() - inteiro(1, 200) * 3600000}, ${rnd() < 0.75 ? 1 : 3}, ${aspas(
          escolher(["WTS barato", "Full stock", "Preco justo", "So hoje", "WTB adena", "Promo"])
        )})`
    )
    .join(",\n") + ";",
  "",
  "DELETE FROM character_offline_trade_items;",
  "INSERT INTO character_offline_trade_items (charId, item, count, price) VALUES",
  lojistas
    .flatMap((l) =>
      Array.from({ length: inteiro(2, 5) }, () => {
        const it = escolher(ITENS);
        return `  (${l.charId}, ${it}, ${inteiro(1, 20)}, ${inteiro(1, 400) * 1000000})`;
      })
    )
    .join(",\n") + ";"
);

/* --------------------------------------------------- tabelas próprias do site */
bloco("Histórico financeiro, entregas e serviços do usuário demo.");
const transacoes = [
  ["topup", 30000, "pix", "Recarga via PIX"],
  ["referral_bonus", 1500, "internal", "Bônus por indicação (carlo)"],
  ["spend", -4000, "internal", "Pacote Iniciante"],
  ["topup", 20000, "crypto", "Recarga em USDT"],
  ["service", -800, "internal", "Limpeza de karma"],
  ["send_to_game", -2500, "internal", "Envio de VSCOIN para DarkFang"],
  ["referral_bonus", 1500, "internal", "Bônus por indicação (nikita)"],
  ["pack", -6000, "internal", "Pacote Guerreiro"],
  ["topup", 10000, "mercadopago", "Recarga via Mercado Pago"],
  ["referral_bonus", 1500, "internal", "Bônus por indicação (marek"],
];
sql.push(
  "DELETE FROM web_transactions;",
  "INSERT INTO web_transactions (user_id, kind, amount, method, status, description, created_at) VALUES",
  transacoes
    .map(
      ([kind, amount, method, desc], i) =>
        `  (1, '${kind}', ${amount}, ${aspas(method)}, 'done', ${aspas(desc)}, '2026-09-${String(
          5 + i * 2
        ).padStart(2, "0")} 14:${String(10 + i * 3).padStart(2, "0")}:00')`
    )
    .join(",\n") + ";",
  "",
  "DELETE FROM web_deliveries;",
  "INSERT INTO web_deliveries (user_id, char_obj_id, char_name, kind, item_id, amount, status, created_at, delivered_at) VALUES",
  charsDemo
    .slice(0, 4)
    .map(
      (c, i) =>
        `  (1, ${c.charId}, ${aspas(c.nome)}, '${i === 3 ? "pack" : "coins"}', ${
          i === 3 ? 6578 : "NULL"
        }, ${i === 3 ? 1 : inteiro(500, 5000)}, '${i === 0 ? "pending" : "delivered"}',` +
        ` '2026-09-2${i} 11:0${i}:00', ${i === 0 ? "NULL" : `'2026-09-2${i} 11:1${i}:00'`})`
    )
    .join(",\n") + ";",
  "",
  "DELETE FROM web_service_log;",
  "INSERT INTO web_service_log (user_id, char_obj_id, char_name, service, cost, created_at) VALUES",
  [
    ["clear_karma", 800, charsDemo[0]],
    ["unstuck", 300, charsDemo[1]],
    ["change_gender", 1200, charsDemo[2]],
  ]
    .map(
      ([s, custo, c], i) =>
        `  (1, ${c.charId}, ${aspas(c.nome)}, '${s}', ${custo}, '2026-09-1${i + 2} 09:3${i}:00')`
    )
    .join(",\n") + ";"
);

bloco("Mercado RMT e carteira em USD.");
const paraVender = itens.filter((i) => i.item !== 57).slice(0, 10);
sql.push(
  "DELETE FROM rmt_wallet;",
  "INSERT INTO rmt_wallet (user_id, balance_cents, pending_cents, lifetime_cents) VALUES",
  "  (1, 18740, 4400, 92310);",
  "",
  "DELETE FROM rmt_listings;",
  "INSERT INTO rmt_listings (seller_uid, seller_char_obj_id, seller_char_name, item_object_id," +
    " item_id, enchant, count, price_cents, commission_pct, status, created_at) VALUES",
  paraVender
    .map((it, i) => {
      const dono = personagens.find((p) => p.charId === it.dono);
      const estado = i < 7 ? "active" : i < 9 ? "sold" : "pending_escrow";
      return (
        `  (1, ${it.dono}, ${aspas(dono.nome)}, ${it.obj}, ${it.item}, ${it.ench}, ${it.qtd},` +
        ` ${inteiro(3, 180) * 100}, 12, '${estado}', '2026-09-${String(inteiro(10, 28)).padStart(2, "0")} 16:00:00')`
      );
    })
    .join(",\n") + ";",
  "",
  "DELETE FROM rmt_payouts;",
  "INSERT INTO rmt_payouts (user_id, amount_cents, method, destination, status, created_at) VALUES",
  "  (1, 25000, 'paypal', 'teste@l2versus.com', 'paid', '2026-08-30 12:00:00'),",
  "  (1, 12000, 'crypto', 'TRC20:TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'processing', '2026-09-27 18:20:00');"
);

bloco("Streamers.");
sql.push(
  "DELETE FROM web_streamers;",
  "INSERT INTO web_streamers (user_id, platform, channel, url, status) VALUES",
  "  (1, 'twitch', 'l2versus', 'https://twitch.tv/l2versus', 'approved'),",
  "  (2, 'youtube', 'UCl2versusdemo00000000', 'https://youtube.com/@l2versus', 'approved');"
);

sql.push("", "SET FOREIGN_KEY_CHECKS = 1;", "");

mkdirSync(resolve(raiz, "db/demo"), { recursive: true });
writeFileSync(resolve(raiz, "db/demo/seed.sql"), sql.join("\n"), "utf8");

console.log("db/demo/seed.sql gerado.");
console.log(`  ${personagens.length} personagens, ${clas.length} clãs, ${itens.length} itens,`);
console.log(`  ${herois.length} heróis, ${nobres.length} nobres, ${paraVender.length} anúncios RMT.`);
console.log(`  Login de demonstração: ${USUARIO_DEMO} / ${SENHA_DEMO}`);
