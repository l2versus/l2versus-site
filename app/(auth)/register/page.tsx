"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type AuthState } from "../actions";

const initial: AuthState = {};

const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[15px] text-[var(--color-parchment)] placeholder:text-[var(--color-faint)] outline-none transition focus:border-[var(--color-gold)] focus:bg-[rgba(201,162,75,0.05)] focus:ring-1 focus:ring-[rgba(201,162,75,0.35)]";
const labelCls =
  "mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, initial);

  return (
    <form action={action} className="reveal">
      <div className="diamond-rule mb-6">
        <span className="dia" />
      </div>
      <h1 className="text-center font-display text-4xl tracking-[0.06em] text-glow-gold">
        Criar Conta
      </h1>
      <p className="mt-3 text-center text-sm text-[var(--color-muted)]">
        Uma conta de site comanda todas as suas contas de jogo.
      </p>

      {state.error && (
        <div className="mt-6 rounded-sm border border-[rgba(200,67,59,0.45)] bg-[rgba(200,67,59,0.09)] px-4 py-3 text-sm text-[#e79b95]">
          {state.error}
        </div>
      )}

      <div className="mt-7 space-y-5">
        <div>
          <label className={labelCls} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="voce@exemplo.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="username">
            Usuário
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            placeholder="3–20 caracteres"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="mínimo 6 caracteres"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="confirm">
            Confirmar Senha
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            placeholder="repita a senha"
            className={inputCls}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn-gold mt-7 w-full py-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Criando conta…" : "⚔ Registrar"}
      </button>

      <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--color-gold-bright)] underline-offset-4 transition hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
