import { z } from "zod";

/**
 * Tipos do L2Wiki.
 *
 * A unidade atômica aqui NÃO é o item — é a MUDANÇA. Cada entrada responde
 * primeiro "o que mudou em relação ao Lineage 2 original" e só depois lista
 * números. É essa inversão que separa este wiki de um banco de dados de itens.
 *
 * `antes` vazio significa uma de duas coisas, e a UI distingue as duas:
 *   - a entrada é uma ADIÇÃO nossa (não existia no jogo original);
 *   - a fonte documentou só o estado atual, sem registrar o valor antigo.
 * O campo `antesAusente` marca o segundo caso. Nunca inventamos o "antes".
 */

export const EfeitoSchema = z.object({
  rotulo: z.string(),
  valor: z.string(),
});
export type Efeito = z.infer<typeof EfeitoSchema>;

export const CATEGORIAS = [
  "joia",
  "masterwork",
  "arma-sa",
  "conjunto",
  "augment",
  "heroi",
  "skill",
  "skill-slot",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const EntradaSchema = z.object({
  id: z.string().min(1),
  categoria: z.enum(CATEGORIAS),
  titulo: z.string().min(1),
  subtitulo: z.string().optional(),
  /** Boss de origem (jóias). */
  boss: z.string().optional(),
  /** Degrau da jóia: Lesser / Normal / Improved. */
  tier: z.string().optional(),
  /** Slot do equipamento: Anel / Brinco / Colar. */
  slot: z.string().optional(),
  grade: z.string().optional(),
  itemId: z.number().int().positive().optional(),
  skillId: z.number().int().positive().optional(),
  antes: z.array(EfeitoSchema).default([]),
  agora: z.array(EfeitoSchema).default([]),
  /** A fonte só registrou o estado atual — não há "antes" documentado. */
  antesAusente: z.boolean().optional(),
  /**
   * Marca explícita de ADIÇÃO: isto não existe no Lineage 2 original.
   *
   * Tem que ser explícito, e nunca inferido de `antes` estar vazio. `antes`
   * vazio quer dizer apenas "não temos o valor antigo" — na maioria dos casos
   * o item existe no retail e a fonte só não registrou como ele era. Inferir
   * novidade daí faria o wiki afirmar que Ring of Core ou os augments não
   * existem no jogo original, o que é falso. Um wiki que erra isso perde a
   * única coisa que ele tem para vender: credibilidade.
   */
  novo: z.boolean().optional(),
  /** Com duas jóias iguais equipadas, só uma aplica. */
  regraDuplicata: z.boolean().optional(),
  /** A descrição dentro do cliente do jogo ficou com o número velho. */
  notaCliente: z.string().optional(),
  /** Divergência, typo ou lacuna do arquivo-fonte — registrada, não corrigida em silêncio. */
  notaFonte: z.string().optional(),
  /** Parágrafo narrativo original, preservado literal. */
  prosa: z.string().optional(),
  /** OBRIGATÓRIO: "ARQUIVO.txt:LINHA". É o que permite auditar o wiki contra a fonte. */
  fonte: z.string().min(1),
  alteradoEm: z.string().optional(),
});
export type Entrada = z.infer<typeof EntradaSchema>;

export const TierSchema = z.object({
  tier: z.string(),
  comoObter: z.string(),
  fonte: z.string(),
  pendente: z.boolean().optional(),
});
export type Tier = z.infer<typeof TierSchema>;

/**
 * Nota de documento — as regras de leitura, escopo e proveniência que os
 * arquivos-fonte carregam no cabeçalho/rodapé e que não pertencem a nenhuma
 * entrada individual.
 *
 * Este campo existe por causa de uma lição cara: a primeira extração converteu
 * as tabelas perfeitamente e DESCARTOU o texto que as torna interpretáveis
 * ("Dano crítico é soma, não porcentagem"; "311 opções só saem em acessório";
 * "precisa REINICIAR o servidor") — porque o schema não tinha onde guardar.
 * Schema sem lugar para o contexto é um convite à perda silenciosa.
 */
export const NotaDocSchema = z.object({
  titulo: z.string().optional(),
  texto: z.string().min(1),
  /** "ARQUIVO.txt:LINHA" — mesma disciplina de auditoria das entradas. */
  fonte: z.string().min(1),
});
export type NotaDoc = z.infer<typeof NotaDocSchema>;

export const FamiliaSchema = z.object({
  familia: z.string().min(1),
  titulo: z.string().optional(),
  geradoDe: z.array(z.string()).default([]),
  curadoPor: z.string().optional(),
  contexto: z
    .object({
      resumo: z.string().optional(),
      tiers: z.array(TierSchema).optional(),
      regraDuplicata: z.string().optional(),
    })
    .optional(),
  /** Regras de leitura, escopo e proveniência do documento — ver NotaDocSchema. */
  comoLer: z.array(NotaDocSchema).default([]),
  entradas: z.array(EntradaSchema),
});
export type Familia = z.infer<typeof FamiliaSchema>;

/** Metadados de cada seção do wiki — a ordem aqui é a ordem do índice. */
export type SecaoMeta = {
  slug: string;
  familia: string;
  titulo: string;
  /** Uma linha, para o cartão do índice. */
  chamada: string;
  /** Glifo do cartão — do repertório do design system, não emoji colorido. */
  glifo: string;
};

export const SECOES: SecaoMeta[] = [
  {
    slug: "joias-boss",
    familia: "joia",
    titulo: "Jóias de Boss",
    chamada: "Três degraus por jóia onde o original tem um só — e como obter cada um.",
    glifo: "◈",
  },
  {
    slug: "armas-sa",
    familia: "arma-sa",
    titulo: "SA das Armas",
    chamada: "As Soul Abilities que foram trocadas, arma por arma, com o que saiu e o que entrou.",
    glifo: "⚔",
  },
  {
    slug: "masterwork",
    familia: "masterwork",
    titulo: "Masterwork",
    chamada: "O bônus de cada família Masterwork de arma e de peito.",
    glifo: "✦",
  },
  {
    slug: "conjuntos",
    familia: "conjunto",
    titulo: "Conjuntos de Armadura",
    chamada: "A escada de encantamento +4 a +10 que o jogo original não tem, e o bônus de cada conjunto.",
    glifo: "⛨",
  },
  {
    slug: "augments",
    familia: "augment",
    titulo: "Augment e Lifestone",
    chamada: "O que cada Lifestone pode entregar na arma.",
    glifo: "◆",
  },
  {
    slug: "armas-heroi",
    familia: "heroi",
    titulo: "Armas de Herói",
    chamada: "O arsenal da Olympíada e o que mudou nele.",
    glifo: "♛",
  },
  {
    slug: "skills",
    familia: "skill",
    titulo: "Skills Alteradas",
    chamada: "Toda habilidade com valor mexido, sempre com o de antes e o de agora.",
    glifo: "❂",
  },
  {
    slug: "skills-sem-slot",
    familia: "skill-slot",
    titulo: "Skills sem Vaga de Buff",
    chamada: "As habilidades que não disputam vaga e não derrubam os seus buffs.",
    glifo: "◎",
  },
];

export function secaoPorSlug(slug: string): SecaoMeta | undefined {
  return SECOES.find((s) => s.slug === slug);
}
