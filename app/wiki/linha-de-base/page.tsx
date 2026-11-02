import Link from "next/link";
import type { Metadata } from "next";
import SequenciaScrub from "@/components/media/SequenciaScrub";
import { getT } from "@/lib/i18n/server";
import { realce } from "@/lib/i18n/realce";
import { romano } from "@/lib/wiki/data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("wiki.base.meta.titulo"),
    description: t("wiki.base.meta.descricao"),
  };
}

/**
 * A LINHA DE BASE — página curada à mão, não gerada.
 *
 * O wiki inteiro se apoia numa comparação: "no jogo original é X, aqui é Y".
 * Esta página estabelece o X para quem nunca jogou H5 retail ou vem de outra
 * crônica. Os fatos do retail foram conferidos em fontes públicas (l2db.info /
 * l2central — Divine Inspiration, skill 1405) e no padrão dos low rates
 * clássicos (x1–x5, economia próxima do oficial). O lado L2 Versus sai da
 * nossa documentação interna, a mesma que alimenta as seções do códice.
 *
 * O texto NÃO mora aqui: as oito comparações vivem no `wiki-dict.ts`, com as
 * quatro línguas lado a lado. Página curada continua sendo página curada —
 * só deixou de ser monolíngue. (O conteúdo GERADO, das outras seções, tem
 * caminho próprio: dicionário por padrão em `content/wiki/i18n/`.)
 */
const SISTEMAS = [
  { chave: "rates" },
  { chave: "buff", secao: { href: "/wiki/skills-sem-slot", chave: "wiki.sec.skills-sem-slot.titulo" } },
  { chave: "joias", secao: { href: "/wiki/joias-boss", chave: "wiki.sec.joias-boss.titulo" } },
  { chave: "conjunto", secao: { href: "/wiki/conjuntos", chave: "wiki.sec.conjuntos.titulo" } },
  { chave: "sa", secao: { href: "/wiki/armas-sa", chave: "wiki.sec.armas-sa.titulo" } },
  { chave: "masterwork", secao: { href: "/wiki/masterwork", chave: "wiki.sec.masterwork.titulo" } },
  { chave: "heroi", secao: { href: "/wiki/armas-heroi", chave: "wiki.sec.armas-heroi.titulo" } },
  { chave: "augment", secao: { href: "/wiki/augments", chave: "wiki.sec.augments.titulo" } },
];

export default async function LinhaDeBasePage() {
  const t = await getT();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <nav className="mb-7 flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          {t("wiki.migalha.codice")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-muted)]">{t("wiki.porta.linha_de_base")}</span>
      </nav>

      <header className="max-w-3xl">
        <p className="flex items-center gap-2.5 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
          <span aria-hidden className="font-display text-base leading-none">⚖</span>
          {t("wiki.base.kicker")}
        </p>
        <h1 className="mt-3 font-display text-[1.75rem] leading-tight tracking-[0.03em] text-[var(--color-parchment)] md:text-[2.4rem]">
          {t("wiki.base.titulo")}
        </h1>
        <p className="prosa-col mt-4 text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
          {realce(t("wiki.base.intro"))}
        </p>
      </header>

      {/* ---------- A DESCIDA ----------
          O palco é full-bleed e gruda na viewport; as oito fichas descem por
          cima dele. O scrub da cidadela é o MESMO de antes — o que mudou é
          que ele deixou de caber num selo de 340px na lateral e passou a ser
          o chão da página. A coluna de texto encosta à esquerda para a arte
          ter o terço direito livre; ver o bloco .base-cena no globals.css. */}
      <div className="base-cena mt-12" data-scrub-cena>
        <div className="base-palco">
          <SequenciaScrub pasta="/seq/castelo" quadros={192} quadrosBase={96} modo="painel" />
          <div className="base-palco-scrim" aria-hidden />
        </div>

        <div className="base-lista">
          <p className="base-prancha-rotulo mb-7 text-[0.68rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
            <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] align-middle" />
            {t("wiki.base.prancha.titulo")}
            <span className="ml-3 normal-case tracking-[0.08em] text-[var(--color-faint)]">
              {t("wiki.base.prancha.nota")}
            </span>
          </p>

          <div className="relative space-y-5">
            {/* o fio da encadernação: desenha-se conforme você desce as oito
                fichas — progresso e costura do livro na mesma linha */}
            <span className="wk-fio -left-11 hidden lg:block" data-wk-thread aria-hidden />

            {SISTEMAS.map((s, i) => (
              <section
                key={s.chave}
                data-wk-rise
                className="filet panel base-ficha relative p-5 transition-colors md:p-6"
              >
                <span className="filet-alt" aria-hidden />
                <span className="base-calha hidden lg:block" aria-hidden>
                  <span className="base-numeral marginalia">{romano(i + 1)}</span>
                </span>

                <h2 className="font-display text-lg text-[var(--color-parchment)]">
                  {t(`wiki.base.sis.${s.chave}.nome`)}
                </h2>
                <div className="balanca mt-4">
                  <div>
                    <p className="balanca-rotulo balanca-rotulo-antes">
                      {t("wiki.base.no_original")}
                    </p>
                    <p className="text-[0.95rem] leading-relaxed text-[var(--color-faint)]">
                      {t(`wiki.base.sis.${s.chave}.original`)}
                    </p>
                  </div>
                  <div className="balanca-regua" aria-hidden>
                    <span className="dia" />
                  </div>
                  <div className="balanca-lado-agora">
                    <p className="balanca-rotulo balanca-rotulo-agora">
                      {t("wiki.base.no_versus")}
                    </p>
                    <p className="text-[0.95rem] leading-relaxed text-[var(--color-muted)]">
                      {t(`wiki.base.sis.${s.chave}.versus`)}
                    </p>
                    {s.secao && (
                      <Link
                        href={s.secao.href}
                        className="mt-3 inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-colors hover:text-[var(--color-gold-bright)]"
                      >
                        <span aria-hidden className="inline-block h-1 w-1 rotate-45 bg-current" />
                        {t(s.secao.chave)}
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <footer className="max-w-3xl">
        <p className="text-[0.92rem] leading-relaxed text-[var(--color-faint)]">
          {t("wiki.base.rodape")}
        </p>
      </footer>
    </main>
  );
}
