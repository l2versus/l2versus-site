import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "vs_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

/**
 * O fallback de desenvolvimento NÃO pode alcançar produção.
 *
 * Antes isto era um `??` silencioso: sem JWT_SECRET no ambiente, o site subia
 * normal e assinava as sessões com uma string que está aqui no código, à
 * vista de qualquer um que abra o repositório — ou seja, qualquer pessoa
 * poderia forjar o cookie de qualquer conta. E nada no boot denunciava isso.
 *
 * A checagem é NA HORA DO USO, não no carregamento do módulo. `next build`
 * roda com NODE_ENV=production, então um `throw` no topo do arquivo quebraria
 * o build em qualquer plataforma que injete a variável só em runtime — e aí
 * a proteção viraria um estorvo que alguém removeria. Assim ela só dispara
 * quando uma sessão é de fato assinada ou verificada, que é quando a falta
 * do segredo passa a importar.
 */
function segredo(): Uint8Array {
  const doAmbiente = process.env.JWT_SECRET;
  if (!doAmbiente && process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET não está definida. Em produção ela é obrigatória — sem ela as " +
        "sessões seriam assinadas com o segredo de desenvolvimento, que é público. " +
        "Defina JWT_SECRET nas variáveis de ambiente do deploy."
    );
  }
  return new TextEncoder().encode(doAmbiente ?? "dev-insecure-secret-change-me");
}

export type SessionUser = {
  uid: number;
  email: string;
  username: string;
};

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(segredo());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, segredo());
    return {
      uid: Number(payload.uid),
      email: String(payload.email),
      username: String(payload.username),
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
