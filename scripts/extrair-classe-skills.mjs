/**
 * EXTRATOR DE SKILLS POR CLASSE — servidor → content/wiki/classe-skills.json
 *
 * Roda: node scripts/extrair-classe-skills.mjs
 *
 * Fonte: dist/game/data/stats/players/skillTrees/{StartingClass,1stClass,2ndClass,3rdClass}
 * São 103 XML, um por classe, cada um com UM <skillTree type="classSkillTree">.
 *
 * ⚠️ O MAPEAMENTO ARQUIVO→CLASSE NÃO SAI DO NOME DO ARQUIVO.
 * Sai do atributo classId que está DENTRO do XML:
 *
 *   2ndClass/Bladedancer.xml:4  <skillTree type="classSkillTree" classId="34" parentClassId="32">
 *
 * É exatamente o que o servidor faz — SkillTreeData.java:198-201 lê
 * `getNamedItem("classId")` do elemento <skillTree> e ignora o nome do arquivo.
 * Casar por nome seria frágil de propósito: "Eva'sSaint.xml" tem apóstrofo,
 * "KamaelMaleSoldier.xml" não é o nome de exibição ("Male Soldier"), e
 * "HumanKnight.xml" é o "Knight" do classList. Nenhum desses casaria por string.
 * O nome do arquivo aqui é só documentação; o dado é o classId.
 * O relatório no fim mostra quais nomes de arquivo NÃO casariam por string —
 * como prova de que a escolha pelo classId não é preciosismo.
 *
 * O classes.json entra apenas como ÍNDICE (id → nome/slug/tier) e como
 * conferência dos dois lados: classe sem árvore e árvore sem classe.
 *
 * DECISÕES DE LEITURA, todas verificadas no source:
 *
 * - `levelUpSp` é OPCIONAL no XML (706 das 17177 linhas não têm). No servidor
 *   o atributo entra num StatSet genérico (SkillTreeData.java:224-231), então
 *   ausente = 0. Somamos como 0 e contamos quantas linhas eram assim em
 *   `linhasSemSp` — o campo vazio vira número medido, não estimativa.
 *
 * - "skill única" é por skillId, não por nome. skillId 239 muda de nome a cada
 *   nível ("Expertise D", "Expertise C", "Expertise B"...). Adotamos o nome do
 *   MENOR skillLevel e, quando há mais de um nome, gravamos todos em `nomes`.
 *   Esconder isso seria perder dado da fonte.
 *
 * - `exigeLivro` = a skill tem <item> em ALGUMA linha (spellbook). `comSpellbook`
 *   da classe conta LINHAS, não skills — são grandezas diferentes de propósito.
 *
 * - ⚠️ `skillName` do skillTree NÃO é o nome oficial da skill. Ele vira
 *   `SkillLearn._skillName` (SkillLearn.java:87) e o getter `getName()`
 *   (SkillLearn.java:101-104) NÃO é chamado em lugar nenhum do core nem do
 *   datapack — é campo decorativo. O nome que o jogador vê vem do `name` do
 *   <skill> em dist/game/data/stats/skills/ (SkillData), keyado por id.
 *   Em 24 dos 932 skillIds os dois textos divergem ("Fighters Will" vs
 *   "Fighter's Will", "Focus Mastery" vs "Force Mastery", "Enlightement" vs
 *   "Enlightenment"...). Publicar o do skillTree mostraria ao jogador um nome
 *   que não existe no jogo. Então: `nome` continua sendo o da fonte declarada
 *   (nada é reescrito em silêncio) e, QUANDO diverge, a skill ganha
 *   `nomeOficial` — o do SkillData, que é o que a página deve exibir.
 *   A lista completa sai em `nomeDivergeDoSkillData`.
 *
 * - `fonte` de cada skill única aponta a PRIMEIRA linha dela no arquivo
 *   (a de menor nível). O total por classe fica em `fonteArquivo`.
 *
 * O parser é por linha, não DOM: o formato é rígido (uma <skill> por linha,
 * <item> na linha seguinte) e o script precisa do NÚMERO DA LINHA para a fonte,
 * que um parser DOM não devolve. Se o formato mudar, o script acusa em vez de
 * inventar — ver a checagem de linhas <skill não reconhecidas no fim.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, posix, join } from "node:path";

const SERVIDOR = resolve(
  "C:/Users/admin/Desktop/MOBIUS SOURCE/L2J_Mobius/L2J_Mobius_CT_2.6_HighFive"
);
const BASE = "dist/game/data/stats/players/skillTrees";
const BASE_SKILLS = "dist/game/data/stats/skills";
const PASTAS = ["StartingClass", "1stClass", "2ndClass", "3rdClass"];
const INDICE_CLASSES = resolve("content/wiki/classes.json");
const SAIDA = resolve("content/wiki/classe-skills.json");

/* ---------- 1. índice de classes (id → nome/slug/tier) ---------- */
const indice = JSON.parse(readFileSync(INDICE_CLASSES, "utf8"));
const classePorId = new Map(indice.classes.map((c) => [c.id, c]));

