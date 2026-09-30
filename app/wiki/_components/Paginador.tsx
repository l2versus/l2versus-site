import Link from "next/link";
import { getT } from "@/lib/i18n/server";

/**
 * PAGINADOR DAS SEÇÕES LONGAS.
 *
 * Por que existe: uma ficha de entrada ocupa ~960px no celular (o par
 * rótulo/valor empilha, e há seções com 10+ efeitos por entrada). Com 200
 * entradas numa página só, /wiki/augments chegava a 192.000px — cerca de 227
 * telas. Ninguém percorre isso, e o navegador ainda paga o layout inteiro.
 *
 * Por que paginar por CONTAGEM e não agrupar por grade/tipo: o dado não
 * sustenta um eixo único. Medido nas 7 famílias — `grade` está preenchido em
 * 119/220 no masterwork, 82/146 no arma-sa, 61/115 nos conjuntos, e ZERO nos
 * augments. Agrupar por "grade quando tem, subtítulo quando não tem" produz
 * grupos heterogêneos dentro da mesma seção ("Grade A" ao lado de "LIGHT" e
 * "ROBE") e chega a 31 grupos numa família só. Contagem é o único critério
 * que vale igual para todas — e não mente sobre uma estrutura que o arquivo
 * -fonte não tem. Quando a curadoria por seção existir, ela entra POR CIMA
 * disto, como filtro.
 */

export const POR_PAGINA = 24;
/** Abaixo disto a seção continua em página única — paginar 23 jóias só atrapalha. */
export const LIMIAR_PAGINACAO = 36;

export function totalDePaginas(total: number): number {
  return Math.max(1, Math.ceil(total / POR_PAGINA));
}

/** Página pedida na URL, saneada para a faixa válida. */
export function paginaValida(bruto: string | undefined, total: number): number {
  const n = Number.parseInt(bruto ?? "1", 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(1, n), totalDePaginas(total));
}

/** Janela de páginas em volta da atual: 1 … 4 5 [6] 7 8 … 9 */
function janela(atual: number, ultima: number): (number | "…")[] {
  if (ultima <= 7) return Array.from({ length: ultima }, (_, i) => i + 1);
  const perto = new Set([1, ultima, atual, atual - 1, atual + 1]);
  if (atual <= 3) [2, 3, 4].forEach((n) => perto.add(n));
  if (atual >= ultima - 2) [ultima - 1, ultima - 2, ultima - 3].forEach((n) => perto.add(n));
  const nums = [...perto].filter((n) => n >= 1 && n <= ultima).sort((a, b) => a - b);
  const saida: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) saida.push("…");
    saida.push(n);
  });
  return saida;
}

export default async function Paginador({
  base,
  atual,
  total,
  ancora = "entradas",
}: {
  /** Caminho da seção, ex.: "/wiki/augments" */
  base: string;
  atual: number;
  /** Total de ENTRADAS (não de páginas). */
  total: number;
  ancora?: string;
}) {
  const ultima = totalDePaginas(total);
  if (ultima <= 1) return null;

  const t = await getT();
  const href = (p: number) => `${base}${p === 1 ? "" : `?p=${p}`}#${ancora}`;
  const primeiro = (atual - 1) * POR_PAGINA + 1;
  const ultimo = Math.min(atual * POR_PAGINA, total);

  return (
    <nav className="pag" aria-label={t("wiki.pag.rotulo")}>
      <p className="pag-conta">
        <b>{primeiro}</b>–<b>{ultimo}</b> {t("wiki.pag.de")} <b>{total}</b>
      </p>
      <div className="pag-botoes">
        {atual > 1 ? (
          <Link href={href(atual - 1)} className="pag-seta" rel="prev" aria-label={t("wiki.pag.anterior")}>
            ‹
          </Link>
        ) : (
          <span className="pag-seta pag-off" aria-hidden>‹</span>
        )}

        {janela(atual, ultima).map((n, i) =>
          n === "…" ? (
            <span key={`e${i}`} className="pag-elipse" aria-hidden>…</span>
          ) : n === atual ? (
            <span key={n} className="pag-num pag-atual" aria-current="page">{n}</span>
          ) : (
            <Link key={n} href={href(n)} className="pag-num">{n}</Link>
          )
        )}

        {atual < ultima ? (
          <Link href={href(atual + 1)} className="pag-seta" rel="next" aria-label={t("wiki.pag.proxima")}>
            ›
          </Link>
        ) : (
          <span className="pag-seta pag-off" aria-hidden>›</span>
        )}
      </div>
    </nav>
  );
}
