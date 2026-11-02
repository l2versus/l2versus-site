import type { ReactNode } from "react";

/**
 * REALCE INLINE DENTRO DE UMA STRING TRADUZÍVEL.
 *
 * Nasceu de um problema concreto do frontispício do códice: a frase de tese
 * tem duas palavras realçadas no meio ("a **diferença**", "*o que muda aqui*").
 * Em JSX isso vira três `<strong>`/`<em>` soltos entre pedaços de texto — e aí
 * traduzir obriga a quebrar a frase em cinco chaves.
 *
 * Quebrar em cinco chaves NÃO funciona fora do português. A ordem das palavras
 * muda: em russo e em polonês o pedaço realçado cai em outro ponto da oração,
 * às vezes no começo. Concatenar fragmentos traduzidos separadamente produz
 * frase torta em dois dos quatro idiomas — o tipo de erro que só quem lê o
 * idioma percebe, ou seja, que ninguém aqui ia perceber.
 *
 * Então a frase inteira fica numa chave só, com marcação mínima, e o tradutor
 * move o realce junto com a palavra:
 *
 *   **forte**  → <strong>, classe de `forte` (padrão: cor de pergaminho)
 *   *ênfase*   → <em>, classe de `enfase`
 *
 * Deliberadamente NÃO é um parser de Markdown: duas marcas, sem aninhamento,
 * sem links, sem escape. Qualquer coisa além disso é conteúdo, e conteúdo tem
 * lugar próprio (`content/wiki/`), não string de interface.
 */

const PADRAO = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

export function realce(
  texto: string,
  opts?: { forte?: string; enfase?: string }
): ReactNode[] {
  return texto.split(PADRAO).map((pedaco, i) => {
    if (pedaco.startsWith("**") && pedaco.endsWith("**")) {
      return (
        <strong key={i} className={opts?.forte ?? "text-[var(--color-parchment)]"}>
          {pedaco.slice(2, -2)}
        </strong>
      );
    }
    if (pedaco.startsWith("*") && pedaco.endsWith("*") && pedaco.length > 2) {
      return (
        <em key={i} className={opts?.enfase}>
          {pedaco.slice(1, -1)}
        </em>
      );
    }
    return pedaco;
  });
}
