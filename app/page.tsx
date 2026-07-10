import Image from "next/image";
import Link from "next/link";
import EventsLive, { NextEventBadge } from "./_home/EventsLive";
import ParallaxFx from "./_home/ParallaxFx";
import ScrollFx from "./_home/ScrollFx";
import BrandLogo from "@/components/BrandLogo";

/* ==== Layout portado do Stitch (L2 Versus Landing — Obsidiana & Ouro) ==== */

const RATES = [
  { label: "EXPERIÊNCIA", value: "x100", tone: "gold" },
  { label: "SKILL POINTS", value: "x100", tone: "gold" },
  { label: "ADENA", value: "x1", tone: "parchment" },
  { label: "ITEM DROP", value: "x1", tone: "parchment" },
  { label: "SPOIL", value: "x1", tone: "parchment" },
  { label: "QUEST DROP", value: "x3", tone: "deep" },
];

const RECURSOS = [
  { label: "Itens Custom", icon: "⚔", slug: "itens-custom" },
  { label: "Auto-Farm", icon: "⟳", slug: "auto-farm" },
  { label: "Offline Shops", icon: "⌂", slug: "offline-shops" },
  { label: "DressMe", icon: "✦", slug: "dressme" },
  { label: "GM Shop", icon: "◆", slug: "gm-shop" },
  { label: "Anti-Bot", icon: "⛨", slug: "anti-bot" },
  { label: "Olympíada", icon: "♛", slug: "olympiada" },
  { label: "Cercos", icon: "⚑", slug: "cercos" },
];

const LADDER = [
  { rank: 1, name: "ManeLRuuLeZ", cls: "Duelist", lvl: 85, clan: "Versus", pvp: 1420 },
  { rank: 2, name: "Kyrios", cls: "Sagittarius", lvl: 85, clan: "Nemesis", pvp: 1287 },
  { rank: 3, name: "Seraphina", cls: "Cardinal", lvl: 84, clan: "Aeon", pvp: 1104 },
  { rank: 4, name: "Draukoth", cls: "Titan", lvl: 85, clan: "Versus", pvp: 989 },
  { rank: 5, name: "Nyxaria", cls: "Storm Screamer", lvl: 84, clan: "Nemesis", pvp: 902 },
  { rank: 6, name: "Vandheer", cls: "Adventurer", lvl: 83, clan: "Aeon", pvp: 861 },
  { rank: 7, name: "Ishtar", cls: "Mystic Muse", lvl: 83, clan: "Versus", pvp: 794 },
];

const NEWS = [
  { date: "05 JUL", title: "Abertura do Servidor", excerpt: "Grand opening com EXP em dobro na primeira semana." },
  { date: "02 JUL", title: "RMT Market no ar", excerpt: "Venda itens por dinheiro real. Casa retém só 12%." },
  { date: "28 JUN", title: "Balance Dynasty/Vesper", excerpt: "Ajustes finos para PvP competitivo sem P2W." },
];

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

