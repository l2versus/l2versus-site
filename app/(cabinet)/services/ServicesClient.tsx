"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  clearKarmaAction,
  changeGenderAction,
  unstuckAction,
  transferAction,
  type ServiceState,
} from "./actions";

export type ServiceChar = {
  objId: number;
  name: string;
  level: number;
  online: boolean;
  karma: number;
  sex: number;
};

const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]";
const labelCls =
  "mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]";

function Feedback({ state }: { state: ServiceState }) {
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

/* ---- Casca visual comum a todos os cards ---- */
function Card({
  title,
  cost,
  description,
  children,
}: {
  title: string;
  cost: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="panel flex flex-col rounded-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[rgba(201,162,75,0.05)] px-5 py-3.5">
        <h3 className="font-display text-lg uppercase tracking-[0.12em] text-[var(--color-gold-bright)]">
          {title}
        </h3>
        <span className="rounded-sm border border-[rgba(201,162,75,0.35)] px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-gold)]">
          {cost}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted)]">
          {description}
        </p>
        {children}
      </div>
    </div>
  );
}

/* ---- Seletor de personagem controlado ---- */
function CharSelect({
  id,
  chars,
  value,
  onChange,
}: {
  id: string;
  chars: ServiceChar[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      id={id}
      name="charObjId"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    >
      {chars.map((c) => (
        <option key={c.objId} value={String(c.objId)}>
          {c.name} (Lv {c.level})
          {c.online ? " • ONLINE" : ""}
        </option>
      ))}
    </select>
  );
}

function noChars() {
  return (
    <p className="rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.4)] px-4 py-6 text-center text-sm text-[var(--color-faint)]">
      Você ainda não tem personagens neste servidor.
    </p>
  );
}

/* ---- 1. Limpar Karma ---- */
function ClearKarmaCard({ chars }: { chars: ServiceChar[] }) {
  const [state, action, pending] = useActionState<ServiceState, FormData>(
    clearKarmaAction,
    {}
  );
  const [sel, setSel] = useState(chars[0] ? String(chars[0].objId) : "");
  const current = chars.find((c) => String(c.objId) === sel);
  const blocked = !current || current.online || current.karma <= 0;

  return (
    <Card
      title="Limpar Karma"
      cost="80 VSCOIN"
      description="Zera a karma e os PK kills do personagem, removendo o status de assassino."
    >
      {chars.length === 0 ? (
        noChars()
      ) : (
        <form action={action} className="mt-auto space-y-3">
          <div>
            <label className={labelCls} htmlFor="ck-char">
              Personagem
            </label>
            <CharSelect id="ck-char" chars={chars} value={sel} onChange={setSel} />
          </div>
          {current && (
            <p className="text-xs text-[var(--color-faint)]">
              Karma atual:{" "}
              <span className="text-[var(--color-crimson)]">{current.karma}</span>
            </p>
          )}
          <Feedback state={state} />
          <button
            type="submit"
            disabled={pending || blocked}
            className="btn-gold w-full px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "Processando…"
              : current && current.karma <= 0
                ? "Sem karma para limpar"
                : "Limpar Karma — 80 VSCOIN"}
          </button>
        </form>
      )}
    </Card>
  );
}

