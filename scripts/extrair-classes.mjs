/**
 * EXTRATOR DE CLASSES — servidor → content/wiki/classes.json
 *
 * Roda: node scripts/extrair-classes.mjs
 *
 * Cruza DUAS fontes do servidor, porque nenhuma sozinha tem tudo:
 *   1. dist/game/data/stats/players/classList.xml
 *      → classId e NOME DE EXIBIÇÃO (o que o jogador lê: "Human Fighter").
 *   2. java/.../model/actor/enums/player/PlayerClass.java
 *      → HIERARQUIA (pai), raça, flag de mago, flag de invocador.
 *
 * ⚠️ AS DUAS DIVERGEM, e a escolha de qual manda não é arbitrária:
 *
 *   classList.xml:37  <class classId="34" name="Bladedancer" parentClassId="33"/>
 *   PlayerClass.java:81  BLADEDANCER(34, false, Race.DARK_ELF, PALUS_KNIGHT)  // = 32
 *
 * O XML diz que o Bladedancer descende do Shillien Knight; o enum diz que
 * descende do Palus Knight (que é o certo — os dois são 2ª profissão irmãs).
 * Quem governa o JOGO é o enum: `SkillTreeData` chama `PlayerClass.getParent()`
 * (SkillTreeData.java:391, 765, 1084-1086) para montar a árvore de skills. O XML
 * só alimenta `ClassListData.getClassName()`, usado exclusivamente para escrever
 * NOME em HTML de village master (VillageMaster.java:430+). O `parentClassId` do
 * XML não é lido por nenhuma lógica — por isso o erro nunca apareceu em jogo.
 *
 * Portanto: hierarquia/raça/mago vêm do ENUM, nome vem do XML. Seguir o XML
 * aqui colocaria o Bladedancer um degrau abaixo na árvore e empurraria o
 * Spectral Dancer para um 4º tier que não existe.
 *
 * O tier (base/1ª/2ª/3ª) NÃO está em nenhuma das duas — no servidor ele é
 * calculado subindo a cadeia de parent até a raiz (PlayerClass.level(),
 * linhas 312-320). Fazemos o mesmo aqui, em vez de digitar à mão.
 *
 * O arquétipo (Warrior/Wizard/Rogue/Knight/Support) é a ÚNICA parte
 * editorial deste arquivo: não existe no servidor, é classificação nossa
 * para a cor e o ícone da árvore. Fica no mapa ARQUETIPO abaixo, versionado,
 * e cada entrada carrega de onde saiu.
 *
 * Toda entrada carrega `fonte` no formato ARQUIVO:LINHA — a mesma disciplina
 * do resto do códice. Sem fonte, o campo fica vazio e entra no relatório.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SERVIDOR = resolve(
  "C:/Users/admin/Desktop/MOBIUS SOURCE/L2J_Mobius/L2J_Mobius_CT_2.6_HighFive"
);
const CLASS_LIST = "dist/game/data/stats/players/classList.xml";
const PLAYER_CLASS =
  "java/org/l2jmobius/gameserver/model/actor/enums/player/PlayerClass.java";
const SAIDA = resolve("content/wiki/classes.json");

/* ---------- 1. classList.xml: id, nome (e o pai SÓ para conferir) ---------- */
const xml = readFileSync(resolve(SERVIDOR, CLASS_LIST), "utf8").split(/\r?\n/);
const porId = new Map();

xml.forEach((linha, i) => {
  const m = linha.match(
    /<class\s+classId="(\d+)"\s+name="([^"]+)"(?:\s+parentClassId="(\d+)")?/
  );
  if (!m) return;
  const [, id, nome, pai] = m;
  porId.set(Number(id), {
    id: Number(id),
    nome,
    paiIdXml: pai === undefined ? null : Number(pai),
    fonte: `${CLASS_LIST}:${i + 1}`,
  });
});

/* ---------- 2. PlayerClass.java: hierarquia, raça, mago, invocador ----------
   Duas passadas: o enum referencia o pai pelo NOME DA CONSTANTE, então só dá
   para resolver id do pai depois de ter lido o arquivo inteiro. */
const java = readFileSync(resolve(SERVIDOR, PLAYER_CLASS), "utf8").split(/\r?\n/);
const idPorConstante = new Map();
const paiConstante = new Map();

