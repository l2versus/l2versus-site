import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "../i18n/dict";
import { traduzir } from "./frases-skill.mjs";
import { semCaminhos } from "./procedencia";
import type { SkillsClienteDaClasse } from "./skills-ui";

/**
 * LEITURA DO `classe-skills-cliente.json` — só servidor.
 *
 * O arquivo tem ~2,3 MB: as 89 classes com ícone, descrição e os 15.461 graus.
 * Nada disso chega ao navegador em bloco — as páginas de classe são estáticas
 * (`generateStaticParams`) e cada uma embarca apenas a sua classe (95 KB no
 * pior caso, Gladiator).
 *
 * O cache é uma PROMISE de módulo, não o objeto: sem isso, as 103 páginas que
 * o build gera em paralelo disparariam 103 leituras + 103 `JSON.parse` de 2,3
 * MB antes da primeira terminar. Guardando a promise, só a primeira lê.
 *
 * Falha é explícita como no resto do códice: devolve `undefined` e quem chamou
 * mostra o estado degradado, em vez de renderizar uma seção vazia que parece
 * dizer "esta classe não aprende nada".
 */

export type ArquivoSkillsCliente = {
  familia: "classe-skills-cliente";
  geradoEm: string | null;
  geradoDe: string[];
  curadoPor: string;
  totais: {
    classes: number;
    linhas: number;
    skills: number;
    icones: number;
    descricoesGuardadas: number;
    descricoesHerdadas: number;
  };
  auditoria: {
    iconesSemPng: string[];
    iconesNaoUsados: string[];
    classesForaDoCodice: string[];
    skillsSemParNoCodice: number;
    skillsComLivro: number;
    parDoCodiceAusenteNoPacote: { classe: string; skillId: number; nome: string }[];
  };
  classes: Record<string, SkillsClienteDaClasse>;
};

let cache: Promise<ArquivoSkillsCliente | undefined> | undefined;

function ler(): Promise<ArquivoSkillsCliente | undefined> {
  cache ??= readFile(
    path.join(process.cwd(), "content", "wiki", "classe-skills-cliente.json"),
    "utf8"
  )
    .then((t) => JSON.parse(t) as ArquivoSkillsCliente)
    .catch(() => undefined);
  return cache;
}

/* ------------------------------------------------------------------ *
 *  TRADUÇÃO
 *
 *  O texto vem do `skillname-e.dat` — o `-e` é de English, porque o client
 *  do Versus é inglês. Para o jogador BR, RU ou PL isso é uma barreira real:
 *  quem não lê a skill não sabe o que ela faz, e joga pior por causa disso.
 *
 *  A tradução NÃO é feita por descrição (5.183 textos), e sim por FRASE
 *  (1.093). Um dicionário por idioma em `content/wiki/skills-i18n/<lang>.json`
 *  mapeia a frase em inglês, com os números trocados por `{0}`, para a frase
 *  traduzida. Ver `frases-skill.mjs`.
 *
 *  Aplicada na LEITURA e não na ingestão de propósito: assim corrigir uma
 *  tradução é editar o dicionário e recarregar a página, sem reprocessar os
 *  2,3 MB do pacote — e o repositório guarda um arquivo de dados, não quatro.
 * ------------------------------------------------------------------ */

type Dicionario = Record<string, string>;

const cacheDic = new Map<Locale, Promise<Dicionario>>();

function lerDicionario(locale: Locale): Promise<Dicionario> {
  let p = cacheDic.get(locale);
  if (!p) {
    p = readFile(
      path.join(process.cwd(), "content", "wiki", "skills-i18n", `${locale}.json`),
      "utf8"
    )
      .then((t) => (JSON.parse(t) as { frases?: Dicionario }).frases ?? {})
      /* Dicionário ausente não é erro: é idioma ainda não traduzido. Cai no
         inglês, que é o texto do jogo — nunca numa página vazia. */
      .catch(() => ({}));
    cacheDic.set(locale, p);
  }
  return p;
}

