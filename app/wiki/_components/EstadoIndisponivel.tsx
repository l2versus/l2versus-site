/**
 * Estado de seção indisponível — VISÍVEL de propósito.
 *
 * Um wiki cuja fonte é insubstituível não pode ter seção que desaparece calada.
 * Se o JSON falta ou está malformado, isso aparece na tela com o motivo e o
 * caminho do arquivo, em vez de renderizar uma lista vazia e responder 200
 * fingindo normalidade — que é exatamente o modo de falha que derrubou a área
 * logada deste site sem ninguém perceber.
 */
export default function EstadoIndisponivel({
  titulo,
  erro,
  detalhe,
}: {
  titulo: string;
  erro: string;
  detalhe?: string;
}) {
  const aindaNaoExtraida = erro === "ainda-nao-extraida";

  return (
    <div
      className={`filet panel p-6 md:p-8 ${aindaNaoExtraida ? "" : "border-[rgba(200,67,59,0.4)]"}`}
    >
      <span className="filet-alt" aria-hidden />
      <div className="flex flex-wrap items-center gap-3">
        <span className={aindaNaoExtraida ? "selo selo-pendente" : "selo selo-aviso"}>
          {aindaNaoExtraida ? "em preparação" : "falha ao carregar"}
        </span>
        <h3 className="font-display text-lg text-[var(--color-parchment)]">{titulo}</h3>
      </div>

      <p className="prosa-col mt-4 text-[0.92rem] leading-relaxed text-[var(--color-muted)]">
        {aindaNaoExtraida
          ? "Esta seção ainda está sendo transcrita dos arquivos-fonte do servidor. O conteúdo existe e está preservado — só não passou pela conversão para cá ainda."
          : "Esta seção existe mas não pôde ser carregada. Isso é um erro de dado, não uma seção vazia — e está aparecendo aqui de propósito, para não passar em silêncio."}
      </p>

      {detalhe && (
        <p className="mt-3 font-mono text-[0.72rem] leading-relaxed text-[var(--color-faint)]">
          {detalhe}
        </p>
      )}
    </div>
  );
}
