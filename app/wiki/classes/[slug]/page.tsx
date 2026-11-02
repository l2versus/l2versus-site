import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { carregarArvore } from "@/lib/wiki/classes.server";
import { carregarDadosDaClasse, NOME_DA_ARMA } from "@/lib/wiki/classes-dados";
import { carregarDonosDeSkill, carregarSkillsDaClasse, semProcedencia } from "@/lib/wiki/skills-cliente";
import { getLocale, getT } from "@/lib/i18n/server";
import { realce } from "@/lib/i18n/realce";
import { ARQUETIPOS, TIERS } from "@/lib/wiki/classes-ui";
import type { Classe } from "@/lib/wiki/classes";
import Fonte from "../../_components/Fonte";
import GlifoArquetipo from "../../_components/GlifoArquetipo";
import GrimorioSkills from "../../_components/GrimorioSkills";

/** Troca `{marca}` pelo valor. Sem regex: nome de classe tem parêntese. */
function fmt(texto: string, valores: Record<string, string | number>): string {
  let saida = texto;
  for (const [k, v] of Object.entries(valores)) {
    saida = saida.split(`{${k}}`).join(String(v));
  }
  return saida;
}

/**
 * Como `fmt`, mas o valor é um NÓ (um `<strong>` colorido, um link).
 *
 * Existe para a frase da divergência, onde os dois nomes de classe entram
 * com cores diferentes — velho apagado, novo aceso. Quebrar em três chaves
 * para encaixar os dois `<strong>` quebraria a ordem das palavras em RU e PL;
 * assim a frase inteira fica numa chave e o tradutor move `{xml}` e `{enum}`
 * para onde a oração precisar.
 */
