/**
 * EXTRATOR DE ATRIBUTOS BASE — servidor → content/wiki/classe-stats.json
 *
 * Roda: node scripts/extrair-classe-stats.mjs
 *
 * Fonte única: os 103 XML de template de personagem em
 *   dist/game/data/stats/players/templates/{StartingClass,1stClass,2ndClass,3rdClass}/
 * É o mesmo arquivo que o servidor lê no boot (PlayerTemplateData) para montar
 * o PlayerTemplate de cada classe — não há segunda fonte para conferir, então
 * aqui não existe o problema de divergência que o extrair-classes.mjs tem.
 *
 * ⚠️ DUAS TAGS DO BRIEFING NÃO EXISTEM NESTA ÁRVORE — medido nos 103 arquivos:
 *
 *   `baseAtkSpd`  → 0 arquivos.  A velocidade de ataque é `basePAtkSpd` (103/103).
 *   `baseRunSpd`  → 0 arquivos.  A corrida mora dentro de `<baseMoveSpd><run>`
 *                                (103/103), junto de walk/slowSwim/fastSwim.
 *
 * Preenchemos `atkSpd` e `runSpd` a partir dessas tags reais em vez de deixar
 * vazio, porque é o MESMO dado com outro nome de tag — não é suposição. De onde
 * cada um saiu fica gravado em `tagsDeOrigem` na saída, para ninguém depois
 * achar que inventamos o campo. Se um dia a tag sumir, o campo sai vazio e entra
 * no relatório: nenhum default, nenhum "conhecimento de L2".
 *
 * pDefTotal / mDefTotal são SOMA, não dado bruto: o XML dá defesa por slot de
 * equipamento (7 slots de P.Def, 5 de M.Def, os mesmos em 103/103) e o servidor
 * também soma os slots vestidos para chegar ao valor exibido. Somar é a única
 * forma de ter um número comparável entre classes numa barra. Os slots crus vão
 * junto em `pDef`/`mDef` para quem quiser detalhar.
 *
 * `nome`/`slug` vêm de content/wiki/classes.json (que por sua vez veio do
 * servidor, via extrair-classes.mjs) só para a UI não precisar cruzar dois
 * arquivos — o XML de template não tem nome de classe, só classId.
 *
 * Toda entrada carrega `fonte` no formato ARQUIVO:LINHA — a mesma disciplina
 * do resto do códice. Sem fonte, o campo fica vazio e entra no relatório.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, posix } from "node:path";

const SERVIDOR = resolve(
  "C:/Users/admin/Desktop/MOBIUS SOURCE/L2J_Mobius/L2J_Mobius_CT_2.6_HighFive"
);
const TEMPLATES = "dist/game/data/stats/players/templates";
const SUBPASTAS = ["StartingClass", "1stClass", "2ndClass", "3rdClass"];
const INDICE_CLASSES = resolve("content/wiki/classes.json");
const SAIDA = resolve("content/wiki/classe-stats.json");

/* Slots que compõem cada total. Não é lista escolhida a dedo: é a união medida
   dos filhos de <basePDef>/<baseMDef> nos 103 arquivos — todos têm todos. */
const SLOTS_PDEF = ["chest", "legs", "head", "feet", "gloves", "underwear", "cloak"];
const SLOTS_MDEF = ["rear", "lear", "rfinger", "lfinger", "neck"];

/* campo de saída → tag real no XML. O mapa existe justamente porque dois nomes
   do briefing não batem com o arquivo (ver cabeçalho). */
const TAGS = {
  str: "baseSTR", dex: "baseDEX", con: "baseCON",
  int: "baseINT", wit: "baseWIT", men: "baseMEN",
  pAtk: "basePAtk", mAtk: "baseMAtk", critRate: "baseCritRate",
  atkSpd: "basePAtkSpd", atkRange: "baseAtkRange",
};

/* ---------- índice de classes (só para nome/slug) ---------- */
const indice = new Map(
  JSON.parse(readFileSync(INDICE_CLASSES, "utf8")).classes.map((c) => [c.id, c])
);

/* ---------- ler os 103 templates ---------- */
const stats = [];
const faltando = [];   // campo que a tag não entregou, por classe
const semIndice = [];  // classId no template que não existe no classes.json

