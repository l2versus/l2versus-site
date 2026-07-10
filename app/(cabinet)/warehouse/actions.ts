"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { debit } from "@/lib/repos/economy";
import { ownedCharByObjId } from "@/lib/repos/services";
import { queueDelivery } from "@/lib/repos/deliveries";

export type ActionState = { error?: string; ok?: boolean; message?: string };

/**
 * Debita VSCOIN do saldo do site e enfileira a entrega no jogo (kind 'coins').
 * O servidor consome a fila (web_deliveries) e entrega ao personagem.
 */
export async function sendCoinsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const objId = Number(formData.get("charObjId") ?? 0);
  const amount = Math.floor(Number(formData.get("amount") ?? 0));

  if (!objId) return { error: "Selecione um personagem." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Informe uma quantidade válida (maior que zero)." };

  try {
    const ch = await ownedCharByObjId(s.uid, objId);
    if (!ch) return { error: "Personagem não pertence a você." };

    const res = await debit(
      s.uid,
      amount,
      "send_to_game",
      `Envio ao jogo: ${ch.char_name}`
    );
    if (!res.ok) return { error: res.error ?? "Saldo insuficiente." };

    await queueDelivery({
      uid: s.uid,
      charObjId: ch.obj_Id,
      charName: ch.char_name,
      kind: "coins",
      amount,
    });

    revalidatePath("/warehouse");
    return {
      ok: true,
      message: `${amount} VSCOIN enviados para ${ch.char_name} (entrega em instantes).`,
    };
  } catch (e) {
    console.error("sendCoinsAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }
}
