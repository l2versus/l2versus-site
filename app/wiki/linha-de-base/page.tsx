import Link from "next/link";
import type { Metadata } from "next";
import SequenciaScrub from "@/components/media/SequenciaScrub";

export const metadata: Metadata = {
  title: "A linha de base — o High Five original | Wiki L2 Versus",
  description:
    "O que é um servidor Lineage 2 High Five low rate de verdade — e, sistema por sistema, o que o L2 Versus muda em cima dele.",
};

/**
 * A LINHA DE BASE — página curada à mão, não gerada.
 *
 * O wiki inteiro se apoia numa comparação: "no jogo original é X, aqui é Y".
 * Esta página estabelece o X para quem nunca jogou H5 retail ou vem de outra
 * crônica. Os fatos do retail foram conferidos em fontes públicas (l2db.info /
 * l2central — Divine Inspiration, skill 1405) e no padrão dos low rates
 * clássicos (x1–x5, economia próxima do oficial). O lado L2 Versus sai da
 * nossa documentação interna, a mesma que alimenta as seções do códice.
 */

type Linha = {
  sistema: string;
  original: string;
  versus: string;
  secao?: { href: string; rotulo: string };
};

const LINHAS: Linha[] = [
  {
    sistema: "Rates",
    original:
      "O oficial roda em x1. Um low rate clássico fica entre x1 e x5 — a economia continua funcionando porque adena e drop não desvalorizam, e cada level pesa.",
    versus:
      "x5 — dentro da janela clássica de low rate. Sem drop dobrado por evento: o rate é o rate.",
  },
  {
    sistema: "Vagas de buff",
    original:
      "20 vagas base + 4 com os livros de Divine Inspiration = 24 no máximo. Todo buff, dança e canção disputa essas vagas.",
    versus:
      "20 buffs + 12 danças/canções + 12 gatilhos — e 10 habilidades marcadas (mais todas as 153 de gatilho) não ocupam vaga nenhuma e não derrubam os seus buffs.",
    secao: { href: "/wiki/skills-sem-slot", rotulo: "Skills sem Vaga de Buff" },
  },
  {
    sistema: "Jóias de boss",
    original:
      "Cada jóia épica existe numa versão só, que dropa do próprio boss. Ring of Core é Ring of Core, e acabou.",
    versus:
      "Até três degraus por jóia — Lesser, normal e Improved — com efeitos crescentes e formas de obter diferentes (moeda do boss, drop, e um sistema pós-Dynasty ainda em definição).",
    secao: { href: "/wiki/joias-boss", rotulo: "Jóias de Boss" },
  },
  {
    sistema: "Bônus de conjunto",
    original:
      "O bônus extra de encantamento de conjunto liga num único limiar: +6. Abaixo disso, só o bônus base.",
    versus:
      "Uma escada de +4 a +10, para qualquer conjunto completo de qualquer grade — e ela SOMA com o bônus nativo de +6 que já existia.",
    secao: { href: "/wiki/conjuntos", rotulo: "Conjuntos de Armadura" },
  },
  {
    sistema: "SA das armas",
    original:
      "Cada arma aceita suas Soul Abilities de fábrica, com valores fixos da crônica.",
    versus:
      "223 alterações, em 30 SAs e 83 skills — SAs trocadas arma por arma, sempre documentando o que saiu e o que entrou.",
    secao: { href: "/wiki/armas-sa", rotulo: "SA das Armas" },
  },
  {
    sistema: "Masterwork",
    original:
      "Armas e peitos Masterwork (Foundation) dão bônus de fábrica, muitos deles fracos ou redundantes.",
    versus:
      "112 bônus já alterados. Percentuais escalam por grade sozinhos; os valores fixos valem igual em toda grade, de propósito.",
    secao: { href: "/wiki/masterwork", rotulo: "Masterwork" },
  },
  {
    sistema: "Armas de Herói",
    original:
      "O arsenal Infinity do Herói da Olympíada, com o cancel da Infinity Spear disparando sem regra clara.",
    versus:
      "As 14 Infinity rebalanceadas — o cancel agora segue a mesma regra das armas {PvP}: só no crítico, 33%, 1 buff por vez, 3s de intervalo.",
    secao: { href: "/wiki/armas-heroi", rotulo: "Armas de Herói" },
  },
  {
    sistema: "Augment",
    original:
      "Lifestones sorteiam opções numa tabela retail conhecida; atributos de elemento e resistências saem só em acessório.",
    versus:
      "A tabela inteira do servidor documentada: 200 entradas, com cada skill, chance e valor lidos dos arquivos — não da descrição do cliente.",
    secao: { href: "/wiki/augments", rotulo: "Augment e Lifestone" },
  },
];

