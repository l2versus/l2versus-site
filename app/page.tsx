import Image from "next/image";
import Link from "next/link";
import EventsLive, { NextEventBadge } from "./_home/EventsLive";
import ParallaxFx from "./_home/ParallaxFx";
import SequenciaScrub from "@/components/media/SequenciaScrub";
import NavPrincipal from "@/components/site/NavPrincipal";
import ScrollFx from "./_home/ScrollFx";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { topByPvp, onlineCount } from "@/lib/repos/rankings";
import { discordStats } from "@/lib/discord";
import { getT, getLocale } from "@/lib/i18n/server";
import { DISCORD_URL, INSTAGRAM_URL } from "@/lib/links";

// A landing lê online e rankings do banco em request-time (nunca no build).
export const dynamic = "force-dynamic";

/* ==== Layout portado do Stitch (L2 Versus Landing — Obsidiana & Ouro) ==== */

const NF_LOCALE: Record<string, string> = {
  pt: "pt-BR",
  en: "en-GB",
  ru: "ru-RU",
  pl: "pl-PL",
};

function DiamondRule() {
  return (
    <div className="diamond-rule mx-auto max-w-3xl px-6 py-10">
      <span className="dia" />
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 data-split className="font-display text-2xl tracking-[0.08em] text-[var(--color-gold-bright)] drop-shadow-md md:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-sm text-[var(--color-muted)] md:text-base">{sub}</p>}
    </div>
  );
}

function Medal({ rank }: { rank: number }) {
  const c = rank === 1 ? "#f0d488" : rank === 2 ? "#cfcfcf" : rank === 3 ? "#c9885b" : "";
  if (rank > 3) return <span className="font-display text-sm text-[var(--color-faint)]">{rank}</span>;
  return (
    <span className="inline-grid h-6 w-6 place-items-center rounded-full font-display text-xs" style={{ color: "#111", background: c, boxShadow: `0 0 10px ${c}55` }}>
      {rank}
    </span>
  );
}

