/**
 * EXTRATOR DE TROCA DE PROFISSÃO — servidor → content/wiki/classe-profissao.json
 *
 * Roda: node scripts/extrair-profissao.mjs
 *
 * O servidor não guarda "requisito de profissão" em lugar nenhum: não existe
 * um XML de regras. O requisito ESTÁ ESCRITO NO CÓDIGO de cada village master,
 * em três dialetos diferentes — e é por isso que este extrator parseia Java em
 * vez de ler tabela:
 *
 *   1. CADEIA DE `else if` (11 dos 14 scripts) — ElfHuman*, Orc*, Dwarf*, Kamael*
 *        else if ((classId == WARRIOR) && (player.getPlayerClass() == PlayerClass.FIGHTER))
 *        { if (player.getLevel() < 20) ... else if (hasQuestItems(player, MEDALLION_OF_WARRIOR)) ... }
 *
 *   2. TABELA `int[][] CLASSES` (DarkElfChange1/2) — o nonom escreveu Elfo Negro
 *      como dado, não como código. Mesma regra, forma diferente:
 *        { 32, 31, 15, 16, 17, 18, GAZE_OF_ABYSS }, // PK
 *          ^destino ^origem ^^^^^^^^^^^ sufixos de html  ^item
 *
 *   3. QUEST em vez de item (Kamael 1ª e 2ª) — não há `hasQuestItems`; o gate é
 *      `qs.isCompleted()` de uma quest. O `takeItems` que aparece ali só limpa o
 *      inventário DEPOIS; não é requisito. Por isso a saída separa
 *      `itensExigidos` (o que é COBRADO) de `itensConsumidos` (o que é tomado).
 *      Misturar os dois inventaria um requisito que o servidor não checa.
 *
 * A 3ª profissão não passa por village master nenhum: vem das 34 Saga quests
 * (`AbstractSagaQuest`), que carregam `_classId`/`_prevClass` e exigem nível 76.
 * Fora dela, Judicator (136) vem da Q00061 e Inspector (135) só existe como
 * subclasse de Kamael. Tudo isso é lido dos arquivos, não digitado aqui.
 *
 * ⚠️ O NPC de atalho (ClassMaster / Mr. Cat) está DESLIGADO neste servidor
 * (`classChangeEnabled="false"`). O script confere isso e grava o resultado —
 * se alguém ligar amanhã, a próxima rodada denuncia sozinha.
 *
 * A ÚNICA camada editorial é a prosa das regras de subclasse (mapa REGRAS_SUB):
 * o texto é nosso, mas a LINHA é medida — cada regra tem uma âncora, um trecho
 * literal do VillageMaster.java, e o script procura a âncora no arquivo. Âncora
 * que não bate = regra descartada e reportada, nunca publicada com fonte falsa.
 *
 * Toda entrada carrega `fonte` no formato ARQUIVO:LINHA. Sem fonte, campo vazio
 * e entra no relatório.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const SERVIDOR = resolve(
  "C:/Users/admin/Desktop/MOBIUS SOURCE/L2J_Mobius/L2J_Mobius_CT_2.6_HighFive"
);
const SAIDA = resolve("content/wiki/classe-profissao.json");
const INDICE_CLASSES = resolve("content/wiki/classes.json");

const DIR_VM = "dist/game/data/scripts/village_master";
const DIR_QUESTS = "dist/game/data/scripts/quests";
const ABSTRACT_SAGA = `${DIR_QUESTS}/AbstractSagaQuest.java`;
const Q_JUDICATOR = `${DIR_QUESTS}/Q00061_LawEnforcement/Q00061_LawEnforcement.java`;
const VILLAGE_MASTER =
  "java/org/l2jmobius/gameserver/model/actor/instance/VillageMaster.java";
const PLAYER_INI = "dist/game/config/Player.ini";
const CLASS_MASTER_XML = "dist/game/config/ClassMaster.xml";
const DIR_ITENS = "dist/game/data/stats/items";
const DIR_NPCS = "dist/game/data/stats/npcs";

const avisos = [];
const lacunas = [];

function linhas(rel) {
  return readFileSync(resolve(SERVIDOR, rel), "utf8").split(/\r?\n/);
}

/* ---------- 0. índice de classes (fato já estabelecido: vem do enum) ---------- */
const indice = new Map(
  JSON.parse(readFileSync(INDICE_CLASSES, "utf8")).classes.map((c) => [
    c.id,
    c,
  ])
);
const nomeClasse = (id) => indice.get(id)?.nome ?? "";
const tierClasse = (id) => indice.get(id)?.tier ?? null;

/* ---------- 1. nomes de item e de NPC, com a linha do XML ----------
   O comentário `// Tapoy` do script Java é conveniente mas é comentário.
   O nome que o jogador lê sai do XML de stats — é esse que vale. */
