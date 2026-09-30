/**
 * CONSTANTES DE APRESENTAÇÃO DA ÁRVORE — zero dependências.
 *
 * Existe por um motivo medido, não por gosto de organizar: o componente
 * cliente da árvore importava estas constantes de `classes.ts`, que declara
 * os schemas zod. Importar UM valor de lá arrasta o zod inteiro para o
 * bundle do navegador — e em dev isso custava ~60s de compilação POR REQUEST,
 * bloqueando o render do servidor (a página levava 2 a 3 minutos).
 *
 * Aqui só moram dados literais. Os tipos continuam em `classes.ts` e são
 * importados com `import type`, que o compilador apaga — não arrasta nada.
 */

/** Ordem de exibição das raças — a mesma da tela de criação do jogo. */
export const RACAS = [
  { chave: "HUMAN", nome: "Humano" },
  { chave: "ELF", nome: "Elfo" },
  { chave: "DARK_ELF", nome: "Elfo Negro" },
  { chave: "ORC", nome: "Orc" },
  { chave: "DWARF", nome: "Anão" },
  { chave: "KAMAEL", nome: "Kamael" },
] as const;

/** Os cinco arquétipos e sua cor. Classificação editorial — ver o extrator. */
export const ARQUETIPOS = [
  { chave: "guerreiro", nome: "Guerreiro", cor: "#c8433b" },
  { chave: "cavaleiro", nome: "Cavaleiro", cor: "#c9a24b" },
  { chave: "ladino", nome: "Ladino", cor: "#6fae7a" },
  { chave: "mago", nome: "Mago", cor: "#5b8fd6" },
  { chave: "suporte", nome: "Suporte", cor: "#b07fc7" },
] as const;

export const TIERS = ["Classe inicial", "1ª profissão", "2ª profissão", "3ª profissão"];