/* ---------- 1b. nome OFICIAL da skill (SkillData) ---------- */
/* id → name do <skill> em stats/skills — a fonte que o servidor realmente usa
   para identificar a skill. O skillName do skillTree é decorativo (ver topo). */
const nomeOficialPorId = new Map();
(function varrerSkills(dir) {
  for (const entrada of readdirSync(dir)) {
    const caminho = join(dir, entrada);
    if (statSync(caminho).isDirectory()) {
      varrerSkills(caminho);
      continue;
    }
    if (!entrada.endsWith(".xml")) continue;
    const texto = readFileSync(caminho, "utf8");
    for (const m of texto.matchAll(/<skill\s+id="(\d+)"[^>]*?\sname="([^"]*)"/g)) {
      const id = Number(m[1]);
      if (!nomeOficialPorId.has(id)) nomeOficialPorId.set(id, m[2]);
    }
  }
})(resolve(SERVIDOR, BASE_SKILLS));

/* ---------- 2. varrer os XML ---------- */
const porClasse = new Map();
const arquivosSemClassId = [];
const classIdForaDoIndice = [];
const linhasNaoReconhecidas = [];
const nomeArquivoNaoCasaria = [];

/* `<skill ... />` numa linha só; o `/>` final é o que diz se há filhos abaixo */
const RE_SKILL = /<skill\s+([^>]*?)(\/?)>/;
const RE_SKILLTREE = /<skillTree\s+([^>]*?)>/;
const RE_ITEM = /<item\s+id="(\d+)"\s+count="(\d+)"/;

function atributos(texto) {
  const mapa = {};
  for (const m of texto.matchAll(/([a-zA-Z]+)="([^"]*)"/g)) mapa[m[1]] = m[2];
  return mapa;
}

