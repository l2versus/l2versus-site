"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { ownedCharByObjId } from "@/lib/repos/services";
import { debit, credit } from "@/lib/repos/economy";
import { queueDelivery } from "@/lib/repos/deliveries";
import { donateItemById } from "@/lib/l2/donate-catalog";

export type ShopState = { error?: string; ok?: boolean; message?: string };

/**
 * Compra um item da Donate Shop e enfileira a entrega no jogo.
 *
 * SEGURANÇA: o preço e o nome vêm SEMPRE do catálogo server-side
 * (donateItemById). O client só envia o `catalogId` — nunca o preço.
 */
export async function buyDonateItemAction(
  _prev: ShopState,
  formData: FormData
): Promise<ShopState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const catalogId = String(formData.get("catalogId") ?? "");
  const objId = Number(formData.get("charObjId") ?? 0);

  // Fonte da verdade: re-deriva o item (e o preço) a partir do catálogo.
  const item = donateItemById(catalogId);
  if (!item) return { error: "Item inválido." };
  if (!objId) return { error: "Selecione um personagem." };

  let charName = "";
  try {
    const ch = await ownedCharByObjId(s.uid, objId);
    if (!ch) return { error: "Personagem não pertence a você." };
    charName = ch.char_name;

    const paid = await debit(s.uid, item.price, "spend", `Donate: ${item.name}`);
    if (!paid.ok)
      return { error: paid.error ?? "Não foi possível concluir a compra." };

    try {
      await queueDelivery({
        uid: s.uid,
        charObjId: Number(ch.obj_Id),
        charName: ch.char_name,
        kind: "item",
        payload: {
          catalogId: item.id,
          name: item.name,
          category: item.category,
        },
      });
    } catch (e) {
      // Fila falhou após o débito: reembolsa para não cobrar sem entregar.
      console.error("buyDonateItemAction/queueDelivery", e);
      await credit(s.uid, item.price, "spend", `Reembolso Donate: ${item.name}`);
      return { error: "Falha ao enfileirar a entrega. Saldo reembolsado." };
    }
  } catch (e) {
    console.error("buyDonateItemAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/shop");
  return {
    ok: true,
    message: `${item.name} enviado para entrega em "${charName}".`,
  };
}