export default function Home() {
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
                <span className="text-[#5ec26a] tabular-nums">1.248 online</span>
              </span>
              <span className="hidden text-[var(--color-line)] sm:inline">|</span>
              <span className="hidden text-[var(--color-muted)] sm:inline">Interlude+ · GMT-3</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hidden items-center gap-1.5 text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)] sm:flex">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3c-.2.4-.5.9-.6 1.3a18.3 18.3 0 0 0-5.5 0C9.1 3.9 8.8 3.4 8.6 3a19.7 19.7 0 0 0-4.9 1.5A20.4 20.4 0 0 0 .2 18.1a19.9 19.9 0 0 0 6 3c.5-.7.9-1.4 1.3-2.1-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1 .4.7.8 1.5 1.3 2.1a19.8 19.8 0 0 0 6-3A20.3 20.3 0 0 0 20.3 4.4ZM8 15.3c-1.2 0-2.1-1-2.1-2.3S6.8 10.7 8 10.7s2.2 1 2.1 2.3c0 1.2-.9 2.3-2.1 2.3Zm8 0c-1.2 0-2.1-1-2.1-2.3s.9-2.3 2.1-2.3 2.2 1 2.1 2.3c0 1.2-.9 2.3-2.1 2.3Z"/></svg>
                Discord
              </a>
              <Link href="/dashboard" className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]">Painel</Link>
              <span className="text-[var(--color-faint)]">PT · <span className="opacity-60">EN</span></span>
            </div>
          </div>
        </div>
        {/* nav principal */}
        <nav className="bg-[rgba(8,7,10,0.85)] backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-[4.2rem] md:px-6">
            <Link href="/" className="flex items-center">
              <BrandLogo className="w-[100px] md:w-[118px]" priority />
            </Link>
            <ul className="hidden items-center gap-7 text-xs uppercase tracking-[0.2em] md:flex">
              <li><Link href="/" className="border-b-2 border-[var(--color-gold-bright)] pb-1 text-[var(--color-gold-bright)]">Início</Link></li>
              <li><a href="#eventos" className="px-1 py-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]">Eventos</a></li>
              <li><Link href="/rankings" className="px-1 py-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]">Ranking</Link></li>
              <li><Link href="/donate" className="px-1 py-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]">Loja</Link></li>
              <li><Link href="/download" className="px-1 py-1 text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]">Download</Link></li>
            </ul>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-ghost hidden px-4 py-2.5 text-xs md:inline-flex">Entrar</Link>
              <Link href="/register" className="btn-gold px-4 py-2.5 text-xs md:px-6 md:py-3">Jogar Agora</Link>
            </div>
          </div>
        </nav>
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
              Servidor Privado · Interlude+
            </span>
            <h1 className="reveal mt-6" style={{ animationDelay: "0.15s" }}>
              <span className="sr-only">L2 Versus</span>
              <BrandLogo priority className="mx-auto w-[min(80vw,420px)] md:mx-0 md:w-[430px]" />
            </h1>
            <p className="reveal mx-auto mt-6 max-w-md text-base leading-relaxed text-[var(--color-muted)] md:mx-0 md:text-lg" style={{ animationDelay: "0.3s" }}>
              Renasça em Aden. Empunhe lâminas forjadas na escuridão e clame seu lugar em uma guerra eterna por glória, sangue e ouro.
            </p>
            {/* chips de info (padrão RU: crônica/rate/abertura) */}
            <div className="reveal mt-6 flex flex-wrap items-center justify-center gap-2 md:justify-start" style={{ animationDelay: "0.4s" }}>
              {["Interlude+", "EXP x100", "Eventos 4x/dia", "Sem wipe"].map((c) => (
                <span key={c} className="rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.06)] px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.15em] text-[var(--color-gold-bright)]">
                  {c}
                </span>
              ))}
            </div>
            <div className="reveal mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start" style={{ animationDelay: "0.5s" }}>
              <Link href="/register" className="btn-gold px-8 py-4 text-sm">⚔ Começar a Jogar</Link>
              <Link href="/download" className="btn-ghost px-8 py-4 text-sm">Baixar o Cliente</Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== FAIXA DE STATUS (Stitch: stats grandes) ===== */}
      <section className="relative z-20 border-b border-[rgba(78,70,55,0.3)] bg-[var(--color-panel-2)] py-5 md:py-6">
        <div data-cine-group="rise" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-[#5ec26a] shadow-[0_0_10px_#5EC26A]" />
            <div>
              <div className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">Servidor</div>
              <div className="text-sm font-semibold tracking-[0.2em] text-[#5ec26a]">ONLINE</div>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-[rgba(78,70,55,0.3)] md:block" />
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">Jogadores Ativos</div>
            <div data-count="1248" className="font-display text-2xl tabular-nums text-[var(--color-parchment)] drop-shadow-md">1.248</div>
          </div>
          <div className="hidden h-8 w-px bg-[rgba(78,70,55,0.3)] md:block" />
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">Crônica</div>
            <div className="text-lg text-[var(--color-gold-bright)]">Interlude+</div>
          </div>
          <div className="hidden h-8 w-px bg-[rgba(78,70,55,0.3)] md:block" />
          <div className="text-right">
            <div className="text-[0.62rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">Próximo Evento</div>
            <div className="text-sm font-semibold text-[var(--color-crimson)]"><NextEventBadge /></div>
          </div>
        </div>
      </section>

      {/* ===== TAXAS (Stitch: headline central + 6 cards) ===== */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <SectionHead title="TAXAS DO SERVIDOR" sub="Evolução acelerada, economia clássica." />
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
        <SectionHead title="EVENTOS AUTOMÁTICOS" sub="Todos os dias, em horário do servidor — registre pelo NPC ou Community Board." />
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
          HUMANO · ELFO · ELFO NEGRO · ORC · ANÃO · KAMAEL · HUMANO · ELFO
        </div>
        <div className="relative z-10 px-4 text-center">
          <h2 data-races-title className="font-display text-3xl tracking-[0.06em] text-[var(--color-gold-bright)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] md:text-5xl">
            SEIS RAÇAS · UMA GUERRA ETERNA
          </h2>
          <p data-races-sub className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-parchment)] md:text-lg">
            Escolha sua linhagem e forje sua lenda nas terras de Aden.
          </p>
        </div>
      </section>

      {/* ===== RECURSOS ===== */}
      {/* pb generoso: o corte diagonal do pergaminho invade -3.5vw + deriva do parallax */}
      <section className="mx-auto max-w-6xl px-4 pb-28 pt-12 md:px-6 md:pb-36 md:pt-16">
        <SectionHead title="RECURSOS DO VERSUS" sub="Qualidade de vida sem quebrar o clássico." />
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
              <h2 className="sec-title">Rankings</h2>
              <Link href="/rankings" className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--color-gold)] hover:text-[var(--color-gold-bright)]">Ver tudo →</Link>
            </div>
            <div className="panel overflow-hidden rounded-sm p-0">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-4 py-3">
                <span className="font-display text-sm tracking-[0.2em] text-[var(--color-gold-bright)]">TOP PVP</span>
                <div className="flex gap-3 text-[0.65rem] uppercase tracking-[0.15em] text-[var(--color-faint)]">
                  <span className="text-[var(--color-gold-bright)]">PvP</span><span>PK</span><span>Clãs</span><span className="hidden sm:inline">Heróis</span>
                </div>
              </div>

              {/* Mobile: lista em cards (sem scroll lateral) */}
              <ul className="sm:hidden">
                {LADDER.map((p, i) => (
                  <li key={p.name} className={`flex items-center gap-3 border-t border-[var(--color-line)] px-4 py-3 ${i % 2 ? "bg-[rgba(255,255,255,0.012)]" : ""}`}>
                    <Medal rank={p.rank} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-[var(--color-gold-bright)]">{p.name}</div>
                      <div className="mt-0.5 text-[0.7rem] text-[var(--color-muted)]">{p.cls} · Lv {p.lvl}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display tabular-nums leading-none text-[var(--color-parchment)]">{p.pvp.toLocaleString("pt-BR")}</div>
                      <div className="mt-1 text-[0.58rem] uppercase tracking-[0.15em] text-[var(--color-faint)]">PvP</div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* ≥sm: tabela completa */}
              <table className="hidden w-full text-left text-sm sm:table">
                <tbody>
                  {LADDER.map((p, i) => (
                    <tr key={p.name} className={`border-t border-[var(--color-line)] transition-colors hover:bg-[rgba(201,162,75,0.05)] ${i % 2 ? "bg-[rgba(255,255,255,0.012)]" : ""}`}>
                      <td className="w-12 px-4 py-2.5"><Medal rank={p.rank} /></td>
                      <td className="px-3 py-2.5 font-semibold text-[var(--color-gold-bright)]">{p.name}</td>
                      <td className="px-3 py-2.5 text-xs text-[var(--color-muted)]">{p.cls}</td>
                      <td className="hidden px-3 py-2.5 text-xs text-[var(--color-muted)] md:table-cell">{p.clan}</td>
                      <td className="px-3 py-2.5 text-center text-xs text-[var(--color-parchment)]">{p.lvl}</td>
                      <td className="px-4 py-2.5 text-right font-display tabular-nums text-[var(--color-parchment)]">{p.pvp.toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div data-plx="5" data-cine="right" className="flex min-w-0 flex-col gap-8">
            <div>
              <h2 className="sec-title mb-5">Economia</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href="/donate" className="panel panel-gold group flex items-center gap-4 rounded-sm px-4 py-4 transition-transform hover:-translate-y-1 sm:flex-col sm:gap-0 sm:py-6 sm:text-center">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.08)] text-xl text-[var(--color-gold-bright)] sm:mb-3">◆</span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm tracking-[0.12em] text-[var(--color-gold-bright)]">LOJA DONATE</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--color-muted)] sm:mt-2">Apoie o servidor e receba VSCOIN.</span>
                  </span>
                </Link>
                <Link href="/login" className="panel group relative flex items-center gap-4 rounded-sm px-4 py-4 transition-transform hover:-translate-y-1 sm:flex-col sm:gap-0 sm:py-6 sm:text-center">
                  <span className="absolute right-2 top-2 rounded-sm border border-[rgba(201,162,75,0.5)] px-1.5 py-px text-[0.55rem] uppercase tracking-[0.15em] text-[var(--color-gold-bright)]">Novo</span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.08)] text-xl text-[var(--color-gold-bright)] sm:mb-3">⇄</span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm tracking-[0.12em] text-[var(--color-gold-bright)]">RMT MARKET</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--color-muted)] sm:mt-2">Troque itens com segurança — casa retém 12%.</span>
                  </span>
                </Link>
              </div>
            </div>
            <div>
              <h2 className="sec-title mb-5">Notícias</h2>
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

      {/* ===== COMUNIDADE + DOWNLOAD ===== */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div data-cine-group="tilt" className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <div className="panel flex flex-col justify-between rounded-sm p-6">
            <div>
              <h2 className="sec-title mb-3">Comunidade</h2>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">Suporte, sorteios e o pulso do servidor em tempo real no Discord.</p>
              <div className="mt-4 flex items-center gap-5">
                <div><div className="font-display text-xl text-[var(--color-gold-bright)]">312</div><div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">Online</div></div>
                <div className="h-7 w-px bg-[var(--color-line)]" />
                <div><div className="font-display text-xl text-[var(--color-parchment)]">2.4k</div><div className="text-[0.6rem] uppercase tracking-[0.2em] text-[var(--color-faint)]">Membros</div></div>
              </div>
            </div>
            <a href="#" className="btn-gold mt-5 self-start px-5 py-2.5 text-xs">Entrar no Discord</a>
          </div>
          <div className="panel panel-gold relative overflow-hidden rounded-sm p-6">
            <div data-plx="8" className="pointer-events-none absolute -right-6 bottom-0 hidden opacity-60 md:block">
              <Image src="/art/char-darkelf.png" alt="" width={210} height={320} className="h-[230px] w-auto object-contain [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_40%,transparent_85%)]" />
            </div>
            <div className="relative md:max-w-[70%]">
              <h2 className="sec-title mb-3">Três passos até Aden</h2>
              <ol className="space-y-2.5">
                {[
                  { n: 1, t: "Baixe o client Interlude+" },
                  { n: 2, t: "Crie sua conta em segundos" },
                  { n: 3, t: "Aplique o patch e jogue" },
                ].map((s) => (
                  <li key={s.n} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-[rgba(201,162,75,0.4)] font-display text-xs text-[var(--color-gold-bright)]">{s.n}</span>
                    <span className="text-sm text-[var(--color-parchment)]">{s.t}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex gap-3">
                <Link href="/download" className="btn-gold px-5 py-2.5 text-xs">Baixar Client</Link>
                <Link href="/register" className="btn-ghost px-5 py-2.5 text-xs">Criar Conta</Link>
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
              © {new Date().getFullYear()} L2 Versus — Todos os direitos reservados. Lineage II é marca da NCSoft.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 md:justify-end">
            {[
              { t: "Suporte", h: "#" },
              { t: "Discord", h: "#" },
              { t: "Rankings", h: "/rankings" },
              { t: "Download", h: "/download" },
              { t: "Painel", h: "/dashboard" },
            ].map((l) => (
              <Link key={l.t} href={l.h} className="text-[0.68rem] uppercase tracking-[0.15em] text-[var(--color-muted)] underline underline-offset-4 opacity-80 transition-opacity hover:text-[var(--color-gold-bright)] hover:opacity-100">
                {l.t}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
