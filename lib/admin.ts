import "server-only";
import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import { getSession } from "@/lib/session";

/**
 * O PORTÃO da área dos sócios.
 *
 * Uma decisão por vez, e cada uma tem um porquê:
 *
 * 1. POR QUE `notFound()` E NÃO 403 / NEM redirect PARA /login.
 *    Um 403 é uma confissão: diz "existe algo aqui, você só não tem a chave".
 *    Um redirect para /login é pior ainda — diz "existe algo aqui E a chave é
 *    uma senha", que é exatamente o convite para começar a tentar senhas. O 404
 *    é a única resposta que não distingue "você não é sócio" de "essa URL nunca
 *    existiu". Quem não é admin vê a mesma página que veria digitando qualquer
 *    bobagem na barra de endereços, e não aprende nada sobre o que existe aqui.
 *    Esta área lida com carteira, receita e saque de dinheiro real — o custo de
 *    ela ser descoberta e sondada é alto, e o custo de esconder é zero, porque
 *    os cinco sócios sabem a URL de cor.
 *
 * 2. POR QUE RELER `is_admin` DO BANCO A CADA REQUISIÇÃO, e não guardar a flag
 *    na sessão. A sessão é um JWT de 7 dias assinado por nós (lib/session.ts):
 *    o `uid` dentro dela é confiável, mas é IMUTÁVEL até expirar. Se a flag
 *    morasse ali, tirar o acesso de um sócio só valeria sete dias depois — e
 *    revogação que não é imediata não é revogação. A consulta é um SELECT por
 *    chave primária em `web_users`; o custo é ruído comparado ao resto da
 *    página.
 *
 * 3. FALHA FECHADA. Sem sessão: 404. Sessão de usuário que não existe mais
 *    (conta apagada com cookie ainda válido no browser): 404. `is_admin`
 *    qualquer coisa diferente de 1: 404. Nada aqui tem caminho de "deixa
 *    passar porque não deu para verificar" — num banco recém-instalado não há
 *    nenhum admin, e o estado correto é recusar todo mundo até alguém rodar o
 *    UPDATE à mão (ver db/migrations/007_admin_role.sql).
 */

export type Admin = {
  uid: number;
  username: string;
  email: string;
};

export async function requireAdmin(): Promise<Admin> {
  const s = await getSession();
  if (!s) notFound();

  const row = await queryOne<{
    id: number;
    username: string;
    email: string;
    is_admin: number;
  }>(
    "SELECT id, username, email, is_admin FROM web_users WHERE id = ? LIMIT 1",
    [s.uid]
  );

  // `!== 1` e não `!row.is_admin`: TINYINT chega como number, mas um driver que
  // devolvesse "0" (string) tornaria a negação falsa e o truthy verdadeiro —
  // ou seja, promoveria todo mundo a admin. Comparar com o valor esperado é a
  // forma que erra fechado se o tipo mudar debaixo da gente.
  if (!row || Number(row.is_admin) !== 1) notFound();

  return { uid: Number(row.id), username: row.username, email: row.email };
}