function mapaXml(dir, tag) {
  const mapa = new Map();
  const arquivos = [];
  const anda = (sub) => {
    for (const e of readdirSync(resolve(SERVIDOR, dir, sub), {
      withFileTypes: true,
    })) {
      const rel = sub ? `${sub}/${e.name}` : e.name;
      if (e.isDirectory()) anda(rel);
      else if (e.name.endsWith(".xml")) arquivos.push(rel);
    }
  };
  anda("");
  const re = new RegExp(`<${tag}\\s+id="(\\d+)"[^>]*?\\bname="([^"]*)"`);
  for (const arq of arquivos) {
    const ls = linhas(`${dir}/${arq}`);
    ls.forEach((linha, i) => {
      const m = linha.match(re);
      /* primeiro id vence: o retail carrega, o custom não sobrescreve nome à revelia */
      if (m && !mapa.has(Number(m[1]))) {
        mapa.set(Number(m[1]), {
          nome: m[2],
          fonte: `${dir}/${arq}:${i + 1}`,
        });
      }
    });
  }
  return mapa;
}

const ITENS = mapaXml(DIR_ITENS, "item");
const NPCS = mapaXml(DIR_NPCS, "npc");

function item(id, fonteFallback) {
  const x = ITENS.get(id);
  if (!x) {
    lacunas.push(`item ${id} não tem nome em ${DIR_ITENS} (visto em ${fonteFallback})`);
    return { id, nome: "", fonte: "" };
  }
  return { id, nome: x.nome, fonte: x.fonte };
}

function npc(id, nomeComentario, fonteComentario) {
  const x = NPCS.get(id);
  if (!x) {
    lacunas.push(`npc ${id} não tem nome em ${DIR_NPCS} (visto em ${fonteComentario})`);
    return { id, nome: nomeComentario ?? "", fonte: fonteComentario };
  }
  return { id, nome: x.nome, fonte: x.fonte };
}

/* ---------- 2. leitura genérica de um script de village master ---------- */

/** `private static final int MARK_OF_DUTY = 2633;` → nome → valor */
function constantes(ls) {
  const m = new Map();
  ls.forEach((linha, i) => {
    const x = linha.match(/private static (?:final )?int ([A-Z_0-9]+) = (\d+);/);
    if (x) m.set(x[1], { valor: Number(x[2]), linha: i + 1 });
  });
  return m;
}

/** `private static int[] NPCS = { 30499, // Tapoy ... }` → nome do array → [{id, nome, linha}] */
function arraysDeNpc(ls) {
  const arrays = new Map();
  for (let i = 0; i < ls.length; i++) {
    const decl = ls[i].match(/private static (?:final )?int\[\] (\w+)\s*=/);
    if (!decl) continue;
    const entradas = [];
    for (let j = i + 1; j < ls.length; j++) {
      const t = ls[j].trim();
      if (t === "{") continue;
      if (t === "};") break;
      const e = t.match(/^(\d+),?\s*(?:\/\/\s*(.*))?$/);
      if (e) entradas.push({ id: Number(e[1]), nome: (e[2] ?? "").trim(), linha: j + 1 });
      else break;
    }
    if (entradas.length) arrays.set(decl[1], entradas);
  }
  return arrays;
}

/** limites [inicio, fim] do corpo de um método, por contagem de chaves */
function corpoDoMetodo(ls, regexAssinatura) {
  const i = ls.findIndex((l) => regexAssinatura.test(l));
  if (i < 0) return null;
  let d = 0;
  for (let j = i; j < ls.length; j++) {
    for (const ch of ls[j]) {
      if (ch === "{") d++;
      else if (ch === "}") {
        d--;
        if (d === 0) return [i, j];
      }
    }
  }
  return null;
}

/**
 * Varre o corpo de um método e devolve os blocos governados por `classId == X`,
 * com as condições que os envolvem.
 *
 * O estilo Mobius põe `{` em linha própria, o que permite rastrear profundidade
 * sem parser de Java de verdade. O `else` puro vira `!(condição do if irmão)` —
 * é assim que o KamaelChange2 distingue mestre macho de mestre fêmea, e sem
 * isso os Soul Breaker/Arbalester sairiam atribuídos ao NPC errado.
 */
function blocosDeClasse(ls, ini, fim) {
  const blocos = [];
  const pilha = [];
  const fechadoEm = new Map(); // profundidade → último bloco irmão fechado
  let prof = 0;
  let pendente = null;
  let anterior = "";

  for (let i = ini; i <= fim; i++) {
    const t = ls[i].trim();
    if (t === "{") {
      prof++;
      let cond = pendente?.cond ?? "";
      let linhaCond = pendente?.linha ?? i + 1;
      if (!pendente && anterior === "else" && fechadoEm.has(prof)) {
        cond = `!(${fechadoEm.get(prof).cond})`;
        linhaCond = i + 1;
      }
      pilha.push({
        prof,
        cond,
        linhaCond,
        inicio: i,
        envolventes: pilha.map((f) => f.cond),
      });
      pendente = null;
    } else if (t === "}" || t === "};") {
      const f = pilha.pop();
      if (f) {
        fechadoEm.set(prof, f);
        if (/classId\s*==/.test(f.cond)) blocos.push({ ...f, fim: i });
      }
      prof--;
    } else {
      const m = t.match(/^(?:else\s+)?if\s*\((.+)\)$/);
      if (m) pendente = { cond: m[1], linha: i + 1 };
    }
    if (t) anterior = t;
  }
  return blocos;
}