java.forEach((linha, i) => {
  /* Duas assinaturas convivem no enum:
       NOME(id, isMage, Race.X, PAI)
       NOME(id, isMage, isSummoner, Race.X, PAI)
     O segundo booleano só aparece nos invocadores. */
  const m = linha.match(
    /^\s*([A-Z_0-9]+)\((\d+),\s*(true|false),\s*(?:(true|false),\s*)?Race\.([A-Z_]+),\s*(\w+|null)\)/
  );
  if (!m) return;
  const [, constante, id, mago, invocador, raca, pai] = m;
  const c = porId.get(Number(id));
  if (!c) {
    console.warn(`! id ${id} (${constante}) existe no enum e não no classList.xml`);
    return;
  }
  idPorConstante.set(constante, Number(id));
  paiConstante.set(Number(id), pai === "null" ? null : pai);
  c.constante = constante;
  c.raca = raca;
  c.mago = mago === "true";
  c.invocador = invocador === "true";
  c.fonteEnum = `${PLAYER_CLASS}:${i + 1}`;
});

/* resolve o pai (autoridade = enum) e anota onde o XML discorda */
const divergencias = [];
for (const c of porId.values()) {
  const nomePai = paiConstante.get(c.id);
  c.paiId = nomePai === null || nomePai === undefined ? null : idPorConstante.get(nomePai) ?? null;
  if (c.paiIdXml !== c.paiId) {
    divergencias.push({
      classe: c.nome,
      id: c.id,
      paiSegundoXml: c.paiIdXml,
      paiSegundoEnum: c.paiId,
      adotado: "enum",
      porque:
        "SkillTreeData usa PlayerClass.getParent(); o parentClassId do XML não é lido por nenhuma lógica do servidor",
      fonteXml: c.fonte,
      fonteEnum: c.fonteEnum,
    });
  }
}

/* ---------- 3. tier: subir a cadeia de pais até a raiz ---------- */
function tier(c) {
  let n = 0;
  let atual = c;
  while (atual.paiId !== null && atual.paiId !== undefined) {
    atual = porId.get(atual.paiId);
    if (!atual) break;
    n++;
    if (n > 5) break; // trava contra ciclo — o dado é de arquivo, não confiar cegamente
  }
  return n;
}

/* ---------- 4. arquétipo: a única camada editorial ----------
   Classificação nossa para a cor/ícone da árvore. Derivada da raiz da
   cadeia + do papel real da classe no jogo. Não é dado do servidor.
   Os cavaleiros saem de "guerreiro" porque a árvore separa tank de dano;
   os de suporte idem. Quem não cair em nenhuma regra herda do pai. */
const ARQUETIPO = {
  // tanques (linha de escudo)
  KNIGHT: "cavaleiro", PALADIN: "cavaleiro", DARK_AVENGER: "cavaleiro",
  PHOENIX_KNIGHT: "cavaleiro", HELL_KNIGHT: "cavaleiro",
  ELVEN_KNIGHT: "cavaleiro", TEMPLE_KNIGHT: "cavaleiro", EVA_TEMPLAR: "cavaleiro",
  PALUS_KNIGHT: "cavaleiro", SHILLIEN_KNIGHT: "cavaleiro", SHILLIEN_TEMPLAR: "cavaleiro",
  // suporte (cura, buff, canção/dança)
  CLERIC: "suporte", BISHOP: "suporte", PROPHET: "suporte",
  CARDINAL: "suporte", HIEROPHANT: "suporte",
  ORACLE: "suporte", ELDER: "suporte", EVA_SAINT: "suporte",
  SHILLIEN_ORACLE: "suporte", SHILLIEN_ELDER: "suporte", SHILLIEN_SAINT: "suporte",
  SWORD_SINGER: "suporte", SWORD_MUSE: "suporte",
  BLADEDANCER: "suporte", SPECTRAL_DANCER: "suporte",
  WARCRYER: "suporte", DOOMCRYER: "suporte",
  // ladinos (adaga, arco, espólio)
  ROGUE: "ladino", TREASURE_HUNTER: "ladino", HAWKEYE: "ladino",
  ADVENTURER: "ladino", SAGITTARIUS: "ladino",
  ELVEN_SCOUT: "ladino", PLAINS_WALKER: "ladino", SILVER_RANGER: "ladino",
  WIND_RIDER: "ladino", MOONLIGHT_SENTINEL: "ladino",
  ASSASSIN: "ladino", ABYSS_WALKER: "ladino", PHANTOM_RANGER: "ladino",
  GHOST_HUNTER: "ladino", GHOST_SENTINEL: "ladino",
  SCAVENGER: "ladino", BOUNTY_HUNTER: "ladino", FORTUNE_SEEKER: "ladino",
  ARTISAN: "ladino", WARSMITH: "ladino", MAESTRO: "ladino",
  DWARVEN_FIGHTER: "ladino",
};
const POR_RAIZ = { 0: "guerreiro", 10: "mago", 18: "guerreiro", 25: "mago",
  31: "guerreiro", 38: "mago", 44: "guerreiro", 49: "mago", 53: "ladino",
  123: "guerreiro", 124: "guerreiro" };

