import Balanca from "./Balanca";
import { MOSTRAR_PROCEDENCIA } from "@/lib/wiki/procedencia";
import { romano } from "@/lib/wiki/data";
import type { Entrada } from "@/lib/wiki/types";
import { getT } from "@/lib/i18n/server";

/**
 * Uma entrada do códice: cantoneiras em filete, numeral romano na margem,
 * cabeçalho com nome em Cinzel + selos, e a Balança no corpo.
 *
 * O nome do item fica em INGLÊS de propósito — é assim que jogador de L2
 * procura. Ninguém digita "Anel da Rainha das Formigas". O numeral romano e
 * os glifos também não têm o que traduzir.
 *
 * A moldura (os avisos, o rótulo de data, o "Grade") sai do `wiki.ui.*`. O
 * CONTEÚDO — `titulo`, `prosa`, `notaCliente`, `notaFonte`, os pares da
 * Balança — continua vindo do JSON em português; é o trabalho de tradução
 * do conteúdo, que é outro.
 */

function seloTier(tier?: string): string {
  const t = (tier ?? "").toLowerCase();
  if (t === "lesser") return "selo selo-tier-lesser";
  if (t === "improved") return "selo selo-tier-improved";
  return "selo selo-tier-normal";
}

export default async function EntradaCard({
  entrada,
  indice,
  ocultarNotaEstadoAtual,
}: {
  entrada: Entrada;
  indice: number;
  /** Repassado à Balança — ver o comentário lá. */
  ocultarNotaEstadoAtual?: boolean;
}) {
  const e = entrada;
  const t = await getT();

  return (
    <div data-wk-rise className="relative">
      {/* Numeral fantasma sangrando para a margem — quebra a monotonia de
          centenas de fichas idênticas e dá o ar de manuscrito numerado.

          Fica FORA do <article> de propósito: `.panel-lit` tem overflow
          hidden (é o que recorta a faixa de luz do topo), e dentro dele o
          numeral era cortado na borda esquerda em vez de sangrar. */}
      <span className="wk-numeral" aria-hidden>
        {romano(indice + 1)}
      </span>

      <article id={e.id} className="filet panel panel-lit scroll-mt-28 p-5 md:p-7">
        <span className="filet-alt" aria-hidden />

        {/* cabeçalho */}
      <header className="relative z-10 mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2.5">
            <span className="marginalia">{romano(indice + 1)}</span>
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]"
            />
          </div>
          <h3 className="font-display text-xl leading-tight text-[var(--color-parchment)] md:text-2xl">
            {e.titulo}
          </h3>
          {(e.boss || e.slot || e.subtitulo || e.grade) && (
            <p className="mt-1.5 text-[0.76rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
              {[
                e.boss && `${t("wiki.ui.boss")}: ${e.boss}`,
                e.slot,
                e.subtitulo,
                e.grade && `${t("wiki.ui.grade")} ${e.grade}`,
              ]
                .filter(Boolean)
                .join("  ·  ")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {e.tier && <span className={seloTier(e.tier)}>{e.tier}</span>}
          {e.skillId && (
            <span className="selo selo-tier-normal">
              {t("wiki.ui.selo_skill")} {e.skillId}
            </span>
          )}
          {e.itemId && (
            <span className="selo selo-tier-normal">
              {t("wiki.ui.selo_item")} {e.itemId}
            </span>
          )}
        </div>
      </header>

      <div data-wk-balanca className="relative z-10">
        <Balanca
          antes={e.antes}
          agora={e.agora}
          antesAusente={e.antesAusente}
          novo={e.novo}
          ocultarNotaEstadoAtual={ocultarNotaEstadoAtual}
        />
      </div>

      {/* prosa original, preservada literal */}
      {e.prosa && (
        <p className="prosa-col mt-5 text-[0.95rem] leading-relaxed text-[var(--color-muted)]">
          {e.prosa}
        </p>
      )}

      {/* avisos */}
      <div className="mt-5 space-y-2.5">
        {e.notaCliente && (
          <p className="nota nota-cliente">
            <span aria-hidden className="text-[var(--color-crimson)]">⚠</span>
            {/* Três pedaços, e cada um é uma FRASE inteira: o aviso, a nota
                vinda da fonte, o fecho. Por isso aqui duas chaves não torcem
                a ordem em RU/PL — o que o `realce` resolve é palavra realçada
                NO MEIO de uma frase, que não é o caso. */}
            <span>
              <strong className="font-semibold text-[var(--color-parchment)]">
                {t("wiki.ui.nota_cliente.titulo")}
              </strong>{" "}
              {e.notaCliente} {t("wiki.ui.nota_cliente.fecho")}
            </span>
          </p>
        )}
        {e.notaFonte && (
          <p className="nota nota-fonte">
            <span aria-hidden className="text-[var(--color-gold)]">◆</span>
            <span>{e.notaFonte}</span>
          </p>
        )}
        {e.regraDuplicata && (
          <p className="text-[0.92rem] leading-relaxed text-[var(--color-faint)]">
            {t("wiki.ui.regra_duplicata")}
          </p>
        )}
      </div>

        {/* rodapé de auditoria: arquivo:linha da fonte */}
        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(42,37,48,0.7)] pt-3">
          {MOSTRAR_PROCEDENCIA && (
            <span className="font-mono text-[0.75rem] tracking-tight text-[var(--color-faint)]">
              {e.fonte}
            </span>
          )}
          {e.alteradoEm && (
            <span className="text-[0.75rem] uppercase tracking-[0.18em] text-[var(--color-faint)]">
              {t("wiki.ui.alterado_em").replace("{d}", e.alteradoEm)}
            </span>
          )}
        </footer>
      </article>
    </div>
  );
}