/** resolve `MARK_OF_DUTY` ou `2633` para um número */
function valor(token, consts) {
  if (/^\d+$/.test(token)) return Number(token);
  return consts.get(token)?.valor ?? null;
}

function lerScriptVM(pasta) {
  const rel = `${DIR_VM}/${pasta}/${pasta}.java`;
  const ls = linhas(rel);
  const consts = constantes(ls);
  const arrays = arraysDeNpc(ls);
  const limites = corpoDoMetodo(ls, /private String ClassChangeRequested\(/);
  if (!limites) {
    avisos.push(`${rel}: sem método ClassChangeRequested — não é cadeia de else if`);
    return [];
  }

  const todosNpcs = [...arrays.values()].flat();
  const saida = [];

  for (const b of blocosDeClasse(ls, limites[0], limites[1])) {
    const idAlvo = valor(b.cond.match(/classId\s*==\s*(\w+)/)[1], consts);
    if (idAlvo === null) {
      avisos.push(`${rel}:${b.linhaCond}: não resolvi o classId da condição`);
      continue;
    }

    /* classe de origem: na própria condição, ou numa que envolve o bloco
       (KamaelChange2 aninha `classId == 127` dentro de `== PlayerClass.TROOPER`) */
    const reOrigem = /player\.getPlayerClass\(\)\s*==\s*PlayerClass\.([A-Z_0-9]+)/;
    let origem = b.cond.match(reOrigem)?.[1] ?? null;
    if (!origem) {
      for (let k = b.envolventes.length - 1; k >= 0; k--) {
        const m = b.envolventes[k].match(reOrigem);
        if (m) {
          origem = m[1];
          break;
        }
      }
    }

    /* qual conjunto de NPCs atende esta troca (só o Kamael separa por sexo) */
    let npcsDaTroca = todosNpcs;
    for (const cond of b.envolventes) {
      const m = cond.match(/(!\()?ArrayUtil\.contains\((\w+),/);
      if (!m) continue;
      npcsDaTroca = m[1]
        ? [...arrays.entries()].filter(([n]) => n !== m[2]).flatMap(([, v]) => v)
        : arrays.get(m[2]) ?? todosNpcs;
    }

    const texto = ls.slice(b.inicio, b.fim + 1);
    const corpo = texto.join("\n");

    const nivel = corpo.match(/player\.getLevel\(\)\s*<\s*(\d+)/);
    const exigidos = corpo.match(/hasQuestItems\(player,\s*([^)]+)\)/);
    const quest = corpo.match(/getQuestState\((Q\d+_\w+)\.class/);
    const premio = corpo.match(/giveItems\(player,\s*(\w+),\s*(\d+)\)/);

    /* takeItems tem duas assinaturas: (player, item, -1) e (player, -1, a, b, c) */
    const consumidos = new Set();
    for (const m of corpo.matchAll(/takeItems\(player,\s*([^)]+)\)/g)) {
      for (const tok of m[1].split(",").map((s) => s.trim())) {
        if (tok === "-1") continue;
        const v = valor(tok, consts);
        if (v !== null) consumidos.add(v);
      }
    }

    const itensExigidos = exigidos
      ? exigidos[1]
          .split(",")
          .map((s) => valor(s.trim(), consts))
          .filter((v) => v !== null)
          .map((v) => item(v, `${rel}:${b.linhaCond}`))
      : [];

    saida.push({
      classId: idAlvo,
      origemConstante: origem,
      nivelMinimo: nivel ? Number(nivel[1]) : null,
      itensExigidos,
      itensConsumidos: [...consumidos].map((v) => item(v, `${rel}:${b.linhaCond}`)),
      questExigida: quest ? quest[1] : null,
      recompensa: premio
        ? { ...item(valor(premio[1], consts), `${rel}:${b.linhaCond}`), quantidade: Number(premio[2]) }
        : null,
      npcQueTroca: npcsDaTroca.map((n) => npc(n.id, n.nome, `${rel}:${n.linha}`)),
      fonte: `${rel}:${b.linhaCond}`,
      fonteNivel: nivel ? `${rel}:${b.inicio + 1 + texto.findIndex((l) => /getLevel\(\)\s*<\s*\d+/.test(l))}` : "",
    });
  }
  return saida;
}

/* ---------- 3. DarkElfChange1/2: mesma regra, escrita como tabela ---------- */
function lerScriptDarkElf(pasta) {
  const rel = `${DIR_VM}/${pasta}/${pasta}.java`;
  const ls = linhas(rel);
  const consts = constantes(ls);
  const arrays = arraysDeNpc(ls);
  const todosNpcs = [...arrays.values()].flat();

  const limites = corpoDoMetodo(ls, /public String onEvent\(/);
  const corpo = limites ? ls.slice(limites[0], limites[1] + 1).join("\n") : "";
  const nivel = corpo.match(/player\.getLevel\(\)\s*<\s*(\d+)/);
  const linhaNivel = ls.findIndex((l) => /player\.getLevel\(\)\s*<\s*\d+/.test(l));
  const premio = corpo.match(/giveItems\(player,\s*(\w+),\s*(\d+)\)/);

  const saida = [];
  ls.forEach((linha, i) => {
    /* linha de tabela: { destino, origem, ...sufixos de html..., ITEM[, ITEM, ITEM] } */
    const m = linha.match(/^\s*\{\s*([\d,\sA-Z_]+?)\s*\},/);
    if (!m) return;
    const tokens = m[1].split(",").map((s) => s.trim()).filter(Boolean);
    if (tokens.length < 3 || !/^\d+$/.test(tokens[0])) return;
    const itens = tokens.filter((t) => !/^\d+$/.test(t)).map((t) => valor(t, consts));
    if (!itens.length) return; // não é a tabela CLASSES

    saida.push({
      classId: Number(tokens[0]),
      origemId: Number(tokens[1]),
      nivelMinimo: nivel ? Number(nivel[1]) : null,
      itensExigidos: itens.map((v) => item(v, `${rel}:${i + 1}`)),
      itensConsumidos: itens.map((v) => item(v, `${rel}:${i + 1}`)),
      questExigida: null,
      recompensa: premio
        ? { ...item(valor(premio[1], consts), `${rel}:${i + 1}`), quantidade: Number(premio[2]) }
        : null,
      npcQueTroca: todosNpcs.map((n) => npc(n.id, n.nome, `${rel}:${n.linha}`)),
      fonte: `${rel}:${i + 1}`,
      fonteNivel: linhaNivel >= 0 ? `${rel}:${linhaNivel + 1}` : "",
    });
  });
  return saida;
}

/* ---------- 4. junta os 14 scripts ---------- */
const pastasVM = readdirSync(resolve(SERVIDOR, DIR_VM), { withFileTypes: true })
  .filter((e) => e.isDirectory() && /Change[12]$/.test(e.name))
  .map((e) => e.name)
  .sort();

const porClasse = {};
const constantePorId = new Map(
  [...indice.values()].filter((c) => c.constante).map((c) => [c.constante, c.id])
);

for (const pasta of pastasVM) {
  const entradas = pasta.startsWith("DarkElf")
    ? lerScriptDarkElf(pasta)
    : lerScriptVM(pasta);
  for (const e of entradas) {
    const origemId =
      e.origemId ?? (e.origemConstante ? constantePorId.get(e.origemConstante) ?? null : null);
    if (e.origemConstante && origemId === null) {
      avisos.push(`${e.fonte}: PlayerClass.${e.origemConstante} não existe em classes.json`);
    }
    porClasse[e.classId] = {
      classId: e.classId,
      nome: nomeClasse(e.classId),
      tier: tierClasse(e.classId),
      viaProfissao: pasta.endsWith("1") ? 1 : 2,
      classeOrigemId: origemId,
      classeOrigemNome: origemId === null ? "" : nomeClasse(origemId),
      nivelMinimo: e.nivelMinimo,
      metodo: e.questExigida
        ? "quest"
        : e.itensExigidos.length
          ? "item"
          : "indeterminado",
      /* singular só quando existe UM item; com três marcas, um id só seria mentira */
      itemExigidoId: e.itensExigidos.length === 1 ? e.itensExigidos[0].id : null,
      itemExigidoNome: e.itensExigidos.length === 1 ? e.itensExigidos[0].nome : "",
      itensExigidos: e.itensExigidos,
      itensConsumidos: e.itensConsumidos,
      questExigida: e.questExigida,
      recompensa: e.recompensa,
      npcQueTroca: e.npcQueTroca,
      script: `${DIR_VM}/${pasta}/${pasta}.java`,
      fonte: e.fonte,
      fonteNivel: e.fonteNivel,
    };
    if (e.nivelMinimo === null) lacunas.push(`${e.fonte}: sem checagem de nível no bloco`);
    if (!e.itensExigidos.length && !e.questExigida)
      lacunas.push(`${e.fonte}: sem item nem quest exigidos`);
  }
}

/* ---------- 5. 3ª profissão: as Saga quests ----------
   Nenhum village master faz a 3ª. Quem faz é AbstractSagaQuest.onEvent("0-2"),
   e cada Q000XX_Saga* só declara qual classe entrega e de qual sai. */
const saga = linhas(ABSTRACT_SAGA);
const iNivelSaga = saga.findIndex((l) => /player\.getLevel\(\)\s*<\s*76/.test(l));
const iSetSaga = saga.findIndex((l) => /player\.setPlayerClass\(playerClass\);/.test(l));
const NIVEL_SAGA = iNivelSaga >= 0 ? 76 : null;
if (iNivelSaga < 0) lacunas.push(`${ABSTRACT_SAGA}: não achei a checagem de nível da saga`);

function arrayInt(ls, campo) {
  const i = ls.findIndex((l) => l.includes(`${campo} = new int[]`));
  if (i < 0) return null;
  const nums = [];
  for (let j = i; j < ls.length; j++) {
    for (const m of ls[j].matchAll(/(0x[0-9a-fA-F]+|\d+)/g)) {
      if (!/new int\[\]/.test(m.input.slice(0, m.index))) nums.push(Number(m[0]));
    }
    if (ls[j].includes("};")) break;
  }
  return { valores: nums, linha: i + 1 };
}

const pastasSaga = readdirSync(resolve(SERVIDOR, DIR_QUESTS), { withFileTypes: true })
  .filter((e) => e.isDirectory() && /_SagaOf|_SagaOfThe/.test(e.name))
  .map((e) => e.name)
  .sort();

for (const pasta of pastasSaga) {
  const rel = `${DIR_QUESTS}/${pasta}/${pasta}.java`;
  if (!existsSync(resolve(SERVIDOR, rel))) {
    avisos.push(`${rel}: arquivo esperado não existe`);
    continue;
  }
  const ls = linhas(rel);
  const alvos = arrayInt(ls, "_classId");
  const origens = arrayInt(ls, "_prevClass");
  if (!alvos) {
    lacunas.push(`${rel}: sem _classId`);
    continue;
  }
  alvos.valores.forEach((id, k) => {
    const origemId = origens?.valores[k] ?? origens?.valores[0] ?? null;
    porClasse[id] = {
      classId: id,
      nome: nomeClasse(id),
      tier: tierClasse(id),
      viaProfissao: 3,
      classeOrigemId: origemId,
      classeOrigemNome: origemId === null ? "" : nomeClasse(origemId),
      nivelMinimo: NIVEL_SAGA,
      metodo: "quest",
      itemExigidoId: null,
      itemExigidoNome: "",
      itensExigidos: [],
      itensConsumidos: [],
      questExigida: pasta,
      recompensa: null,
      npcQueTroca: [],
      script: rel,
      fonte: `${rel}:${alvos.linha}`,
      fonteNivel: iNivelSaga >= 0 ? `${ABSTRACT_SAGA}:${iNivelSaga + 1}` : "",
    };
  });
}

/* Judicator (136) e Inspector (135) ficam fora da saga — os dois casos Kamael */
const judic = linhas(Q_JUDICATOR);
const iJudicSet = judic.findIndex((l) => /setPlayerClass\(136\)/.test(l));
const iJudicNivel = judic.findIndex((l) => /MIN_LEVEL = (\d+);/.test(l));
if (iJudicSet >= 0) {
  porClasse[136] = {
    classId: 136,
    nome: nomeClasse(136),
    tier: tierClasse(136),
    viaProfissao: 3,
    classeOrigemId: 135,
    classeOrigemNome: nomeClasse(135),
    nivelMinimo: iJudicNivel >= 0 ? Number(judic[iJudicNivel].match(/= (\d+);/)[1]) : null,
    metodo: "quest",
    itemExigidoId: null,
    itemExigidoNome: "",
    itensExigidos: [],
    itensConsumidos: [],
    questExigida: "Q00061_LawEnforcement",
    recompensa: null,
    npcQueTroca: [],
    script: Q_JUDICATOR,
    fonte: `${Q_JUDICATOR}:${iJudicSet + 1}`,
    fonteNivel: iJudicNivel >= 0 ? `${Q_JUDICATOR}:${iJudicNivel + 1}` : "",
  };
} else {
  lacunas.push(`${Q_JUDICATOR}: não achei setPlayerClass(136)`);
}

const vm = linhas(VILLAGE_MASTER);
const iInspector = vm.findIndex((l) => /subclasses\.remove\(PlayerClass\.INSPECTOR\)/.test(l));
if (iInspector >= 0) {
  /* Inspector é 2ª profissão mas nenhum village master a entrega: ela só aparece
     na lista de SUBCLASSE, e só para Kamael com a 2ª sub em 75+ */
  porClasse[135] = {
    classId: 135,
    nome: nomeClasse(135),
    tier: tierClasse(135),
    viaProfissao: 2,
    classeOrigemId: null,
    classeOrigemNome: "",
    nivelMinimo: null,
    metodo: "somente-subclasse",
    itemExigidoId: null,
    itemExigidoNome: "",
    itensExigidos: [],
    itensConsumidos: [],
    questExigida: null,
    recompensa: null,
    npcQueTroca: [],
    script: VILLAGE_MASTER,
    fonte: `${VILLAGE_MASTER}:${iInspector + 1}`,
    fonteNivel: "",
  };
}

/* ---------- 6. porTier ---------- */
function consolidaNivel(via) {
  const vals = Object.values(porClasse).filter((c) => c.viaProfissao === via);
  const niveis = [...new Set(vals.map((c) => c.nivelMinimo).filter((n) => n !== null))];
  const fontes = [...new Set(vals.map((c) => c.fonteNivel).filter(Boolean))];
  if (niveis.length > 1) {
    avisos.push(`profissão ${via}: níveis divergentes no código — ${niveis.join(", ")}`);
  }
  return {
    nivel: niveis.length === 1 ? niveis[0] : null,
    niveisVistos: niveis,
    classes: vals.length,
    fontes,
  };
}

const t1 = consolidaNivel(1);
const t2 = consolidaNivel(2);
const t3 = consolidaNivel(3);

/* Armadilha de nomenclatura que já derrubou leitura de código alheio: o
   CategoryData chama de FIRST_CLASS_GROUP as classes BASE (nenhuma profissão
   feita). Ou seja, os nomes estão deslocados em um: quem faz a 3ª profissão cai
   em FOURTH_CLASS_GROUP. Fica gravado no dado, com a linha, para ninguém ler
   "THIRD_CLASS_GROUP" na página e concluir 3ª profissão. */
const CATEGORY_DATA = "dist/game/data/CategoryData.xml";
const cat = linhas(CATEGORY_DATA);
function categoria(nome, profissao) {
  const i = cat.findIndex((l) => l.includes(`<category name="${nome}">`));
  if (i < 0) {
    lacunas.push(`${CATEGORY_DATA}: categoria ${nome} não encontrada`);
    return null;
  }
  let n = 0;
  for (let j = i + 1; j < cat.length && !cat[j].includes("</category>"); j++) {
    if (/<id>\d+<\/id>/.test(cat[j])) n++;
  }
  return { categoria: nome, profissao, classes: n, fonte: `${CATEGORY_DATA}:${i + 1}` };
}
const mapaCategorias = [
  categoria("FIRST_CLASS_GROUP", 0),
  categoria("SECOND_CLASS_GROUP", 1),
  categoria("THIRD_CLASS_GROUP", 2),
  categoria("FOURTH_CLASS_GROUP", 3),
].filter(Boolean);

const cm = linhas(CLASS_MASTER_XML);
const iCm = cm.findIndex((l) => /classChangeEnabled=/.test(l));
const classMasterLigado = iCm >= 0 && /classChangeEnabled="true"/.test(cm[iCm]);

const porTier = {
  1: {
    nivel: t1.nivel,
    niveisVistos: t1.niveisVistos,
    classesCobertas: t1.classes,
    comoObter:
      "Falar com o village master da raça e entregar o item de prova da quest de 1ª profissão. O item é cobrado (hasQuestItems) e tomado; o Kamael é a exceção — lá o gate é a quest concluída, não o item.",
    fontes: t1.fontes,
  },
  2: {
    nivel: t2.nivel,
    niveisVistos: t2.niveisVistos,
    classesCobertas: t2.classes,
    comoObter:
      "Falar com o village master de 2ª e entregar as marcas (normalmente 3: a da linha, a da raça e a da especialização). Kamael de novo é quest, não item.",
    fontes: t2.fontes,
  },
  3: {
    nivel: t3.nivel,
    niveisVistos: t3.niveisVistos,
    classesCobertas: t3.classes,
    comoObter:
      "NÃO passa por village master. Vem das Saga quests (AbstractSagaQuest): aceitar a saga da classe, matar o guardião/arcanjo e voltar ao NPC com nível 76+. A troca acontece em AbstractSagaQuest.onEvent(\"0-2\"), que ainda paga 2.299.404 XP, 5.000.000 adena e o Book of Giants (6622). Fora da saga: Judicator (136) sai da Q00061_LawEnforcement, e Inspector (135) não é profissão — só existe como subclasse de Kamael.",
    fontes: t3.fontes,
    fonteTroca: iSetSaga >= 0 ? `${ABSTRACT_SAGA}:${iSetSaga + 1}` : "",
  },
};

/* ---------- 7. subclasse ---------- */
const ini = linhas(PLAYER_INI);
function lerIni(chave) {
  const i = ini.findIndex((l) => new RegExp(`^${chave}\\s*=`).test(l));
  if (i < 0) {
    lacunas.push(`${PLAYER_INI}: chave ${chave} não encontrada`);
    return { valor: null, fonte: "" };
  }
  const v = ini[i].split("=")[1].trim();
  const valor = /^\d+$/.test(v)
    ? Number(v)
    : /^(true|false)$/i.test(v)
      ? v.toLowerCase() === "true"
      : v;
  return { valor, fonte: `${PLAYER_INI}:${i + 1}` };
}

/* A prosa é nossa; a LINHA é medida. Âncora que não bate no fonte = regra fora. */
const REGRAS_SUB = [
  ["O personagem precisa estar em nível 75 para adicionar uma subclasse.", "if (player.getLevel() < 75)"],
  ["Todas as subclasses que ele já tem precisam estar em 75 também.", "if (subClass.getLevel() < 75)"],
  ["O total de subclasses não pode passar do teto de configuração (MaxSubclass).", "player.getTotalSubClasses() >= PlayerConfig.MAX_SUBCLASS"],
  ["Precisa ter concluído as duas quests de liberação — salvo se for noble ou se AltSubClassWithoutQuests estiver ligado.", "allowAddition = checkQuests(player);"],
  ["Noble dispensa as quests de liberação.", "if (player.isNoble())"],
  ["Quest de liberação 1: Fate's Whisper.", 'player.getQuestState("Q00234_FatesWhisper")'],
  ["Quest de liberação 2: Mimir's Elixir.", 'player.getQuestState("Q00235_MimirsElixir")'],
  ["A lista de subclasses possíveis são as classes de 2ª profissão (CategoryType.THIRD_CLASS_GROUP).", "getCategoryByType(CategoryType.THIRD_CLASS_GROUP)"],
  ["Overlord e Warsmith nunca podem ser subclasse.", "neverSubclassed = EnumSet.of(PlayerClass.OVERLORD, PlayerClass.WARSMITH)"],
  ["Classes parecidas se excluem entre si (o grupo da classe principal some da lista).", "subclasses.removeAll(unavailableClasses);"],
  ["Se a principal é Kamael, só é possível subclassar Kamael.", "if (cid.getRace() != Race.KAMAEL)"],
  ["Se a principal NÃO é Kamael, nenhuma classe Kamael pode ser subclasse.", "if (cid.getRace() == Race.KAMAEL)"],
  ["Se a principal é Elfo, nenhuma classe de Elfo Negro pode ser subclasse.", "if (cid.getRace() == Race.DARK_ELF)"],
  ["Se a principal é Elfo Negro, nenhuma classe de Elfo pode ser subclasse.", "if (cid.getRace() == Race.ELF)"],
  ["Kamael fêmea não pega Male Soul Breaker; Kamael macho não pega Female Soul Breaker.", "subclasses.remove(PlayerClass.MALE_SOULBREAKER);"],
  ["Inspector só aparece se a 2ª subclasse já estiver em nível 75.", "subclasses.remove(PlayerClass.INSPECTOR);"],
  ["Não dá para subclassar a própria linha (a classe atual ou ancestral dela).", "if (currClassId.equalsOrChildOf(tempClass))"],
  ["Não dá para repetir uma subclasse já escolhida (nem irmã na mesma linha).", "if (subClassId.equalsOrChildOf(cid))"],
  ["Não dá para trocar de subclasse transformado.", '"data/html/villagemaster/SubClass_NoTransformed.htm"'],
  ["Não dá para trocar de subclasse com summon/pet invocado.", '"data/html/villagemaster/SubClass_NoSummon.htm"'],
  ["Não dá para trocar de subclasse com o inventário acima de 90%.", "player.isInventoryUnder90(true)"],
  ["Não dá para trocar de subclasse sobrecarregado (penalidade de peso 2+).", "player.getWeightPenalty() >= 2"],
  ["Cada village master só atende as classes da raça/tipo dele — a menos que AltSubclassEverywhere esteja ligado.", "return checkVillageMasterRace(pclass) && checkVillageMasterTeachType(pclass);"],
];

const restricoes = [];
for (const [regra, ancora] of REGRAS_SUB) {
  const achadas = [];
  vm.forEach((l, i) => {
    if (l.includes(ancora)) achadas.push(i + 1);
  });
  if (!achadas.length) {
    lacunas.push(`regra de subclasse sem âncora no fonte: "${regra}" (âncora: ${ancora})`);
    continue;
  }
  restricoes.push({
    regra,
    fonte: `${VILLAGE_MASTER}:${achadas[0]}`,
    ...(achadas.length > 1 ? { fontesTambem: achadas.slice(1).map((n) => `${VILLAGE_MASTER}:${n}`) } : {}),
  });
}

/* os grupos de "classes parecidas" são dado, não prosa: saem do EnumSet */
const gruposSimilares = [];
vm.forEach((l, i) => {
  const m = l.match(/subclasseSet\d+ = EnumSet\.of\(([^)]+)\)/);
  if (!m) return;
  gruposSimilares.push({
    classes: m[1]
      .split(",")
      .map((s) => s.trim().replace("PlayerClass.", ""))
      .map((c) => ({ constante: c, classId: constantePorId.get(c) ?? null, nome: nomeClasse(constantePorId.get(c)) })),
    fonte: `${VILLAGE_MASTER}:${i + 1}`,
  });
});

const maxSub = lerIni("MaxSubclass");
const baseSubLevel = lerIni("BaseSubclassLevel");
const maxSubLevel = lerIni("MaxSubclassLevel");
const semQuests = lerIni("AltSubClassWithoutQuests");
const emQualquerMestre = lerIni("AltSubclassEverywhere");
const iNivel75 = vm.findIndex((l) => l.includes("if (player.getLevel() < 75)"));

const subclasse = {
  maximo: maxSub.valor,
  fonteMaximo: maxSub.fonte,
  nivelMinimoPersonagem: iNivel75 >= 0 ? 75 : null,
  fonteNivelMinimo: iNivel75 >= 0 ? `${VILLAGE_MASTER}:${iNivel75 + 1}` : "",
  nivelInicialSub: baseSubLevel.valor,
  fonteNivelInicialSub: baseSubLevel.fonte,
  nivelMaximoSub: maxSubLevel.valor,
  fonteNivelMaximoSub: maxSubLevel.fonte,
  dispensaQuests: semQuests.valor,
  fonteDispensaQuests: semQuests.fonte,
  emQualquerMestre: emQualquerMestre.valor,
  fonteEmQualquerMestre: emQualquerMestre.fonte,
  restricoes,
  gruposSimilares,
};

/* ---------- 8. escrever ---------- */
const lista = Object.values(porClasse).sort((a, b) => a.classId - b.classId);
const semNivel = lista.filter((c) => c.nivelMinimo === null);
const semOrigem = lista.filter((c) => c.classeOrigemId === null);
const idsCobertos = new Set(lista.map((c) => c.classId));
const naoCobertas = [...indice.values()]
  .filter((c) => c.tier > 0 && !idsCobertos.has(c.id))
  .map((c) => ({ classId: c.id, nome: c.nome, tier: c.tier }));

const saida = {
  familia: "classe",
  titulo: "Troca de profissão",
  geradoDe: [
    `${DIR_VM}/ (${pastasVM.length} scripts)`,
    ABSTRACT_SAGA,
    `${DIR_QUESTS}/ (${pastasSaga.length} Saga quests)`,
    Q_JUDICATOR,
    VILLAGE_MASTER,
    PLAYER_INI,
    CLASS_MASTER_XML,
    DIR_ITENS,
    DIR_NPCS,
  ],
  curadoPor:
    "extraído por scripts/extrair-profissao.mjs — níveis, itens, quests e NPCs lidos do código do servidor; a prosa de `comoObter` e o texto das regras de subclasse são redação nossa, mas cada regra carrega a linha real do fonte (âncora conferida em tempo de extração)",
  total: lista.length,
  porTier,
  nomeDasCategorias: {
    observacao:
      "No CategoryData.xml os nomes estão deslocados em um: FIRST_CLASS_GROUP são as classes base (nenhuma profissão feita), e quem já fez a 3ª profissão está em FOURTH_CLASS_GROUP. Os scripts de village master usam esses nomes — ler SECOND_CLASS_GROUP como '2ª profissão' inverte a regra.",
    mapa: mapaCategorias,
  },
  atalhoClassMaster: {
    ligado: classMasterLigado,
    observacao: classMasterLigado
      ? "ATENÇÃO: o NPC de atalho (Mr. Cat / Miss Queen) está LIGADO — as regras acima podem ser contornadas."
      : "O NPC de atalho (Mr. Cat / Miss Queen) está desligado neste servidor; a única rota é village master + quest.",
    fonte: iCm >= 0 ? `${CLASS_MASTER_XML}:${iCm + 1}` : "",
  },
  porClasse: Object.fromEntries(lista.map((c) => [c.classId, c])),
  subclasse,
  lacunas,
  avisos,
  classesSemRotaDeProfissao: naoCobertas,
};

writeFileSync(SAIDA, JSON.stringify(saida, null, 2) + "\n", "utf8");

console.log(`${lista.length} classes com rota de profissão → ${SAIDA}`);
console.log(
  "por profissão:",
  [1, 2, 3]
    .map((v) => `${v}ª:${lista.filter((c) => c.viaProfissao === v).length}`)
    .join("  ")
);
console.log(
  "níveis:",
  `1ª=${porTier[1].nivel}  2ª=${porTier[2].nivel}  3ª=${porTier[3].nivel}`
);
console.log(
  "método:",
  Object.entries(
    lista.reduce((a, c) => ((a[c.metodo] = (a[c.metodo] ?? 0) + 1), a), {})
  )
    .map(([m, n]) => `${m}:${n}`)
    .join("  ")
);
console.log(`restrições de subclasse com fonte: ${restricoes.length}/${REGRAS_SUB.length}`);
console.log(`itens distintos citados: ${new Set(lista.flatMap((c) => c.itensExigidos.map((i) => i.id))).size}`);
console.log(`npcs distintos citados: ${new Set(lista.flatMap((c) => c.npcQueTroca.map((n) => n.id))).size}`);
if (semNivel.length) console.log(`! ${semNivel.length} sem nível:`, semNivel.map((c) => c.nome).join(", "));
if (semOrigem.length) console.log(`! ${semOrigem.length} sem classe de origem:`, semOrigem.map((c) => c.nome).join(", "));
if (naoCobertas.length) console.log(`! ${naoCobertas.length} classes sem rota:`, naoCobertas.map((c) => `${c.nome}(t${c.tier})`).join(", "));
if (lacunas.length) console.log(`! ${lacunas.length} lacunas:`, lacunas.slice(0, 10).join(" | "));
if (avisos.length) console.log(`! ${avisos.length} avisos:`, avisos.slice(0, 10).join(" | "));