export default async function Home() {
  const [rankRows, online, discord, t, locale] = await Promise.all([
    topByPvp(7),
    onlineCount(),
    discordStats(),
    getT(),
    getLocale(),
  ]);
  const nf = NF_LOCALE[locale] ?? "pt-BR";

  const RACES = [
    t("site.race.human"),
    t("site.race.elf"),
    t("site.race.darkelf"),
    t("site.race.orc"),
    t("site.race.dwarf"),
  ];
  const raceName = (r: number) => RACES[r] ?? "—";

  const RATES = [
    { label: t("site.rates.exp"), value: "x7", tone: "gold" },
    { label: t("site.rates.sp"), value: "x7", tone: "gold" },
    { label: t("site.rates.adena"), value: "x7", tone: "parchment" },
    { label: t("site.rates.drop"), value: "x7", tone: "parchment" },
    { label: t("site.rates.spoil"), value: "x7", tone: "parchment" },
    { label: t("site.rates.quest"), value: "x7", tone: "deep" },
  ];

  const RECURSOS = [
    { label: t("site.feat.custom"), icon: "⚔", slug: "itens-custom" },
    { label: t("site.feat.autofarm"), icon: "⟳", slug: "auto-farm" },
    { label: t("site.feat.offline"), icon: "⌂", slug: "offline-shops" },
    { label: t("site.feat.dressme"), icon: "✦", slug: "dressme" },
    { label: t("site.feat.gmshop"), icon: "◆", slug: "gm-shop" },
    { label: t("site.feat.antibot"), icon: "⛨", slug: "anti-bot" },
    { label: t("site.feat.oly"), icon: "♛", slug: "olympiada" },
    { label: t("site.feat.siege"), icon: "⚑", slug: "cercos" },
  ];

  const NEWS = [
    { date: "05 JUL", title: t("site.news.1.title"), excerpt: t("site.news.1.excerpt") },
    { date: "02 JUL", title: t("site.news.2.title"), excerpt: t("site.news.2.excerpt") },
    { date: "28 JUN", title: t("site.news.3.title"), excerpt: t("site.news.3.excerpt") },
  ];

  const ladder = rankRows.map((r, idx) => ({
    rank: idx + 1,
    name: r.char_name,
    cls: raceName(r.race),
    lvl: r.level,
    clan: r.clan_name ?? "—",
    pvp: r.pvpkills,
  }));

  return (
    <main className="min-h-screen overflow-x-clip">
      <ScrollFx />
      <ParallaxFx />
      <div className="grain" aria-hidden />
      {/* ===== HEADER 2 ANDARES (padrão RU: faixa utilitária + nav principal) ===== */}
      <div className="sticky top-0 z-50 border-b border-[rgba(78,70,55,0.35)]">
        {/* faixa utilitária */}
        <div className="border-b border-[rgba(78,70,55,0.25)] bg-[#0a090c]">
          <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-[0.62rem] uppercase tracking-[0.18em] md:px-6">
            <div className="flex items-center gap-4 text-[var(--color-faint)]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ec26a]" />
                <span className="text-[#5ec26a] tabular-nums">{online.toLocaleString(nf)} {t("site.online_suffix")}</span>
              </span>
              <span className="hidden text-[var(--color-line)] sm:inline">|</span>
              <span className="hidden text-[var(--color-muted)] sm:inline">{t("site.region")}</span>
            </div>
            <div className="flex items-center gap-4">
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)] sm:flex">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3c-.2.4-.5.9-.6 1.3a18.3 18.3 0 0 0-5.5 0C9.1 3.9 8.8 3.4 8.6 3a19.7 19.7 0 0 0-4.9 1.5A20.4 20.4 0 0 0 .2 18.1a19.9 19.9 0 0 0 6 3c.5-.7.9-1.4 1.3-2.1-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1 .4.7.8 1.5 1.3 2.1a19.8 19.8 0 0 0 6-3A20.3 20.3 0 0 0 20.3 4.4ZM8 15.3c-1.2 0-2.1-1-2.1-2.3S6.8 10.7 8 10.7s2.2 1 2.1 2.3c0 1.2-.9 2.3-2.1 2.3Zm8 0c-1.2 0-2.1-1-2.1-2.3s.9-2.3 2.1-2.3 2.2 1 2.1 2.3c0 1.2-.9 2.3-2.1 2.3Z"/></svg>
                Discord
              </a>
              <Link href="/dashboard" className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]">{t("site.panel")}</Link>
              <LanguageSwitcher current={locale} compact />
            </div>
          </div>
        </div>
        {/* nav principal — client component: drawer mobile, compactação no
            scroll e filete que segue o cursor. Os rótulos vêm traduzidos
            daqui (server) para o i18n continuar server-side. */}
        <NavPrincipal
          itens={[
            { href: "/", rotulo: t("site.nav.home") },
            { href: "#eventos", rotulo: t("site.nav.events"), ancora: true },
            { href: "/wiki", rotulo: t("site.nav.wiki"), destaque: true },
            { href: "/rankings", rotulo: t("site.nav.ranking") },
            { href: "/streams", rotulo: t("site.nav.streams") },
            { href: "/donate", rotulo: t("site.nav.shop") },
            { href: "/download", rotulo: t("site.nav.download") },
          ]}
          entrar={t("site.login")}
          jogar={t("site.play_now")}
          menuRotulo={t("site.nav.menu")}
          fecharRotulo={t("site.nav.close")}
        />
      </div>

      {/* ===== HERO full-bleed (arte = background, zero moldura, zero espaço morto) ===== */}
      <header className="relative w-full overflow-hidden border-b border-[rgba(78,70,55,0.3)]">
        {/* camadas de fundo: cena viva (Ken Burns) + rays + brasas */}
        <div className="absolute inset-0">
          {/* cena com sangria vertical: desliza no scroll sem mostrar borda */}
          <div data-plx="10" className="absolute inset-x-0 -inset-y-[16%]">
            <Image src="/art/scene-siege.png" alt="" fill priority sizes="100vw" className="kenburns object-cover object-[center_28%] opacity-45 [filter:saturate(1.3)_contrast(1.08)]" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_75%_at_74%_60%,rgba(201,162,75,0.20),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_108%,rgba(255,150,60,0.14),transparent_65%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-abyss)] via-[rgba(7,7,10,0.5)] to-[rgba(7,7,10,0.2)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-abyss)] via-transparent to-[rgba(7,7,10,0.5)]" />
          <div className="god-rays" />
          <div className="embers" />
        </div>
        {/* cavaleiro RECORTADO de verdade (isnet, fundo transparente — espada inteira, sem watermark) */}
        <div data-plx="6" data-hero-knight className="pointer-events-none absolute bottom-0 right-0 hidden h-full items-end pr-[1vw] md:flex">
          <Image
            src="/art/knight-cut.png"
            alt=""
            width={966}
            height={768}
            priority
            className="h-[86%] w-auto object-contain object-bottom [mask-image:linear-gradient(to_top,transparent_1%,#000_12%)] drop-shadow-[0_0_55px_rgba(255,140,50,0.22)]"
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-center px-4 py-14 md:min-h-[68vh] md:px-6 md:py-16">
          <div data-plx="-7" className="max-w-xl text-center md:text-left">
            <span className="reveal flex items-center justify-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.3em] text-[var(--color-gold-bright)] md:justify-start" style={{ animationDelay: "0.05s" }}>
              <span className="hidden h-px w-4 bg-[var(--color-gold-bright)] md:inline-block" />
              {t("site.hero.kicker")}
            </span>
            <h1 className="reveal mt-6" style={{ animationDelay: "0.15s" }}>
              <span className="sr-only">L2 Versus</span>
              <BrandLogo priority className="mx-auto w-[min(80vw,420px)] md:mx-0 md:w-[430px]" />
            </h1>
            <p className="reveal mx-auto mt-6 max-w-md text-base leading-relaxed text-[var(--color-muted)] md:mx-0 md:text-lg" style={{ animationDelay: "0.3s" }}>
              {t("site.hero.desc")}
            </p>
            {/* chips de info (padrão RU: crônica/rate/abertura) */}
            <div className="reveal mt-6 flex flex-wrap items-center justify-center gap-2 md:justify-start" style={{ animationDelay: "0.4s" }}>
              {["High Five", "EXP x7", t("site.hero.chip_events"), t("site.hero.chip_nowipe")].map((c) => (
                <span key={c} className="rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.06)] px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-[var(--color-gold-bright)]">
                  {c}
                </span>
              ))}
            </div>
            <div className="reveal mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start" style={{ animationDelay: "0.5s" }}>
              <Link href="/register" className="btn-gold px-8 py-4 text-sm">⚔ {t("site.hero.play")}</Link>
              <Link href="/download" className="btn-ghost px-8 py-4 text-sm">{t("site.hero.download")}</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== FAIXA DE STATUS =====
          Quatro leituras do servidor em quatro celas iguais. A versão antiga
          era um flex com espaço distribuído: no desktop os valores ficavam
          soltos e no celular quebravam em pilha desalinhada, com as
          divisórias sumindo. Agora é grade — 2 colunas no celular, 4 a partir
          do tablet —, cada cela com a mesma estrutura (rótulo em cima, valor
          embaixo) e separada por losango, que é a pontuação do códice.
          A cela do evento é a única acionável, e por isso é a única que
          acende: é a informação com prazo. */}
      <section className="faixa-status">
        <div className="faixa-brilho" aria-hidden />
        <div data-cine-group="rise" className="relative mx-auto grid max-w-6xl grid-cols-2 px-4 md:grid-cols-4 md:px-6">
          <div className="cela-status">
            <span className="cela-rotulo">{t("site.status.server")}</span>
            <span className="cela-valor flex items-center gap-2.5">
              <span className="pulso-online" aria-hidden />
              <span className="text-[#5ec26a]">{t("site.status.online")}</span>
            </span>
          </div>

          <div className="cela-status">
            <span className="cela-rotulo">{t("site.status.players")}</span>
            <span data-count={online} className="cela-valor cela-numero">
              {online.toLocaleString(nf)}
            </span>
          </div>

          <div className="cela-status">
            <span className="cela-rotulo">{t("site.status.chronicle")}</span>
            <span className="cela-valor text-[var(--color-gold-bright)]">High Five</span>
          </div>

          <div className="cela-status cela-status-quente">
            <span className="cela-rotulo">{t("site.status.next")}</span>
            <span className="cela-valor cela-numero text-[var(--color-crimson)]">
              <NextEventBadge />
            </span>
          </div>
        </div>
      </section>

      {/* ===== TAXAS (Stitch: headline central + 6 cards) ===== */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <SectionHead title={t("site.rates.title")} sub={t("site.rates.sub")} />
        <div data-plx="6" data-cine-group="alt-x" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {RATES.map((r) => (
            <div key={r.label} className="panel tile-shine group relative flex min-h-[110px] flex-col items-center justify-center overflow-hidden rounded-sm border-[rgba(78,70,55,0.5)] p-4 transition-colors hover:border-[rgba(240,212,136,0.5)] md:min-h-[120px]">
              <div className="mb-1 text-[0.6rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">{r.label}</div>
              <div className={`font-display text-3xl transition-transform group-hover:scale-110 ${r.tone === "gold" ? "text-[var(--color-gold-bright)]" : r.tone === "deep" ? "text-[var(--color-gold)]" : "text-[var(--color-parchment)]"}`}>
                {r.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <DiamondRule />

      {/* ===== EVENTOS ===== */}
      <section id="eventos" className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
        <SectionHead title={t("site.events.title")} sub={t("site.events.sub")} />
        <div data-plx="-6" data-cine-group="rise" data-cine-depth="2">
          <EventsLive />
        </div>
      </section>

      <DiamondRule />

      {/* ===== BANNER CINEMATOGRÁFICO PINADO (cena presa: bg dá zoom, raças varrem, título cresce) ===== */}
      <section data-races-pin className="relative flex h-[320px] w-full items-center justify-center overflow-hidden border-y border-[rgba(78,70,55,0.5)] md:h-[72vh] md:min-h-[420px]">
        <div data-races-bg className="absolute inset-x-0 -inset-y-[10%]">
          <div
            className="kenburns absolute inset-0 bg-cover bg-center opacity-70 [filter:saturate(1.25)_contrast(1.06)]"
            style={{ backgroundImage: "url('/art/stitch-banner.png')" }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-abyss)] via-transparent to-[var(--color-abyss)]" />
        <div className="embers" />
        {/* faixa gigante de raças varrendo atrás do título durante o pin */}
        <div
          data-races-strip
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[16vh] leading-none tracking-[0.08em] text-transparent opacity-[0.13] [-webkit-text-stroke:1.5px_#c9a24b]"
        >
          {t("site.races.strip")}
        </div>
        <div className="relative z-10 px-4 text-center">
          <h2 data-races-title className="font-display text-3xl tracking-[0.06em] text-[var(--color-gold-bright)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] md:text-5xl">
            {t("site.races.title")}
          </h2>
          <p data-races-sub className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-parchment)] md:text-lg">
            {t("site.races.sub")}
          </p>
        </div>
      </section>

      {/* ===== RECURSOS ===== */}
      {/* pb generoso: o corte diagonal do pergaminho invade -3.5vw + deriva do parallax */}
      <section className="mx-auto max-w-6xl px-4 pb-28 pt-12 md:px-6 md:pb-36 md:pt-16">
        <SectionHead title={t("site.features.title")} sub={t("site.features.sub")} />
        <div data-plx="4" data-cine-group="pop" className="grid grid-cols-4 gap-3 lg:grid-cols-8">
          {RECURSOS.map((r) => (
            <Link key={r.label} href={`/recursos#${r.slug}`} className="panel tile-shine group flex flex-col items-center gap-2.5 rounded-sm px-2 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(240,212,136,0.5)] hover:shadow-[0_10px_30px_-12px_rgba(201,162,75,0.35)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-[rgba(201,162,75,0.3)] bg-[rgba(201,162,75,0.06)] text-xl text-[var(--color-gold-bright)] transition-transform duration-300 group-hover:scale-110">{r.icon}</span>
              <span className="text-[0.6rem] uppercase tracking-wide text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-parchment)]">{r.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== ZONA PERGAMINHO (corte diagonal, claro × escuro): RANKINGS + ECONOMIA + NOTÍCIAS ===== */}
      <section className="zone-parchment cut-both">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:px-6 lg:grid-cols-[1.5fr_1fr]">
          <div data-plx="-4" data-cine="left" className="min-w-0">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="sec-title">{t("site.rank.title")}</h2>
              <Link href="/rankings" className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-gold)] hover:text-[var(--color-gold-bright)]">{t("site.rank.viewall")}</Link>
            </div>
            <div className="panel overflow-hidden rounded-sm p-0">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-4 py-3">
                <span className="font-display text-sm tracking-[0.2em] text-[var(--color-gold-bright)]">{t("site.rank.top_pvp")}</span>
                <div className="flex gap-3 text-[0.65rem] uppercase tracking-[0.15em] text-[var(--color-faint)]">
                  <span className="text-[var(--color-gold-bright)]">{t("site.rank.pvp")}</span><span>{t("site.rank.pk")}</span><span>{t("site.rank.clans")}</span><span className="hidden sm:inline">{t("site.rank.heroes")}</span>
                </div>
              </div>

              {/* Mobile: lista em cards (sem scroll lateral) */}
              <ul className="sm:hidden">
                {ladder.length === 0 ? (
                  <li className="border-t border-[var(--color-line)] px-4 py-5 text-center text-xs text-[var(--color-muted)]">{t("site.rank.empty")}</li>
                ) : ladder.map((p, i) => (
                  <li key={p.name} className={`flex items-center gap-3 border-t border-[var(--color-line)] px-4 py-3 ${i % 2 ? "bg-[rgba(255,255,255,0.012)]" : ""}`}>
                    <Medal rank={p.rank} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-[var(--color-gold-bright)]">{p.name}</div>
                      <div className="mt-0.5 text-[0.7rem] text-[var(--color-muted)]">{p.cls} · Lv {p.lvl}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display tabular-nums leading-none text-[var(--color-parchment)]">{p.pvp.toLocaleString(nf)}</div>
                      <div className="mt-1 text-[0.58rem] uppercase tracking-[0.15em] text-[var(--color-faint)]">{t("site.rank.pvp")}</div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* ≥sm: tabela completa */}
              <table className="hidden w-full text-left text-sm sm:table">
                <tbody>
                  {ladder.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-5 text-center text-xs text-[var(--color-muted)]">{t("site.rank.empty")}</td></tr>
                  ) : ladder.map((p, i) => (
                    <tr key={p.name} className={`border-t border-[var(--color-line)] transition-colors hover:bg-[rgba(201,162,75,0.05)] ${i % 2 ? "bg-[rgba(255,255,255,0.012)]" : ""}`}>
                      <td className="w-12 px-4 py-2.5"><Medal rank={p.rank} /></td>
                      <td className="px-3 py-2.5 font-semibold text-[var(--color-gold-bright)]">{p.name}</td>
                      <td className="px-3 py-2.5 text-xs text-[var(--color-muted)]">{p.cls}</td>
                      <td className="hidden px-3 py-2.5 text-xs text-[var(--color-muted)] md:table-cell">{p.clan}</td>
                      <td className="px-3 py-2.5 text-center text-xs text-[var(--color-parchment)]">{p.lvl}</td>
                      <td className="px-4 py-2.5 text-right font-display tabular-nums text-[var(--color-parchment)]">{p.pvp.toLocaleString(nf)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div data-plx="5" data-cine="right" className="flex min-w-0 flex-col gap-8">
            <div>
              <h2 className="sec-title mb-5">{t("site.eco.title")}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href="/donate" className="panel panel-gold group flex items-center gap-4 rounded-sm px-4 py-4 transition-transform hover:-translate-y-1 sm:flex-col sm:gap-0 sm:py-6 sm:text-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.08)] text-xl text-[var(--color-gold-bright)] sm:mb-3">◆</span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm tracking-[0.12em] text-[var(--color-gold-bright)]">{t("site.eco.shop")}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--color-muted)] sm:mt-2">{t("site.eco.shop_desc")}</span>
                  </span>
                </Link>
                <Link href="/login" className="panel group relative flex items-center gap-4 rounded-sm px-4 py-4 transition-transform hover:-translate-y-1 sm:flex-col sm:gap-0 sm:py-6 sm:text-center">
                  <span className="absolute right-2 top-2 rounded-sm border border-[rgba(201,162,75,0.5)] px-1.5 py-px text-[0.55rem] uppercase tracking-[0.15em] text-[var(--color-gold-bright)]">{t("site.eco.new")}</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.08)] text-xl text-[var(--color-gold-bright)] sm:mb-3">⇄</span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm tracking-[0.12em] text-[var(--color-gold-bright)]">{t("site.eco.rmt")}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--color-muted)] sm:mt-2">{t("site.eco.rmt_desc")}</span>
                  </span>
                </Link>
              </div>
            </div>
            <div>
              <h2 className="sec-title mb-5">{t("site.news.title")}</h2>
              <div className="flex flex-col gap-3">
                {NEWS.map((n) => (
                  <article key={n.title} className="panel group rounded-sm px-4 py-3 transition-all hover:border-[rgba(201,162,75,0.5)]">
                    <span className="font-display text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-gold)]">{n.date}</span>
                    <h3 className="mt-1 text-sm font-semibold text-[var(--color-parchment)]">{n.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{n.excerpt}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RMT CINEMÁTICO: o clipe da elfa, quadro a quadro no scroll =====
          O scroll é o controle do tempo: a moeda de PvP vira a comparação
          RMT-externo × RMT-plataforma (texto queimado no próprio vídeo) e
          termina no "Saque Realizado". As legendas ficam no terço de baixo
          para nunca brigar com os cartões do quadro. */}
      <SequenciaScrub pasta="/seq/mercado" quadros={48} modo="heroi" alturaVh={260}>
        <div className="ss-cap ss-cap-baixo" data-de="0" data-ate="0.3">
          <p className="text-[0.66rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">{t("site.eco.rmt")}</p>
          <p className="mt-3 font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">{t("site.cine.rmt1")}</p>
        </div>
        <div className="ss-cap ss-cap-baixo" data-de="0.3" data-ate="0.68">
          <p className="font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">{t("site.cine.rmt2")}</p>
          <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-[var(--color-muted)] [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">{t("site.cine.rmt2d")}</p>
        </div>
        <div className="ss-cap ss-cap-baixo" data-de="0.68" data-ate="1">
          <p className="font-display text-2xl leading-snug text-[var(--color-parchment)] [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] md:text-4xl">{t("site.cine.rmt3")}</p>
          <Link href="/login" className="btn-gold mt-6 px-7 py-3 text-xs">{t("site.cine.cta")}</Link>
        </div>
      </SequenciaScrub>

      {/* ===== COMUNIDADE + DOWNLOAD ===== */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div data-cine-group="tilt" className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <div className="panel flex flex-col justify-between rounded-sm p-6">
            <div>
              <h2 className="sec-title mb-3">{t("site.comm.title")}</h2>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">{t("site.comm.desc")}</p>
              {discord && (
                <div className="mt-4 flex items-center gap-5">
                  <div><div className="font-display text-xl text-[var(--color-gold-bright)]">{discord.online.toLocaleString(nf)}</div><div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">{t("site.comm.online")}</div></div>
                  <div className="h-7 w-px bg-[var(--color-line)]" />
                  <div><div className="font-display text-xl text-[var(--color-parchment)]">{discord.members.toLocaleString(nf)}</div><div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">{t("site.comm.members")}</div></div>
                </div>
              )}
            </div>
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-gold mt-5 self-start px-5 py-2.5 text-xs">{t("site.comm.join")}</a>
          </div>
          <div className="panel panel-gold relative overflow-hidden rounded-sm p-6">
            <div data-plx="8" className="pointer-events-none absolute -right-6 bottom-0 hidden opacity-60 md:block">
              <Image src="/art/char-darkelf.png" alt="" width={210} height={320} className="h-[230px] w-auto object-contain [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_40%,transparent_85%)]" />
            </div>
            <div className="relative md:max-w-[70%]">
              <h2 className="sec-title mb-3">{t("site.steps.title")}</h2>
              <ol className="space-y-2.5">
                {[
                  { n: 1, t: t("site.steps.1") },
                  { n: 2, t: t("site.steps.2") },
                  { n: 3, t: t("site.steps.3") },
                ].map((s) => (
                  <li key={s.n} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-[rgba(201,162,75,0.4)] font-display text-xs text-[var(--color-gold-bright)]">{s.n}</span>
                    <span className="text-sm text-[var(--color-parchment)]">{s.t}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex gap-3">
                <Link href="/download" className="btn-gold px-5 py-2.5 text-xs">{t("site.steps.dl")}</Link>
                <Link href="/register" className="btn-ghost px-5 py-2.5 text-xs">{t("site.steps.acc")}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER (Stitch: 2 colunas, links sublinhados) ===== */}
      <footer className="border-t border-[rgba(78,70,55,0.6)] bg-[#0b0a0d] py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 md:px-6">
          <div className="flex flex-col gap-4">
            <BrandLogo className="w-[130px]" />
            <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[var(--color-faint)]">
              © {new Date().getFullYear()} L2 Versus — {t("site.footer.rights")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 md:justify-end">
            {[
              { t: t("site.footer.support"), h: DISCORD_URL, ext: true },
              { t: "Discord", h: DISCORD_URL, ext: true },
              { t: "Instagram", h: INSTAGRAM_URL, ext: true },
              { t: t("site.nav.rankings"), h: "/rankings", ext: false },
              { t: t("site.nav.download"), h: "/download", ext: false },
              { t: t("site.panel"), h: "/dashboard", ext: false },
            ].map((l) =>
              l.ext ? (
                <a key={l.t} href={l.h} target="_blank" rel="noopener noreferrer" className="text-[0.68rem] uppercase tracking-[0.15em] text-[var(--color-muted)] underline underline-offset-4 opacity-80 transition-opacity hover:text-[var(--color-gold-bright)] hover:opacity-100">
                  {l.t}
                </a>
              ) : (
                <Link key={l.t} href={l.h} className="text-[0.68rem] uppercase tracking-[0.15em] text-[var(--color-muted)] underline underline-offset-4 opacity-80 transition-opacity hover:text-[var(--color-gold-bright)] hover:opacity-100">
                  {l.t}
                </Link>
              )
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
