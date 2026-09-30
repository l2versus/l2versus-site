/**
 * EXTRATOR DE ARMAS POR CLASSE — servidor → content/wiki/classe-armas.json
 *
 * Roda: node scripts/extrair-classe-armas.mjs
 *
 * ⚠️ ISTO É UMA DERIVAÇÃO, NÃO UM CAMPO DO SERVIDOR.
 * Não existe em lugar nenhum do L2J Mobius uma tabela "classe X usa arma Y".
 * O que existe é:
 *
 *   a) a ÁRVORE DE SKILLS de cada classe
 *      dist/game/data/stats/players/skillTrees/{StartingClass,1stClass,2ndClass,3rdClass}/*.xml
 *
 *   b) a CONDIÇÃO DE ARMA de cada skill
 *      dist/game/data/stats/skills/*.xml  →  <using kind="BOW,CROSSBOW" />
 *
 * Cruzando (a) com (b) o servidor responde, indiretamente, que arma a classe usa:
 * se o Hawkeye aprende 40 skills que só funcionam com BOW equipado, ele usa arco.
 * É o mesmo raciocínio que o jogador faz na prática — só que aqui medido no dado.
 *
 * === Por que <using kind> e não outra coisa ===
 *
 * `DocumentBase.parseUsingCondition()` (linhas 1469-1520) lê o atributo `kind`,
 * quebra por vírgula e casa cada token contra WeaponType.values() e, depois,
 * ArmorType.values(). Ou seja: os nomes possíveis em `kind` são EXATAMENTE os
 * dois enums, e por isso este script lê os dois enums do fonte Java em vez de
 * digitar a lista à mão — se o Mobius acrescentar um tipo, entra sozinho.
 *
 * Existem DOIS lugares onde `<using kind>` aparece, com peso diferente:
 *   - dentro de <conditions>  → EXIGÊNCIA: sem essa arma a skill nem é lançada.
 *   - dentro de <effects> / <enchantNeffects> / <selfEffects> / ...
 *                             → BÔNUS CONDICIONAL: a skill funciona, mas o
 *                               stat só entra com aquela arma (ex.: mastery).
 * Os dois contam como prova de uso, e o JSON separa os dois números para a
 * página poder dizer "exige" vs "beneficia".
 *
 * `<using>` dentro de `<not>` é NEGAÇÃO ("não estar usando armadura MAGIC") —
 * prova do contrário, então é descartado e só aparece na contagem de descarte.
 *
 * === Herança da árvore ===
 *
 * Uma classe herda as skills dos ancestrais. O pai usado aqui é o
 * `parentClassId` do PRÓPRIO skillTree XML — e isso é deliberado: é ele que o
 * servidor usa para montar a árvore completa (SkillTreeData.java:209-215
 * enche `_parentClassMap`, e as linhas 141-168 sobem a cadeia acumulando).
 * Não é o mesmo caminho do extrair-classes.mjs, que usa o enum PlayerClass
 * para a hierarquia de PROFISSÃO. Aqui a pergunta é "que skill a classe tem",
 * e para essa pergunta a autoridade é o skillTree XML.
 *
 * === O que NÃO entra ===
 * transfer/noble/hero/pledge/fishing/subClass/transform skill trees: não são
 * skills de classe. Se um dia forem relevantes, entram com fonte própria.
 *
 * Toda entrada carrega `fonte` no formato ARQUIVO:LINHA — sem fonte, não entra.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const SERVIDOR = resolve(
  "C:/Users/admin/Desktop/MOBIUS SOURCE/L2J_Mobius/L2J_Mobius_CT_2.6_HighFive"
);
const DIR_SKILLS = "dist/game/data/stats/skills";
const DIR_SKILLS_CUSTOM = "dist/game/data/stats/skills/custom";
const DIR_ARVORES = "dist/game/data/stats/players/skillTrees";
const SUBDIRS_ARVORE = ["StartingClass", "1stClass", "2ndClass", "3rdClass"];
const WEAPON_TYPE = "java/org/l2jmobius/gameserver/model/item/type/WeaponType.java";
const ARMOR_TYPE = "java/org/l2jmobius/gameserver/model/item/type/ArmorType.java";
const CLASSES = resolve("content/wiki/classes.json");
const SAIDA = resolve("content/wiki/classe-armas.json");

/** caminho relativo ao servidor, sempre com barra normal — é o formato de `fonte` */
const rel = (abs) => relative(SERVIDOR, abs).replace(/\\/g, "/");

