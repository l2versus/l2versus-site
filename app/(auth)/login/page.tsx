"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "../actions";

const initial: AuthState = {};

const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[15px] text-[var(--color-parchment)] placeholder:text-[var(--color-faint)] outline-none transition focus:border-[var(--color-gold)] focus:bg-[rgba(201,162,75,0.05)] focus:ring-1 focus:ring-[rgba(201,162,75,0.35)]";
const labelCls =
  "mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="reveal">
      <div className="diamond-rule mb-6">
        <span className="dia" />
      </div>
      <h1 className="text-center font-display text-4xl tracking-[0.06em] text-glow-gold">
        Entrar
      </h1>
      <p className="mt-3 text-center text-sm text-[var(--color-muted)]">
        Bem-vindo de volta, guerreiro.
      </p>

      {state.error && (
        <div className="mt-6 rounded-sm border border-[rgba(200,67,59,0.45)] bg-[rgba(200,67,59,0.09)] px-4 py-3 text-sm text-[#e79b95]">
          {state.error}
        </div>
      )}

      <div className="mt-7 space-y-5">
        <div>
          <label className={labelCls} htmlFor="login">
            E-mail ou Usuário
          </label>
          <input
            id="login"
            name="login"
            type="text"
            autoComplete="username"
            required
            placeholder="voce@exemplo.com"
            className={inputCls}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelCls + " mb-0"} htmlFor="password">
              Senha
            </label>
            <Link
              href="/recover"
              className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-faint)] transition hover:text-[var(--color-gold)]"
            >
              Esqueci
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="sua senha"
            className={inputCls}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-gold mt-7 w-full py-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar no Reino"}
      </button>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Ainda não tem conta?{" "}
        <Link
          href="/register"
          className="font-medium text-[var(--color-gold-bright)] underline-offset-4 transition hover:underline"
        >
          Criar agora
        </Link>
      </p>
    </form>
  );
}
