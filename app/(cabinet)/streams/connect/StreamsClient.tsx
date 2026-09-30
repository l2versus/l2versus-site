"use client";

import { useActionState, useState } from "react";
import {
  addStreamerAction,
  removeStreamerAction,
  type StreamActionState,
} from "./actions";
import type { StreamerRow } from "@/lib/repos/streams";

const labelCls =
  "mb-1.5 block text-[0.7rem] uppercase tracking-[0.22em] text-[var(--color-faint)]";
const inputCls =
  "w-full rounded-sm border border-[var(--color-line)] bg-[rgba(7,7,10,0.6)] px-4 py-2.5 text-[15px] text-[var(--color-parchment)] outline-none transition-colors placeholder:text-[var(--color-faint)] focus:border-[var(--color-gold)]";

const PLATFORMS = [
  { id: "twitch", label: "Twitch", color: "#9146FF" },
  { id: "youtube", label: "YouTube", color: "#FF0000" },
  { id: "kick", label: "Kick", color: "#53FC18" },
  { id: "trovo", label: "Trovo", color: "#1FBF66" },
] as const;

function Feedback({ state }: { state: StreamActionState }) {
  if (state.error)
    return (
      <p className="mt-4 rounded-sm border border-[rgba(200,67,59,0.4)] bg-[rgba(200,67,59,0.08)] px-3 py-2 text-sm text-[var(--color-crimson)]">
        {state.error}
      </p>
    );
  if (state.ok && state.message)
    return (
      <p className="mt-4 rounded-sm border border-[rgba(94,194,106,0.4)] bg-[rgba(94,194,106,0.08)] px-3 py-2 text-sm text-[#8fe19b]">
        {state.message}
      </p>
    );
  return null;
}

export default function StreamsClient({
  initial,
  labels,
}: {
  initial: StreamerRow[];
  labels: Record<string, string>;
}) {
  const [platform, setPlatform] = useState<string>("twitch");
  const [addState, addAction, addPending] = useActionState<StreamActionState, FormData>(
    addStreamerAction,
    {}
  );
  const [rmState, rmAction, rmPending] = useActionState<StreamActionState, FormData>(
    removeStreamerAction,
    {}
  );

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* ESQUERDA — conectar canal */}
      <section className="reveal panel rounded-sm p-6 md:p-7" style={{ animationDelay: "0.05s" }}>
        <h2 className="font-display text-xl uppercase tracking-[0.15em] text-[var(--color-parchment)]">
          {labels.add}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-faint)]">{labels.sub}</p>

        <form action={addAction} className="mt-6">
          <input type="hidden" name="platform" value={platform} />

          <span className={labelCls}>{labels.platform}</span>
          <div className="flex flex-wrap gap-2.5">
            {PLATFORMS.map((p) => {
              const active = p.id === platform;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  aria-pressed={active}
                  className={`rounded-sm border px-4 py-2 text-sm transition-colors ${
                    active
                      ? "border-[var(--color-gold)] bg-[rgba(201,162,75,0.12)] text-[var(--color-gold-bright)]"
                      : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-gold)]"
                  }`}
                >
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label className={labelCls} htmlFor="channel">
              {labels.channel}
            </label>
            <input
              id="channel"
              name="channel"
              type="text"
              autoComplete="off"
              maxLength={60}
              placeholder="meucanal"
              className={inputCls}
              required
            />
            <p className="mt-2 text-[0.7rem] leading-relaxed text-[var(--color-faint)]">
              {labels.hint}
            </p>
          </div>

          <button
            type="submit"
            disabled={addPending}
            className="btn-gold mt-6 w-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addPending ? "…" : labels.add.toUpperCase()}
          </button>

          <Feedback state={addState} />
        </form>
      </section>

      {/* DIREITA — canais conectados */}
      <aside className="reveal panel-gold panel rounded-sm p-6 md:p-7" style={{ animationDelay: "0.12s" }}>
        <h2 className="font-display text-lg uppercase tracking-[0.15em] text-[var(--color-gold-bright)]">
          {labels.title}
        </h2>

        {initial.length === 0 ? (
          <p className="mt-5 text-sm text-[var(--color-faint)]">{labels.none}</p>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {initial.map((s) => {
              const p = PLATFORMS.find((x) => x.id === s.platform);
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-sm border border-[var(--color-line)] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[var(--color-parchment)]">
                      {s.channel}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.15em]">
                      <span style={{ color: p?.color }}>{p?.label}</span>
                      <span
                        className={
                          s.status === "approved"
                            ? "text-[#8fe19b]"
                            : s.status === "pending"
                              ? "text-[var(--color-gold)]"
                              : "text-[var(--color-crimson)]"
                        }
                      >
                        {labels[`status_${s.status}`]}
                      </span>
                    </div>
                  </div>
                  <form action={rmAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      disabled={rmPending}
                      className="rounded-sm border border-[rgba(200,67,59,0.25)] px-3 py-1.5 text-[0.65rem] uppercase tracking-widest text-[var(--color-crimson)] transition-all hover:border-[rgba(200,67,59,0.5)] hover:bg-[rgba(200,67,59,0.08)] disabled:opacity-50"
                    >
                      {labels.remove}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
        <Feedback state={rmState} />
      </aside>
    </div>
  );
}