/* ---------- 0. o vocabulário de `kind` vem dos enums, não de nós ---------- */
/* Constante de enum = linha que é SÓ um nome em CAIXA ALTA, com ou sem
   argumentos de construtor, terminada em vírgula ou ponto e vírgula. O
   construtor da própria classe (`WeaponType(TraitType t)`) não casa porque
   tem minúsculas no nome e não termina em , ou ; */
function lerEnum(arquivoRelativo) {
  const linhas = readFileSync(resolve(SERVIDOR, arquivoRelativo), "utf8").split(/\r?\n/);
  const nomes = new Map();
  for (const [i, linha] of linhas.entries()) {
    const m = linha.match(/^\s+([A-Z][A-Z_0-9]*)\s*(?:\([^)]*\))?\s*[,;]\s*$/);
    if (m) nomes.set(m[1], `${arquivoRelativo}:${i + 1}`);
  }
  return nomes;
}

const ARMAS = lerEnum(WEAPON_TYPE);
const ARMADURAS = lerEnum(ARMOR_TYPE);

/* NONE existe nos dois enums. O servidor resolve pelo WeaponType primeiro
   (DocumentBase.java:1486-1500, o laço de WeaponType vem antes do de
   ArmorType), então classificamos igual — não inventamos desempate. */
const categoriaDoKind = (kind) =>
  ARMAS.has(kind) ? "arma" : ARMADURAS.has(kind) ? "armadura" : "desconhecido";

/* ---------- 1. índice skillId → kinds exigidos ---------- */
function listarXml(dirRelativo, recursivo) {
  const base = resolve(SERVIDOR, dirRelativo);
  const saida = [];
  for (const nome of readdirSync(base)) {
    const caminho = join(base, nome);
    if (statSync(caminho).isDirectory()) {
      if (recursivo) saida.push(...listarXml(rel(caminho), true));
    } else if (nome.toLowerCase().endsWith(".xml")) {
      saida.push(caminho);
    }
  }
  return saida.sort();
}

/* SkillData.processDirectory() não é recursivo (SkillData.java:66-86): lê
   data/stats/skills e, se CustomSkillsLoad estiver ligado, data/stats/skills/custom.
   Fazemos a mesma varredura, nem mais nem menos. */
const arquivosSkill = [...listarXml(DIR_SKILLS, false), ...listarXml(DIR_SKILLS_CUSTOM, false)];

/** skillId → { nome, arquivo, kinds: Map<kind, {contextos:Set, fonte}> } */
const skillPorId = new Map();
let usingDescartadosPorNot = 0;
let usingTotal = 0;
let skillsSobrescritas = 0;

