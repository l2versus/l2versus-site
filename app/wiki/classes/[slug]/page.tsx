import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { carregarArvore } from "@/lib/wiki/classes.server";
import { carregarDadosDaClasse, NOME_DA_ARMA } from "@/lib/wiki/classes-dados";
import { ARQUETIPOS, TIERS } from "@/lib/wiki/classes-ui";
import type { Classe } from "@/lib/wiki/classes";
import GlifoArquetipo from "../../_components/GlifoArquetipo";

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
  const e = await carregarArvore();
  const c = e.ok ? e.arvore.classes.find((x) => x.slug === slug) : undefined;
  if (!c) return { title: "Classe — Wiki | L2 Versus" };
  return {
    title: `${c.nome} — ${TIERS[c.tier]} ${c.racaPt} | Wiki L2 Versus`,
    description: `${c.nome}: ${TIERS[c.tier]} da raça ${c.racaPt} no L2 Versus (High Five). Linhagem, identificador de classe e o que muda no servidor.`,
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
  const estado = await carregarArvore();
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
  const filhos = classes.filter((x) => x.paiId === c.id).sort((a, b) => a.id - b.id);
  const irmaos = classes
    .filter((x) => x.paiId === c.paiId && x.id !== c.id)
    .sort((a, b) => a.id - b.id);

  const divergencia = estado.arvore.divergencias.find((d) => d.id === c.id);
  const cc = cor(c.arquetipo);
  const dados = await carregarDadosDaClasse(c.id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <nav className="mb-7 flex flex-wrap items-center gap-2 text-[0.75rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          Códice
        </Link>
        <span aria-hidden>/</span>
        <Link href="/wiki/classes" className="transition-colors hover:text-[var(--color-gold-bright)]">
          Classes
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
          <span className="cls-id-rotulo">Class ID</span>
          <span className="cls-id-valor">{c.id}</span>
        </span>
      </header>

      {/* ---------- a linhagem ---------- */}
      <section className="mt-10">
        <h2 className="sec-title">A linhagem</h2>
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
              Evolui para
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
              No mesmo degrau
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
        <h2 className="sec-title">Estado atual</h2>
        <dl className="cls-ficha mt-5">
          <div>
            <dt>Raça</dt>
            <dd>{c.racaPt}</dd>
          </div>
          <div>
            <dt>Degrau</dt>
            <dd>{TIERS[c.tier]}</dd>
          </div>
          <div>
            <dt>Função</dt>
            <dd style={{ color: cc }}>{nomeArquetipo(c.arquetipo)}</dd>
          </div>
          <div>
            <dt>Tipo</dt>
            <dd>{c.mago ? "Mágica" : "Física"}</dd>
          </div>
          <div>
            <dt>Invocador</dt>
            <dd>{c.invocador ? "Sim" : "Não"}</dd>
          </div>
          <div>
            <dt>Class ID</dt>
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
          <h2 className="sec-title">Atributos base</h2>
          <div className="cls-stats mt-5">
            {(
              [
                ["str", "STR", "Força"],
                ["dex", "DEX", "Destreza"],
                ["con", "CON", "Constituição"],
                ["int", "INT", "Inteligência"],
                ["wit", "WIT", "Sagacidade"],
                ["men", "MEN", "Mental"],
              ] as const
            ).map(([chave, sigla, nome]) => {
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
          <p className="mt-3 font-mono text-[0.72rem] text-[var(--color-faint)]">
            {dados.stats.fonte}
          </p>
        </section>
      )}

      {/* ---------- armas ---------- */}
      {dados.armas && dados.armas.length > 0 && (
        <section className="mt-12">
          <h2 className="sec-title">Armas que as skills exigem</h2>
          <p className="prosa-col mt-3 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
            O servidor não guarda uma lista de &ldquo;armas desta classe&rdquo;. Isto
            é <strong className="text-[var(--color-parchment)]">derivado</strong>:
            cruzamos as skills que a classe aprende com a condição de arma
            declarada em cada uma. Onde a skill não exige arma, ela não aparece
            aqui — e uma classe pode usar armas que nenhuma skill exige.
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
                  title={`ex.: ${a.exemploSkillNome} — ${a.fonte}`}
                >
                  {NOME_DA_ARMA[a.kind] ?? a.kind}
                  <b>{a.quantasSkills}</b>
                </span>
              ))}
          </div>
        </section>
      )}

      {/* ---------- skills ---------- */}
      <section className="mt-12">
        <h2 className="sec-title">Skills que aprende</h2>
        {!dados.skills ? (
          <p className="nota nota-fonte mt-5">
            <span aria-hidden className="text-[var(--color-gold)]">◆</span>
            <span>
              A árvore de skills desta classe não foi encontrada no arquivo
              gerado. Nada foi inventado para preencher o espaço.
            </span>
          </p>
        ) : (
          <>
            <div className="cls-resumo mt-5">
              <span>
                <b>{dados.skills.skillsUnicas}</b> skills
              </span>
              <span>
                <b>{dados.skills.totalLinhas.toLocaleString("pt-BR")}</b> níveis no total
              </span>
              <span>
                níveis <b>{dados.skills.nivelMinimo}–{dados.skills.nivelMaximo}</b>
              </span>
              <span>
                <b>{(dados.skills.spTotal / 1_000_000).toFixed(1)}M</b> SP para tudo
              </span>
              {dados.skills.comSpellbook > 0 && (
                <span>
                  <b>{dados.skills.comSpellbook}</b> com livro
                </span>
              )}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="wiki-table min-w-[560px]">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th className="text-right">Nível</th>
                    <th className="text-right">Graus</th>
                    <th className="text-right">SP</th>
                    <th>Obtenção</th>
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
                              muda de nome
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
                          {s.autoGet && <span className="selo selo-tier-normal">automática</span>}
                          {s.exigeLivro && (
                            <span className="ml-1 selo selo-tier-improved">livro</span>
                          )}
                          {!s.autoGet && !s.exigeLivro && (
                            <span className="text-[var(--color-faint)]">mestre</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 font-mono text-[0.72rem] text-[var(--color-faint)]">
              {dados.skills.fonteArquivo}
            </p>
            {dados.skills.linhasSemSp > 0 && (
              <p className="nota nota-fonte mt-4">
                <span aria-hidden className="text-[var(--color-gold)]">◆</span>
                <span>
                  {dados.skills.linhasSemSp} dos {dados.skills.totalLinhas} níveis não
                  declaram custo de SP no arquivo — são as skills automáticas, que
                  chegam sozinhas ao subir de nível. Aparecem como
                  &ldquo;—&rdquo; na tabela, não como zero inventado.
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
            As fontes do servidor discordam nesta classe
          </p>
          <p className="prosa-col text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
            O XML de classes diz que a classe-pai é a{" "}
            <strong className="text-[var(--color-faint)]">{divergencia.paiSegundoXml}</strong>; o
            enum do código diz{" "}
            <strong className="text-[var(--color-gold-bright)]">{divergencia.paiSegundoEnum}</strong>.
            Esta página segue o enum, que é de onde o servidor tira a árvore de
            skills de verdade.
          </p>
          <p className="mt-3 font-mono text-[0.72rem] leading-relaxed text-[var(--color-faint)]">
            {divergencia.fonteXml}
            <br />
            {divergencia.fonteEnum}
          </p>
        </section>
      )}

      {/* ---------- procedência ---------- */}
      <footer className="mt-10 border-t border-[var(--color-line)] pt-5">
        <p className="text-[0.85rem] leading-relaxed text-[var(--color-faint)]">
          Nome, hierarquia e raça lidos dos arquivos do servidor. A função é
          classificação nossa, para dar cor e leitura à árvore.
        </p>
        <p className="mt-2 font-mono text-[0.72rem] leading-relaxed text-[var(--color-faint)]">
          {c.fonte}
          <br />
          {c.fonteEnum}
        </p>
        <Link href="/wiki/classes" className="btn-ghost mt-6 inline-flex px-5 py-2.5 text-xs">
          ◆ Todas as classes
        </Link>
      </footer>
    </main>
  );
}
