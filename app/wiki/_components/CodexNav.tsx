import Link from "next/link";
import type { SecaoCarregada } from "@/lib/wiki/data";
import { getT } from "@/lib/i18n/server";

/**
 * O índice do códice — rail fixo à esquerda. Sticky no desktop, faixa
 * rolável no mobile. Item ativo ganha hairline dourado à esquerda, que é
 * como o design system já marca seleção no painel do jogador.
 */
/** Páginas que não são famílias de diff, e por isso não saem de SECOES:
    a linha de base (o "antes" de tudo) e a árvore de classes. Ficam no topo
    do rail porque são porta de entrada, não mais um capítulo na fila. */
const PORTAS = [
  { slug: "linha-de-base", glifo: "⚖", chave: "wiki.porta.linha_de_base", marca: "H5" },
  { slug: "classes", glifo: "⚔", chave: "wiki.porta.classes", marca: "103" },
  { slug: "mudancas", glifo: "⟳", chave: "wiki.porta.mudancas", marca: "184" },
];

export default async function CodexNav({
  secoes,
  ativo,
}: {
  secoes: SecaoCarregada[];
  ativo?: string;
}) {
  const t = await getT();
  return (
    <nav aria-label={t("wiki.indice")}>
      <p className="mb-3 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
        {t("wiki.codice")}
      </p>

      <div className="mb-1 flex gap-1 overflow-x-auto no-scrollbar lg:mb-3 lg:flex-col lg:gap-0 lg:overflow-visible">
        {PORTAS.map((p) => (
          <Link
            key={p.slug}
            href={`/wiki/${p.slug}`}
            aria-current={p.slug === ativo ? "true" : undefined}
            className="codex-item shrink-0 whitespace-nowrap lg:whitespace-normal"
          >
            <span aria-hidden className="text-[var(--color-gold-deep)]">
              {p.glifo}
            </span>
            <span>{t(p.chave)}</span>
            <span className="n">{p.marca}</span>
          </Link>
        ))}
      </div>

      <div className="hidden lg:mb-2 lg:block">
        <span className="block h-px bg-[var(--color-line)]" />
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col lg:gap-0 lg:overflow-visible">
        {secoes.map((s) => {
          const disponivel = s.estado.ok;
          return (
            <Link
              key={s.slug}
              href={`/wiki/${s.slug}`}
              aria-current={s.slug === ativo ? "true" : undefined}
              className="codex-item shrink-0 whitespace-nowrap lg:whitespace-normal"
            >
              <span aria-hidden className="text-[var(--color-gold-deep)]">
                {s.glifo}
              </span>
              <span className={disponivel ? "" : "text-[var(--color-faint)]"}>
                {t(`wiki.sec.${s.slug}.titulo`)}
              </span>
              <span className="n">{disponivel ? s.total : "—"}</span>
            </Link>
          );
        })}
      </div>

      <div className="diamond-rule my-5 hidden lg:flex">
        <span className="dia" />
      </div>

      <p className="hidden text-[0.92rem] leading-relaxed text-[var(--color-faint)] lg:block">
        {t("wiki.rail.nota")}
      </p>
    </nav>
  );
}