for (const pasta of PASTAS) {
  const dir = resolve(SERVIDOR, BASE, pasta);
  for (const arquivo of readdirSync(dir).filter((f) => f.endsWith(".xml"))) {
    const rel = posix.join(BASE, pasta, arquivo);
    const linhas = readFileSync(resolve(dir, arquivo), "utf8").split(/\r?\n/);

    let classId = null;
    let parentClassId = null;
    let linhaArvore = 0;
    const linhasSkill = [];
    /* skill aberta (sem `/>`): as <item> das linhas seguintes são dela */
    let aberta = null;

    linhas.forEach((linha, i) => {
      if (classId === null) {
        const t = linha.match(RE_SKILLTREE);
        if (t) {
          const a = atributos(t[1]);
          if (a.classId !== undefined) {
            classId = Number(a.classId);
            parentClassId =
              a.parentClassId === undefined ? null : Number(a.parentClassId);
            linhaArvore = i + 1;
          }
          return;
        }
      }

      if (linha.includes("<item")) {
        const it = linha.match(RE_ITEM);
        if (it && aberta) {
          aberta.itens.push({ id: Number(it[1]), count: Number(it[2]) });
        }
        return;
      }
      if (linha.includes("</skill>")) {
        aberta = null;
        return;
      }
      if (!linha.includes("<skill ")) return;

      const m = linha.match(RE_SKILL);
      if (!m) {
        linhasNaoReconhecidas.push(`${rel}:${i + 1}`);
        return;
      }
      const a = atributos(m[1]);
      if (!a.skillId || !a.skillLevel || !a.getLevel) {
        linhasNaoReconhecidas.push(`${rel}:${i + 1}`);
        return;
      }
      const registro = {
        skillId: Number(a.skillId),
        nome: a.skillName ?? "",
        skillLevel: Number(a.skillLevel),
        getLevel: Number(a.getLevel),
        /* ausente = 0, como o StatSet do servidor; contado em linhasSemSp */
        sp: a.levelUpSp === undefined ? 0 : Number(a.levelUpSp),
        temSp: a.levelUpSp !== undefined,
        autoGet: a.autoGet === "true",
        porNpc: a.learnedByNpc === "true",
        porFS: a.learnedByFS === "true",
        itens: [],
        linha: i + 1,
      };
      linhasSkill.push(registro);
      /* m[2] é a `/` do fechamento inline — sem ela, a skill continua aberta */
      aberta = m[2] === "/" ? null : registro;
    });

    if (classId === null) {
      arquivosSemClassId.push(rel);
      continue;
    }
    if (porClasse.has(classId)) {
      classIdForaDoIndice.push({
        classId,
        motivo: "classId duplicado em mais de um arquivo",
        fonte: `${rel}:${linhaArvore}`,
      });
      continue;
    }

    const classe = classePorId.get(classId);
    if (!classe) {
      classIdForaDoIndice.push({
        classId,
        motivo: "classId não existe em classes.json",
        fonte: `${rel}:${linhaArvore}`,
      });
    } else {
      /* diagnóstico: o nome do arquivo casaria com o nome da classe por string? */
      const semXml = arquivo.replace(/\.xml$/, "");
      if (semXml !== classe.nome.replace(/\s+/g, "")) {
        nomeArquivoNaoCasaria.push({
          arquivo: semXml,
          nomeDaClasse: classe.nome,
          classId,
          fonte: `${rel}:${linhaArvore}`,
        });
      }
    }

    porClasse.set(classId, {
      classId,
      parentClassId,
      arquivo: rel,
      linhaArvore,
      linhasSkill,
    });
  }
}

/* ---------- 3. agregar por classe ---------- */
const nomeVariaPorNivel = [];
const entradas = [];
/* skillIds cujo skillName do skillTree não bate com o name do SkillData */
const divergeDoSkillData = new Map();
const semDefinicaoNoSkillData = new Set();