function fmtNos(texto: string, nos: Record<string, ReactNode>): ReactNode[] {
  const marcas = Object.keys(nos).map((k) => `{${k}}`);
  let pedacos: (string | ReactNode)[] = [texto];
  for (const marca of marcas) {
    const chave = marca.slice(1, -1);
    pedacos = pedacos.flatMap((p) =>
      typeof p === "string"
        ? p.split(marca).flatMap((parte, i) => (i === 0 ? [parte] : [nos[chave], parte]))
        : [p]
    );
  }
  return pedacos.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

/** Uma rota estática por classe — nenhuma toca o banco. */
export async function generateStaticParams() {
  const e = await carregarArvore();
  return e.ok ? e.arvore.classes.map((c) => ({ slug: c.slug })) : [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [e, t] = await Promise.all([carregarArvore(), getT()]);
  const c = e.ok ? e.arvore.classes.find((x) => x.slug === slug) : undefined;
  if (!c) return { title: t("wiki.gs.meta.fallback") };
  const valores = { classe: c.nome, degrau: TIERS[c.tier], raca: c.racaPt };
  return {
    title: fmt(t("wiki.gs.meta.titulo"), valores),
    description: fmt(t("wiki.gs.meta.descricao"), valores),
  };
}

const cor = (a: string) =>
  ARQUETIPOS.find((x) => x.chave === a)?.cor ?? "var(--color-gold)";
const nomeArquetipo = (a: string) =>
  ARQUETIPOS.find((x) => x.chave === a)?.nome ?? "—";

export default async function ClassePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [estado, locale, t] = await Promise.all([carregarArvore(), getLocale(), getT()]);
  if (!estado.ok) notFound();

  const classes = estado.arvore.classes;
  const c = classes.find((x) => x.slug === slug);
  if (!c) notFound();

  const porId = new Map(classes.map((x) => [x.id, x]));

  /* a cadeia até a raiz, da mais antiga para a atual */
  const cadeia: Classe[] = [];
  let atual: Classe | undefined = c;
  while (atual) {
    cadeia.unshift(atual);
    atual = atual.paiId == null ? undefined : porId.get(atual.paiId);
  }
  const pai = c.paiId == null ? undefined : porId.get(c.paiId);
  const filhos = classes.filter((x) => x.paiId === c.id).sort((a, b) => a.id - b.id);
  const irmaos = classes
    .filter((x) => x.paiId === c.paiId && x.id !== c.id)
    .sort((a, b) => a.id - b.id);

  const divergencia = estado.arvore.divergencias.find((d) => d.id === c.id);
  const cc = cor(c.arquetipo);
  const [dados, grimorio, donos] = await Promise.all([
    carregarDadosDaClasse(c.id),
    /* O pacote do cliente: ícone + descrição em jogo. Cobre 89 das 103 classes
       (Kamael ficou de fora por decisão do dono). `undefined` aqui não é erro —
       é a classe não estar no pacote, e a seção diz isso em vez de sumir. */
    carregarSkillsDaClasse(c.id, locale),
    carregarDonosDeSkill(),
  ]);

  /**
   * SKILLS QUE A EXTRAÇÃO ANTIGA LISTAVA AQUI E A ATUAL NÃO.
   *
   * Quase sempre isto é uma MUDANÇA DE DONO feita pelo servidor, não uma
   * lacuna: Archer's Will passou a ser "uma por classe", Rush e Rush Impact
   * ganharam dono único, Parry Stance foi dividida em duas versões. Então a
   * nota mostra para onde a skill foi, com link — e só fala em lacuna quando
   * ninguém no pacote aprende a skill.
   */
  const foraDoGrimorio =
    grimorio && dados.skills
      ? dados.skills.skills
          .filter((s) => !grimorio.skills.some((g) => g.id === s.skillId))
          .map((s) => ({
            ...s,
            agoraDe: (donos.get(s.skillId) ?? [])
              .map((id) => porId.get(id))
              .filter((x): x is Classe => !!x),
          }))
      : [];
  const mudaramDeDono = foraDoGrimorio.filter((s) => s.agoraDe.length > 0);
  const semDono = foraDoGrimorio.filter((s) => s.agoraDe.length === 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <nav className="mb-7 flex flex-wrap items-center gap-2 text-[0.75rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          {t("wiki.migalha.codice")}
        </Link>
        <span aria-hidden>/</span>
        <Link href="/wiki/classes" className="transition-colors hover:text-[var(--color-gold-bright)]">
          {t("wiki.porta.classes")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-muted)]">{c.nome}</span>
      </nav>

      {/* ---------- cabeçalho ---------- */}
      <header className="cls-cabeca" style={{ ["--c" as string]: cc }}>
        <span className="cls-brasao" aria-hidden>
          <GlifoArquetipo arquetipo={c.arquetipo} className="h-8 w-8" />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[0.72rem] uppercase tracking-[0.24em] text-[var(--color-faint)]">
            <span style={{ color: cc }}>{nomeArquetipo(c.arquetipo)}</span>
            <span aria-hidden>·</span>
            <span>{c.racaPt}</span>
            <span aria-hidden>·</span>
            <span>{TIERS[c.tier]}</span>
          </p>
          <h1 className="mt-1.5 font-display text-[2rem] leading-tight tracking-[0.02em] text-[var(--color-parchment)] md:text-[2.6rem]">
            {c.nome}
          </h1>
        </div>
        <span className="cls-id">
          <span className="cls-id-rotulo">{t("wiki.cls.class_id")}</span>
          <span className="cls-id-valor">{c.id}</span>
        </span>
      </header>

      {/* ---------- a linhagem ---------- */}
      <section className="mt-10">
        <h2 className="sec-title">{t("wiki.cls.linhagem")}</h2>
        <ol className="cls-cadeia mt-5">
          {cadeia.map((p) => {
            const atualEste = p.id === c.id;
            return (
              <li key={p.id}>
                <Link
                  href={`/wiki/classes/${p.slug}`}
                  aria-current={atualEste ? "page" : undefined}
                  className={`cls-elo ${atualEste ? "cls-elo-atual" : ""}`}
                  style={{ ["--c" as string]: cor(p.arquetipo) }}
                >
                  <span className="cls-elo-glifo">
                    <GlifoArquetipo arquetipo={p.arquetipo} className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="cls-elo-nome">{p.nome}</span>
                    <span className="cls-elo-tier">{TIERS[p.tier]}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        {filhos.length > 0 && (
          <div className="mt-7">
            <p className="mb-3 text-[0.68rem] uppercase tracking-[0.26em] text-[var(--color-gold)]">
              {t("wiki.cls.evolui_para")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {filhos.map((f) => (
                <Link
                  key={f.id}
                  href={`/wiki/classes/${f.slug}`}
                  className="cls-vizinho"
                  style={{ ["--c" as string]: cor(f.arquetipo) }}
                >
                  <span className="cls-elo-glifo">
                    <GlifoArquetipo arquetipo={f.arquetipo} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="cls-elo-nome">{f.nome}</span>
                    <span className="cls-elo-tier">
                      {TIERS[f.tier]} · {nomeArquetipo(f.arquetipo)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {irmaos.length > 0 && (
          <div className="mt-7">
            <p className="mb-3 text-[0.68rem] uppercase tracking-[0.26em] text-[var(--color-faint)]">
              {t("wiki.cls.irmas")}
            </p>
            <div className="flex flex-wrap gap-2">
              {irmaos.map((i) => (
                <Link
                  key={i.id}
                  href={`/wiki/classes/${i.slug}`}
                  className="cls-irmao"
                  style={{ ["--c" as string]: cor(i.arquetipo) }}
                >
                  {i.nome}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------- ficha ---------- */}
      <section className="mt-12">
        <h2 className="sec-title">{t("wiki.estado_atual")}</h2>
        <dl className="cls-ficha mt-5">
          <div>
            <dt>{t("wiki.cls.raca")}</dt>
            <dd>{c.racaPt}</dd>
          </div>
          <div>
            <dt>{t("wiki.degrau")}</dt>
            <dd>{TIERS[c.tier]}</dd>
          </div>
          <div>
            <dt>{t("wiki.cls.funcao")}</dt>
            <dd style={{ color: cc }}>{nomeArquetipo(c.arquetipo)}</dd>
          </div>
          <div>
            <dt>{t("wiki.gs.ficha.tipo")}</dt>
            <dd>{t(c.mago ? "wiki.gs.ficha.magica" : "wiki.gs.ficha.fisica")}</dd>
          </div>
          <div>
            <dt>{t("wiki.gs.ficha.invocador")}</dt>
            <dd>{t(c.invocador ? "wiki.gs.sim" : "wiki.gs.nao")}</dd>
          </div>
          <div>
            <dt>{t("wiki.cls.class_id")}</dt>
            <dd className="tabular-nums">{c.id}</dd>
          </div>
        </dl>

      </section>

      {/* ---------- atributos base ----------
          Cada barra é a posição da classe DENTRO da faixa real medida nas 103
          classes (min e max vêm do próprio extrator). Uma barra sem escala não
          diria nada: 40 de STR só significa alguma coisa ao lado do 21 do
          Elven Mystic e do 41 do Dark Fighter. */}
      {dados.stats && dados.faixas && (
        <section className="mt-12">
          <h2 className="sec-title">{t("wiki.cls.atributos")}</h2>
          <div className="cls-stats mt-5">
            {(
              [
                ["str", "STR"],
                ["dex", "DEX"],
                ["con", "CON"],
                ["int", "INT"],
                ["wit", "WIT"],
                ["men", "MEN"],
              ] as const
            ).map(([chave, sigla]) => {
              const nome = t(`wiki.gs.stat.${chave}`);
              const v = dados.stats![chave];
              const f = dados.faixas![chave];
              const pct = f && f.max > f.min ? ((v - f.min) / (f.max - f.min)) * 100 : 50;
              return (
                <div key={chave} className="cls-stat">
                  <span className="cls-stat-sigla" title={nome}>
                    {sigla}
                  </span>
                  <span className="cls-stat-trilho">
                    <span
                      className="cls-stat-barra"
                      style={{ width: `${Math.max(3, pct)}%`, ["--c" as string]: cc }}
                    />
                  </span>
                  <span className="cls-stat-valor">{v}</span>
                  <span className="cls-stat-faixa">
                    {f.min}–{f.max}
                  </span>
                </div>
              );
            })}
          </div>
          <Fonte>{dados.stats.fonte}</Fonte>
        </section>
      )}

      {/* ---------- armas ---------- */}
      {dados.armas && dados.armas.length > 0 && (
        <section className="mt-12">
          <h2 className="sec-title">{t("wiki.cls.armas")}</h2>
          <p className="prosa-col mt-3 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
            {realce(t("wiki.gs.armas.nota"))}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {dados.armas
              .slice()
              .sort((a, b) => b.quantasSkills - a.quantasSkills)
              .map((a) => (
                <span
                  key={a.kind}
                  className="cls-arma"
                  style={{ ["--c" as string]: cc }}
                  title={fmt(t("wiki.gs.armas.exemplo"), { skill: a.exemploSkillNome })}
                >
                  {NOME_DA_ARMA[a.kind] ?? a.kind}
                  <b>{a.quantasSkills}</b>
                </span>
              ))}
          </div>
        </section>
      )}

      {/* ---------- skills: o grimório ----------
          A seção mais pesada da página, e a única que vale a pena ser larga:
          ícone, descrição e a escada de graus não cabem na coluna de leitura.
          `gs-sangra` só abre a partir de 1280px — abaixo disso ela não faz
          nada e o conteúdo fica dentro do container normal. */}
      <section className="mt-12">
        <h2 className="sec-title">{t("wiki.gs.titulo")}</h2>

        {grimorio ? (
          <>
            <p className="prosa-col mt-3 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
              {realce(t("wiki.gs.intro"))}
            </p>

            <div className="gs-sangra">
              <GrimorioSkills dados={semProcedencia(grimorio)} cor={cc} locale={locale} />
            </div>

            <Fonte>
              {grimorio.fonteArquivo ?? t("wiki.gs.fonte.arvore")}
              <br />
              {fmt(t("wiki.gs.fonte.cliente"), {
                n: grimorio.totais.skills,
                m: grimorio.totais.linhas.toLocaleString("pt-BR"),
              })}
            </Fonte>

            {mudaramDeDono.length > 0 && (
              <p className="nota nota-fonte mt-4">
                <span aria-hidden className="text-[var(--color-gold)]">
                  ◆
                </span>
                <span>
                  {t(
                    mudaramDeDono.length === 1
                      ? "wiki.gs.dono.saiu_1"
                      : "wiki.gs.dono.saiu_n"
                  )}
                  {mudaramDeDono.map((s, i) => (
                    <span key={s.skillId}>
                      {i > 0 && "; "}
                      <strong className="text-[var(--color-parchment)]">{s.nome}</strong>
                      {t("wiki.gs.dono.meio")}
                      {s.agoraDe.map((d, k) => (
                        <span key={d.id}>
                          {k > 0 && (k === s.agoraDe.length - 1 ? t("wiki.gs.lista.e") : ", ")}
                          <Link
                            href={`/wiki/classes/${d.slug}`}
                            className="text-[var(--color-gold-bright)] underline decoration-dotted underline-offset-2"
                          >
                            {d.nome}
                          </Link>
                        </span>
                      ))}
                    </span>
                  ))}
                  {t("wiki.gs.dono.sufixo")}
                </span>
              </p>
            )}

            {semDono.length > 0 && (
              <p className="nota nota-cliente mt-4">
                <span aria-hidden className="text-[var(--color-crimson)]">
                  ◆
                </span>
                <span>
                  {semDono.length === 1
                    ? t("wiki.gs.semdono.prefixo_1")
                    : fmt(t("wiki.gs.semdono.prefixo_n"), { n: semDono.length })}
                  {semDono.map((s, i) => (
                    <span key={s.skillId}>
                      {i > 0 && ", "}
                      <strong className="text-[var(--color-parchment)]">{s.nome}</strong>{" "}
                      <span className="font-mono text-[0.85em]">#{s.skillId}</span>
                    </span>
                  ))}
                  {t("wiki.gs.semdono.sufixo")}
                </span>
              </p>
            )}
          </>
        ) : !dados.skills ? (
          <p className="nota nota-fonte mt-5">
            <span aria-hidden className="text-[var(--color-gold)]">◆</span>
            <span>{t("wiki.gs.sem_arvore")}</span>
          </p>
        ) : (
          <>
            {/* Caminho degradado: as 14 classes Kamael. O pacote de ícones e
                descrições sai do cliente do Versus e o dono tirou Kamael dele
                de propósito. A árvore do datapack existe e é mostrada; o que
                não existe (ícone, descrição) não é buscado de outra fonte. */}
            <p className="nota nota-cliente mt-5">
              <span aria-hidden className="text-[var(--color-crimson)]">◆</span>
              <span>{t("wiki.gs.fora_do_pacote")}</span>
            </p>

            <div className="cls-resumo mt-5">
              <span>
                <b>{dados.skills.skillsUnicas}</b> {t("wiki.gs.resumo.skills")}
              </span>
              <span>
                <b>{dados.skills.totalLinhas.toLocaleString("pt-BR")}</b>{" "}
                {t("wiki.gs.resumo.niveis_total")}
              </span>
              <span>
                {t("wiki.gs.resumo.niveis")}{" "}
                <b>{dados.skills.nivelMinimo}–{dados.skills.nivelMaximo}</b>
              </span>
              <span>
                <b>{(dados.skills.spTotal / 1_000_000).toFixed(1)}M</b>{" "}
                {t("wiki.gs.resumo.sp_tudo")}
              </span>
              {dados.skills.comSpellbook > 0 && (
                <span>
                  <b>{dados.skills.comSpellbook}</b> {t("wiki.gs.resumo.com_livro")}
                </span>
              )}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="wiki-table min-w-[560px]">
                <thead>
                  <tr>
                    <th>{t("wiki.gs.tab.skill")}</th>
                    <th className="text-right">{t("wiki.cls.nivel")}</th>
                    <th className="text-right">{t("wiki.gs.tab.graus")}</th>
                    <th className="text-right">SP</th>
                    <th>{t("wiki.gs.tab.obtencao")}</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.skills.skills
                    .slice()
                    .sort((a, b) => a.nivelMaisBaixo - b.nivelMaisBaixo)
                    .map((s) => (
                      <tr key={s.skillId}>
                        <td>
                          <span className="text-[var(--color-parchment)]">{s.nome}</span>
                          {s.nomes && s.nomes.length > 1 && (
                            <span
                              className="ml-2 selo selo-tier-lesser"
                              title={s.nomes.join(" → ")}
                            >
                              {t("wiki.gs.muda_de_nome")}
                            </span>
                          )}
                          <span className="ml-2 font-mono text-[0.68rem] text-[var(--color-faint)]">
                            #{s.skillId}
                          </span>
                        </td>
                        <td className="text-right tabular-nums">
                          {s.nivelMaisBaixo === s.nivelMaisAlto
                            ? s.nivelMaisBaixo
                            : `${s.nivelMaisBaixo}–${s.nivelMaisAlto}`}
                        </td>
                        <td className="text-right tabular-nums text-[var(--color-muted)]">
                          {s.niveis}
                        </td>
                        <td className="text-right tabular-nums">
                          {s.spTotal > 0 ? s.spTotal.toLocaleString("pt-BR") : "—"}
                        </td>
                        <td>
                          {s.autoGet && (
                            <span className="selo selo-tier-normal">
                              {t("wiki.gs.obt.automatica")}
                            </span>
                          )}
                          {s.exigeLivro && (
                            <span className="ml-1 selo selo-tier-improved">
                              {t("wiki.gs.obt.livro")}
                            </span>
                          )}
                          {!s.autoGet && !s.exigeLivro && (
                            <span className="text-[var(--color-faint)]">
                              {t("wiki.gs.obt.mestre")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <Fonte>{dados.skills.fonteArquivo}</Fonte>
            {dados.skills.linhasSemSp > 0 && (
              <p className="nota nota-fonte mt-4">
                <span aria-hidden className="text-[var(--color-gold)]">◆</span>
                <span>
                  {fmt(t("wiki.gs.sem_sp"), {
                    n: dados.skills.linhasSemSp,
                    m: dados.skills.totalLinhas,
                  })}
                </span>
              </p>
            )}
          </>
        )}
      </section>

      {/* ---------- divergência, quando houver ---------- */}
      {divergencia && (
        <section className="filet panel panel-lit mt-10 p-5 md:p-6">
          <span className="filet-alt" aria-hidden />
          <p className="mb-3 text-[0.68rem] uppercase tracking-[0.26em] text-[var(--color-crimson)]">
            {t("wiki.gs.div.titulo")}
          </p>
          <p className="prosa-col text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
            {fmtNos(t("wiki.gs.div.texto"), {
              xml: (
                <strong className="text-[var(--color-faint)]">
                  {divergencia.paiSegundoXml}
                </strong>
              ),
              enum: (
                <strong className="text-[var(--color-gold-bright)]">
                  {divergencia.paiSegundoEnum}
                </strong>
              ),
            })}
          </p>
          <Fonte>
            {divergencia.fonteXml}
            <br />
            {divergencia.fonteEnum}
          </Fonte>
        </section>
      )}

      {/* ---------- o fim da página ----------
          Antes isto era um filete, duas linhas de crédito, o caminho do
          arquivo-fonte e um botão. A página não terminava: parava.

          Quem chega ao fim de uma classe quer o PRÓXIMO passo da linhagem —
          é a pergunta que a página inteira constrói ("e depois do Gladiator,
          o quê?"). Então o rodapé é a continuação da árvore: de onde veio,
          o índice e para onde vai. O crédito desce para colofão, no lugar
          certo dele, e o caminho do arquivo saiu de vez (ver
          `lib/wiki/procedencia.ts`). */}
      <footer className="cls-rodape">
        <div className="diamond-rule" aria-hidden>
          <span className="dia" />
        </div>

        <nav className="cls-passos" aria-label={t("wiki.gs.rodape.aria")}>
          {pai ? (
            <Link
              href={`/wiki/classes/${pai.slug}`}
              className="cls-passo cls-passo-tras"
              style={{ ["--c" as string]: cor(pai.arquetipo) }}
            >
              <span className="cls-passo-rot">{t("wiki.gs.rodape.vem_de")}</span>
              <span className="cls-passo-nome">
                <GlifoArquetipo arquetipo={pai.arquetipo} className="h-4 w-4" />
                {pai.nome}
              </span>
            </Link>
          ) : (
            <span className="cls-passo cls-passo-raiz">
              <span className="cls-passo-rot">{t("wiki.gs.rodape.vem_de")}</span>
              <span className="cls-passo-nome">{t("wiki.gs.rodape.comeco")}</span>
            </span>
          )}

          <Link href="/wiki/classes" className="cls-passo cls-passo-indice">
            <span className="cls-passo-rot">{t("wiki.gs.rodape.indice")}</span>
            <span className="cls-passo-nome">
              ◆ {fmt(t("wiki.gs.rodape.todas"), { n: classes.length })}
            </span>
          </Link>

          {filhos.length > 0 ? (
            <span className="cls-passo-saidas">
              {filhos.map((f) => (
                <Link
                  key={f.id}
                  href={`/wiki/classes/${f.slug}`}
                  className="cls-passo cls-passo-frente"
                  style={{ ["--c" as string]: cor(f.arquetipo) }}
                >
                  <span className="cls-passo-rot">
                    {t(filhos.length > 1 ? "wiki.cls.evolui_para" : "wiki.gs.rodape.vira")}
                  </span>
                  <span className="cls-passo-nome">
                    {f.nome}
                    <GlifoArquetipo arquetipo={f.arquetipo} className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </span>
          ) : (
            <span className="cls-passo cls-passo-fim">
              <span className="cls-passo-rot">{t("wiki.gs.rodape.vira")}</span>
              <span className="cls-passo-nome">{t("wiki.gs.rodape.fim")}</span>
            </span>
          )}
        </nav>

        <p className="cls-colofao">{t("wiki.gs.colofao")}</p>
      </footer>
    </main>
  );
}
