"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { ownedChars } from "@/lib/repos/services";
import { settleSale } from "@/lib/repos/rmt";

export type BuyState = { ok?: boolean; message?: string; error?: string };

/**
 * Compra (liquidação) de um anúncio do RMT Market.
 *
 * v1 (modo teste): o checkout USD real é um seam de provedor que entra no
 * deploy. Aqui a compra chama settleSale direto — que credita o vendedor 88%,
 * a casa 12% e enfileira a entrega do item ao personagem escolhido.
 *
 * SEGURANÇA:
 *  - Nunca confia em preço vindo do cliente: settleSale re-deriva tudo do DB.
 *  - Valida que o personagem receptor pertence ao comprador (escopo por uid).
 *  - settleSale recusa comprar o próprio anúncio (seller_uid === buyerUid).
 */
export async function buyAction(
  _prev: BuyState,
  formData: FormData
): Promise<BuyState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const listingId = Number(formData.get("listingId"));
  const buyerCharObjId = Number(formData.get("buyerCharObjId"));

  if (!Number.isInteger(listingId) || listingId <= 0)
    return { error: "Anúncio inválido." };
  if (!Number.isInteger(buyerCharObjId) || buyerCharObjId <= 0)
    return { error: "Escolha um personagem para receber o item." };

  // O personagem receptor precisa pertencer ao comprador.
  const chars = await ownedChars(s.uid);
  const owns = chars.some((c) => Number(c.obj_Id) === buyerCharObjId);
  if (!owns) return { error: "Esse personagem não é seu." };

  const res = await settleSale(listingId, s.uid, buyerCharObjId);
  if (!res.ok) return { error: res.error ?? "Não foi possível concluir a compra." };

  revalidatePath("/rmt");
  return {
    ok: true,
    message:
      "Compra liquidada — item será entregue no personagem (modo teste).",
  };
}
