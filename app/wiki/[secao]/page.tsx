import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { carregarFamilia, carregarSecoes } from "@/lib/wiki/data";
import { SECOES, secaoPorSlug } from "@/lib/wiki/types";
import CodexNav from "../_components/CodexNav";
import EntradaCard from "../_components/EntradaCard";
import EstadoIndisponivel from "../_components/EstadoIndisponivel";
import { getT } from "@/lib/i18n/server";
import Paginador, {
  LIMIAR_PAGINACAO,
  POR_PAGINA,
  paginaValida,
  totalDePaginas,
} from "../_components/Paginador";

/** Uma rota estática por seção — nenhuma toca no banco. */
export function generateStaticParams() {
  return SECOES.map((s) => ({ secao: s.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ secao: string }>;
  searchParams: Promise<{ p?: string }>;
}): Promise<Metadata> {
  const [{ secao }, { p }] = await Promise.all([params, searchParams]);
  const meta = secaoPorSlug(secao);
  if (!meta) return { title: "Wiki — L2 Versus" };
  /* a página 2+ precisa de título próprio: duas URLs com o mesmo <title> e a
     mesma descrição são páginas duplicadas aos olhos do buscador.

     O número passa pelo MESMO saneamento do corpo da página. Sem isso,
     /wiki/augments?p=999 renderizava a página 9 mas anunciava "(página 999)"
     no título — qualquer valor na querystring virava um título fabricado. */
  const [estado, t] = await Promise.all([carregarFamilia(meta.familia), getT()]);
  const total = estado.ok ? estado.familia.entradas.length : 0;
  const n = total > LIMIAR_PAGINACAO ? paginaValida(p, total) : 1;
  const sufixo = n > 1 ? ` (página ${n})` : "";
  return {
    title: `${t(`wiki.sec.${secao}.titulo`)}${sufixo} — Wiki | L2 Versus`,
    description: t(`wiki.sec.${secao}.chamada`),
  };
}

export default async function SecaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ secao: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const [{ secao }, { p }] = await Promise.all([params, searchParams]);
  const meta = secaoPorSlug(secao);
  if (!meta) notFound();
  const t = await getT();

  const [estado, secoes] = await Promise.all([
    carregarFamilia(meta.familia),
    carregarSecoes(),
  ]);

  const contexto = estado.ok ? estado.familia.contexto : undefined;
  const entradas = estado.ok ? estado.familia.entradas : [];
  const geradoDe = estado.ok ? estado.familia.geradoDe : [];
  const comoLer = estado.ok ? estado.familia.comoLer : [];

  /* Quando a seção INTEIRA é "estado atual" (nenhuma entrada tem o valor
     antigo nem é adição nova), o aviso sobe para cá — uma vez — e sai das
     fichas. O mesmo aviso repetido em 23 fichas treina o olho a ignorá-lo. */
  const secaoInteiraSemAntes =
    entradas.length > 0 && entradas.every((e) => e.antes.length === 0 && !e.novo);

  /* Seções curtas continuam em página única — paginar 23 jóias só cria
     cliques. Acima do limiar, a fatia da página pedida. */
  const paginar = entradas.length > LIMIAR_PAGINACAO;
  const pagina = paginar ? paginaValida(p, entradas.length) : 1;
  const visiveis = paginar
    ? entradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
    : entradas;
  /* o índice do card é global, não da fatia: a numeração romana das fichas
     tem que continuar de onde a página anterior parou */
  const deslocamento = paginar ? (pagina - 1) * POR_PAGINA : 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* migalha */}
      <nav className="mb-7 flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          {t("wiki.migalha.codice")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-muted)]">{t(`wiki.sec.${secao}.titulo`)}</span>
      </nav>

      <div className="grid min-w-0 gap-10 lg:grid-cols-[232px_1fr] lg:gap-12">
        {/* ---------- rail do índice ---------- */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <CodexNav secoes={secoes} ativo={meta.slug} />
        </aside>

        {/* ---------- conteúdo ---------- */}
        <div className="min-w-0">
          <header>
            <p className="flex items-center gap-2.5 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
              <span aria-hidden className="font-display text-base leading-none">
                {meta.glifo}
              </span>
              {t("wiki.porta.mudancas")}
            </p>
            <h1 className="mt-3 font-display text-[1.75rem] leading-tight tracking-[0.03em] text-[var(--color-parchment)] md:text-[2.4rem]">
              {t(`wiki.sec.${secao}.titulo`)}
            </h1>
            <p className="prosa-col mt-3 text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
              {t(`wiki.sec.${secao}.chamada`)}
            </p>
          </header>

          {/* ---------- contexto da seção ---------- */}
          {contexto?.resumo && (
            <div className="filet panel panel-gold panel-lit mt-8 p-5 md:p-6">
              <span className="filet-alt" aria-hidden />
              <p className="mb-3 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
                {t("wiki.diferenca_ideia")}
              </p>
              <p className="prosa-col text-[1rem] leading-relaxed text-[var(--color-parchment)]">
                {contexto.resumo}
              </p>

              {contexto.tiers && contexto.tiers.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="wiki-table min-w-[520px]">
                    <thead>
                      <tr>
                        <th>{t("wiki.degrau")}</th>
                        <th>{t("wiki.como_se_obtem")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contexto.tiers.map((linha) => (
                        <tr key={linha.tier}>
                          <td className="whitespace-nowrap">
                            <span
                              className={
                                linha.tier.toLowerCase() === "lesser"
                                  ? "selo selo-tier-lesser"
                                  : linha.tier.toLowerCase() === "improved"
                                    ? "selo selo-tier-improved"
                                    : "selo selo-tier-normal"
                              }
                            >
                              {linha.tier}
                            </span>
                          </td>
                          <td className="text-[var(--color-muted)]">
                            {linha.comoObter}
                            {linha.pendente && (
                              <span className="ml-2 selo selo-pendente">
                                não definido
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {contexto.regraDuplicata && (
                <p className="mt-5 text-[0.9rem] leading-relaxed text-[var(--color-faint)]">
                  <span aria-hidden className="mr-1.5 text-[var(--color-gold-deep)]">
                    ◆
                  </span>
                  {contexto.regraDuplicata}
                </p>
              )}
            </div>
          )}

          {/* ---------- como ler esta seção ----------
              As regras de leitura que o arquivo-fonte carrega no cabeçalho e
              no rodapé: o que os números significam, o que ficou de fora e de
              onde tudo saiu. Recolhível para não empurrar as entradas — mas
              presente, porque foi a primeira coisa que a extração perdeu. */}
          {comoLer.length > 0 && (
            <details className="filet panel panel-lit group mt-4">
              <span className="filet-alt" aria-hidden />
              <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)] transition-transform group-open:rotate-[225deg]"
                />
                <span className="text-[0.76rem] font-bold uppercase tracking-[0.28em] text-[var(--color-gold)]">
                  {t("wiki.como_ler")}
                </span>
                <span className="ml-auto text-[0.75rem] uppercase tracking-[0.18em] text-[var(--color-faint)]">
                  {comoLer.length} {comoLer.length === 1 ? "nota" : "notas"}
                </span>
              </summary>
              <div className="space-y-4 px-5 pb-5 md:px-6">
                {comoLer.map((n, i) => (
                  <div
                    key={`${n.fonte}-${i}`}
                    className="border-l-2 border-[var(--color-gold-deep)] pl-4"
                  >
                    {n.titulo && (
                      <p className="mb-1 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[var(--color-gold-bright)]">
                        {n.titulo}
                      </p>
                    )}
                    <p className="prosa-col text-[0.95rem] leading-relaxed text-[var(--color-muted)]">
                      {n.texto}
                    </p>
                    <p className="mt-1.5 font-mono text-[0.73rem] text-[var(--color-faint)]">
                      {n.fonte}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ---------- as entradas ---------- */}
          <div className="mt-10">
            {!estado.ok ? (
              <EstadoIndisponivel
                titulo={meta.titulo}
                erro={estado.erro}
                detalhe={estado.detalhe}
              />
            ) : (
              <>
                <div className="diamond-rule mb-6">
                  <span className="dia" />
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3" id="entradas">
                  <h2 className="sec-title">
                    {entradas.length} {t(entradas.length === 1 ? "wiki.entrada" : "wiki.entradas")}
                    {paginar && (
                      <span className="sec-title-pag">
                        {t("wiki.pag.pagina_n_de_m").replace("{n}", String(pagina)).replace("{m}", String(totalDePaginas(entradas.length)))}
                      </span>
                    )}
                  </h2>
                  {geradoDe.length > 0 && (
                    <p className="font-mono text-[0.75rem] text-[var(--color-faint)]">
                      {t("wiki.fonte")}: {geradoDe.join(" · ")}
                    </p>
                  )}
                </div>

                {/* O fio de ouro: desenha-se conforme você desce a seção.
                    É a costura da encadernação e o indicador de progresso ao
                    mesmo tempo — o tema carregando a função, em vez de uma
                    barra de progresso colada no topo da janela. */}
                {secaoInteiraSemAntes && (
                  <p className="nota nota-fonte mt-5">
                    <span aria-hidden className="text-[var(--color-gold)]">◆</span>
                    <span>{t("wiki.sem_antes_secao")}</span>
                  </p>
                )}

                {paginar && (
                  <Paginador
                    base={`/wiki/${secao}`}
                    atual={pagina}
                    total={entradas.length}
                  />
                )}

                <div className="relative mt-6">
                  <span
                    className="wk-fio -left-4 hidden lg:block"
                    data-wk-thread
                    aria-hidden
                  />
                  <div className="space-y-4">
                    {visiveis.map((e, i) => (
                      <EntradaCard
                        key={e.id}
                        entrada={e}
                        indice={deslocamento + i}
                        ocultarNotaEstadoAtual={secaoInteiraSemAntes}
                      />
                    ))}
                  </div>
                </div>

                {paginar && (
                  <Paginador
                    base={`/wiki/${secao}`}
                    atual={pagina}
                    total={entradas.length}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- fecho da seção: banda parallax + volta ao códice ---------- */}
      <section className="wk-banda -mx-6 mt-16 md:mt-20">
        <div
          className="wk-banda-img"
          style={{ backgroundImage: "url(/art/scene-lightning.png)" }}
          data-wk-plx="14"
          aria-hidden
        />
        <div className="wk-banda-scrim" aria-hidden />
        <div className="relative mx-auto flex min-h-[220px] max-w-4xl flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <p className="font-display text-xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_16px_rgba(0,0,0,0.85)] md:text-2xl">
            {t("wiki.continua")}
          </p>
          <Link
            href="/wiki"
            className="btn-ghost px-6 py-3 text-xs backdrop-blur-sm"
          >
            ◆ {t("wiki.todas_secoes")}
          </Link>
        </div>
      </section>
    </main>
  );
}
