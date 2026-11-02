import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

/**
 * `/admin` existe só para não ser um 404 para quem é sócio e digitou a raiz.
 *
 * A ORDEM IMPORTA: o portão roda ANTES do redirect. Se fosse só um redirect,
 * qualquer visitante descobriria que /admin existe (um 307 é uma resposta
 * diferente de um 404) e aprenderia o caminho do painel sem nunca ter acesso.
 * Com o `requireAdmin()` na frente, quem não é sócio recebe o mesmo 404 que
 * receberia em qualquer URL inventada.
 */
export const dynamic = "force-dynamic";

export default async function AdminRaiz() {
  await requireAdmin();
  redirect("/admin/rmt");
}
