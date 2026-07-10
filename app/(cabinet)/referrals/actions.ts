"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { execute } from "@/lib/db";

export type ReferralActionState = {
  error?: string;
  ok?: boolean;
  message?: string;
  /** Código gerado (ou já existente) para uso imediato no client. */
  code?: string;
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 36 chars, A-Z0-9

/**
 * Gera um código de indicação de 8 caracteres A-Z0-9 de forma DETERMINÍSTICA
 * a partir de username + uid (sem Math.random). Prefixo legível vindo do
 * username + sufixo espalhado por um LCG semeado com "username#uid" — o uid
 * torna o resultado único por usuário.
 */
function buildReferralCode(username: string, uid: number): string {
  const prefix = username.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);

  // djb2 -> semente do LCG (determinístico).
  let h = 5381 >>> 0;
  const seed = `${username.toLowerCase()}#${uid}`;
  for (let i = 0; i < seed.length; i++) {
    h = (((h << 5) + h) ^ seed.charCodeAt(i)) >>> 0;
  }

  let code = prefix;
  while (code.length < 8) {
    code += ALPHABET[h % 36];
    h = (h * 1103515245 + 12345) >>> 0; // LCG step (glibc), nunca colapsa
  }
  return code.slice(0, 8);
}

/**
 * Gera e persiste o código de indicação do usuário logado, caso ainda não
 * tenha um. O `AND referral_code IS NULL` garante que jamais sobrescreve um
 * código já existente (idempotente, seguro contra corridas).
 */
export async function generateReferralAction(
  _prev: ReferralActionState,
  _formData: FormData
): Promise<ReferralActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const code = buildReferralCode(s.username, s.uid);

  try {
    await execute(
      "UPDATE web_users SET referral_code = ? WHERE id = ? AND referral_code IS NULL",
      [code, s.uid]
    );
  } catch (e) {
    console.error("generateReferralAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/referrals");
  return { ok: true, code, message: "Código de indicação gerado." };
}
