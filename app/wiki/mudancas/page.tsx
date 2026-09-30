import Link from "next/link";
import type { Metadata } from "next";
import { carregarFeed, dataPorExtenso, type MudancaNoFeed } from "@/lib/wiki/mudancas";
import { carregarSecoes } from "@/lib/wiki/data";
import CodexNav from "../_components/CodexNav";

export const metadata: Metadata = {
  title: "O que mudou — linha do tempo | Wiki L2 Versus",
  description:
    "Todas as alterações do L2 Versus em relação ao High Five original, em ordem cronológica: jóias, SA de armas, masterwork, conjuntos, augments e armas de herói.",
};

/* O feed existe para ser ESCANEADO — o jogador percorre dezenas de linhas
   procurando o que lhe interessa. Alguns valores da fonte são parágrafos
   inteiros (a lista dos 9 peitos com texto duplicado, por exemplo) e uma
   linha de cinco alturas quebra o ritmo da varredura. Aqui o valor é uma
   amostra; a entrada completa, sem corte nenhum, está na seção — que é
   exatamente para onde a linha leva. */
const resumir = (texto: string, limite = 96) =>
  texto.length <= limite ? texto : `${texto.slice(0, limite).trimEnd()}…`;

function Linha({ m }: { m: MudancaNoFeed }) {
  const e = m.entrada;
  /* o primeiro efeito do lado AGORA é o resumo mais honesto que existe da
     mudança — é o valor que passou a valer em jogo */
  const destaque = e.agora[0];
  return (
    <li>
      <Link href={`/wiki/${m.secaoSlug}`} className="mud-linha">
        <span className="mud-glifo" aria-hidden>
          {m.glifo}
        </span>
        <span className="min-w-0 flex-1">
          <span className="mud-titulo">{resumir(e.titulo, 110)}</span>
          {destaque && (
            <span className="mud-valor">
              {resumir(destaque.rotulo, 40)}
              <b>{resumir(destaque.valor)}</b>
            </span>
          )}
        </span>
        <span className="mud-secao">{m.secaoTitulo}</span>
      </Link>
    </li>
  );
}

export default async function MudancasPage() {
  const [feed, secoes] = await Promise.all([carregarFeed(), carregarSecoes()]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <nav className="mb-7 flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          Códice
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-muted)]">O que mudou</span>
      </nav>

      <div className="grid min-w-0 gap-10 lg:grid-cols-[232px_1fr] lg:gap-12">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <CodexNav secoes={secoes} ativo="mudancas" />
        </aside>

        <div className="min-w-0">
          <header>
            <p className="flex items-center gap-2.5 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
              <span aria-hidden className="font-display text-base leading-none">
                ⟳
              </span>
              A linha do tempo
            </p>
            <h1 className="mt-3 font-display text-[1.75rem] leading-tight tracking-[0.03em] text-[var(--color-parchment)] md:text-[2.4rem]">
              O que mudou, e quando
            </h1>
            <p className="prosa-col mt-3 text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
              As seções do códice respondem <em>como funciona</em>. Esta página
              responde <em>o que mudou</em> — em ordem, da alteração mais recente
              para a mais antiga. Se você já joga aqui, é por ela que dá para
              saber o que vale reler.
            </p>
          </header>

          <div className="mud-resumo mt-7">
            <span>
              <b>{feed.totalDatadas}</b> alterações datadas
            </span>
            <span>
              <b>{feed.marcos.length}</b> dias de trabalho
            </span>
            <span>
              <b>{feed.totalSemData}</b> sem data na fonte
            </span>
          </div>

          {feed.familiasIndisponiveis.length > 0 && (
            <p className="nota nota-fonte mt-5">
              <span aria-hidden className="text-[var(--color-gold)]">◆</span>
              <span>
                Fora desta contagem:{" "}
                <strong className="text-[var(--color-parchment)]">
                  {feed.familiasIndisponiveis.join(", ")}
                </strong>{" "}
                — {feed.familiasIndisponiveis.length === 1 ? "essa seção ainda não foi" : "essas seções ainda não foram"}{" "}
                extraída{feed.familiasIndisponiveis.length === 1 ? "" : "s"} da fonte. A
                linha do tempo cresce quando {feed.familiasIndisponiveis.length === 1 ? "ela entrar" : "elas entrarem"}.
              </span>
            </p>
          )}

          {/* ---------- a linha do tempo ---------- */}
          <div className="mud-tempo mt-10">
            {feed.marcos.map((marco) => (
              <section key={marco.data} className="mud-marco">
                <header className="mud-marco-cabeca">
                  <span className="mud-marco-dia" aria-hidden />
                  <h2 className="mud-marco-data">{dataPorExtenso(marco.data)}</h2>
                  <span className="mud-marco-linha" aria-hidden />
                  <span className="mud-marco-total">
                    {marco.itens.length}{" "}
                    {marco.itens.length === 1 ? "alteração" : "alterações"}
                  </span>
                </header>
                <ul className="mud-lista">
                  {marco.itens.map((m) => (
                    <Linha key={`${m.secaoSlug}-${m.entrada.id}`} m={m} />
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* ---------- as sem data ---------- */}
          {feed.semData.length > 0 && (
            <section className="mt-14">
              <div className="diamond-rule mb-5">
                <span className="dia" />
              </div>
              <h2 className="sec-title">Sem data na fonte</h2>
              <p className="prosa-col mt-3 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                Estas {feed.semData.length} alterações estão documentadas e valem em
                jogo, mas o arquivo-fonte não registrou <em>quando</em> foram feitas.
                Ficam aqui em vez de receberem uma data inventada — e sobem para a
                linha do tempo no dia em que a fonte disser a data.
              </p>
              <details className="filet panel panel-lit group mt-5">
                <span className="filet-alt" aria-hidden />
                <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)] transition-transform group-open:rotate-[225deg]"
                  />
                  <span className="text-[0.76rem] font-bold uppercase tracking-[0.28em] text-[var(--color-gold)]">
                    Ver as {feed.semData.length}
                  </span>
                </summary>
                <ul className="mud-lista px-5 pb-5">
                  {feed.semData.map((m) => (
                    <Linha key={`${m.secaoSlug}-${m.entrada.id}`} m={m} />
                  ))}
                </ul>
              </details>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
