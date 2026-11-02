import Link from "next/link";
import type { Metadata } from "next";
import { carregarSecoes } from "@/lib/wiki/data";
import SequenciaScrub from "@/components/media/SequenciaScrub";
import { getT } from "@/lib/i18n/server";
import { realce } from "@/lib/i18n/realce";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("wiki.home.meta.titulo"),
    description: t("wiki.home.meta.descricao"),
  };
}

/**
 * Frontispício do wiki.
 *
 * A tese: banco de dados de itens qualquer servidor tem. O que ninguém tem é o
 * DIFF contra o jogo original. Então a página abre com isso, não com uma barra
 * de busca.
 *
 * O bloco de abertura usa `zone-parchment` — o tema claro que já existia no
 * design system e nenhuma tela usava. Sair do obsidiana para o pergaminho no
 * exato momento em que o jogador entra no wiki faz o gesto de ABRIR UM LIVRO,
 * e depois a página volta ao escuro para a navegação.
 *
 * Esta página nasceu com o texto cravado em português. O rail à esquerda já
 * traduzia e o frontispício não, então um jogador russo via o menu em russo e
 * a página em português — o pior dos dois mundos, porque parece defeito, não
 * falta de tradução. Agora tudo sai do `wiki.home.*`.
 */
export default async function WikiIndexPage() {
  const [secoes, t] = await Promise.all([carregarSecoes(), getT()]);
  const prontas = secoes.filter((s) => s.estado.ok);
  const totalEntradas = prontas.reduce((n, s) => n + s.total, 0);

  const comoEFeito = [1, 2, 3].map((n) => ({
    n: ["I", "II", "III"][n - 1],
    t: t(`wiki.home.feito.${n}.t`),
    d: t(`wiki.home.feito.${n}.d`),
  }));

  return (
    <main>
      {/* ---------- FRONTISPÍCIO (pergaminho) ----------
          Três planos de profundidade ATRÁS do texto, cada um num ritmo
          diferente no scroll; o plano do texto não recebe parallax nenhum,
          para o título nunca fugir do olho. O conjunto levanta como uma
          página sendo virada (data-wk-lift). */}
      <section
        data-wk-lift
        className="zone-parchment cut-both relative overflow-hidden"
      >
        {/* plano distante: o cerco, vivo nas bordas, vazio no miolo do texto */}
        <div className="wk-camada wk-camada-mundo" data-wk-plx="24" aria-hidden />
        {/* plano médio: o ornamento gravado */}
        <div className="wk-camada wk-camada-brasao" data-wk-plx="-12" aria-hidden />
        {/* primeiro plano: o cavaleiro recortado, correndo CONTRA o fundo */}
        <img
          src="/art/knight-cut.png"
          alt=""
          className="wk-cavaleiro"
          data-wk-plx="-16"
          aria-hidden
        />
        {/* a dobra: sombra que só nasce conforme a página levanta */}
        <div className="wk-dobra" data-wk-dobra aria-hidden />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-14 text-center md:py-16">
          <p className="flex items-center justify-center gap-2.5 text-[0.68rem] uppercase tracking-[0.34em] text-[var(--color-gold)]">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] bg-[rgba(138,107,44,0.25)]"
            />
            Chaotic Throne · High Five
          </p>

          <h1 className="mt-4 font-display text-[2rem] leading-[1.1] tracking-[0.03em] text-[var(--color-parchment)] md:text-[3.1rem]">
            {t("wiki.home.titulo")}
          </h1>

          <div className="diamond-rule mx-auto mt-6 max-w-sm">
            <span className="dia" />
          </div>

          <p className="prosa-col mx-auto mt-6 text-[1.02rem] leading-relaxed text-[var(--color-muted)] md:text-[1.1rem]">
            {realce(t("wiki.home.tese"))}
          </p>

          <p className="prosa-col mx-auto mt-4 text-[0.92rem] leading-relaxed text-[var(--color-faint)]">
            {t("wiki.home.procedencia")}
          </p>
        </div>
      </section>

      {/* ---------- AS DUAS PORTAS DE ENTRADA ---------- */}
      <section className="mx-auto max-w-6xl px-6 pt-14 md:pt-16">
        <Link
          href="/wiki/linha-de-base"
          data-wk-rise
          className="filet panel panel-gold panel-lit wk-luz group flex flex-col gap-4 p-6 transition-colors hover:border-[rgba(240,212,136,0.6)] md:flex-row md:items-center md:gap-8 md:p-7"
        >
          <span className="filet-alt" aria-hidden />
          <span
            aria-hidden
            className="font-display text-4xl leading-none text-[var(--color-gold)] transition-colors group-hover:text-[var(--color-gold-bright)]"
          >
            ⚖
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl leading-snug text-[var(--color-parchment)] transition-colors group-hover:text-[var(--color-gold-bright)] md:text-2xl">
              {t("wiki.home.porta_base.titulo")}
            </span>
            <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-[var(--color-muted)]">
              {t("wiki.home.porta_base.texto")}
            </span>
          </span>
          <span className="selo selo-tier-improved shrink-0">
            {t("wiki.home.porta_base.selo")}
          </span>
        </Link>

        {/* a árvore: a outra porta de entrada, para quem chega pensando
            "que classe eu jogo" antes de "o que mudou" */}
        <Link
          href="/wiki/classes"
          data-wk-rise
          className="filet panel panel-lit wk-luz group mt-4 flex flex-col gap-4 p-6 transition-colors hover:border-[rgba(201,162,75,0.45)] md:flex-row md:items-center md:gap-8"
        >
          <span className="filet-alt" aria-hidden />
          <span
            aria-hidden
            className="font-display text-4xl leading-none text-[var(--color-gold)] transition-colors group-hover:text-[var(--color-gold-bright)]"
          >
            ⚔
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl leading-snug text-[var(--color-parchment)] transition-colors group-hover:text-[var(--color-gold-bright)] md:text-2xl">
              {t("wiki.home.porta_classes.titulo")}
            </span>
            <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-[var(--color-muted)]">
              {t("wiki.home.porta_classes.texto")}
            </span>
          </span>
          <span className="selo selo-tier-normal shrink-0">
            {t("wiki.home.porta_classes.selo")}
          </span>
        </Link>
      </section>

      {/* ---------- ÍNDICE DAS SEÇÕES ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-10 md:pt-12">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="sec-title">{t("wiki.home.secoes")}</h2>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
            {t("wiki.home.prontas")
              .replace("{n}", String(prontas.length))
              .replace("{m}", String(secoes.length))}{" "}
            · {totalEntradas}{" "}
            {t(totalEntradas === 1 ? "wiki.entrada" : "wiki.entradas")}
          </p>
        </div>

        <div
          data-wk-tilt
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {secoes.map((s) => {
            const pronta = s.estado.ok;
            return (
              <Link
                key={s.slug}
                href={`/wiki/${s.slug}`}
                data-wk-rise
                className={`filet panel panel-lit wk-luz group flex flex-col p-5 transition-colors ${
                  pronta ? "hover:border-[rgba(201,162,75,0.45)]" : "opacity-70"
                }`}
              >
                <span className="filet-alt" aria-hidden />

                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className="font-display text-2xl leading-none text-[var(--color-gold)] transition-colors group-hover:text-[var(--color-gold-bright)]"
                  >
                    {s.glifo}
                  </span>
                  {pronta ? (
                    <span className="text-[0.75rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
                      {s.total} {t(s.total === 1 ? "wiki.entrada" : "wiki.entradas")}
                    </span>
                  ) : (
                    <span className="selo selo-pendente">{t("wiki.em_preparacao")}</span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-lg leading-snug text-[var(--color-parchment)] transition-colors group-hover:text-[var(--color-gold-bright)]">
                  {t(`wiki.sec.${s.slug}.titulo`)}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                  {t(`wiki.sec.${s.slug}.chamada`)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- O CAPÍTULO CINEMÁTICO: vídeo scrubbado quadro a quadro ----------
          O clipe do cavaleiro (Veo) vira sequência de 97 quadros e o SCROLL é
          o controle do tempo: desce, ele avança; sobe, ele volta. Os quadros
          param no 96 de propósito — dali em diante o vídeo original dizia
          "Servidor Interlude 7x", que é de outro projeto. O último quadro é o
          cavaleiro erguendo a mão — deixamos o convite aparecer nessa deixa. */}
      <SequenciaScrub
        pasta="/seq/versus"
        /* O clipe original tem 848×478 e 192 quadros a 24fps. O conjunto de
           desktop usa os 192 (scrub liso, 15 MB) e o de tela pequena usa 96
           (4 MB) — os dois cobrem o mesmo clipe, só muda a granularidade.
           Ver scripts/tratar-sequencia.mjs e o comentário de `quadrosBase`. */
        quadros={192}
        quadrosBase={96}
        modo="heroi"
        alturaVh={300}
        className="mt-16 md:mt-20"
      >
        <div className="ss-cap ss-cap-baixo" data-de="0" data-ate="0.34">
          <div className="diamond-rule w-full max-w-xs">
            <span className="dia" />
          </div>
          <p className="mt-5 font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">
            {t("wiki.home.cap1")}
          </p>
        </div>
        <div className="ss-cap ss-cap-baixo" data-de="0.34" data-ate="0.66">
          <p className="font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">
            <span className="text-glow-gold">{t("wiki.home.cap2")}</span>
          </p>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-[var(--color-muted)] [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            {t("wiki.home.cap2_sub")}
          </p>
        </div>
        <div className="ss-cap ss-cap-baixo" data-de="0.66" data-ate="1">
          <p className="font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">
            {realce(t("wiki.home.cap3"), { forte: "text-glow-gold" })}
          </p>
          <Link
            href="/wiki/linha-de-base"
            className="btn-gold mt-7 px-7 py-3 text-xs backdrop-blur-sm"
          >
            ◆ {t("wiki.home.porta_base.titulo")}
          </Link>
        </div>
      </SequenciaScrub>

      {/* ---------- COMO ESTE CÓDICE É FEITO ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="sec-title">{t("wiki.home.feito.titulo")}</h2>

        <div data-wk-tilt className="mt-7 grid gap-4 md:grid-cols-3">
          {comoEFeito.map((c) => (
            <div key={c.n} data-wk-rise className="filet panel panel-lit wk-luz p-5">
              <span className="filet-alt" aria-hidden />
              <span className="marginalia">{c.n}</span>
              <h3 className="mt-2 font-display text-base leading-snug text-[var(--color-gold-bright)]">
                {c.t}
              </h3>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                {c.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
