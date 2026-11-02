import Link from "next/link";
import type { Metadata } from "next";
import { carregarFeed, type MudancaNoFeed } from "@/lib/wiki/mudancas";
import { carregarSecoes } from "@/lib/wiki/data";
import { SECOES } from "@/lib/wiki/types";
import { getT, getLocale } from "@/lib/i18n/server";
import { realce } from "@/lib/i18n/realce";
import type { Locale } from "@/lib/i18n/dict";
import CodexNav from "../_components/CodexNav";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("wiki.mud.meta.titulo"),
    description: t("wiki.mud.meta.descricao"),
  };
}

/* O feed existe para ser ESCANEADO — o jogador percorre dezenas de linhas
   procurando o que lhe interessa. Alguns valores da fonte são parágrafos
   inteiros (a lista dos 9 peitos com texto duplicado, por exemplo) e uma
   linha de cinco alturas quebra o ritmo da varredura. Aqui o valor é uma
   amostra; a entrada completa, sem corte nenhum, está na seção — que é
   exatamente para onde a linha leva. */
const resumir = (texto: string, limite = 96) =>
  texto.length <= limite ? texto : `${texto.slice(0, limite).trimEnd()}…`;

const BCP47: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-GB",
  ru: "ru-RU",
  pl: "pl-PL",
};

/**
 * "2026-08-18" → "18 de agosto de 2026" / "18 August 2026" / "18 августа
 * 2026 г." / "18 sierpnia 2026".
 *
 * Vem do `Intl`, não de uma tabela de meses no dicionário: além dos nomes, o
 * runtime acerta a ORDEM (em inglês o dia e o mês trocam de lugar) e os
 * sufixos (o "г." russo). Doze meses × quatro idiomas escritos à mão seriam
 * 48 strings para reproduzir pior o que a plataforma já faz.
 *
 * A data é montada e formatada em UTC de propósito. `new Date("2026-08-18")`
 * é meia-noite UTC: formatado em fuso negativo (o nosso), o dia RECUA para 17.
 */
function dataNoLocale(iso: string, locale: Locale): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return iso;
  return new Intl.DateTimeFormat(BCP47[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(a, m - 1, d)));
}

/* `carregarFeed` devolve o título da seção em português (vem de SECOES, que é
   metadado de código, não conteúdo traduzido). O rótulo que o leitor vê sai
   do dicionário — a mesma chave `wiki.sec.<slug>.titulo` que o rail e as
   páginas de seção já usam. Daí o mapa: para `familiasIndisponiveis`, que
   carrega só o título, é por ele que se chega ao slug. */
const SLUG_POR_TITULO = new Map(SECOES.map((s) => [s.titulo, s.slug]));

function Linha({
  m,
  t,
}: {
  m: MudancaNoFeed;
  t: (chave: string) => string;
}) {
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
        <span className="mud-secao">{t(`wiki.sec.${m.secaoSlug}.titulo`)}</span>
      </Link>
    </li>
  );
}

export default async function MudancasPage() {
  const [feed, secoes, t, locale] = await Promise.all([
    carregarFeed(),
    carregarSecoes(),
    getT(),
    getLocale(),
  ]);

  const indisponiveis = feed.familiasIndisponiveis.map((titulo) => {
    const slug = SLUG_POR_TITULO.get(titulo);
    return slug ? t(`wiki.sec.${slug}.titulo`) : titulo;
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <nav className="mb-7 flex items-center gap-2 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
        <Link href="/wiki" className="transition-colors hover:text-[var(--color-gold-bright)]">
          {t("wiki.migalha.codice")}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-muted)]">{t("wiki.porta.mudancas")}</span>
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
              {t("wiki.mud.linha_do_tempo")}
            </p>
            <h1 className="mt-3 font-display text-[1.75rem] leading-tight tracking-[0.03em] text-[var(--color-parchment)] md:text-[2.4rem]">
              {t("wiki.mud.titulo")}
            </h1>
            <p className="prosa-col mt-3 text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
              {realce(t("wiki.mud.intro"))}
            </p>
          </header>

          <div className="mud-resumo mt-7">
            <span>
              <b>{feed.totalDatadas}</b> {t("wiki.mud.datadas")}
            </span>
            <span>
              <b>{feed.marcos.length}</b> {t("wiki.mud.dias")}
            </span>
            <span>
              <b>{feed.totalSemData}</b> {t("wiki.mud.sem_data_conta")}
            </span>
          </div>

          {indisponiveis.length > 0 && (
            <p className="nota nota-fonte mt-5">
              <span aria-hidden className="text-[var(--color-gold)]">◆</span>
              <span>
                {realce(
                  t(
                    indisponiveis.length === 1
                      ? "wiki.mud.fora_contagem_1"
                      : "wiki.mud.fora_contagem_n"
                  ).replace("{lista}", indisponiveis.join(", "))
                )}
              </span>
            </p>
          )}

          {/* ---------- a linha do tempo ---------- */}
          <div className="mud-tempo mt-10">
            {feed.marcos.map((marco) => (
              <section key={marco.data} className="mud-marco">
                <header className="mud-marco-cabeca">
                  <span className="mud-marco-dia" aria-hidden />
                  <h2 className="mud-marco-data">{dataNoLocale(marco.data, locale)}</h2>
                  <span className="mud-marco-linha" aria-hidden />
                  <span className="mud-marco-total">
                    {marco.itens.length}{" "}
                    {t(
                      marco.itens.length === 1
                        ? "wiki.mud.alteracao"
                        : "wiki.mud.alteracoes"
                    )}
                  </span>
                </header>
                <ul className="mud-lista">
                  {marco.itens.map((m) => (
                    <Linha key={`${m.secaoSlug}-${m.entrada.id}`} m={m} t={t} />
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
              <h2 className="sec-title">{t("wiki.mud.sem_data_titulo")}</h2>
              <p className="prosa-col mt-3 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
                {realce(
                  t("wiki.mud.sem_data_texto").replace("{n}", String(feed.semData.length))
                )}
              </p>
              <details className="filet panel panel-lit group mt-5">
                <span className="filet-alt" aria-hidden />
                <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)] transition-transform group-open:rotate-[225deg]"
                  />
                  <span className="text-[0.76rem] font-bold uppercase tracking-[0.28em] text-[var(--color-gold)]">
                    {t("wiki.mud.ver_as").replace("{n}", String(feed.semData.length))}
                  </span>
                </summary>
                <ul className="mud-lista px-5 pb-5">
                  {feed.semData.map((m) => (
                    <Linha key={`${m.secaoSlug}-${m.entrada.id}`} m={m} t={t} />
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
