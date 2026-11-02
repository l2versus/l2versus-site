import { MOSTRAR_PROCEDENCIA } from "@/lib/wiki/procedencia";
import { getT } from "@/lib/i18n/server";

/**
 * Estado de seção indisponível — VISÍVEL de propósito.
 *
 * Um wiki cuja fonte é insubstituível não pode ter seção que desaparece calada.
 * Se o JSON falta ou está malformado, isso aparece na tela com o motivo, em vez
 * de renderizar uma lista vazia e responder 200 fingindo normalidade — que é
 * exatamente o modo de falha que derrubou a área logada deste site sem ninguém
 * perceber.
 *
 * O MOTIVO aparece; o CAMINHO não. `detalhe` vem com o nome do arquivo-fonte
 * ("content/wiki/X.json não existe…"), que é estrutura interna do servidor e
 * não diz nada a quem veio ler a seção — e nenhuma tela do códice mostra
 * caminho desde 08/10/2026. Então passa pelo mesmo interruptor das outras
 * sete, `MOSTRAR_PROCEDENCIA` (ver `lib/wiki/procedencia.ts`): a prop continua
 * existindo e chegando, só não é desenhada. A falha segue diagnosticável onde
 * se diagnostica de verdade — no log do servidor e no repositório.
 */
export default async function EstadoIndisponivel({
  titulo,
  erro,
  detalhe,
}: {
  titulo: string;
  erro: string;
  detalhe?: string;
}) {
  const t = await getT();
  const aindaNaoExtraida = erro === "ainda-nao-extraida";

  return (
    <div
      className={`filet panel p-6 md:p-8 ${aindaNaoExtraida ? "" : "border-[rgba(200,67,59,0.4)]"}`}
    >
      <span className="filet-alt" aria-hidden />
      <div className="flex flex-wrap items-center gap-3">
        <span className={aindaNaoExtraida ? "selo selo-pendente" : "selo selo-aviso"}>
          {aindaNaoExtraida ? t("wiki.em_preparacao") : t("wiki.falha_carregar")}
        </span>
        <h3 className="font-display text-lg text-[var(--color-parchment)]">{titulo}</h3>
      </div>

      <p className="prosa-col mt-4 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
        {aindaNaoExtraida ? t("wiki.ui.indisp.preparacao") : t("wiki.ui.indisp.falha")}
      </p>

      {MOSTRAR_PROCEDENCIA && detalhe && (
        <p className="mt-3 font-mono text-[0.72rem] leading-relaxed text-[var(--color-faint)]">
          {detalhe}
        </p>
      )}
    </div>
  );
}
