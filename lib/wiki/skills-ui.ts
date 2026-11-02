/**
 * TIPOS E CONSTANTES DAS SKILLS — zero dependências, seguro no cliente.
 *
 * Mesma disciplina de `classes-ui.ts`, pelo mesmo motivo medido: o Grimório é
 * componente cliente, e importar UM valor de um módulo que declara zod arrasta
 * o zod inteiro para o bundle do navegador. Aqui só moram literais e tipos.
 * Quem lê o JSON de 2,3 MB é `skills-cliente.ts`, que nunca é importado por
 * código de cliente.
 */

/** Um grau (level) da skill. `d` ausente = descrição igual à do grau anterior
 *  (compressão feita em `scripts/preparar-skills-cliente.mjs`); `n` presente =
 *  a skill muda de nome neste grau (Expertise D → Expertise C → …). */
export type Grau = {
  lvl: number;
  nivel: number;
  sp: number;
  d?: string;
  n?: string;
};

export type TipoSkill = "Ativa" | "Passiva" | "Toggle";
export type MagiaSkill = "Sim" | "Nao" | "Estatica" | "Danca/Canto";

export type SkillCliente = {
  id: number;
  nome: string;
  nomes?: string[];
  icone: string;
  tipo: TipoSkill;
  magia: MagiaSkill;
  fs: boolean;
  livro?: boolean;
  auto: boolean;
  /**
   * O PNG existe, mas não é o ícone — magenta de textura ausente ou o mipmap
   * errado esticado (ver `scripts/png.mjs`). 51 dos 801 no lote de 06/10/2026.
   * A UI desenha o glifo do tipo no lugar: um borrão de quatro tons exibido
   * como arte é pior do que assumir a lacuna.
   */
  semIcone?: boolean;
  /** Nível de personagem em que a skill ENTRA (grau 1). */
  nivel: number;
  /** Nível de personagem do último grau. */
  nivelMax: number;
  lvlMax: number;
  spTotal: number;
  graus: Grau[];
};

export type TotaisClasse = {
  linhas: number;
  skills: number;
  sp: number;
  nivelMin: number;
  nivelMax: number;
  ativas: number;
  passivas: number;
  toggles: number;
  magicas: number;
  fs: number;
  auto: number;
  livro: number;
};

export type SkillsClienteDaClasse = {
  classId: number;
  nome: string;
  raca: string;
  racaPt: string;
  ramo: string;
  degrau: string;
  parentId: number;
  fonteArquivo: string | null;
  iconeDestaque: string | null;
  totais: TotaisClasse;
  skills: SkillCliente[];
};

/* ------------------------------------------------------------------ */

/**
 * O ícone QUE A PÁGINA USA é o ampliado, não o 32×32 cru.
 *
 * `public/skills/<nome>.png` é o 32×32 extraído do cliente — a fonte da
 * verdade, contra a qual as auditorias rodam. `public/skills/x4/<nome>.webp`
 * é o mesmo ícone ampliado 4× (ver `scripts/ampliar-icones-skill.mjs`): com
 * 128×128 servido num quadro de 64px o navegador REDUZ em vez de ampliar, e
 * acaba o dilema entre quadriculado e borrado.
 */
export const PASTA_ICONES = "/skills/x4";

export const iconeUrl = (nome: string) =>
  `${PASTA_ICONES}/${encodeURIComponent(nome)}.webp`;

/**
 * Cor por tipo. As três saem da paleta que a árvore de classes já usa
 * (`ARQUETIPOS`), para a wiki inteira falar a mesma língua cromática:
 * ouro = o que você aciona, aço = o que está sempre ligado, verde = o que
 * você liga e desliga.
 *
 * `rotulo` e `ajuda` guardam a CHAVE do dicionário, não o texto: quem desenha
 * resolve com `t(...)`. É o único jeito de traduzir daqui sem importar o
 * dicionário neste arquivo — ele é importado pelo componente cliente e a
 * regra de zero dependência vale igual (ver o cabeçalho).
 */
export const TIPO: Record<TipoSkill, { rotulo: string; cor: string; glifo: string; ajuda: string }> =
  {
    Ativa: {
      rotulo: "wiki.gs.tipo.ativa.rotulo",
      cor: "#c9a24b",
      glifo: "◆",
      ajuda: "wiki.gs.tipo.ativa.ajuda",
    },
    Passiva: {
      rotulo: "wiki.gs.tipo.passiva.rotulo",
      cor: "#8d98ad",
      glifo: "◇",
      ajuda: "wiki.gs.tipo.passiva.ajuda",
    },
    Toggle: {
      rotulo: "wiki.gs.tipo.toggle.rotulo",
      cor: "#6fae7a",
      glifo: "◈",
      ajuda: "wiki.gs.tipo.toggle.ajuda",
    },
  };

export const MAGIA: Record<MagiaSkill, { rotulo: string; cor: string; ajuda: string }> = {
  Sim: {
    rotulo: "wiki.gs.magia.sim.rotulo",
    cor: "#5b8fd6",
    ajuda: "wiki.gs.magia.sim.ajuda",
  },
  Nao: {
    rotulo: "wiki.gs.magia.nao.rotulo",
    cor: "#9c9484",
    ajuda: "wiki.gs.magia.nao.ajuda",
  },
  Estatica: {
    rotulo: "wiki.gs.magia.estatica.rotulo",
    cor: "#9c9484",
    ajuda: "wiki.gs.magia.estatica.ajuda",
  },
  "Danca/Canto": {
    rotulo: "wiki.gs.magia.danca.rotulo",
    cor: "#b07fc7",
    ajuda: "wiki.gs.magia.danca.ajuda",
  },
};

/** 670.750.000 → "670,8 M". Números de SP em L2 são grandes demais para
 *  ler com separador de milhar na tabela. */
export function sp(n: number): string {
  if (n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} M`;
  if (n >= 10_000) return `${(n / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return n.toLocaleString("pt-BR");
}

/** Resolve a descrição de um grau subindo até achar a última declarada —
 *  o outro lado da compressão feita na ingestão. */
export function descDoGrau(graus: Grau[], i: number): string {
  for (let k = Math.min(i, graus.length - 1); k >= 0; k--) {
    const d = graus[k].d;
    if (d) return d;
  }
  return "";
}

/** O nome vigente num grau (Expertise D no grau 1, Expertise S84 no 7). */
export function nomeDoGrau(s: SkillCliente, i: number): string {
  for (let k = Math.min(i, s.graus.length - 1); k >= 0; k--) {
    const n = s.graus[k].n;
    if (n) return n;
  }
  return s.nome;
}