for (const sub of SUBPASTAS) {
  const dir = resolve(SERVIDOR, TEMPLATES, sub);
  for (const arquivo of readdirSync(dir).filter((f) => f.endsWith(".xml")).sort()) {
    const rel = posix.join(TEMPLATES, sub, arquivo);
    const texto = readFileSync(resolve(dir, arquivo), "utf8");
    const linhas = texto.split(/\r?\n/);

    const iClassId = linhas.findIndex((l) => /<classId>\s*\d+\s*<\/classId>/.test(l));
    if (iClassId === -1) {
      faltando.push({ arquivo: rel, campo: "classId" });
      continue;
    }
    const id = Number(linhas[iClassId].match(/<classId>\s*(\d+)\s*<\/classId>/)[1]);

    /* só o que está dentro de <staticData>: lvlUpgainData repete nomes de tag
       (hp/mp por nível) e um match solto no arquivo inteiro pegaria lixo */
    const estatico = texto.match(/<staticData>([\s\S]*?)<\/staticData>/)?.[1] ?? "";

    const num = (tag) => {
      const m = estatico.match(new RegExp(`<${tag}>\\s*([-\\d.]+)\\s*</${tag}>`));
      return m ? Number(m[1]) : null;
    };
    const bloco = (tag) =>
      estatico.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] ?? "";

    const entrada = { id };
    const c = indice.get(id);
    if (!c) semIndice.push({ id, arquivo: rel });
    entrada.nome = c?.nome ?? "";
    entrada.slug = c?.slug ?? "";

    for (const [campo, tag] of Object.entries(TAGS)) {
      const v = num(tag);
      if (v === null) faltando.push({ id, arquivo: rel, campo, tag });
      entrada[campo] = v === null ? "" : v;
    }

    /* runSpd: não é tag de primeiro nível, está dentro de baseMoveSpd */
    const move = bloco("baseMoveSpd");
    const run = move.match(/<run>\s*([-\d.]+)\s*<\/run>/);
    if (!run) faltando.push({ id, arquivo: rel, campo: "runSpd", tag: "baseMoveSpd/run" });
    entrada.runSpd = run ? Number(run[1]) : "";

    /* defesas: guarda slot a slot e soma. Slot ausente NÃO vira 0 — entra no
       relatório, senão um XML incompleto passaria como classe fraca. */
    const somar = (nomeBloco, slots, destino) => {
      const conteudo = bloco(nomeBloco);
      const porSlot = {};
      let total = 0;
      for (const slot of slots) {
        const m = conteudo.match(new RegExp(`<${slot}>\\s*([-\\d.]+)\\s*</${slot}>`));
        if (!m) {
          faltando.push({ id, arquivo: rel, campo: `${nomeBloco}/${slot}` });
          continue;
        }
        porSlot[slot] = Number(m[1]);
        total += Number(m[1]);
      }
      entrada[destino] = porSlot;
      return Object.keys(porSlot).length ? total : "";
    };
    entrada.pDefTotal = somar("basePDef", SLOTS_PDEF, "pDef");
    entrada.mDefTotal = somar("baseMDef", SLOTS_MDEF, "mDef");

    entrada.fonte = `${rel}:${iClassId + 1}`;
    entrada.fonteArquivo = rel;
    stats.push(entrada);
  }
}

stats.sort((a, b) => a.id - b.id);

/* ---------- faixas: mín/máx de cada atributo, com quem é o extremo ----------
   A UI desenha barra comparativa; sem os extremos reais ela teria que escolher
   um teto arbitrário e mentir na proporção. */
const CAMPOS_FAIXA = [
  "str", "dex", "con", "int", "wit", "men",
  "pAtk", "mAtk", "critRate", "atkSpd", "atkRange", "runSpd",
  "pDefTotal", "mDefTotal",
];
const faixas = {};
for (const campo of CAMPOS_FAIXA) {
  const com = stats.filter((s) => s[campo] !== "" && s[campo] !== null);
  if (!com.length) {
    faixas[campo] = { min: "", max: "", medidoEm: 0 };
    continue;
  }
  const menor = com.reduce((a, b) => (b[campo] < a[campo] ? b : a));
  const maior = com.reduce((a, b) => (b[campo] > a[campo] ? b : a));
  faixas[campo] = {
    min: menor[campo], minClasse: menor.nome || String(menor.id),
    max: maior[campo], maxClasse: maior.nome || String(maior.id),
    medidoEm: com.length,
  };
}

/* ---------- chaveado por classId, como pedido ---------- */
const porClasse = {};
for (const s of stats) porClasse[s.id] = s;

const saida = {
  familia: "classe-stats",
  titulo: "Atributos base por classe",
  geradoDe: SUBPASTAS.map((s) => posix.join(TEMPLATES, s)),
  curadoPor:
    "extraído por scripts/extrair-classe-stats.mjs — tudo lido do XML de template do servidor; nome/slug vêm de classes.json; pDefTotal/mDefTotal são soma dos slots",
  /* fica no dado, não só no comentário: a página pode mostrar de qual tag
     cada número saiu, e fica registrado que atkSpd/runSpd trocaram de nome */
  tagsDeOrigem: {
    ...TAGS,
    runSpd: "baseMoveSpd/run",
    pDefTotal: `soma de basePDef: ${SLOTS_PDEF.join(", ")}`,
    mDefTotal: `soma de baseMDef: ${SLOTS_MDEF.join(", ")}`,
  },
  naoExisteNaFonte: [
    { tag: "baseAtkSpd", medido: "0 de 103 arquivos", usadoNoLugar: "basePAtkSpd (103/103)" },
    { tag: "baseRunSpd", medido: "0 de 103 arquivos", usadoNoLugar: "baseMoveSpd/run (103/103)" },
  ],
  total: stats.length,
  faixas,
  camposVazios: faltando,
  classes: porClasse,
};

writeFileSync(SAIDA, JSON.stringify(saida, null, 2) + "\n", "utf8");

console.log(`${stats.length} classes → ${SAIDA}`);
for (const campo of CAMPOS_FAIXA) {
  const f = faixas[campo];
  console.log(
    `  ${campo.padEnd(10)} ${String(f.min).padStart(6)} (${f.minClasse})` +
      `  →  ${String(f.max).padStart(6)} (${f.maxClasse})   [${f.medidoEm}/${stats.length}]`
  );
}
if (semIndice.length) {
  console.log(`! ${semIndice.length} classId sem entrada em classes.json:`,
    semIndice.map((s) => s.id).join(", "));
}
if (faltando.length) {
  console.log(`! ${faltando.length} campo(s) sem dado na fonte:`,
    faltando.map((f) => `${f.id ?? "?"}/${f.campo}`).join(", "));
} else {
  console.log("! nenhum campo vazio — as 103 classes têm todas as tags");
}
