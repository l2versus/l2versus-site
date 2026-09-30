/**
 * GLIFOS DE ARQUÉTIPO.
 *
 * Por que desenhados e não extraídos do client: procurei ícone de classe nos
 * 60 pacotes de textura do client H5 (Icon.utx, L2UI, L2UI_CH3, L2UI_CT1,
 * Pledge, symbol — os três de UI descriptografados com l2encdec para poder
 * ler). Não existe: o H5 mostra classe como TEXTO, nunca como ícone. O que
 * existe é ícone de SKILL (1.339 no grupo `skill_i` do Icon.utx), que entra
 * nas tabelas de skill — não aqui.
 *
 * Copiar os ícones do lineage2wiki está fora de questão (arte deles).
 * Então são cinco glifos nossos, no mesmo vocabulário do códice: traço de
 * 1,5, sem preenchimento chapado, legíveis a 18px. Cada um diz a FUNÇÃO —
 * que é o que a árvore precisa comunicar num relance.
 */
export default function GlifoArquetipo({
  arquetipo,
  className = "",
}: {
  arquetipo: string;
  className?: string;
}) {
  const comum = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (arquetipo) {
    /* espada de duas mãos, lâmina larga */
    case "guerreiro":
      return (
        <svg {...comum}>
          <path d="M12 2.5 14 6v9h-4V6l2-3.5Z" />
          <path d="M7.5 15h9" />
          <path d="M12 15v6" />
          <path d="M10 21h4" />
        </svg>
      );
    /* escudo com barra central */
    case "cavaleiro":
      return (
        <svg {...comum}>
          <path d="M12 2.5 4.5 5.5v6.2c0 4.4 3.1 8.3 7.5 9.8 4.4-1.5 7.5-5.4 7.5-9.8V5.5L12 2.5Z" />
          <path d="M12 6.5v10" />
          <path d="M8 10.5h8" />
        </svg>
      );
    /* adaga cruzada com flecha — furtividade e alcance */
    case "ladino":
      return (
        <svg {...comum}>
          <path d="M6 3.5 15 15" />
          <path d="M13 13.5 18 19" />
          <path d="M16.5 17 19 19.5" />
          <path d="M18 3.5 9 15" />
          <path d="M8.5 16.5 6 19" />
        </svg>
      );
    /* orbe com halo de energia */
    case "mago":
      return (
        <svg {...comum}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4" />
          <path d="M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
        </svg>
      );
    /* cálice com gota — cura e canto */
    case "suporte":
      return (
        <svg {...comum}>
          <path d="M6.5 4h11l-1 5.5a4.5 4.5 0 0 1-9 0L6.5 4Z" />
          <path d="M12 14v5" />
          <path d="M8.5 20.5h7" />
        </svg>
      );
    default:
      return (
        <svg {...comum}>
          <path d="M12 4.5 19.5 12 12 19.5 4.5 12 12 4.5Z" />
        </svg>
      );
  }
}
