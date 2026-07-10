"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { createListing } from "@/lib/repos/rmt";

export type SellState = { error?: string; ok?: boolean; message?: string };

/**
 * Cria um anúncio no RMT Market.
 *
 * SEGURANÇA: o `objectId` e o `priceCents` vêm do formulário, mas a posse do
 * item e o estado offline do personagem são SEMPRE re-validados server-side
 * dentro de `createListing` (que também rejeita preço < 100 e duplicidade).
 * Aqui fazemos a primeira barreira: preço inteiro em centavos >= 100 (US$ 1,00).
 */
export async function createListingAction(
  _prev: SellState,
  formData: FormData
): Promise<SellState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const objectId = Number(formData.get("objectId") ?? 0);
  const priceCents = Number(formData.get("priceCents") ?? 0);

  if (!Number.isInteger(objectId) || objectId <= 0)
    return { error: "Item inválido." };
  if (!Number.isInteger(priceCents) || priceCents < 100)
    return { error: "Preço mínimo de US$ 1,00." };

  try {
    const res = await createListing(s.uid, objectId, priceCents);
    if (!res.ok) return { error: res.error ?? "Não foi possível anunciar." };
  } catch (e) {
    console.error("createListingAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/rmt/sell");
  const dollars = (priceCents / 100).toFixed(2);
  return {
    ok: true,
    message: `Anúncio criado por US$ ${dollars}. O item entra em custódia dentro do jogo.`,
  };
}
