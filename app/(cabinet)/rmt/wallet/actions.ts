"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { requestPayout, cancelListing } from "@/lib/repos/rmt";

/** Estado de retorno das actions da carteira (feedback verde/vermelho no client). */
export type WalletState = { error?: string; ok?: boolean; message?: string };

/** Métodos de saque aceitos (validados no servidor — nunca confiar no cliente). */
const PAYOUT_METHODS = new Set(["PayPal", "Stripe", "Cripto"]);

/**
 * Solicita um saque em USD. O valor chega em US$ (string do form) e é
 * convertido para cents inteiros. Saque mínimo de US$ 5,00.
 * A liquidação real (transferência ao provedor) é um seam de deploy.
 */
export async function requestPayoutAction(
  _prev: WalletState,
  formData: FormData
): Promise<WalletState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const raw = String(formData.get("amount") ?? "").replace(",", ".").trim();
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Informe um valor válido em US$." };

  const amountCents = Math.round(amount * 100);
  if (amountCents < 500) return { error: "Saque mínimo de US$ 5,00." };

  const method = String(formData.get("method") ?? "");
  if (!PAYOUT_METHODS.has(method))
    return { error: "Selecione um método de saque válido." };

  const destination = String(formData.get("destination") ?? "").trim();
  if (!destination)
    return { error: "Informe o destino (e-mail PayPal, conta Stripe ou carteira cripto)." };

  try {
    const r = await requestPayout(s.uid, amountCents, method, destination);
    if (!r.ok) return { error: r.error ?? "Não foi possível solicitar o saque." };
    revalidatePath("/rmt/wallet");
    return {
      ok: true,
      message: `Saque de US$ ${(amountCents / 100).toFixed(2)} solicitado. A liquidação entra no deploy.`,
    };
  } catch (e) {
    console.error("requestPayoutAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }
}

/** Cancela um anúncio próprio (ativo). O item volta ao personagem no jogo. */
export async function cancelListingAction(
  _prev: WalletState,
  formData: FormData
): Promise<WalletState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const listingId = Number(formData.get("listingId") ?? 0);
  if (!Number.isInteger(listingId) || listingId <= 0)
    return { error: "Anúncio inválido." };

  try {
    const r = await cancelListing(s.uid, listingId);
    if (!r.ok) return { error: r.error ?? "Não foi possível cancelar o anúncio." };
    revalidatePath("/rmt/wallet");
    return { ok: true, message: "Anúncio cancelado. O item será devolvido no jogo." };
  } catch (e) {
    console.error("cancelListingAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }
}
