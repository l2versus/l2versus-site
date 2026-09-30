import Link from "next/link";
import type { Metadata } from "next";
import { carregarSecoes } from "@/lib/wiki/data";
import SequenciaScrub from "@/components/media/SequenciaScrub";

export const metadata: Metadata = {
  title: "Wiki — O Códice do Versus | L2 Versus",
  description:
    "O que o L2 Versus tem de diferente do Lineage 2 High Five original: jóias de boss em três degraus, SA de armas trocadas, escada de encantamento de conjunto, skills rebalanceadas. Sempre com o valor de antes e o de agora.",
};

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
 */
export default async function WikiIndexPage() {
  const secoes = await carregarSecoes();
  const prontas = secoes.filter((s) => s.estado.ok);
  const totalEntradas = prontas.reduce((n, s) => n + s.total, 0);

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
            O Códice do Versus
          </h1>

          <div className="diamond-rule mx-auto mt-6 max-w-sm">
            <span className="dia" />
          </div>

          <p className="prosa-col mx-auto mt-6 text-[1.02rem] leading-relaxed text-[var(--color-muted)] md:text-[1.1rem]">
            Todo servidor tem um banco de dados de itens. O que quase nenhum tem é
            a <strong className="text-[var(--color-parchment)]">diferença</strong>.
            Este códice existe para responder uma pergunta só: se você já conhece
            Lineage 2, <em>o que muda aqui</em> — e em quanto.
          </p>

          <p className="prosa-col mx-auto mt-4 text-[0.92rem] leading-relaxed text-[var(--color-faint)]">
            Cada número foi lido dos arquivos do servidor, um por um, não da
            descrição que aparece dentro do cliente. Onde os dois divergem, está
            avisado na página — e o que vale em jogo é o daqui.
          </p>
        </div>
      </section>

      {/* ---------- A LINHA DE BASE (porta de entrada) ---------- */}
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
              Comece pela linha de base
            </span>
            <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-[var(--color-muted)]">
              Como é um High Five low rate de verdade — e, sistema por sistema, o que
              o Versus muda em cima dele. Se você só ler uma página, leia esta.
            </span>
          </span>
          <span className="selo selo-tier-improved shrink-0">o mapa do códice</span>
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
              A árvore de classes
            </span>
            <span className="mt-1.5 block text-[0.95rem] leading-relaxed text-[var(--color-muted)]">
              As 103 profissões por raça e por função, da inicial à terceira —
              com a linhagem inteira acendendo quando você passa o mouse.
            </span>
          </span>
          <span className="selo selo-tier-normal shrink-0">103 classes</span>
        </Link>
      </section>

      {/* ---------- ÍNDICE DAS SEÇÕES ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-4 pt-10 md:pt-12">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="sec-title">As seções</h2>
          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
            {prontas.length} de {secoes.length} prontas · {totalEntradas}{" "}
            {totalEntradas === 1 ? "entrada" : "entradas"}
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
                      {s.total} {s.total === 1 ? "entrada" : "entradas"}
                    </span>
                  ) : (
                    <span className="selo selo-pendente">em preparação</span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-lg leading-snug text-[var(--color-parchment)] transition-colors group-hover:text-[var(--color-gold-bright)]">
                  {s.titulo}
                </h3>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                  {s.chamada}
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
        quadros={49}
        modo="heroi"
        alturaVh={300}
        className="mt-16 md:mt-20"
      >
        <div className="ss-cap ss-cap-baixo" data-de="0" data-ate="0.34">
          <div className="diamond-rule w-full max-w-xs">
            <span className="dia" />
          </div>
          <p className="mt-5 font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">
            Lido dos arquivos do servidor.
          </p>
        </div>
        <div className="ss-cap ss-cap-baixo" data-de="0.34" data-ate="0.66">
          <p className="font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">
            <span className="text-glow-gold">Não da descrição do cliente.</span>
          </p>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-[var(--color-muted)] [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            Quando o jogo mostrar um número velho, o que vale em combate é o que
            está gravado neste códice.
          </p>
        </div>
        <div className="ss-cap ss-cap-baixo" data-de="0.66" data-ate="1">
          <p className="font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">
            O que muda, você vê <span className="text-glow-gold">antes de logar</span>.
          </p>
          <Link
            href="/wiki/linha-de-base"
            className="btn-gold mt-7 px-7 py-3 text-xs backdrop-blur-sm"
          >
            ◆ Comece pela linha de base
          </Link>
        </div>
      </SequenciaScrub>

      {/* ---------- COMO ESTE CÓDICE É FEITO ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="sec-title">Como este códice é feito</h2>

        <div data-wk-tilt className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "I",
              t: "Lido do servidor, não do cliente",
              d: "Os valores saem dos arquivos do servidor. A descrição dentro do jogo às vezes ficou com o número velho — quando isso acontece, a entrada avisa, e o valor desta página é o que vale.",
            },
            {
              n: "II",
              t: "Toda entrada cita a origem",
              d: "No pé de cada entrada está o arquivo e a linha de onde ela saiu. Serve para você conferir, e para nós auditarmos o códice contra a fonte sem adivinhação.",
            },
            {
              n: "III",
              t: "O que não sabemos fica em branco",
              d: "Quando a fonte registrou só o valor de hoje, a entrada mostra “estado atual” e diz que o valor antigo não está documentado. Não preenchemos lacuna com chute.",
            },
          ].map((c) => (
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