for (const [classId, dados] of [...porClasse.entries()].sort((a, b) => a[0] - b[0])) {
  const { linhasSkill, arquivo } = dados;
  const classe = classePorId.get(classId);

  const porSkillId = new Map();
  for (const l of linhasSkill) {
    if (!porSkillId.has(l.skillId)) porSkillId.set(l.skillId, []);
    porSkillId.get(l.skillId).push(l);
  }

  const skills = [...porSkillId.entries()]
    .map(([skillId, linhas]) => {
      const ordenadas = [...linhas].sort((a, b) => a.skillLevel - b.skillLevel);
      const nomes = [...new Set(ordenadas.map((l) => l.nome).filter(Boolean))];
      if (nomes.length > 1) {
        nomeVariaPorNivel.push({
          classId,
          skillId,
          nomes,
          fonte: `${arquivo}:${ordenadas[0].linha}`,
        });
      }
      const primeira = ordenadas.reduce((a, b) => (b.linha < a.linha ? b : a));

      /* o nome que o jogador vê. Só entra no dado quando DIVERGE do skillTree,
         para não duplicar 2600 campos iguais — ver o bloco de decisões no topo. */
      const oficial = nomeOficialPorId.get(skillId);
      if (oficial === undefined) {
        semDefinicaoNoSkillData.add(skillId);
      } else if (!nomes.includes(oficial)) {
        if (!divergeDoSkillData.has(skillId)) {
          divergeDoSkillData.set(skillId, {
            skillId,
            noSkillTree: nomes.length > 1 ? nomes : ordenadas[0].nome,
            noSkillData: oficial,
            fonte: `${arquivo}:${primeira.linha}`,
          });
        }
      }
      const temDivergencia = oficial !== undefined && !nomes.includes(oficial);

      return {
        skillId,
        nome: ordenadas[0].nome,
        ...(temDivergencia ? { nomeOficial: oficial } : {}),
        ...(nomes.length > 1 ? { nomes } : {}),
        nivelMaisBaixo: Math.min(...linhas.map((l) => l.getLevel)),
        nivelMaisAlto: Math.max(...linhas.map((l) => l.getLevel)),
        niveis: new Set(linhas.map((l) => l.skillLevel)).size,
        spTotal: linhas.reduce((s, l) => s + l.sp, 0),
        exigeLivro: linhas.some((l) => l.itens.length > 0),
        autoGet: linhas.every((l) => l.autoGet),
        fonte: `${arquivo}:${primeira.linha}`,
      };
    })
    .sort((a, b) => a.nivelMaisBaixo - b.nivelMaisBaixo || a.skillId - b.skillId);

  entradas.push([
    String(classId),
    {
      classId,
      nome: classe?.nome ?? "",
      slug: classe?.slug ?? "",
      tier: classe?.tier ?? null,
      /* o pai aqui é o do XML de skill tree; a hierarquia canônica é a do
         classes.json (enum). Guardado só para conferência — ver relatório. */
      parentClassIdXml: dados.parentClassId,
      totalLinhas: linhasSkill.length,
      skillsUnicas: porSkillId.size,
      nivelMinimo: linhasSkill.length ? Math.min(...linhasSkill.map((l) => l.getLevel)) : null,
      nivelMaximo: linhasSkill.length ? Math.max(...linhasSkill.map((l) => l.getLevel)) : null,
      spTotal: linhasSkill.reduce((s, l) => s + l.sp, 0),
      linhasSemSp: linhasSkill.filter((l) => !l.temSp).length,
      comSpellbook: linhasSkill.filter((l) => l.itens.length > 0).length,
      skills,
      fonteArquivo: arquivo,
    },
  ]);
}

const classes = Object.fromEntries(entradas);

/* ---------- 4. conferências dos dois lados ---------- */
const semArvore = indice.classes
  .filter((c) => !porClasse.has(c.id))
  .map((c) => ({ classId: c.id, nome: c.nome, fonte: c.fonte }));

/* divergência de pai entre o XML de skill tree e o enum (autoridade do
   classes.json). Não corrigimos nada aqui — só registramos, é informação. */
const paiDivergente = [];
for (const e of entradas) {
  const v = e[1];
  const c = classePorId.get(v.classId);
  if (c && c.paiId !== v.parentClassIdXml) {
    paiDivergente.push({
      classId: v.classId,
      nome: v.nome,
      paiSegundoSkillTree: v.parentClassIdXml,
      paiSegundoEnum: c.paiId,
      fonte: `${v.fonteArquivo}:${porClasse.get(v.classId).linhaArvore}`,
    });
  }
}

const totalLinhas = entradas.reduce((s, [, v]) => s + v.totalLinhas, 0);
const totalSpellbook = entradas.reduce((s, [, v]) => s + v.comSpellbook, 0);
const totalSemSp = entradas.reduce((s, [, v]) => s + v.linhasSemSp, 0);
const skillIdsDistintosGlobais = new Set(
  entradas.flatMap(([, v]) => v.skills.map((s) => s.skillId))
).size;

