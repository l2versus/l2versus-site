"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { ownedCharByObjId } from "@/lib/repos/services";
import { debit, credit } from "@/lib/repos/economy";
import { queueDelivery } from "@/lib/repos/deliveries";

export type ActionState = { error?: string; ok?: boolean; message?: string };

type PackItem = { id: number; count: number };
type ServerPack = { id: string; name: string; price: number; items: PackItem[] };

/**
 * CATÁLOGO AUTORITATIVO dos pacotes.
 * O servidor NUNCA confia no preço ou nos itens enviados pelo client — o
 * PacksClient tem uma cópia apenas para exibição; aqui é a fonte da verdade.
 * IDs de item conferidos na rev (data/xml/items/*.xml — L2jOne C6/Interlude).
 */
const PACKS: Record<string, ServerPack> = {
  noob: {
    id: "noob",
    name: "NOOB",
    price: 200,
    items: [
      { id: 955, count: 5 }, // Scroll: Enchant Weapon (Grade D)
      { id: 956, count: 10 }, // Scroll: Enchant Armor (Grade D)
      { id: 1463, count: 5000 }, // Soulshot: D-grade
      { id: 1060, count: 500 }, // Lesser Healing Potion
      { id: 57, count: 1_000_000 }, // Adena
    ],
  },
  standart: {
    id: "standart",
    name: "STANDART",
    price: 300,
    items: [
      { id: 947, count: 5 }, // Scroll: Enchant Weapon (Grade B)
      { id: 948, count: 10 }, // Scroll: Enchant Armor (Grade B)
      { id: 1465, count: 10_000 }, // Soulshot: B-grade
      { id: 1539, count: 500 }, // Greater Healing Potion
      { id: 728, count: 500 }, // Mana Potion
      { id: 57, count: 5_000_000 }, // Adena
    ],
  },
  premium: {
    id: "premium",
    name: "PREMIUM",
    price: 500,
    items: [
      { id: 729, count: 5 }, // Scroll: Enchant Weapon (Grade A)
      { id: 730, count: 10 }, // Scroll: Enchant Armor (Grade A)
      { id: 6569, count: 2 }, // Blessed Scroll: Enchant Weapon (Grade A)
      { id: 1466, count: 20_000 }, // Soulshot: A-grade
      { id: 1539, count: 1000 }, // Greater Healing Potion
      { id: 728, count: 1000 }, // Mana Potion
      { id: 57, count: 20_000_000 }, // Adena
    ],
  },
};

/** Compra um Starter Pack e enfileira a entrega no jogo para um personagem do usuário. */
export async function buyPackAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const packId = String(formData.get("packId") ?? "");
  const objId = Number(formData.get("charObjId") ?? 0);

  const pack = PACKS[packId];
  if (!pack) return { error: "Pacote inválido." };
  if (!objId) return { error: "Selecione um personagem." };

  try {
    const ch = await ownedCharByObjId(s.uid, objId);
    if (!ch) return { error: "Personagem não pertence a você." };

    const paid = await debit(s.uid, pack.price, "pack", `Pacote ${pack.name}`);
    if (!paid.ok)
      return { error: paid.error ?? "Não foi possível concluir a compra." };

    try {
      await queueDelivery({
        uid: s.uid,
        charObjId: Number(ch.obj_Id),
        charName: ch.char_name,
        kind: "pack",
        payload: { pack: pack.id, name: pack.name, items: pack.items },
      });
    } catch (e) {
      // A fila falhou depois do débito: reembolsa para não cobrar sem entregar.
      console.error("buyPackAction/queueDelivery", e);
      await credit(s.uid, pack.price, "pack", `Reembolso Pacote ${pack.name}`);
      return { error: "Falha ao enfileirar a entrega. Saldo reembolsado." };
    }
  } catch (e) {
    console.error("buyPackAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/packs");
  return {
    ok: true,
    message: `Pacote ${pack.name} enviado para entrega no jogo.`,
  };
}
