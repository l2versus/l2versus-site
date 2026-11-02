#!/usr/bin/env node
/**
 * INGERE O PACOTE "WikiSkills-L2Versus" → dados + ícones do site.
 *
 *   node scripts/preparar-skills-cliente.mjs [caminho-do-pacote]
 *
 * O pacote é gerado no servidor cruzando a árvore de skills do datapack com o
 * `skillname-e.dat` / `skillgrp.dat` do CLIENTE. É dele que vêm as duas coisas
 * que o extrator de dentro do site nunca vai ter: o NOME DO ÍCONE e a
 * DESCRIÇÃO que o jogador lê em jogo (já com as alterações custom do Versus).
 *
 * Por que um segundo arquivo em vez de reescrever `classe-skills.json`:
 *
 *   - `classe-skills.json` é extraído por `extrair-classe-skills.mjs` lendo o
 *     datapack, cobre as 103 classes (Kamael incluso) e carrega a procedência
 *     linha-a-linha do XML. Continua sendo a fonte de topologia.
 *   - O pacote do cliente cobre 89 classes (o dono tirou Kamael de propósito) e
 *     é a fonte de APRESENTAÇÃO: ícone, descrição, tipo, magia.
 *
 * Os dois discordam, e a discordância é dado, não bug — ela é medida e sai no
 * bloco `auditoria` do arquivo gerado. Nada é inventado para fechar conta:
 * onde o pacote não tem a skill, ela simplesmente não aparece na seção nova.
 *
 * SAÍDA
 *   content/wiki/classe-skills-cliente.json
 *   public/skills/<icone>.png          (801 PNGs 32×32, cópia literal)
 *
 * O JSON tem ~4 MB. Isso NÃO vai para o navegador: as páginas de classe são
 * estáticas, o arquivo é lido uma vez no build (cache de módulo em
 * `lib/wiki/skills-cliente.ts`) e cada página embarca só a sua classe.
 */