const saida = {
  familia: "classe-skills",
  titulo: "Skills por classe",
  geradoDe: PASTAS.map((p) => posix.join(BASE, p)),
  curadoPor:
    "extraído por scripts/extrair-classe-skills.mjs — 100% lido do servidor; o mapeamento arquivo→classe vem do atributo classId de dentro do XML (o mesmo que SkillTreeData.java:198-201 usa), nunca do nome do arquivo",
  totalClasses: entradas.length,
  totalClassesNoIndice: indice.total,
  totalLinhas,
  skillIdsDistintosGlobais,
  totalComSpellbook: totalSpellbook,
  /* linhas cujo levelUpSp não existe no XML — somadas como 0, igual ao servidor */
  totalLinhasSemSp: totalSemSp,
  /* tudo o que NÃO casou fica no dado, não só no console */
  classesSemArvore: semArvore,
  arquivosSemClassId,
  classIdForaDoIndice,
  linhasNaoReconhecidas,
  nomeArquivoNaoCasaria,
  nomeVariaPorNivel,
  /* skillName do skillTree ≠ name do SkillData. O campo do skillTree é
     decorativo (SkillLearn.getName() não é chamado em lugar nenhum); quem
     manda na tela é o SkillData. Nessas skills use `nomeOficial`. */
  nomeDivergeDoSkillData: [...divergeDoSkillData.values()].sort(
    (a, b) => a.skillId - b.skillId
  ),
  skillIdsSemDefinicaoNoSkillData: [...semDefinicaoNoSkillData].sort((a, b) => a - b),
  paiDivergente,
  classes,
};

writeFileSync(SAIDA, JSON.stringify(saida, null, 2) + "\n", "utf8");

console.log(`${entradas.length}/${indice.total} classes cobertas → ${SAIDA}`);
console.log(`linhas <skill>: ${totalLinhas}   skillIds distintos (global): ${skillIdsDistintosGlobais}`);
console.log(`linhas com spellbook: ${totalSpellbook}   linhas sem levelUpSp: ${totalSemSp}`);
console.log(
  `skills únicas por classe: min ${Math.min(...entradas.map(([, v]) => v.skillsUnicas))}  max ${Math.max(...entradas.map(([, v]) => v.skillsUnicas))}`
);
if (semArvore.length) console.log(`! ${semArvore.length} classes sem árvore:`, semArvore.map((c) => `${c.classId} ${c.nome}`).join(", "));
if (arquivosSemClassId.length) console.log(`! ${arquivosSemClassId.length} arquivos sem classId:`, arquivosSemClassId.join(", "));
if (classIdForaDoIndice.length) console.log(`! ${classIdForaDoIndice.length} classId problemáticos:`, JSON.stringify(classIdForaDoIndice));
if (linhasNaoReconhecidas.length) console.log(`! ${linhasNaoReconhecidas.length} linhas <skill> não reconhecidas:`, linhasNaoReconhecidas.slice(0, 10).join(", "));
if (nomeArquivoNaoCasaria.length) console.log(`! ${nomeArquivoNaoCasaria.length} arquivos NÃO casariam por nome (por isso o classId manda):`, nomeArquivoNaoCasaria.map((n) => `${n.arquivo}≠${n.nomeDaClasse}`).join(", "));
if (nomeVariaPorNivel.length) console.log(`! ${nomeVariaPorNivel.length} skills mudam de nome entre níveis (nome adotado = o do menor nível)`);
if (divergeDoSkillData.size) console.log(`! ${divergeDoSkillData.size} skillIds com skillName ≠ SkillData (a página deve usar nomeOficial):`, [...divergeDoSkillData.values()].map((d) => `${d.skillId} "${Array.isArray(d.noSkillTree) ? d.noSkillTree[0] : d.noSkillTree}"→"${d.noSkillData}"`).join(", "));
if (semDefinicaoNoSkillData.size) console.log(`! ${semDefinicaoNoSkillData.size} skillIds sem definição em ${BASE_SKILLS}:`, [...semDefinicaoNoSkillData].join(", "));
if (paiDivergente.length) console.log(`! ${paiDivergente.length} classes com pai divergente entre skillTree e enum:`, paiDivergente.map((p) => `${p.nome}(${p.paiSegundoSkillTree}≠${p.paiSegundoEnum})`).join(", "));
