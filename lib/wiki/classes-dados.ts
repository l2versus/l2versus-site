import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Os dados POR CLASSE que o servidor tem, além da hierarquia.
 *
 * Quatro arquivos, cada um gerado por um script próprio em `scripts/` a partir
 * do datapack, e cada campo carregando a linha do XML de onde saiu:
 *
 *   classe-skills.json     árvore de skills (17.177 linhas → 2.624 skills únicas)
 *   classe-stats.json      atributos base + faixas min/max entre as 103 classes
 *   classe-armas.json      DERIVADO: armas cruzando skills da classe × condição de arma
 *   classe-profissao.json  níveis de troca e regras de subclasse
 *
 * Carregam sob demanda e em paralelo. São grandes (945 KB só o de skills), mas
 * só o servidor lê: as páginas são estáticas, então isso acontece no build e
 * nunca no navegador do jogador.
 *
 * A falha é explícita, como no resto do códice: se um arquivo sumir, a seção
 * correspondente diz que não está disponível em vez de renderizar vazio e
 * fingir que a classe não tem skills.
 */

export type SkillDaClasse = {
  skillId: number;
  nome: string;
  nomes?: string[];
  nivelMaisBaixo: number;
  nivelMaisAlto: number;
  niveis: number;
  spTotal: number;
  exigeLivro: boolean;
  autoGet: boolean;
  fonte: string;
};

export type SkillsDaClasse = {
  classId: number;
  nome: string;
  totalLinhas: number;
  skillsUnicas: number;
  nivelMinimo: number;
  nivelMaximo: number;
  spTotal: number;
  linhasSemSp: number;
  comSpellbook: number;
  skills: SkillDaClasse[];
  fonteArquivo: string;
};

export type StatsDaClasse = {
  id: number;
  nome: string;
  str: number; dex: number; con: number;
  int: number; wit: number; men: number;
  pAtk?: number; mAtk?: number; critRate?: number;
  atkSpd?: number; atkRange?: number; runSpd?: number;
  pDefTotal?: number; mDefTotal?: number;
  fonte: string;
};

export type Faixa = { min: number; minClasse: string; max: number; maxClasse: string };
export type Faixas = Record<string, Faixa>;

export type ArmaDaClasse = {
  kind: string;
  quantasSkills: number;
  exemploSkillId: number;
  exemploSkillNome: string;
  fonte: string;
};

export type DadosDaClasse = {
  skills?: SkillsDaClasse;
  stats?: StatsDaClasse;
  faixas?: Faixas;
  armas?: ArmaDaClasse[];
  metodoArmas?: string;
};

const pasta = path.join(process.cwd(), "content", "wiki");

async function lerJson<T>(arquivo: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path.join(pasta, arquivo), "utf8")) as T;
  } catch {
    /* ausente ou inválido: quem chamou decide o que mostrar no lugar */
    return undefined;
  }
}

/* Os três arquivos seguem o mesmo contrato do resto do códice: metadados de
   proveniência na raiz (familia, geradoDe, curadoPor, contagens) e os dados
   sob `classes`. Ler da raiz devolve `undefined` em silêncio — foi o que
   aconteceu na primeira ligação, e a página exibiu "árvore não encontrada"
   para todas as 103 classes sem nenhum erro no console. */
export async function carregarDadosDaClasse(classId: number): Promise<DadosDaClasse> {
  const [skills, stats, armas] = await Promise.all([
    lerJson<{ classes: Record<string, SkillsDaClasse> }>("classe-skills.json"),
    lerJson<{ classes: Record<string, StatsDaClasse>; faixas: Faixas }>("classe-stats.json"),
    lerJson<{ classes: Record<string, { armas: ArmaDaClasse[] }>; metodo: string }>(
      "classe-armas.json"
    ),
  ]);

  const chave = String(classId);
  return {
    skills: skills?.classes?.[chave],
    stats: stats?.classes?.[chave],
    faixas: stats?.faixas,
    armas: armas?.classes?.[chave]?.armas,
    metodoArmas: armas?.metodo,
  };
}

/** Só as contagens, para os cartões da árvore — não carrega as 2.624 skills. */
export async function carregarResumoDeSkills(): Promise<
  Record<number, { skillsUnicas: number; spTotal: number; nivelMinimo: number }>
> {
  const j = await lerJson<{ classes: Record<string, SkillsDaClasse> }>("classe-skills.json");
  if (!j?.classes) return {};
  const saida: Record<number, { skillsUnicas: number; spTotal: number; nivelMinimo: number }> = {};
  for (const [id, v] of Object.entries(j.classes)) {
    if (!v || typeof v !== "object" || !("skillsUnicas" in v)) continue;
    saida[Number(id)] = {
      skillsUnicas: v.skillsUnicas,
      spTotal: v.spTotal,
      nivelMinimo: v.nivelMinimo,
    };
  }
  return saida;
}

/** Nomes de arma em português, para não jogar o enum cru na cara do jogador. */
export const NOME_DA_ARMA: Record<string, string> = {
  SWORD: "Espada",
  BLUNT: "Maça",
  DAGGER: "Adaga",
  BOW: "Arco",
  CROSSBOW: "Besta",
  POLE: "Lança",
  FIST: "Punho",
  DUAL: "Duas espadas",
  DUALFIST: "Duas manoplas",
  DUALDAGGER: "Duas adagas",
  BIGSWORD: "Espada pesada",
  BIGBLUNT: "Maça pesada",
  ETC: "Outros",
  RAPIER: "Florete",
  ANCIENTSWORD: "Espada ancestral",
  PET: "Montaria",
};
