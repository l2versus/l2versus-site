import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

/**
 * Casca da ÁREA DOS SÓCIOS.
 *
 * Grupo de rota `(admin)` e não um segmento `admin` dentro de `(cabinet)`
 * porque esta área não é "mais uma aba do painel do jogador": ela não tem a
 * sidebar de personagens, não tem QuickStats de VSCOIN e não deve aparecer na
 * navegação de ninguém. Casca própria, sem link de entrada.
 *
 * ⚠️ A URL é /admin/rmt e NÃO /rmt. Grupo de rota não entra no caminho, e
 * `app/(cabinet)/rmt/page.tsx` já ocupa `/rmt` — duas páginas resolvendo para
 * o mesmo caminho é erro de build no Next ("You cannot have two parallel pages
 * that resolve to the same path"), não um conflito que ele resolve por
 * precedência. Daí o segmento `admin/` explícito aqui dentro.
 *
 * ⚠️ O PORTÃO É CHAMADO AQUI **E** EM CADA PAGE. Não é redundância por
 * paranoia: no Next, navegar entre páginas irmãs do mesmo layout NÃO
 * re-executa o layout — ele fica montado e só a page roda. Um layout é o lugar
 * errado para ser o único guarda de autorização (a documentação do Next diz
 * isso, e o CVE-2025-29927 foi exatamente esse erro em escala). O layout aqui
 * autoriza para poder EXIBIR o nome do sócio; quem protege os dados é o
 * `requireAdmin()` de dentro de cada page, junto da consulta.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-20 border-b"
        style={{
          borderColor: "rgba(201,162,75,0.28)",
          background: "rgba(7,7,10,0.88)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 md:px-8">
          <Link
            href="/admin/rmt"
            className="font-display text-sm tracking-[0.3em] text-[var(--color-gold-bright)]"
          >
            L2 VERSUS
          </Link>

          <span
            className="selo selo-aviso"
            title="Nenhuma tela desta área escreve no banco."
          >
            somente leitura
          </span>

          <div className="ml-auto flex items-center gap-5 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">
            <span>
              {admin.username}
              <span className="mx-2 text-[var(--color-gold-deep)]">·</span>
              sócio
            </span>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-[var(--color-gold-bright)]"
            >
              sair da área
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
