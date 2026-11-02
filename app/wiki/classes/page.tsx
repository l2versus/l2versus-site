import Link from "next/link";
import type { Metadata } from "next";
import { ARQUETIPOS } from "@/lib/wiki/classes-ui";
import { carregarArvore } from "@/lib/wiki/classes.server";
import { carregarSecoes } from "@/lib/wiki/data";
import { carregarResumoDeSkills } from "@/lib/wiki/classes-dados";
import { MOSTRAR_PROCEDENCIA, semCaminhos } from "@/lib/wiki/procedencia";
import { getT, getLocale } from "@/lib/i18n/server";
import { realce } from "@/lib/i18n/realce";
import CodexNav from "../_components/CodexNav";
import ArvoreClasses from "../_components/ArvoreClasses";
import EstadoIndisponivel from "../_components/EstadoIndisponivel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("wiki.arv.meta.titulo"),
    description: t("wiki.arv.meta.descricao"),
  };
}

export default async function ClassesPage() {
  const [estado, secoes, resumoSkills, t, locale] = await Promise.all([
    carregarArvore(),
    carregarSecoes(),
    /* só as contagens por classe — não carrega as 2.624 skills aqui */
    carregarResumoDeSkills(),
    getT(),
    getLocale(),
  ]);

  /* A legenda de função e a frase de procedência citam os MESMOS cinco
     rótulos. Montar a lista aqui, da mesma fonte, evita o defeito clássico de
     traduzir a legenda e esquecer a frase (ou o contrário). As chaves são
     minúsculas de propósito — ver o comentário em lib/i18n/wiki/classes.ts. */
  const nomeArquetipo = (chave: string) => t(`wiki.arv.arq.${chave}`);
  const listaDeFuncoes = ARQUETIPOS.map((a) => nomeArquetipo(a.chave)).join(", ");

  /* Esta página é mais larga que o resto do códice de propósito: quatro
     colunas de classes + o rail do índice não cabem na coluna de leitura
     padrão (max-w-6xl), e era isso que cortava a 3ª profissão na borda
     direita. O resto do wiki continua estreito, porque lá o conteúdo é texto
     e coluna larga piora a leitura. */
  return (
    <main className="mx-auto max-w-[86rem] px-6 py-12 md:py-16">
      <nav className="mb-7 flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          {t("wiki.migalha.codice")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-muted)]">{t("wiki.porta.classes")}</span>
      </nav>

      <div className="grid min-w-0 gap-10 lg:grid-cols-[232px_1fr] lg:gap-12">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <CodexNav secoes={secoes} ativo="classes" />
        </aside>

        <div className="min-w-0">
          <header>
            <p className="flex items-center gap-2.5 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
              <span aria-hidden className="font-display text-base leading-none">
                ⚔
              </span>
              {t("wiki.arv.kicker")}
            </p>
            <h1 className="mt-3 font-display text-[1.75rem] leading-tight tracking-[0.03em] text-[var(--color-parchment)] md:text-[2.4rem]">
              {t("wiki.arv.titulo")}
            </h1>
            <p className="prosa-col mt-3 text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
              {t("wiki.arv.intro")}
            </p>
          </header>

          {!estado.ok ? (
            <div className="mt-8">
              <EstadoIndisponivel
                titulo={t("wiki.porta.classes")}
                erro={estado.erro}
                detalhe={estado.detalhe}
              />
            </div>
          ) : (
            <>
              <div className="filet panel panel-gold panel-lit mt-8 p-5 md:p-6">
                <span className="filet-alt" aria-hidden />
                <p className="mb-3 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
                  {t("wiki.diferenca_ideia")}
                </p>
                <p className="prosa-col text-[1rem] leading-relaxed text-[var(--color-parchment)]">
                  {realce(
                    t("wiki.arv.ideia").replace("{n}", String(estado.arvore.total))
                  )}
                </p>
                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[0.92rem] text-[var(--color-muted)]">
                  {estado.arvore.porTier.map((tt) => (
                    <span key={tt.tier}>
                      <strong className="font-display text-[var(--color-gold-bright)]">
                        {tt.total}
                      </strong>{" "}
                      {t(`wiki.arv.conta.t${tt.tier}`)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Os DOIS passam por `semCaminhos`: tudo que entra num
                  componente cliente é serializado no HTML, visível ou não.
                  Sanitizar só `classes` deixou `divergencias` — que também
                  carrega `fonteXml`/`fonteEnum` — vazando no deploy. */}
              <div className="mt-8">
                <ArvoreClasses
                  classes={semCaminhos(estado.arvore.classes)}
                  divergencias={semCaminhos(estado.arvore.divergencias)}
                  resumoSkills={resumoSkills}
                  locale={locale}
                />
              </div>

              {/* ---------- as divergências entre as fontes do servidor ----------
                  Não é rodapé de erro: num códice que promete "lido dos arquivos",
                  os arquivos discordarem entre si é informação de primeira classe.
                  Mostra qual venceu e por quê. */}
              {estado.arvore.divergencias.length > 0 && (
                <div className="filet panel panel-lit mt-8 p-5 md:p-6">
                  <span className="filet-alt" aria-hidden />
                  <p className="mb-3 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-crimson)]">
                    {t("wiki.arv.div.titulo")}
                  </p>
                  <p className="prosa-col text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                    {/* O termo de código (`parentClassId`) viaja no slot de
                        ênfase do `realce`, com classe de monoespaçada: o
                        negrito do slot forte já está ocupado pelo "enum do
                        código", e os dois precisam de estilos diferentes. */}
                    {realce(
                      estado.arvore.divergencias.length === 1
                        ? t("wiki.arv.div.texto_um")
                        : t("wiki.arv.div.texto_n").replace(
                            "{n}",
                            String(estado.arvore.divergencias.length)
                          ),
                      {
                        /* "" = herda a cor do parágrafo, como o <strong> cru
                           que estava aqui antes; o default do `realce` é
                           pergaminho e clarearia o trecho. */
                        forte: "",
                        enfase:
                          "mx-0.5 font-mono text-[0.85em] not-italic text-[var(--color-faint)]",
                      }
                    )}
                  </p>
                  <div className="mt-5 space-y-4">
                    {estado.arvore.divergencias.map((d) => (
                      <div
                        key={d.id}
                        className="border-l-2 border-[var(--color-gold-deep)] pl-4"
                      >
                        <p className="font-display text-[0.95rem] text-[var(--color-parchment)]">
                          {d.classe}{" "}
                          <span className="text-[0.75rem] text-[var(--color-faint)]">
                            (id {d.id})
                          </span>
                        </p>
                        <p className="mt-1 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                          {/* Frase inteira numa chave só, com os dois nomes em
                              placeholder: a fonte derrotada fica esmaecida e a
                              vencedora acesa, e isso é estilo DIFERENTE para
                              cada uma — o `realce` aplica uma classe só, então
                              aqui o corte é nos placeholders. */}
                          {t("wiki.arv.div.item")
                            .split(/(\{xml\}|\{enum\})/)
                            .map((pedaco, i) =>
                              pedaco === "{xml}" ? (
                                <strong key={i} className="text-[var(--color-faint)]">
                                  {d.paiSegundoXml}
                                </strong>
                              ) : pedaco === "{enum}" ? (
                                <strong
                                  key={i}
                                  className="text-[var(--color-gold-bright)]"
                                >
                                  {d.paiSegundoEnum}
                                </strong>
                              ) : (
                                pedaco
                              )
                            )}
                        </p>
                        {MOSTRAR_PROCEDENCIA && (
                          <p className="mt-1.5 font-mono text-[0.73rem] leading-relaxed text-[var(--color-faint)]">
                            {d.fonteXml}
                            <br />
                            {d.fonteEnum}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------- procedência ---------- */}
              <div className="mt-8 flex flex-wrap items-start justify-between gap-4 border-t border-[var(--color-line)] pt-5">
                <p className="max-w-xl text-[0.92rem] leading-relaxed text-[var(--color-faint)]">
                  {realce(
                    t("wiki.arv.procedencia").replace("{funcoes}", listaDeFuncoes),
                    { forte: "" }
                  )}
                </p>
                {MOSTRAR_PROCEDENCIA && (
                  <p className="font-mono text-[0.73rem] leading-relaxed text-[var(--color-faint)]">
                    {estado.arvore.geradoDe.map((g) => (
                      <span key={g} className="block">
                        {g}
                      </span>
                    ))}
                  </p>
                )}
              </div>

              {/* legenda de cor, repetida no rodapé para quem chegou rolando */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                {ARQUETIPOS.map((a) => (
                  <span
                    key={a.chave}
                    className="flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.16em] text-[var(--color-muted)]"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-2.5 w-2.5"
                      style={{ background: a.cor }}
                    />
                    {nomeArquetipo(a.chave)}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
