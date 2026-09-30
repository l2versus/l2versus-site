"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession, destroySession } from "@/lib/session";
import {
  countGameAccounts,
  createGameAccount,
  gameAccountExists,
  updateGamePassword,
  getAccountForClaim,
  linkAccountToUser,
  countCharacters,
  deleteGameAccount,
} from "@/lib/repos/accounts";
import { ownedCharByObjId, unstuck } from "@/lib/repos/services";

export type ActionState = { error?: string; ok?: boolean; message?: string };

const LOGIN_RE = /^[a-zA-Z0-9]{4,14}$/;
const MAX_ACCOUNTS = 10;

/** Cria nova conta de jogo (login normalizado em lowercase — correção L2J). */
export async function createAccountAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const login = String(formData.get("login") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!LOGIN_RE.test(login))
    return { error: "Login deve ter 4–14 caracteres, apenas letras e números." };
  if (password.length < 6 || password.length > 16)
    return { error: "A senha precisa ter entre 6 e 16 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };

  try {
    if ((await countGameAccounts(s.uid)) >= MAX_ACCOUNTS)
      return { error: `Limite de ${MAX_ACCOUNTS} contas de jogo atingido.` };
    if (await gameAccountExists(login))
      return { error: "Este login de jogo já está em uso." };
    const hash = await bcrypt.hash(password, 10);
    await createGameAccount({ uid: s.uid, login, passwordHash: hash });
  } catch (e) {
    console.error("createAccountAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: `Conta "${login}" criada com sucesso.` };
}

/**
 * Vincula uma conta de jogo JÁ EXISTENTE (criada in-game) ao usuário do site,
 * provando posse pela senha. Resolve o caso de logar no jogo com uma conta que
 * o servidor auto-criou e que não aparecia no painel.
 */
export async function claimAccountAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const login = String(formData.get("login") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!LOGIN_RE.test(login))
    return { error: "Login deve ter 4–14 caracteres, apenas letras e números." };
  if (!password) return { error: "Informe a senha da conta de jogo." };

  try {
    if ((await countGameAccounts(s.uid)) >= MAX_ACCOUNTS)
      return { error: `Limite de ${MAX_ACCOUNTS} contas de jogo atingido.` };

    const acc = await getAccountForClaim(login);
    if (!acc) return { error: "Conta de jogo não encontrada." };
    if (acc.site_user_id === s.uid)
      return { error: "Esta conta já está vinculada a você." };
    if (acc.site_user_id)
      return { error: "Esta conta já pertence a outro usuário do site." };

    const ok = await bcrypt.compare(password, acc.password);
    if (!ok) return { error: "Senha da conta de jogo incorreta." };

    const res = await linkAccountToUser(login, s.uid);
    if (res.affectedRows === 0)
      return { error: "Não foi possível vincular (talvez já reivindicada)." };
  } catch (e) {
    console.error("claimAccountAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: `Conta "${login}" vinculada com sucesso.` };
}

/** Troca a senha de uma conta de jogo do usuário logado. */
export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const login = String(formData.get("login") ?? "").trim().toLowerCase();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!login) return { error: "Selecione uma conta de jogo." };
  if (newPassword.length < 6 || newPassword.length > 16)
    return { error: "A senha precisa ter entre 6 e 16 caracteres." };
  if (newPassword !== confirm) return { error: "As senhas não conferem." };

  try {
    const hash = await bcrypt.hash(newPassword, 10);
    const res = await updateGamePassword(login, hash, s.uid);
    if (res.affectedRows === 0)
      return { error: "Conta não encontrada ou não pertence a você." };
  } catch (e) {
    console.error("changePasswordAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: `Senha da conta "${login}" alterada.` };
}

/**
 * Exclui uma conta de jogo do usuário — SÓ se estiver vazia (sem personagens),
 * para nunca apagar chars por acidente. Escopo por uid garante a posse.
 */
export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const login = String(formData.get("login") ?? "").trim().toLowerCase();
  if (!login) return { error: "Selecione uma conta de jogo." };

  try {
    if ((await countCharacters(login)) > 0)
      return {
        error:
          "Esta conta tem personagens. Delete os personagens no jogo antes de excluir a conta.",
      };
    const res = await deleteGameAccount(login, s.uid);
    if (res.affectedRows === 0)
      return { error: "Conta não encontrada ou não pertence a você." };
  } catch (e) {
    console.error("deleteAccountAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: `Conta "${login}" excluída.` };
}

/** Teleporta um personagem preso (offline) para Giran. Gratuito. */
export async function unstuckAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const s = await getSession();
  if (!s) return { error: "Sessão expirada. Faça login novamente." };

  const objId = Number(formData.get("charObjId") ?? 0);
  if (!objId) return { error: "Personagem inválido." };

  try {
    const ch = await ownedCharByObjId(s.uid, objId);
    if (!ch) return { error: "Personagem não pertence a você." };
    if (ch.online === 1)
      return { error: "O personagem precisa estar offline para o Unstuck." };
    await unstuck(s.uid, ch, 0);
  } catch (e) {
    console.error("unstuckAction", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Personagem teleportado para Giran." };
}

/** Encerra a sessão e volta para a home. */
export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