for (const arquivo of arquivosSkill) {
  const caminho = rel(arquivo);
  const linhas = readFileSync(arquivo, "utf8").split(/\r?\n/);

  let skillAtual = null;
  let profundidadeNot = 0;
  let dentroDeConditions = 0;

  for (const [i, linha] of linhas.entries()) {
    const abre = linha.match(/<skill\s+id="(\d+)"[^>]*\bname="([^"]*)"/);
    if (abre) {
      const id = Number(abre[1]);
      /* o mesmo id pode estar em dois arquivos (custom/ redefine skill retail).
         O servidor faz `temp.put(hash, skill)` varrendo data/stats/skills e
         DEPOIS data/stats/skills/custom (SkillData.java:57-61), então quem
         chega por último vence. Reproduzimos isso: a definição anterior é
         jogada fora inteira, não fundida. */
      const anterior = skillPorId.get(id);
      if (anterior && anterior.arquivo !== caminho) skillsSobrescritas++;
      skillPorId.set(id, { id, nome: abre[2], arquivo: caminho, kinds: new Map() });
      skillAtual = skillPorId.get(id);
      profundidadeNot = 0;
      dentroDeConditions = 0;
      continue;
    }
    if (linha.includes("</skill>")) {
      skillAtual = null;
      continue;
    }
    if (!skillAtual) continue;

    /* <conditions ...> abre bloco; a variante auto-fechada não existe no
       datapack, mas tratamos mesmo assim para não contar errado se surgir */
    if (/<conditions\b/.test(linha) && !/\/>\s*$/.test(linha)) dentroDeConditions++;
    if (linha.includes("</conditions>")) dentroDeConditions--;
    if (linha.includes("<not>")) profundidadeNot++;
    if (linha.includes("</not>")) profundidadeNot--;

    const usa = linha.match(/<using\s+kind="([^"]*)"/);
    if (!usa) continue;
    usingTotal++;
    /* negação: "não estar usando X" é prova do contrário, fora */
    if (profundidadeNot > 0) {
      usingDescartadosPorNot++;
      continue;
    }

    const contexto = dentroDeConditions > 0 ? "exigencia" : "bonus";
    for (const kind of usa[1].split(",").map((k) => k.trim()).filter(Boolean)) {
      let registro = skillAtual.kinds.get(kind);
      if (!registro) {
        registro = { kind, contextos: new Set(), fonte: `${caminho}:${i + 1}` };
        skillAtual.kinds.set(kind, registro);
      }
      /* a primeira fonte fica; mas se aparecer como exigência depois de ter
         aparecido só como bônus, a exigência é a evidência mais forte e passa
         a ser a linha citada */
      if (contexto === "exigencia" && !registro.contextos.has("exigencia")) {
        registro.fonte = `${caminho}:${i + 1}`;
      }
      registro.contextos.add(contexto);
    }
  }
}

/* contagem global por kind só depois da varredura: antes disso ainda pode vir
   um arquivo custom que anula a definição já lida */
const kindsGlobais = new Map(); // kind → nº de skills distintas que o citam
for (const skill of skillPorId.values()) {
  for (const kind of skill.kinds.keys()) {
    kindsGlobais.set(kind, (kindsGlobais.get(kind) ?? 0) + 1);
  }
}

/* ---------- 2. árvores de skill por classe ---------- */
/** classId → { paiId, fonteArvore, skills: Map<skillId, fonte> } */
const arvorePorClasse = new Map();
let linhasDeArvore = 0;

for (const sub of SUBDIRS_ARVORE) {
  for (const arquivo of listarXml(`${DIR_ARVORES}/${sub}`, false)) {
    const caminho = rel(arquivo);
    const linhas = readFileSync(arquivo, "utf8").split(/\r?\n/);
    let atual = null;

    for (const [i, linha] of linhas.entries()) {
      const cab = linha.match(/<skillTree\s+type="classSkillTree"\s+classId="(-?\d+)"(?:\s+parentClassId="(-?\d+)")?/);
      if (cab) {
        const id = Number(cab[1]);
        atual = {
          id,
          paiId: cab[2] === undefined ? null : Number(cab[2]),
          fonteArvore: `${caminho}:${i + 1}`,
          skills: new Map(),
        };
        arvorePorClasse.set(id, atual);
        continue;
      }
      if (linha.includes("</skillTree>")) {
        atual = null;
        continue;
      }
      if (!atual) continue;

      const sk = linha.match(/<skill\s[^>]*skillId="(\d+)"/);
      if (!sk) continue;
      linhasDeArvore++;
      const id = Number(sk[1]);
      /* guardamos a PRIMEIRA linha onde a classe aprende a skill: é a menor
         graduação, a que o jogador vê primeiro na lista do village master */
      if (!atual.skills.has(id)) atual.skills.set(id, `${caminho}:${i + 1}`);
    }
  }
}

/* cadeia raiz→classe, igual ao SkillTreeData.java:151-165 */
function cadeia(classId) {
  const seq = [];
  let atual = classId;
  let trava = 0;
  while (atual !== null && atual !== undefined && arvorePorClasse.has(atual)) {
    seq.unshift(atual);
    atual = arvorePorClasse.get(atual).paiId;
    if (++trava > 10) break; // dado de arquivo: nunca confiar que não há ciclo
  }
  return seq;
}