export default function LinhaDeBasePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <nav className="mb-7 flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          Códice
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-muted)]">A linha de base</span>
      </nav>

      <header className="max-w-3xl">
        <p className="flex items-center gap-2.5 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
          <span aria-hidden className="font-display text-base leading-none">⚖</span>
          Antes de tudo
        </p>
        <h1 className="mt-3 font-display text-[1.75rem] leading-tight tracking-[0.03em] text-[var(--color-parchment)] md:text-[2.4rem]">
          O High Five original — a linha de base
        </h1>
        <p className="prosa-col mt-4 text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
          O L2 Versus é um <strong className="text-[var(--color-parchment)]">low rate
          High Five</strong>: rates entre x1 e x5, economia que funciona porque nada é
          dado de graça, cerco, Olympíada, epic bosses e craft como a NCSoft desenhou.
          Essa é a fundação — e ela não muda. O que muda está catalogado abaixo,
          sistema por sistema, sempre com a seção do códice onde os números vivem.
        </p>
      </header>

      {/* A cena inteira é o gatilho do painel: conforme você desce as oito
          linhas, a luz percorre a cidadela no painel sticky à direita — o
          clipe vertical do castelo, quadro a quadro, cortado para a metade
          de baixo (a de cima tinha texto de IA embaralhado). */}
      <div className="mt-10" data-scrub-cena>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <div className="space-y-4">
        {LINHAS.map((l, i) => (
          <section
            key={l.sistema}
            data-wk-rise
            className="filet panel panel-lit p-5 md:p-6"
          >
            <span className="filet-alt" aria-hidden />
            <h2 className="font-display text-lg text-[var(--color-parchment)]">
              {l.sistema}
            </h2>
            <div className="balanca mt-4">
              <div>
                <p className="balanca-rotulo balanca-rotulo-antes">No High Five original</p>
                <p className="text-[0.95rem] leading-relaxed text-[var(--color-faint)]">
                  {l.original}
                </p>
              </div>
              <div className="balanca-regua" aria-hidden>
                <span className="dia" />
              </div>
              <div className="balanca-lado-agora">
                <p className="balanca-rotulo balanca-rotulo-agora">No L2 Versus</p>
                <p className="text-[0.95rem] leading-relaxed text-[var(--color-muted)]">
                  {l.versus}
                </p>
                {l.secao && (
                  <Link
                    href={l.secao.href}
                    className="mt-3 inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.2em] text-[var(--color-gold)] transition-colors hover:text-[var(--color-gold-bright)]"
                  >
                    <span aria-hidden className="inline-block h-1 w-1 rotate-45 bg-current" />
                    {l.secao.rotulo}
                  </Link>
                )}
              </div>
            </div>
          </section>
        ))}
          </div>

          {/* a miniatura iluminada: moldura dupla, como prancha de manuscrito */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <div className="border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.04)] p-1.5">
                <div className="relative overflow-hidden" style={{ aspectRatio: "720 / 560" }}>
                  <SequenciaScrub pasta="/seq/castelo" quadros={48} modo="painel" className="absolute inset-0" />
                </div>
              </div>
              <p className="mt-3 text-center text-[0.68rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                Desça a página — a luz percorre a cidadela
              </p>
            </div>
          </aside>
        </div>
      </div>

      <footer className="mt-10 max-w-3xl">
        <p className="text-[0.92rem] leading-relaxed text-[var(--color-faint)]">
          Fatos do retail conferidos em fontes públicas da comunidade (l2db.info e
          l2central.info — ex.: Divine Inspiration, skill 1405). O lado L2 Versus sai
          da documentação interna do servidor, a mesma que alimenta cada seção deste
          códice — lida dos arquivos, não digitada.
        </p>
      </footer>
    </main>
  );
}
