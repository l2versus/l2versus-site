"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  ownedCharByObjId,
  clearKarma,
  changeGender,
  unstuck,
} from "@/lib/repos/services";
import { debit, credit } from "@/lib/repos/economy";
import { queryOne } from "@/lib/db";

/** Estado de retorno das actions de serviço (feedback verde/vermelho no client). */
export type ServiceState = { error?: string; ok?: boolean; message?: string };

const COST_CLEAR_KARMA = 80;
const COST_CHANGE_GENDER = 200;

/** 1. Limpar Karma (80 VSCOIN) — apenas se o personagem tiver karma > 0. */
export async function clearKarmaAction(
  _prev: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const objId = Number(formData.get("charObjId") ?? 0);
  if (!objId) return { error: "Selecione um personagem." };

  try {
    const ch = await ownedCharByObjId(s.uid, objId);
    if (!ch) return { error: "Personagem não pertence a você." };
    if (ch.online !== 0)
      return { error: "O personagem precisa estar offline para este serviço." };
    if (ch.karma <= 0)
      return { error: "Este personagem não possui karma para limpar." };

    const d = await debit(
      s.uid,
      COST_CLEAR_KARMA,
      "service",
      `Limpar Karma — ${ch.char_name}`
    );
    if (!d.ok) return { error: d.error ?? "Saldo insuficiente." };

    await clearKarma(s.uid, ch, COST_CLEAR_KARMA);
    revalidatePath("/services");
    return { ok: true, message: `Karma de "${ch.char_name}" foi zerada.` };
  } catch (e) {
    console.error("clearKarmaAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }
}

/** 2. Trocar Sexo (200 VSCOIN) — alterna 0<->1 no personagem offline. */
export async function changeGenderAction(
  _prev: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const objId = Number(formData.get("charObjId") ?? 0);
  if (!objId) return { error: "Selecione um personagem." };

  try {
    const ch = await ownedCharByObjId(s.uid, objId);
    if (!ch) return { error: "Personagem não pertence a você." };
    if (ch.online !== 0)
      return { error: "O personagem precisa estar offline para este serviço." };

    const d = await debit(
      s.uid,
      COST_CHANGE_GENDER,
      "service",
      `Trocar Sexo — ${ch.char_name}`
    );
    if (!d.ok) return { error: d.error ?? "Saldo insuficiente." };

    await changeGender(s.uid, ch, COST_CHANGE_GENDER);
    revalidatePath("/services");
    return { ok: true, message: `Sexo de "${ch.char_name}" alterado.` };
  } catch (e) {
    console.error("changeGenderAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }
}

/** 3. Unstuck para Giran (grátis) — teleporta o personagem offline. */
export async function unstuckAction(
  _prev: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const objId = Number(formData.get("charObjId") ?? 0);
  if (!objId) return { error: "Selecione um personagem." };

  try {
    const ch = await ownedCharByObjId(s.uid, objId);
    if (!ch) return { error: "Personagem não pertence a você." };
    if (ch.online !== 0)
      return { error: "O personagem precisa estar offline para este serviço." };

    await unstuck(s.uid, ch, 0);
    revalidatePath("/services");
    return { ok: true, message: `"${ch.char_name}" foi teleportado para Giran.` };
  } catch (e) {
    console.error("unstuckAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }
}

/** 4. Transferir VSCOIN a outro jogador (grátis). */
export async function transferAction(
  _prev: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const targetName = String(formData.get("target") ?? "").trim();
  const amount = Math.floor(Number(formData.get("amount") ?? 0));

  if (!targetName) return { error: "Informe o nome do jogador de destino." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Informe um valor válido (maior que zero)." };

  try {
    const target = await queryOne<{ id: number; username: string }>(
      "SELECT id, username FROM web_users WHERE username = ? LIMIT 1",
      [targetName]
    );
    if (!target) return { error: "Jogador não encontrado." };
    if (target.id === s.uid)
      return { error: "Você não pode transferir VSCOIN para si mesmo." };

    const d = await debit(
      s.uid,
      amount,
      "transfer_out",
      `Transferência para ${target.username}`
    );
    if (!d.ok) return { error: d.error ?? "Saldo insuficiente." };

    const c = await credit(
      target.id,
      amount,
      "transfer_in",
      `Transferência de ${s.username}`
    );
    if (!c.ok) {
      // Estorna o remetente se o crédito no destino falhar.
      await credit(
        s.uid,
        amount,
        "transfer_in",
        "Estorno — transferência não concluída"
      );
      return { error: "Falha ao creditar o destinatário. Valor estornado." };
    }

    revalidatePath("/services");
    return {
      ok: true,
      message: `${amount} VSCOIN enviados para ${target.username}.`,
    };
  } catch (e) {
    console.error("transferAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }
}