/* ---------- 3. cruzar ---------- */
const indiceClasses = JSON.parse(readFileSync(CLASSES, "utf8"));
const semArvore = [];
const porClasse = {};

for (const classe of indiceClasses.classes) {
  const seq = cadeia(classe.id);
  if (seq.length === 0) {
    semArvore.push(classe.nome);
    porClasse[classe.id] = {
      id: classe.id,
      nome: classe.nome,
      slug: classe.slug,
      armas: [],
      total: 0,
      armaduras: [],
      totalArmaduras: 0,
      skillsNaArvore: 0,
      skillsComCondicao: 0,
      fonteArvore: "",
    };
    continue;
  }

  /* skillId → fonte na árvore (a do ancestral mais antigo que já ensina) */
  const skillsDaClasse = new Map();
  for (const cid of seq) {
    for (const [skillId, fonte] of arvorePorClasse.get(cid).skills) {
      if (!skillsDaClasse.has(skillId)) skillsDaClasse.set(skillId, fonte);
    }
  }

  /* kind → acumulado */
  const acumulado = new Map();
  let skillsComCondicao = 0;
  for (const [skillId, fonteArvore] of skillsDaClasse) {
    const skill = skillPorId.get(skillId);
    if (!skill || skill.kinds.size === 0) continue;
    skillsComCondicao++;
    for (const registro of skill.kinds.values()) {
      let a = acumulado.get(registro.kind);
      if (!a) {
        a = { kind: registro.kind, skills: [], exigidaPor: 0, bonusEm: 0 };
        acumulado.set(registro.kind, a);
      }
      a.skills.push({
        id: skillId,
        nome: skill.nome,
        fonte: registro.fonte,
        fonteArvore,
        exigencia: registro.contextos.has("exigencia"),
      });
      if (registro.contextos.has("exigencia")) a.exigidaPor++;
      if (registro.contextos.has("bonus")) a.bonusEm++;
    }
  }

  /* exemplo: preferimos uma skill que EXIGE a arma (evidência mais forte);
     empate resolvido pelo menor skillId, para a saída ser determinística */
  const montar = (a) => {
    const escolhido =
      [...a.skills].sort(
        (x, y) => Number(y.exigencia) - Number(x.exigencia) || x.id - y.id
      )[0];
    return {
      kind: a.kind,
      quantasSkills: a.skills.length,
      exigidaPor: a.exigidaPor,
      bonusEm: a.bonusEm,
      exemploSkillId: escolhido.id,
      exemploSkillNome: escolhido.nome,
      fonte: escolhido.fonte,
      fonteArvore: escolhido.fonteArvore,
    };
  };

  const ordenar = (x, y) => y.quantasSkills - x.quantasSkills || x.kind.localeCompare(y.kind);
  const armas = [...acumulado.values()]
    .filter((a) => categoriaDoKind(a.kind) === "arma")
    .map(montar)
    .sort(ordenar);
  const armaduras = [...acumulado.values()]
    .filter((a) => categoriaDoKind(a.kind) === "armadura")
    .map(montar)
    .sort(ordenar);

  porClasse[classe.id] = {
    id: classe.id,
    nome: classe.nome,
    slug: classe.slug,
    armas,
    total: armas.length,
    /* mesma derivação, outro enum: <using kind="LIGHT"> é ArmorType, não arma.
       Vem de graça na mesma varredura e responde "que armadura a classe usa". */
    armaduras,
    totalArmaduras: armaduras.length,
    skillsNaArvore: skillsDaClasse.size,
    skillsComCondicao,
    fonteArvore: arvorePorClasse.get(classe.id).fonteArvore,
  };
}

/* ---------- 4. montar ---------- */
const listaClasses = Object.values(porClasse);
const semNenhumaArma = listaClasses.filter((c) => c.total === 0);

const kindsEncontrados = [...kindsGlobais.entries()]
  .map(([kind, skills]) => ({
    kind,
    categoria: categoriaDoKind(kind),
    skillsQueCitam: skills,
    fonteEnum: ARMAS.get(kind) ?? ARMADURAS.get(kind) ?? "",
  }))
  .sort((a, b) => b.skillsQueCitam - a.skillsQueCitam || a.kind.localeCompare(b.kind));

