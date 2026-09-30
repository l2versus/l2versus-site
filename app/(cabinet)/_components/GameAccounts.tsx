"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import L2Icon from "./L2Icon";
import { makeT } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/dict";
import {
  createAccountAction,
  changePasswordAction,
  claimAccountAction,
  unstuckAction,
  deleteAccountAction,
  type ActionState,
} from "../actions";

export type CharView = {
  objId: number;
  name: string;
  classId: number;
  cls: string;
  level: number;
  clan: string | null;
  pvp: number;
  pk: number;
  online: boolean;
};
export type AccountView = { login: string; chars: CharView[] };

const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]";
const labelCls =
  "mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]";

function Feedback({ state }: { state: ActionState }) {
  if (state.error)
    return (
      <p className="mt-3 rounded-sm border border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.08)] px-3 py-2 text-sm text-[var(--color-crimson)]">
        {state.error}
      </p>
    );
  if (state.ok && state.message)
    return (
      <p className="mt-3 rounded-sm border border-[rgba(94,194,106,0.4)] bg-[rgba(94,194,106,0.08)] px-3 py-2 text-sm text-[#8fe19b]">
        {state.message}
      </p>
    );
  return null;
}

/* ---- Unstuck (form curto por personagem) ---- */
function UnstuckButton({ objId, label }: { objId: number; label: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    unstuckAction,
    {}
  );
  const [flash, setFlash] = useState<null | "ok" | "err">(null);

  useEffect(() => {
    if (state.ok) {
      setFlash("ok");
      const t = setTimeout(() => setFlash(null), 2500);
      return () => clearTimeout(t);
    }
    if (state.error) {
      setFlash("err");
      const t = setTimeout(() => setFlash(null), 3500);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <form action={action} className="flex items-center justify-end gap-2">
      {flash === "err" && (
        <span className="max-w-[11rem] text-right text-[0.6rem] leading-tight text-[var(--color-crimson)]">
          {state.error}
        </span>
      )}
      <input type="hidden" name="charObjId" value={objId} />
      <button
        type="submit"
        disabled={pending}
        className={`px-3 py-1.5 text-[0.68rem] disabled:opacity-50 ${
          flash === "ok"
            ? "rounded-sm border border-[rgba(94,194,106,0.5)] bg-[rgba(94,194,106,0.12)] font-medium uppercase tracking-widest text-[#8fe19b]"
            : "btn-ghost"
        }`}
      >
        {pending ? "…" : flash === "ok" ? "✓ OK" : label}
      </button>
    </form>
  );
}

/* ---- Modal: criar conta ---- */
function CreateModal({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: (k: string) => string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    createAccountAction,
    {}
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      const id = setTimeout(onClose, 1100);
      return () => clearTimeout(id);
    }
  }, [state, onClose]);

  return (
    <Modal open={open} onClose={onClose} title={t("modal.create_title")}>
      <form ref={ref} action={action} className="space-y-4">
        <div>
          <label className={labelCls} htmlFor="ca-login">{t("modal.login")}</label>
          <input id="ca-login" name="login" required minLength={4} maxLength={14} autoComplete="off" placeholder="4–14 a-z 0-9" className={inputCls} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="ca-pass">{t("modal.password")}</label>
            <input id="ca-pass" name="password" type="password" required minLength={6} maxLength={16} autoComplete="new-password" placeholder="6–16" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="ca-conf">{t("modal.confirm")}</label>
            <input id="ca-conf" name="confirm" type="password" required minLength={6} maxLength={16} autoComplete="new-password" className={inputCls} />
          </div>
        </div>
        <Feedback state={state} />
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={pending} className="btn-gold flex-1 px-5 py-2.5 text-xs disabled:opacity-60">
            {pending ? t("common.processing") : t("modal.create")}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5 text-xs">
            {t("modal.cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---- Modal: vincular conta existente ---- */
function ClaimModal({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: (k: string) => string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    claimAccountAction,
    {}
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      const id = setTimeout(onClose, 1100);
      return () => clearTimeout(id);
    }
  }, [state, onClose]);

  return (
    <Modal open={open} onClose={onClose} title={t("modal.claim_title")}>
      <form ref={ref} action={action} className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          {t("modal.claim_hint")}
        </p>
        <div>
          <label className={labelCls} htmlFor="cl-login">
            {t("modal.login")}
          </label>
          <input id="cl-login" name="login" required minLength={4} maxLength={14} autoComplete="off" placeholder="4–14 a-z 0-9" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="cl-pass">
            {t("modal.claim_pwd")}
          </label>
          <input id="cl-pass" name="password" type="password" required autoComplete="off" className={inputCls} />
        </div>
        <Feedback state={state} />
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={pending} className="btn-gold flex-1 px-5 py-2.5 text-xs disabled:opacity-60">
            {pending ? t("common.processing") : t("modal.link")}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5 text-xs">
            {t("modal.cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---- Modal: trocar senha ---- */
function ChangeModal({
  login,
  onClose,
  t,
}: {
  login: string | null;
  onClose: () => void;
  t: (k: string) => string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    changePasswordAction,
    {}
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      const id = setTimeout(onClose, 1100);
      return () => clearTimeout(id);
    }
  }, [state, onClose]);

  return (
    <Modal open={login !== null} onClose={onClose} title={`${t("modal.change_title")} — ${login ?? ""}`}>
      <form ref={ref} action={action} className="space-y-4">
        <input type="hidden" name="login" value={login ?? ""} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="cp-pass">{t("modal.new_password")}</label>
            <input id="cp-pass" name="newPassword" type="password" required minLength={6} maxLength={16} autoComplete="new-password" placeholder="6–16" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="cp-conf">{t("modal.confirm")}</label>
            <input id="cp-conf" name="confirm" type="password" required minLength={6} maxLength={16} autoComplete="new-password" className={inputCls} />
          </div>
        </div>
        <Feedback state={state} />
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={pending} className="btn-gold flex-1 px-5 py-2.5 text-xs disabled:opacity-60">
            {pending ? t("common.saving") : t("modal.save")}
          </button>
          <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5 text-xs">
            {t("modal.cancel")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---- Modal: excluir conta (confirmação) ---- */
function DeleteModal({
  login,
  hasChars,
  onClose,
  t,
}: {
  login: string | null;
  hasChars: boolean;
  onClose: () => void;
  t: (k: string) => string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    deleteAccountAction,
    {}
  );
  useEffect(() => {
    if (state.ok) {
      const id = setTimeout(onClose, 1100);
      return () => clearTimeout(id);
    }
  }, [state, onClose]);

  return (
    <Modal open={login !== null} onClose={onClose} title={`${t("modal.delete_title")} — ${login ?? ""}`}>
      {hasChars ? (
        <>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            {t("modal.delete_haschars")}
          </p>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5 text-xs">
              {t("modal.cancel")}
            </button>
          </div>
        </>
      ) : (
        <form action={action} className="space-y-4">
          <input type="hidden" name="login" value={login ?? ""} />
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            {t("modal.delete_confirm")}
          </p>
          <Feedback state={state} />
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-sm border border-[rgba(200,67,59,0.5)] bg-[rgba(200,67,59,0.12)] px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-[var(--color-crimson)] transition-colors hover:bg-[rgba(200,67,59,0.2)] disabled:opacity-60"
            >
              {pending ? t("common.processing") : t("modal.delete")}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost px-5 py-2.5 text-xs">
              {t("modal.cancel")}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ---- Bloco de uma conta (dentro do painel unificado) ---- */
function AccountBlock({
  account,
  onChangePw,
  onDelete,
  t,
}: {
  account: AccountView;
  onChangePw: (login: string) => void;
  onDelete: (login: string) => void;
  t: (k: string) => string;
}) {
  return (
    <div className="border-b border-[var(--color-line)] last:border-b-0">
      {/* Barra da conta */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[rgba(201,162,75,0.04)] px-5 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="1.5" />
            <path d="M7 11V8a5 5 0 0 1 10 0v3" />
          </svg>
          <span className="font-display tracking-wide text-[var(--color-gold-bright)]">
            {account.login}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onChangePw(account.login)} className="btn-ghost px-4 py-1.5 text-[0.68rem]">
            {t("profile.change_password")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(account.login)}
            title={t("profile.delete_account")}
            aria-label={t("profile.delete_account")}
            className="rounded-sm border border-[rgba(200,67,59,0.25)] px-2.5 py-1.5 text-[var(--color-crimson)] transition-colors hover:border-[rgba(200,67,59,0.5)] hover:bg-[rgba(200,67,59,0.08)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>

      {account.chars.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-[var(--color-faint)]">
          {t("profile.no_chars_acc")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-t border-[var(--color-line)] bg-[rgba(8,7,10,0.6)] text-[0.6rem] uppercase tracking-[0.16em] text-[var(--color-faint)]">
                <th className="px-5 py-3 font-semibold md:px-6">{t("col.character")}</th>
                <th className="px-3 py-3 font-semibold">{t("col.class")}</th>
                <th className="px-3 py-3 font-semibold">{t("col.level")}</th>
                <th className="px-3 py-3 font-semibold">{t("col.clan")}</th>
                <th className="px-3 py-3 font-semibold">{t("col.pvppk")}</th>
                <th className="px-3 py-3 font-semibold">{t("col.status")}</th>
                <th className="px-5 py-3 text-right font-semibold md:px-6">{t("col.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(42,37,48,0.5)]">
              {account.chars.map((c) => (
                <tr
                  key={c.objId}
                  className="transition-colors hover:bg-[#17141C] hover:shadow-[inset_2px_0_0_var(--color-gold)]"
                >
                  <td className="px-5 py-3.5 md:px-6">
                    <span className="font-semibold tracking-wide text-[var(--color-parchment)]">
                      {c.name}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <L2Icon kind="class" classId={c.classId} size={30} alt={c.cls} />
                      <span className="text-[var(--color-muted)]">{c.cls}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-display text-lg text-[var(--color-gold-bright)]">{c.level}</td>
                  <td className="px-3 py-3.5">
                    {c.clan ? (
                      <span className="rounded-sm border border-[rgba(143,166,228,0.25)] bg-[rgba(143,166,228,0.08)] px-2.5 py-1 text-xs text-[#8fa6e4]">
                        {c.clan}
                      </span>
                    ) : (
                      <span className="text-[var(--color-faint)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5 font-display text-base">
                    <span className="text-[var(--color-gold-bright)]">{c.pvp}</span>
                    <span className="mx-1 text-[var(--color-faint)]">/</span>
                    <span className="text-[var(--color-crimson)]">{c.pk}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    {c.online ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(94,194,106,0.3)] bg-[rgba(94,194,106,0.1)] px-3 py-1 text-[0.62rem] uppercase tracking-[0.15em] text-[#5ec26a] shadow-[inset_0_0_8px_rgba(94,194,106,0.1)]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ec26a] shadow-[0_0_5px_rgba(94,194,106,0.8)]" />
                        {t("chrome.online")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[rgba(18,16,22,0.7)] px-3 py-1 text-[0.62rem] uppercase tracking-[0.15em] text-[var(--color-faint)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-faint)]" />
                        {t("chrome.offline")}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 md:px-6">
                    <UnstuckButton objId={c.objId} label={t("char.unstuck")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---- Seção completa ---- */
export default function GameAccounts({
  accounts,
  used,
  max,
  locale,
}: {
  accounts: AccountView[];
  used: number;
  max: number;
  locale: Locale;
}) {
  const t = makeT(locale);
  const [createOpen, setCreateOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [changeLogin, setChangeLogin] = useState<string | null>(null);
  const [deleteLogin, setDeleteLogin] = useState<string | null>(null);
  const deleteHasChars =
    deleteLogin !== null &&
    (accounts.find((a) => a.login === deleteLogin)?.chars.length ?? 0) > 0;

  return (
    <section className="reveal mt-8" style={{ animationDelay: "0.1s" }}>
      {/* Painel unificado — port do mockup Stitch "Contas de Jogo" */}
      <div className="panel panel-lit rounded-sm shadow-2xl">
        {/* Header do painel */}
        <div className="relative z-10 flex flex-col gap-4 border-b border-[var(--color-line)] bg-[rgba(12,10,16,0.45)] p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="8" r="4" />
              <path d="M2.5 21c0-4 3.3-6 7.5-6 1.2 0 2.3.16 3.3.47" />
              <path d="M17.5 14.5v6M14.5 17.5h6" />
            </svg>
            <h2 className="font-display text-xl tracking-wide text-[var(--color-parchment)] md:text-2xl">
              {t("profile.accounts")}{" "}
              <span className="text-base text-[var(--color-gold-bright)]">
                {used}/{max}
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={used >= max}
            className="btn-gold px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-base leading-none">＋</span>
            {t("profile.create_account")}
          </button>
        </div>

        {/* Corpo */}
        {accounts.length === 0 ? (
          <div className="px-6 py-12 text-center text-[var(--color-muted)]">
            {t("profile.no_accounts")}
          </div>
        ) : (
          <div>
            {accounts.map((a) => (
              <AccountBlock key={a.login} account={a} onChangePw={setChangeLogin} onDelete={setDeleteLogin} t={t} />
            ))}
          </div>
        )}

        {/* Footer de ações */}
        <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--color-line)] bg-[rgba(8,7,10,0.6)] p-5 md:p-6">
          <button
            type="button"
            onClick={() => setClaimOpen(true)}
            disabled={used >= max}
            className="btn-ghost px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
            </svg>
            {t("profile.claim_account")}
          </button>
        </div>
      </div>

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} t={t} />
      <ClaimModal open={claimOpen} onClose={() => setClaimOpen(false)} t={t} />
      <ChangeModal login={changeLogin} onClose={() => setChangeLogin(null)} t={t} />
      <DeleteModal login={deleteLogin} hasChars={deleteHasChars} onClose={() => setDeleteLogin(null)} t={t} />
    </section>
  );
}
