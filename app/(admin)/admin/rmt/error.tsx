"use client";

/**
 * Por que esta área tem fronteira de erro PRÓPRIA.
 *
 * Os repos antigos do site têm try/catch tolerante: quando a consulta quebra,
 * a função devolve lista vazia e a página mostra "nada aqui". Isso é defensável
 * numa vitrine (o jogador vê um ranking vazio, não uma tela de erro) e é
 * inaceitável num painel de dinheiro — "zero itens em custódia" e "a consulta
 * de custódia falhou" são a mesma tela e significados opostos. Um deles manda
 * o sócio dormir tranquilo em cima de um incidente.
 *
 * Então `lib/repos/rmt-admin.ts` NÃO engole exceção: deixa estourar, e esta
 * fronteira diz em voz alta que o número não existe em vez de inventar zero.
 *
 * O Next apaga `error.message` de erro de servidor em produção e entrega só o
 * `digest` — é por isso que o digest aparece na tela: é a chave para achar a
 * exceção inteira no log do servidor.
 */
export default function ErroRazao({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="panel panel-gold mx-auto max-w-2xl px-6 py-8">
      <p
        className="text-[0.6rem] font-bold uppercase text-[var(--color-crimson)]"
        style={{ letterSpacing: "0.36em" }}
      >
        a consulta falhou
      </p>
      <h1 className="mt-3 font-display text-2xl text-[var(--color-parchment)]">
        Nenhum número desta tela é confiável agora
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        Uma das consultas do painel estourou. Isto <b>não</b> significa que o
        mercado esteja vazio ou que a receita seja zero — significa que não foi
        possível ler o banco. Não tome decisão com base no que ficou na tela.
      </p>

      <pre className="mt-5 overflow-x-auto border border-[rgba(200,67,59,0.35)] bg-[rgba(200,67,59,0.06)] p-4 text-[0.75rem] leading-relaxed text-[#e2857c]">
        {error.message || "erro sem mensagem (sanitizada em produção)"}
        {error.digest ? `\n\ndigest: ${error.digest}` : ""}
      </pre>

      <button type="button" onClick={reset} className="btn-ghost mt-6 px-6 py-3 text-xs">
        tentar de novo
      </button>
    </div>
  );
}