const saida = {
  familia: "classe-armas",
  titulo: "Armas por classe",
  derivado: true,
  metodo:
    "Derivado, não lido: o servidor não tem tabela de 'arma por classe'. " +
    "1) varremos todo dist/game/data/stats/skills/*.xml (mais custom/, que o " +
    "servidor só carrega com CustomSkillsLoad=True) e montamos skillId → tipos de " +
    "arma citados em <using kind=\"...\">; o vocabulário de 'kind' são os enums " +
    "WeaponType e ArmorType, lidos do fonte Java, porque é contra eles que " +
    "DocumentBase.parseUsingCondition() (linhas 1469-1520) casa cada token. " +
    "2) montamos a árvore de skills de cada classe a partir de " +
    "dist/game/data/stats/players/skillTrees/, subindo pelo parentClassId do " +
    "próprio XML — é o caminho que SkillTreeData.java usa (linhas 209-215 e " +
    "141-168) para dar ao jogador a árvore completa, com herança dos ancestrais. " +
    "3) cruzamos os dois: o tipo de arma aparece para a classe se alguma skill " +
    "que ela aprende o cita. <using> dentro de <not> é negação e foi descartado. " +
    "'exigidaPor' = skills em que o tipo está dentro de <conditions> (sem a arma " +
    "a skill não sai); 'bonusEm' = skills em que está dentro de <effects> (a skill " +
    "sai, mas o bônus só vale com aquela arma).",
  geradoDe: [
    `${DIR_SKILLS}/*.xml`,
    `${DIR_SKILLS_CUSTOM}/*.xml`,
    `${DIR_ARVORES}/{StartingClass,1stClass,2ndClass,3rdClass}/*.xml`,
    WEAPON_TYPE,
    ARMOR_TYPE,
    "content/wiki/classes.json (índice de classes)",
  ],
  curadoPor:
    "extraído por scripts/extrair-classe-armas.mjs — cruzamento automático, sem curadoria editorial; nenhum tipo de arma foi acrescentado à mão",
  medicao: {
    arquivosDeSkillLidos: arquivosSkill.length,
    skillsIndexadas: skillPorId.size,
    skillsRedefinidasPorCustom: skillsSobrescritas,
    skillsComTipoDeArma: [...skillPorId.values()].filter((s) => s.kinds.size > 0).length,
    ocorrenciasDeUsingKind: usingTotal,
    ocorrenciasDescartadasPorNot: usingDescartadosPorNot,
    arvoresDeClasse: arvorePorClasse.size,
    linhasDeSkillNasArvores: linhasDeArvore,
    classes: listaClasses.length,
    classesSemNenhumTipoDeArma: semNenhumaArma.length,
  },
  kindsEncontrados,
  classes: porClasse,
};

writeFileSync(SAIDA, JSON.stringify(saida, null, 2) + "\n", "utf8");

console.log(`${listaClasses.length} classes → ${SAIDA}`);
console.log(
  `skills indexadas: ${skillPorId.size}  |  com <using kind>: ${saida.medicao.skillsComTipoDeArma}  |  ocorrências: ${usingTotal} (${usingDescartadosPorNot} descartadas por <not>, ${skillsSobrescritas} redefinidas por custom/)`
);
console.log(
  "kinds encontrados (" + kindsEncontrados.length + "):",
  kindsEncontrados.map((k) => `${k.kind}[${k.categoria === "arma" ? "arma" : "arm."}]:${k.skillsQueCitam}`).join("  ")
);
console.log(
  "top 5 em variedade de armas:",
  [...listaClasses]
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome))
    .slice(0, 5)
    .map((c) => `${c.nome}:${c.total}`)
    .join("  ")
);
if (semArvore.length) {
  console.log(`! ${semArvore.length} classes sem árvore de skill:`, semArvore.join(", "));
}
if (semNenhumaArma.length) {
  console.log(
    `! ${semNenhumaArma.length} classes sem nenhum tipo de arma:`,
    semNenhumaArma.map((c) => c.nome).join(", ")
  );
}