export async function carregarSkillsDaClasse(
  classId: number,
  locale: Locale = "en"
): Promise<SkillsClienteDaClasse | undefined> {
  const a = await ler();
  const c = a?.classes?.[String(classId)];
  if (!c || locale === "en") return c;

  const dic = await lerDicionario(locale);
  if (Object.keys(dic).length === 0) return c;

  /* Cópia, nunca mutação: `c` vive no cache de módulo e é compartilhado por
     todas as páginas do build. Traduzir no lugar contaminaria o inglês para
     quem pedisse depois — e o bug só apareceria com o cache quente. */
  return {
    ...c,
    skills: c.skills.map((s) => ({
      ...s,
      graus: s.graus.map((g) => (g.d ? { ...g, d: traduzir(g.d, dic).texto } : g)),
    })),
  };
}

/** Metadados do arquivo (proveniência e auditoria), sem as classes. */
export async function carregarCabecalhoDeSkills() {
  const a = await ler();
  if (!a) return undefined;
  const { classes: _ignorado, ...resto } = a;
  return resto;
}

/**
 * TIRA O CAMINHO DO ARQUIVO ANTES DE ATRAVESSAR PARA O NAVEGADOR.
 *
 * `MOSTRAR_PROCEDENCIA = false` impede que o caminho seja DESENHADO, e isso
 * bastava enquanto tudo era servidor. Não basta para o grimório: ele é
 * componente cliente, e tudo que vai nas props dele é serializado no payload
 * RSC — ou seja, `fonteArquivo` aparecia no HTML da página publicada mesmo
 * sem nenhum pixel na tela. Pego no ar em 08/10/2026, com grep no deploy.
 *
 * A lição que fica: para dado que não pode vazar, esconder na renderização é
 * metade do trabalho; a outra metade é não mandar.
 */
export function semProcedencia(c: SkillsClienteDaClasse): SkillsClienteDaClasse {
  return semCaminhos(c);
}

/**
 * QUEM APRENDE CADA SKILL, hoje.
 *
 * Existe por causa de um erro que esta página chegou a publicar: quando a
 * extração ANTIGA da árvore lista uma skill para a classe e a leitura atual
 * não, a conclusão fácil — "o cliente não tem nome/ícone para ela" — está
 * errada. A Parry Stance tem ícone e descrição; ela só deixou de ser do
 * Warlord. São as mudanças de dono que o servidor fez (ver SKILLS-ALTERADAS:
 * "Fighter's Will e Archer's Will — uma por classe", "Rush e Rush Impact —
 * cada uma com um dono só", "Parry Stance — versão aliviada só para dois").
 *
 * Com este mapa a página diz o que é verdade e ainda é útil: para ONDE a
 * skill foi. Quando ninguém no pacote aprende, aí sim fica a lacuna assumida
 * — pode ser classe Kamael (fora do pacote) ou skill de fato retirada.
 */
export async function carregarDonosDeSkill(): Promise<Map<number, number[]>> {
  const a = await ler();
  const mapa = new Map<number, number[]>();
  if (!a) return mapa;
  for (const c of Object.values(a.classes)) {
    for (const s of c.skills) {
      const atual = mapa.get(s.id);
      if (atual) atual.push(c.classId);
      else mapa.set(s.id, [c.classId]);
    }
  }
  return mapa;
}

/**
 * Só o ícone de destaque por classe — para os cartões da árvore.
 * Paga o parse de 2,3 MB uma vez (mesmo cache da página de classe) e devolve
 * um mapa de 89 strings.
 */
export async function carregarIconesDeDestaque(): Promise<Record<number, string>> {
  const a = await ler();
  if (!a) return {};
  const saida: Record<number, string> = {};
  for (const c of Object.values(a.classes)) {
    if (c.iconeDestaque) saida[c.classId] = c.iconeDestaque;
  }
  return saida;
}
