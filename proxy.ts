import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Tranca do site inteiro atrás de um HTTP Basic Auth.
 *
 * Para que serve: a vitrine hospedada (Vercel) existe para o time olhar antes
 * do lançamento. Sem tranca, a wiki inteira do Carlo e os números do servidor
 * ficariam indexáveis meses antes da abertura. O Vercel só oferece proteção
 * por senha no plano Pro, então ela é feita aqui.
 *
 * Isto NÃO é o login do jogador. São duas camadas distintas e deliberadas:
 *   1. este gate  -> "você é do time?", credencial única, compartilhada;
 *   2. /login     -> conta de jogador (web_users), bcrypt, sessão JWT.
 *
 * Desligado por padrão: sem SITE_GATE_USER/SITE_GATE_PASS no ambiente o gate
 * não faz nada. Assim `next dev` e o deploy real de produção seguem abertos, e
 * ninguém precisa lembrar de remover este arquivo no dia do lançamento — basta
 * não cadastrar as variáveis.
 *
 * Next 16: o arquivo se chama `proxy.ts` e a função exportada é `proxy`
 * (o antigo `middleware.ts` foi renomeado na v16; runtime é sempre nodejs).
 */

// Só ASCII aqui: header HTTP é ByteString, um travessão derruba a resposta
// inteira com TypeError (aprendido no ensaio local — o 401 virava 500).
const REALM = "L2 Versus - acesso restrito";

/**
 * Comparação de tempo constante. Com `===` o tempo de resposta vaza quantos
 * caracteres iniciais estão certos, o que permite adivinhar a senha caractere
 * a caractere. O custo de evitar isso é uma varredura de string.
 */
function igualSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

function pedirCredencial(): NextResponse {
  return new NextResponse("Acesso restrito.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      // Uma vitrine fechada não deve ser indexada nem se a tranca cair.
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export function proxy(request: NextRequest) {
  const usuario = process.env.SITE_GATE_USER;
  const senha = process.env.SITE_GATE_PASS;

  // Gate não configurado = site aberto (comportamento de produção).
  if (!usuario || !senha) return NextResponse.next();

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return pedirCredencial();

  let decodificado: string;
  try {
    decodificado = Buffer.from(header.slice(6), "base64").toString("utf8");
  } catch {
    return pedirCredencial();
  }

  // Só o PRIMEIRO ':' separa; senha pode conter ':'.
  const corte = decodificado.indexOf(":");
  if (corte < 0) return pedirCredencial();

  const ok =
    igualSeguro(decodificado.slice(0, corte), usuario) &&
    igualSeguro(decodificado.slice(corte + 1), senha);

  if (!ok) return pedirCredencial();

  const resposta = NextResponse.next();
  resposta.headers.set("X-Robots-Tag", "noindex, nofollow");
  return resposta;
}

export const config = {
  matcher: [
    /*
     * Tudo, menos o que não vale uma invocação de função:
     * - _next/static, _next/image : build output e otimização de imagem;
     * - favicon.ico, og.png, robots/sitemap;
     * - assets estáticos por extensão — /l2icons tem 9608 PNGs, e uma página
     *   do painel pede dezenas deles. O navegador reenvia a credencial
     *   sozinho depois do primeiro 401, então proteger o HTML já tranca o
     *   site; cobrar uma invocação por ícone só queimaria cota à toa.
     */
    "/((?!_next/static|_next/image|favicon.ico|og\\.png|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|mp4|webm)$).*)",
  ],
};
