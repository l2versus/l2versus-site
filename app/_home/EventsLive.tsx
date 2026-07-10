"use client";

import { useEffect, useState } from "react";

/**
 * Eventos automáticos do servidor (agenda real de config/mods/engine.properties).
 * Horários em HORA DO SERVIDOR (America/Fortaleza). O countdown é calculado no
 * client para evitar mismatch de hidratação (só liga após montar).
 */
export type GameEvent = {
  key: string;
  name: string;
  icon: string;
  desc: string;
  reward: string;
  times: string[]; // "HH:MM"
};

export const EVENTS: GameEvent[] = [
  {
    key: "DM",
    name: "DeathMatch",
    icon: "⚔",
    desc: "Todos contra todos numa arena selada. A última lâmina de pé leva tudo.",
    reward: "Top 3 abates · VSCOIN + buffs",
    times: ["10:00", "16:00", "22:00"],
  },
  {
    key: "TVT",
    name: "Team vs Team",
    icon: "⚑",
    desc: "Dois times, uma guerra. Coordenação vence o caos — registre com seus aliados.",
    reward: "Time vencedor · VSCOIN",
    times: ["11:00", "17:00", "23:00"],
  },
  {
    key: "CTF",
    name: "Capture the Flag",
    icon: "⚐",
    desc: "Roube a bandeira inimiga e leve até sua base sem cair. Puro nervo.",
    reward: "Melhor capturador · VSCOIN",
    times: ["09:00", "15:00", "21:00"],
  },
  {
    key: "HG",
    name: "Hunting Grounds",
    icon: "☠",
    desc: "Zona de caça PvP aberta com recompensa crescente por sequência de abates.",
    reward: "Maior score · VSCOIN",
    times: ["09:00", "15:00", "21:30"],
  },
];

type Next = { date: Date; time: string };

function nextRun(times: string[], now: Date): Next {
  let best: Next | null = null;
  for (let day = 0; day <= 1; day++) {
    for (const t of times) {
      const [h, m] = t.split(":").map(Number);
      const d = new Date(now);
      d.setDate(now.getDate() + day);
      d.setHours(h, m, 0, 0);
      if (d.getTime() > now.getTime() && (!best || d < best.date)) {
        best = { date: d, time: t };
      }
    }
  }
  // fallback (não deveria ocorrer): primeiro horário de amanhã
  if (!best) {
    const [h, m] = times[0].split(":").map(Number);
    const d = new Date(now);
    d.setDate(now.getDate() + 1);
    d.setHours(h, m, 0, 0);
    best = { date: d, time: times[0] };
  }
  return best;
}

function fmtDiff(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Badge compacto p/ a faixa de status (nome do próximo evento + countdown). */
export function NextEventBadge() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <span className="text-[var(--color-parchment)]">—</span>;
  }
  const upcoming = EVENTS.map((e) => ({ e, n: nextRun(e.times, now) })).sort(
    (a, b) => a.n.date.getTime() - b.n.date.getTime()
  )[0];
  return (
    <span className="tabular-nums">
      <span className="text-[var(--color-gold-bright)]">{upcoming.e.key}</span>
      <span className="mx-1.5 text-[var(--color-faint)]">·</span>
      <span className="text-[var(--color-parchment)]">
        {fmtDiff(upcoming.n.date.getTime() - now.getTime())}
      </span>
    </span>
  );
}

/** Chips compactos de eventos (estilo Stitch/russo): icone + nome + próx. corrida + countdown. */
export default function EventsLive() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextKey = now
    ? EVENTS.map((e) => ({ key: e.key, n: nextRun(e.times, now) })).sort(
        (a, b) => a.n.date.getTime() - b.n.date.getTime()
      )[0].key
    : null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {EVENTS.map((e) => {
        const next = now ? nextRun(e.times, now) : null;
        const isNext = e.key === nextKey;
        return (
          <div
            key={e.key}
            title={e.desc}
            className={`panel flex items-center gap-3 rounded-sm px-4 py-3 transition-all duration-300 ${
              isNext
                ? "border-[rgba(201,162,75,0.55)] shadow-[0_0_22px_rgba(201,162,75,0.10)]"
                : "hover:border-[rgba(201,162,75,0.35)]"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[rgba(201,162,75,0.3)] bg-[rgba(201,162,75,0.06)] text-lg text-[var(--color-gold-bright)]">
              {e.icon}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--color-parchment)]">
                {e.name}
                {isNext && (
                  <span className="ml-2 rounded-sm border border-[rgba(201,162,75,0.5)] px-1.5 py-px text-[0.55rem] uppercase tracking-[0.15em] text-[var(--color-gold-bright)] align-middle">
                    Próximo
                  </span>
                )}
              </div>
              <div className="mt-0.5 truncate text-xs tabular-nums text-[var(--color-muted)]">
                {next ? (
                  <>
                    <span className="text-[var(--color-gold-bright)]">{next.time}</span>
                    {" · "}
                    <span>{fmtDiff(next.date.getTime() - now!.getTime())} restante</span>
                  </>
                ) : (
                  "Diário · 3x ao dia"
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
