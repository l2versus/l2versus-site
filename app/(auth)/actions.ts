"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { query, execute } from "@/lib/db";
import { createSession } from "@/lib/session";

export type AuthState = { error?: string };

type WebUserRow = {
  id: number;
  email: string;
  username: string;
  password: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function register(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!EMAIL_RE.test(email)) return { error: "E-mail inválido." };
  if (!USER_RE.test(username))
    return { error: "Usuário deve ter 3–20 caracteres (letras, números, _)." };
  if (password.length < 6)
    return { error: "A senha precisa de pelo menos 6 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };

  try {
    const existing = await query<{ id: number }>(
      "SELECT id FROM web_users WHERE email = ? OR username = ? LIMIT 1",
      [email, username]
    );
    if (existing.length) return { error: "E-mail ou usuário já cadastrado." };

    const hash = await bcrypt.hash(password, 10);
    const res = await execute(
      "INSERT INTO web_users (email, username, password) VALUES (?, ?, ?)",
      [email, username, hash]
    );
    await createSession({ uid: res.insertId, email, username });
  } catch (e) {
    console.error("register error", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  redirect("/dashboard");
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const id = String(formData.get("login") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!id || !password) return { error: "Informe login e senha." };

  try {
    const user = await query<WebUserRow>(
      "SELECT id, email, username, password FROM web_users WHERE email = ? OR username = ? LIMIT 1",
      [id, id]
    );
    const u = user[0];
    if (!u) return { error: "Login ou senha incorretos." };

    const ok = await bcrypt.compare(password, u.password);
    if (!ok) return { error: "Login ou senha incorretos." };

    await execute("UPDATE web_users SET last_login = ? WHERE id = ?", [
      Date.now(),
      u.id,
    ]);
    await createSession({ uid: u.id, email: u.email, username: u.username });
  } catch (e) {
    console.error("login error", e);
    return { error: "Erro no servidor. Tente novamente." };
  }

  redirect("/dashboard");
}