/* ---- 2. Trocar Sexo ---- */
function ChangeGenderCard({ chars }: { chars: ServiceChar[] }) {
  const [state, action, pending] = useActionState<ServiceState, FormData>(
    changeGenderAction,
    {}
  );
  const [sel, setSel] = useState(chars[0] ? String(chars[0].objId) : "");
  const current = chars.find((c) => String(c.objId) === sel);
  const blocked = !current || current.online;
  const from = current?.sex === 1 ? "Feminino" : "Masculino";
  const to = current?.sex === 1 ? "Masculino" : "Feminino";

  return (
    <Card
      title="Trocar Sexo"
      cost="200 VSCOIN"
      description="Alterna o sexo do personagem. A aparência muda ao entrar no jogo."
    >
      {chars.length === 0 ? (
        noChars()
      ) : (
        <form action={action} className="mt-auto space-y-3">
          <div>
            <label className={labelCls} htmlFor="cg-char">
              Personagem
            </label>
            <CharSelect id="cg-char" chars={chars} value={sel} onChange={setSel} />
          </div>
          {current && (
            <p className="text-xs text-[var(--color-faint)]">
              {from}{" "}
              <span className="text-[var(--color-gold)]">→</span>{" "}
              <span className="text-[var(--color-parchment)]">{to}</span>
            </p>
          )}
          <Feedback state={state} />
          <button
            type="submit"
            disabled={pending || blocked}
            className="btn-gold w-full px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Processando…" : "Trocar Sexo — 200 VSCOIN"}
          </button>
        </form>
      )}
    </Card>
  );
}

/* ---- 3. Unstuck para Giran ---- */
function UnstuckCard({ chars }: { chars: ServiceChar[] }) {
  const [state, action, pending] = useActionState<ServiceState, FormData>(
    unstuckAction,
    {}
  );
  const [sel, setSel] = useState(chars[0] ? String(chars[0].objId) : "");
  const current = chars.find((c) => String(c.objId) === sel);
  const blocked = !current || current.online;

  return (
    <Card
      title="Unstuck p/ Giran"
      cost="Grátis"
      description="Teleporta um personagem preso para a cidade de Giran com segurança."
    >
      {chars.length === 0 ? (
        noChars()
      ) : (
        <form action={action} className="mt-auto space-y-3">
          <div>
            <label className={labelCls} htmlFor="us-char">
              Personagem
            </label>
            <CharSelect id="us-char" chars={chars} value={sel} onChange={setSel} />
          </div>
          <Feedback state={state} />
          <button
            type="submit"
            disabled={pending || blocked}
            className="btn-gold w-full px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Processando…" : "Teleportar — Grátis"}
          </button>
        </form>
      )}
    </Card>
  );
}

/* ---- 4. Transferir VSCOIN ---- */
function TransferCard({ balance }: { balance: number }) {
  const [state, action, pending] = useActionState<ServiceState, FormData>(
    transferAction,
    {}
  );

  return (
    <Card
      title="Transferir VSCOIN"
      cost="Grátis"
      description="Envie VSCOIN para outro jogador informando o nome de usuário do site."
    >
      <form action={action} className="mt-auto space-y-3">
        <div>
          <label className={labelCls} htmlFor="tr-target">
            Usuário de destino
          </label>
          <input
            id="tr-target"
            name="target"
            required
            autoComplete="off"
            placeholder="Nome de usuário"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="tr-amount">
            Quantidade
          </label>
          <input
            id="tr-amount"
            name="amount"
            type="number"
            min={1}
            step={1}
            required
            placeholder="0"
            className={inputCls}
          />
        </div>
        <p className="text-xs text-[var(--color-faint)]">
          Saldo disponível:{" "}
          <span className="text-[var(--color-gold-bright)]">
            {balance.toLocaleString("pt-BR")}
          </span>{" "}
          VSCOIN
        </p>
        <Feedback state={state} />
        <button
          type="submit"
          disabled={pending}
          className="btn-gold w-full px-5 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Processando…" : "Transferir — Grátis"}
        </button>
      </form>
    </Card>
  );
}

export default function ServicesClient({
  chars,
  balance,
}: {
  chars: ServiceChar[];
  balance: number;
}) {
  return (
    <div
      className="reveal mt-8 grid gap-5 md:grid-cols-2"
      style={{ animationDelay: "0.1s" }}
    >
      <ClearKarmaCard chars={chars} />
      <ChangeGenderCard chars={chars} />
      <UnstuckCard chars={chars} />
      <TransferCard balance={balance} />
    </div>
  );
}
