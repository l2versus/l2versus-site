import Link from "next/link";
import type { Metadata } from "next";
import { ARQUETIPOS } from "@/lib/wiki/classes-ui";
import { carregarArvore } from "@/lib/wiki/classes.server";
import { carregarSecoes } from "@/lib/wiki/data";
import { carregarResumoDeSkills } from "@/lib/wiki/classes-dados";
import CodexNav from "../_components/CodexNav";
import ArvoreClasses from "../_components/ArvoreClasses";
import EstadoIndisponivel from "../_components/EstadoIndisponivel";

export const metadata: Metadata = {
  title: "Classes — a árvore de profissões | Wiki L2 Versus",
  description:
    "As 103 classes do L2 Versus (High Five), da classe inicial à 3ª profissão, por raça e por função — lidas dos arquivos do servidor.",
};

export default async function ClassesPage() {
  const [estado, secoes, resumoSkills] = await Promise.all([
    carregarArvore(),
    carregarSecoes(),
    /* só as contagens por classe — não carrega as 2.624 skills aqui */
    carregarResumoDeSkills(),
  ]);

  /* Esta página é mais larga que o resto do códice de propósito: quatro
     colunas de classes + o rail do índice não cabem na coluna de leitura
     padrão (max-w-6xl), e era isso que cortava a 3ª profissão na borda
     direita. O resto do wiki continua estreito, porque lá o conteúdo é texto
     e coluna larga piora a leitura. */
  return (
    <main className="mx-auto max-w-[86rem] px-6 py-12 md:py-16">
      <nav className="mb-7 flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          Códice
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-muted)]">Classes</span>
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
              A árvore
            </p>
            <h1 className="mt-3 font-display text-[1.75rem] leading-tight tracking-[0.03em] text-[var(--color-parchment)] md:text-[2.4rem]">
              Classes e profissões
            </h1>
            <p className="prosa-col mt-3 text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
              Da classe inicial à terceira profissão, por raça. Passe o mouse em
              qualquer classe para acender a linhagem inteira — de onde ela vem e
              onde ela pode chegar.
            </p>
          </header>

          {!estado.ok ? (
            <div className="mt-8">
              <EstadoIndisponivel
                titulo="Classes"
                erro={estado.erro}
                detalhe={estado.detalhe}
              />
            </div>
          ) : (
            <>
              <div className="filet panel panel-gold panel-lit mt-8 p-5 md:p-6">
                <span className="filet-alt" aria-hidden />
                <p className="mb-3 text-[0.75rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
                  A diferença, em uma ideia
                </p>
                <p className="prosa-col text-[1rem] leading-relaxed text-[var(--color-parchment)]">
                  A estrutura de classes do Versus é a do High Five original:{" "}
                  <strong>{estado.arvore.total} classes</strong>, seis raças, três
                  profissões. Nada foi somado nem removido — o que muda no servidor
                  são os <em>números</em> das skills que cada uma aprende, e isso
                  está nas seções de skills do códice.
                </p>
                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[0.92rem] text-[var(--color-muted)]">
                  {estado.arvore.porTier.map((t) => (
                    <span key={t.tier}>
                      <strong className="font-display text-[var(--color-gold-bright)]">
                        {t.total}
                      </strong>{" "}
                      {["iniciais", "de 1ª", "de 2ª", "de 3ª"][t.tier]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <ArvoreClasses
                  classes={estado.arvore.classes}
                  divergencias={estado.arvore.divergencias}
                  resumoSkills={resumoSkills}
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
                    Onde as fontes do servidor discordam
                  </p>
                  <p className="prosa-col text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                    O servidor guarda a lista de classes em dois lugares, e em{" "}
                    {estado.arvore.divergencias.length === 1
                      ? "um caso eles"
                      : `${estado.arvore.divergencias.length} casos eles`}{" "}
                    não batem. Adotamos o <strong>enum do código</strong>, porque é
                    dele que o servidor tira a árvore de skills de verdade; o
                    <code className="mx-1 font-mono text-[0.85em] text-[var(--color-faint)]">
                      parentClassId
                    </code>
                    do XML não é lido por nenhuma lógica — o erro nunca apareceu em
                    jogo.
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
                          O XML diz que a classe-pai é a{" "}
                          <strong className="text-[var(--color-faint)]">
                            {d.paiSegundoXml}
                          </strong>
                          ; o enum diz{" "}
                          <strong className="text-[var(--color-gold-bright)]">
                            {d.paiSegundoEnum}
                          </strong>
                          . Vale o enum.
                        </p>
                        <p className="mt-1.5 font-mono text-[0.73rem] leading-relaxed text-[var(--color-faint)]">
                          {d.fonteXml}
                          <br />
                          {d.fonteEnum}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------- procedência ---------- */}
              <div className="mt-8 flex flex-wrap items-start justify-between gap-4 border-t border-[var(--color-line)] pt-5">
                <p className="max-w-xl text-[0.92rem] leading-relaxed text-[var(--color-faint)]">
                  Nomes, hierarquia, raça e contagem saem dos arquivos do servidor.
                  A <strong>função</strong> (guerreiro, cavaleiro, ladino, mago,
                  suporte) é classificação nossa, para dar cor e leitura à árvore —
                  o servidor não guarda esse dado.
                </p>
                <p className="font-mono text-[0.73rem] leading-relaxed text-[var(--color-faint)]">
                  {estado.arvore.geradoDe.map((g) => (
                    <span key={g} className="block">
                      {g}
                    </span>
                  ))}
                </p>
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
                    {a.nome}
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