import { readFile, writeFile, mkdir, readdir, copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { decodificar, pareceVazio } from "./png.mjs";

const RAIZ = process.cwd();
const PACOTE =
  process.argv[2] ?? "C:/Users/admin/Desktop/skills/WikiSkills-L2Versus";

const DESTINO_JSON = path.join(RAIZ, "content", "wiki", "classe-skills-cliente.json");
const DESTINO_ICONES = path.join(RAIZ, "public", "skills");

/* ------------------------------------------------------------------ */

function morrer(msg) {
  console.error(`\n  ✖ ${msg}\n`);
  process.exit(1);
}

const fonteJson = path.join(PACOTE, "dados", "skills.json");
const fonteIcones = path.join(PACOTE, "icones");

if (!existsSync(fonteJson)) morrer(`não achei ${fonteJson}`);
if (!existsSync(fonteIcones)) morrer(`não achei ${fonteIcones}`);

const pacote = JSON.parse(await readFile(fonteJson, "utf8"));
if (!Array.isArray(pacote.classes) || pacote.classes.length === 0) {
  morrer("skills.json não tem `classes` — pacote corrompido");
}

/* O códice já extraído: usado só para ENRIQUECER (spellbook + caminho do XML).
   Se sumir, a ingestão continua — só perde o selo de livro. */
let codice = null;
try {
  codice = JSON.parse(
    await readFile(path.join(RAIZ, "content", "wiki", "classe-skills.json"), "utf8")
  );
} catch {
  console.warn("  ! classe-skills.json ausente: sem selo de livro e sem caminho do XML");
}

/* ---------- ícones: copiar e indexar ---------- */

const arquivosIcone = (await readdir(fonteIcones)).filter((f) => f.endsWith(".png"));
const temIcone = new Set(arquivosIcone.map((f) => f.slice(0, -4)));

/* Copiar E OLHAR DENTRO. O PNG existir não quer dizer que seja o ícone: o
   extrator do pacote pega o ÚLTIMO mipmap da pilha, e nas texturas que têm
   pirâmide isso dá o 4×4 esticado — um borrão de quatro tons que passa por
   ícone na página e ninguém nota.

   NÃO APAGAMOS A PASTA ANTES DE COPIAR, e não sobrescrevemos ícone bom com
   ícone ruim: `extrair-icones-utx.mjs` conserta esses casos lendo o mip 0
   direto do `SysTextures/Icon.utx` do client, e uma reingestão ingênua
   desfaria o conserto em silêncio. Regra: o pacote só escreve por cima
   quando o que ele traz não é pior do que o que já está lá. */
await mkdir(DESTINO_ICONES, { recursive: true });

const iconeVazio = new Map();
let preservados = 0;
for (const f of arquivosIcone) {
  const origem = path.join(fonteIcones, f);
  const destino = path.join(DESTINO_ICONES, f);
  const nome = f.slice(0, -4);

  let ruimNaOrigem = null;
  try {
    const d = pareceVazio(decodificar(await readFile(origem)));
    if (d.vazio) ruimNaOrigem = d.motivo;
  } catch (e) {
    ruimNaOrigem = `não decodificou: ${e.message}`;
  }

  if (ruimNaOrigem && existsSync(destino)) {
    try {
      if (!pareceVazio(decodificar(await readFile(destino))).vazio) {
        preservados++;
        continue; // o que já está no site é melhor — o pacote não encosta
      }
    } catch {
      /* destino ilegível: deixa o pacote sobrescrever */
    }
  }

  await copyFile(origem, destino);
  if (ruimNaOrigem) iconeVazio.set(nome, ruimNaOrigem);
}

/* ---------- transformação ---------- */

/** Rótulo em pt-BR do `job` do pacote, para não jogar "3a Job" na tela. */
const DEGRAU = {
  Inicial: "Classe inicial",
  "1a Job": "1ª profissão",
  "2a Job": "2ª profissão",
  "3a Job": "3ª profissão",
};

const RACA_PT = {
  Human: "Humano",
  Elf: "Elfo",
  "Dark Elf": "Elfo Negro",
  Orc: "Orc",
  Dwarf: "Anão",
};

const auditoria = {
  iconesSemPng: [],
  iconesNaoUsados: [],
  /** PNG existe mas não é o ícone (magenta / mipmap errado) — ver `png.mjs`. */
  iconesVazios: [...iconeVazio.entries()].map(([icone, motivo]) => ({ icone, motivo })),
  skillsComIconeVazio: [],
  classesForaDoCodice: [],
  skillsSemParNoCodice: 0,
  skillsComLivro: 0,
  parDoCodiceAusenteNoPacote: [],
};

const saida = {};
let totalLinhas = 0;
let totalGrausComDesc = 0;
let totalGrausHerdados = 0;
const iconesUsados = new Set();

for (const cl of pacote.classes) {
  const noCodice = codice?.classes?.[String(cl.classId)];
  if (!noCodice) auditoria.classesForaDoCodice.push(cl.nome);

  /* Índice do códice por skillId — de onde vem o selo "exige livro". */
  const livroPorSkill = new Map(
    (noCodice?.skills ?? []).map((s) => [s.skillId, s.exigeLivro === true])
  );

  /* Agrupa as linhas (classe, skill, grau) por skillId.
     O pacote vem ordenado por nível de personagem; dentro de uma skill os
     graus vêm em ordem crescente. Não confio nisso: ordeno explicitamente. */
  const porSkill = new Map();
  for (const s of cl.skills) {
    totalLinhas++;
    let e = porSkill.get(s.id);
    if (!e) {
      e = {
        id: s.id,
        nome: s.nome,
        icone: s.icone,
        tipo: s.tipo,
        magia: s.magia,
        fs: false,
        graus: [],
      };
      porSkill.set(s.id, e);
    }
    if (s.fs) e.fs = true;
    /* O nome pode mudar entre graus (Expertise D → Expertise C → … → S84).
       Guardo o nome NO GRAU quando ele diverge do primeiro, para a UI mostrar
       o nome certo do grau selecionado em vez de escolher um em silêncio. */
    const g = { lvl: s.lvl, nivel: s.nivel, sp: s.sp, desc: s.desc };
    if (s.nome !== e.nome) {
      g.n = s.nome;
      e.nomes ??= [e.nome];
      if (!e.nomes.includes(s.nome)) e.nomes.push(s.nome);
    }
    e.graus.push(g);

    if (!temIcone.has(s.icone)) {
      if (!auditoria.iconesSemPng.includes(s.icone)) auditoria.iconesSemPng.push(s.icone);
    } else {
      iconesUsados.add(s.icone);
    }
  }

  const skills = [...porSkill.values()];
  for (const e of skills) {
    e.graus.sort((a, b) => a.lvl - b.lvl);

    /* COMPRESSÃO DA DESCRIÇÃO.
       Uma skill de 38 graus traz 38 descrições quase idênticas (só muda o
       número). Guardo o texto só quando ele MUDA em relação ao grau anterior;
       `d` ausente significa "igual ao de cima". A UI reconstrói carregando o
       último visto. Em passivas sem escala isso corta ~97% do texto; onde o
       número escala por grau não corta nada — e aí o texto é informação de
       verdade, não repetição. */
    let anterior = null;
    for (const g of e.graus) {
      if (g.desc !== anterior) {
        g.d = g.desc;
        anterior = g.desc;
        totalGrausComDesc++;
      } else {
        totalGrausHerdados++;
      }
      delete g.desc;
    }

    if (iconeVazio.has(e.icone)) {
      e.semIcone = true;
      if (!auditoria.skillsComIconeVazio.some((x) => x.icone === e.icone)) {
        auditoria.skillsComIconeVazio.push({
          icone: e.icone,
          skillId: e.id,
          nome: e.nome,
          motivo: iconeVazio.get(e.icone),
        });
      }
    }

    e.nivel = e.graus[0].nivel;
    e.nivelMax = e.graus[e.graus.length - 1].nivel;
    e.lvlMax = e.graus[e.graus.length - 1].lvl;
    e.spTotal = e.graus.reduce((a, g) => a + (g.sp || 0), 0);
    /* `sp: 0` em TODOS os graus e sem Forgotten Scroll = a skill chega sozinha
       ao subir de nível. É o mesmo critério que o LEIA-ME do pacote declara. */
    e.auto = !e.fs && e.graus.every((g) => !g.sp);

    const livro = livroPorSkill.get(e.id);
    if (livro === undefined) auditoria.skillsSemParNoCodice++;
    else if (livro) {
      e.livro = true;
      auditoria.skillsComLivro++;
    }
  }

  /* Ordem de leitura: pelo nível em que a skill ENTRA, depois por id.
     É a mesma espinha da wiki de referência (agrupar por nível de personagem). */
  skills.sort((a, b) => a.nivel - b.nivel || a.id - b.id);

  /* O que o códice tem e o pacote não — fica registrado, não é preenchido. */
  for (const s of noCodice?.skills ?? []) {
    if (!porSkill.has(s.skillId)) {
      auditoria.parDoCodiceAusenteNoPacote.push({
        classe: cl.nome,
        skillId: s.skillId,
        nome: s.nome,
      });
    }
  }

  const conta = (f) => skills.filter(f).length;

  /* Um ícone que represente a classe nos cartões da árvore: a ativa mais cara
     (mais SP) entre as que ela aprende. Critério mecânico de propósito — é a
     skill em que o jogador mais investe, e não uma escolha editorial nossa. */
  const destaque = skills
    .filter((s) => s.tipo === "Ativa")
    .sort((a, b) => b.spTotal - a.spTotal || b.nivel - a.nivel)[0];

  saida[String(cl.classId)] = {
    classId: cl.classId,
    nome: cl.nome,
    raca: cl.raca,
    racaPt: RACA_PT[cl.raca] ?? cl.raca,
    ramo: cl.ramo === "Mystic" ? "Místico" : "Lutador",
    degrau: DEGRAU[cl.job] ?? cl.job,
    parentId: cl.parentId,
    fonteArquivo: noCodice?.fonteArquivo ?? null,
    iconeDestaque: destaque?.icone ?? skills[0]?.icone ?? null,
    totais: {
      linhas: cl.skills.length,
      skills: skills.length,
      sp: skills.reduce((a, s) => a + s.spTotal, 0),
      nivelMin: Math.min(...skills.map((s) => s.nivel)),
      nivelMax: Math.max(...skills.map((s) => s.nivelMax)),
      ativas: conta((s) => s.tipo === "Ativa"),
      passivas: conta((s) => s.tipo === "Passiva"),
      toggles: conta((s) => s.tipo === "Toggle"),
      magicas: conta((s) => s.magia === "Sim"),
      fs: conta((s) => s.fs),
      auto: conta((s) => s.auto),
      livro: conta((s) => s.livro),
    },
    skills,
  };
}

for (const nome of temIcone) if (!iconesUsados.has(nome)) auditoria.iconesNaoUsados.push(nome);

/* ---------- escrever ---------- */

const doc = {
  familia: "classe-skills-cliente",
  titulo: "Skills por classe — com ícone e descrição do cliente",
  geradoEm: pacote.geradoEm ?? null,
  ingeridoPor: "scripts/preparar-skills-cliente.mjs",
  geradoDe: [
    "pacote WikiSkills-L2Versus (dist/game/data/stats/players/skillTrees/** × skillname-e.dat × skillgrp.dat)",
    "content/wiki/classe-skills.json (só para o selo de livro e o caminho do XML)",
  ],
  curadoPor:
    "ingerido sem edição manual. Ícone e descrição vêm do cliente do Versus, já com as alterações custom — divergir do retail é intencional. O que o pacote não traz não é preenchido de outra fonte; fica listado em `auditoria`.",
  totais: {
    classes: Object.keys(saida).length,
    linhas: totalLinhas,
    skills: Object.values(saida).reduce((a, c) => a + c.skills.length, 0),
    icones: arquivosIcone.length,
    descricoesGuardadas: totalGrausComDesc,
    descricoesHerdadas: totalGrausHerdados,
  },
  auditoria,
  classes: saida,
};

await mkdir(path.dirname(DESTINO_JSON), { recursive: true });
await writeFile(DESTINO_JSON, JSON.stringify(doc), "utf8");

/* ---------- relatório ---------- */

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const bytes = Buffer.byteLength(JSON.stringify(doc));

console.log(`
  Pacote     ${PACOTE}
  Gerado em  ${doc.geradoEm ?? "—"}

  classes             ${doc.totais.classes}
  linhas (classe,skill,grau)  ${doc.totais.linhas.toLocaleString("pt-BR")}
  skills agrupadas    ${doc.totais.skills.toLocaleString("pt-BR")}
  ícones copiados     ${doc.totais.icones}  →  public/skills/

  descrições guardadas  ${totalGrausComDesc.toLocaleString("pt-BR")}
  descrições herdadas   ${totalGrausHerdados.toLocaleString("pt-BR")}  (${((totalGrausHerdados / totalLinhas) * 100).toFixed(0)}% do texto economizado)

  AUDITORIA
  ícones referenciados sem PNG   ${auditoria.iconesSemPng.length}${auditoria.iconesSemPng.length ? ` → ${auditoria.iconesSemPng.join(", ")}` : "  ✓"}
  PNG existe mas não é o ícone   ${auditoria.iconesVazios.length}${auditoria.iconesVazios.length ? `  ← ${auditoria.skillsComIconeVazio.length} skills caem no glifo (rodar extrair-icones-utx.mjs)` : "  ✓"}
  ícones bons preservados        ${preservados}  (o pacote trouxe pior; mantido o conserto do mip 0)
  PNGs no pacote sem uso         ${auditoria.iconesNaoUsados.length}
  classes fora do códice         ${auditoria.classesForaDoCodice.length}${auditoria.classesForaDoCodice.length ? ` → ${auditoria.classesForaDoCodice.join(", ")}` : "  ✓"}
  skills sem par no códice       ${auditoria.skillsSemParNoCodice}  (novas desde a última extração — entram sem selo de livro)
  skills com selo de livro       ${auditoria.skillsComLivro}
  pares do códice fora do pacote ${auditoria.parDoCodiceAusenteNoPacote.length}  (NÃO aparecem na seção nova)

  escrito     content/wiki/classe-skills-cliente.json  (${kb(bytes)})
`);

if (auditoria.iconesSemPng.length > 0) {
  morrer("há skill apontando para ícone que não existe — o site renderizaria 404");
}