function raiz(c) {
  let atual = c;
  while (atual.paiId !== null && atual.paiId !== undefined) {
    const p = porId.get(atual.paiId);
    if (!p) break;
    atual = p;
  }
  return atual.id;
}

function arquetipo(c) {
  if (ARQUETIPO[c.constante]) return ARQUETIPO[c.constante];
  /* herda do pai antes de cair na raiz: o pai já resolveu o caso especial */
  if (c.paiId !== null && c.paiId !== undefined) {
    const p = porId.get(c.paiId);
    if (p && ARQUETIPO[p.constante]) return ARQUETIPO[p.constante];
  }
  if (c.mago) return "mago";
  return POR_RAIZ[raiz(c)] ?? "guerreiro";
}

/* ---------- 5. montar ---------- */
const RACA_PT = {
  HUMAN: "Humano", ELF: "Elfo", DARK_ELF: "Elfo Negro",
  ORC: "Orc", DWARF: "Anão", KAMAEL: "Kamael",
};

const classes = [...porId.values()]
  .sort((a, b) => a.id - b.id)
  .map((c) => {
    const semEnum = !c.constante;
    return {
      id: c.id,
      slug: c.nome.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      nome: c.nome,
      constante: c.constante ?? "",
      paiId: c.paiId,
      tier: tier(c),
      raca: c.raca ?? "",
      racaPt: c.raca ? RACA_PT[c.raca] ?? c.raca : "",
      mago: c.mago ?? false,
      invocador: c.invocador ?? false,
      arquetipo: semEnum ? "" : arquetipo(c),
      fonte: c.fonte,
      fonteEnum: c.fonteEnum ?? "",
    };
  });

const semFonteEnum = classes.filter((c) => !c.fonteEnum);
const semArquetipo = classes.filter((c) => !c.arquetipo);

const saida = {
  familia: "classe",
  titulo: "Classes",
  geradoDe: [CLASS_LIST, PLAYER_CLASS],
  curadoPor: "extraído por scripts/extrair-classes.mjs — nomes e hierarquia lidos do servidor; arquétipo é classificação editorial nossa (mapa ARQUETIPO no script)",
  total: classes.length,
  porTier: [0, 1, 2, 3].map((t) => ({
    tier: t,
    total: classes.filter((c) => c.tier === t).length,
  })),
  /* Divergências entre as duas fontes do servidor, com a decisão tomada.
     Ficam no dado (não só no comentário do script) para a página poder
     mostrá-las — no códice, discordância entre fontes é informação. */
  divergencias,
  classes,
};

writeFileSync(SAIDA, JSON.stringify(saida, null, 2) + "\n", "utf8");

console.log(`${classes.length} classes → ${SAIDA}`);
console.log("por tier:", saida.porTier.map((t) => `${t.tier}:${t.total}`).join("  "));
console.log("por raça:", Object.entries(
  classes.reduce((a, c) => ((a[c.racaPt || "?"] = (a[c.racaPt || "?"] ?? 0) + 1), a), {})
).map(([r, n]) => `${r}:${n}`).join("  "));
if (semFonteEnum.length) {
  console.log(`! ${semFonteEnum.length} sem fonte no enum:`, semFonteEnum.map((c) => c.nome).join(", "));
}
if (semArquetipo.length) {
  console.log(`! ${semArquetipo.length} sem arquétipo:`, semArquetipo.map((c) => c.nome).join(", "));
}
