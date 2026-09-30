import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getT } from "@/lib/i18n/server";
import {
  approvedStreamers,
  twitchIsLive,
  type StreamerRow,
} from "@/lib/repos/streams";

// Lista de streamers vem do banco + status live da Twitch em request-time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Streams — L2 Versus",
  description:
    "Assista quem está transmitindo L2 Versus ao vivo na Twitch, YouTube e Kick — e conecte seu próprio canal.",
};

/** Domínios que a Twitch aceita como parent do player embutido. */
const TWITCH_PARENTS = ["l2versus.com", "www.l2versus.com"];

const PLATFORM_LABEL: Record<string, string> = {
  twitch: "Twitch",
  youtube: "YouTube",
  kick: "Kick",
  trovo: "Trovo",
};

const PLATFORM_COLOR: Record<string, string> = {
  twitch: "#9146FF",
  youtube: "#FF0000",
  kick: "#53FC18",
  trovo: "#1FBF66",
};

function embedSrc(s: StreamerRow): string | null {
  const ch = encodeURIComponent(s.channel.replace(/^@/, ""));
  if (s.platform === "twitch") {
    const parents = TWITCH_PARENTS.map((p) => `parent=${p}`).join("&");
    return `https://player.twitch.tv/?channel=${ch}&${parents}&muted=true&autoplay=true`;
  }
  if (s.platform === "kick") return `https://player.kick.com/${ch}?muted=true&autoplay=true`;
  if (s.platform === "youtube" && s.channel.startsWith("UC"))
    return `https://www.youtube.com/embed/live_stream?channel=${ch}&mute=1`;
  return null; // youtube por @handle / trovo: card com link
}

export default async function StreamsPage() {
  const [t, rows] = await Promise.all([getT(), approvedStreamers()]);

  // Status live só para Twitch (API pública). Demais plataformas: sem badge.
  const liveMap = new Map<number, boolean>();
  await Promise.all(
    rows
      .filter((r) => r.platform === "twitch")
      .map(async (r) => liveMap.set(r.id, await twitchIsLive(r.channel)))
  );

  // Ao vivo primeiro.
  const sorted = [...rows].sort(
    (a, b) => Number(liveMap.get(b.id) ?? false) - Number(liveMap.get(a.id) ?? false)
  );

  return (
    <main className="min-h-screen">
      <SiteHeader />

      {/* HERO curto */}
      <section className="relative overflow-hidden border-b border-[rgba(78,70,55,0.3)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_-10%,rgba(201,162,75,0.14),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-16">
          <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            <span className="block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-crimson)]" />
            {t("site.st.kicker")}
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-[0.06em] text-glow-gold md:text-5xl">
            {t("site.st.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
            {t("site.st.desc")}
          </p>
        </div>
      </section>

      {/* GRID DE STREAMS */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {sorted.length === 0 ? (
          <div className="panel flex flex-col items-center gap-4 rounded-sm px-6 py-20 text-center">
            <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]" />
            <p className="max-w-md text-[var(--color-muted)]">{t("site.st.empty")}</p>
            <Link href="/streams/connect" className="btn-gold mt-2 px-6 py-3 text-xs">
              {t("site.st.cta_btn")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {sorted.map((s) => {
              const live = liveMap.get(s.id) ?? false;
              const src = embedSrc(s);
              const color = PLATFORM_COLOR[s.platform];
              return (
                <article
                  key={s.id}
                  className={`panel overflow-hidden rounded-sm transition-colors ${
                    live ? "border-[rgba(200,67,59,0.6)]" : ""
                  }`}
                >
                  {/* player / capa */}
                  {src ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={src}
                        title={`${PLATFORM_LABEL[s.platform]} — ${s.channel}`}
                        allowFullScreen
                        allow="autoplay; fullscreen"
                        className="h-full w-full border-0"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex aspect-video w-full items-center justify-center bg-[var(--color-abyss)] transition-colors hover:bg-[rgba(201,162,75,0.05)]"
                    >
                      <span
                        className="font-display text-2xl tracking-[0.15em]"
                        style={{ color }}
                      >
                        {PLATFORM_LABEL[s.platform]}
                      </span>
                    </a>
                  )}
                  {/* rodapé do card */}
                  <div className="flex items-center justify-between gap-3 border-t border-[var(--color-line)] px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-[var(--color-parchment)]">
                        {s.channel.replace(/^@/, "")}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em]">
                        <span style={{ color }}>{PLATFORM_LABEL[s.platform]}</span>
                        {s.platform === "twitch" &&
                          (live ? (
                            <span className="flex items-center gap-1 text-[var(--color-crimson)]">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-crimson)]" />
                              {t("site.st.live")}
                            </span>
                          ) : (
                            <span className="text-[var(--color-faint)]">{t("site.st.offline")}</span>
                          ))}
                      </div>
                    </div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost shrink-0 px-4 py-2 text-[0.65rem]"
                    >
                      {t("site.st.watch")} ↗
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA STREAMER */}
      <section className="border-t border-[var(--color-line)] bg-[rgba(201,162,75,0.04)]">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-12 text-center md:px-6">
          <h2 className="font-display text-2xl tracking-[0.08em] text-[var(--color-parchment)] md:text-3xl">
            {t("site.st.cta_title")}
          </h2>
          <p className="max-w-xl text-sm text-[var(--color-muted)]">{t("site.st.cta_desc")}</p>
          <Link href="/streams/connect" className="btn-gold px-8 py-3.5 text-sm">
            📺 {t("site.st.cta_btn")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
