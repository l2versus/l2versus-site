import Image from "next/image";
import Link from "next/link";
import EventsLive, { NextEventBadge } from "./_home/EventsLive";
import Forja from "./_home/Forja";
import ParallaxFx from "./_home/ParallaxFx";
import SequenciaScrub from "@/components/media/SequenciaScrub";
import VideoFundo from "@/components/media/VideoFundo";
import SiteHeader from "@/components/site/SiteHeader";
import ScrollFx from "./_home/ScrollFx";
import BrandLogo from "@/components/BrandLogo";
import { topByPvp, onlineCount } from "@/lib/repos/rankings";
import { discordStats } from "@/lib/discord";
import { getT, getLocale } from "@/lib/i18n/server";
import { realce } from "@/lib/i18n/realce";
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

/* A medalha do pódio era uma bolinha de 24px com cor inline — vocabulário de
   app esportivo, e o único ornamento da zona que não era losango. Agora é
   placa lavrada em losango (.zp-medalha), com as três ligas declaradas em CSS;
   o 1º lugar ainda ganha um segundo losango em volta. Fora do pódio o número
   fica tabular, na MESMA caixa de 2,15rem, senão a coluna desalinha. */
function Medal({ rank }: { rank: number }) {
  if (rank > 3) return <span className="zp-pos">{rank}</span>;
  return (
    <span className={`zp-medalha zp-medalha-${rank}`}>
      <b>{rank}</b>
    </span>
  );
}

/* ---- Os dois brasões da Economia ----
   Substituem o losango genérico e o glifo "⇄". São desenhados aqui, no
   vocabulário do site (losango, filigrana, cunho), e NÃO vêm de biblioteca de
   ícone: um ícone de linha de 24px lido em 44px vira risco fino e some sobre
   pergaminho. Herdam `currentColor` da placa, então o hover do cartão escurece
   o traço junto. `aria-hidden` porque cada um já vem rotulado pelo título do
   cartão ao lado — um nome acessível aqui só repetiria o rótulo. */
function BrasaoMoeda() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="24" cy="24" r="17.5" />
        {/* a serrilha da moeda cunhada */}
        <circle cx="24" cy="24" r="14" strokeWidth="1.1" strokeDasharray="1 2.6" opacity="0.75" />
        <path d="M24 13.5 34.5 24 24 34.5 13.5 24Z" strokeWidth="1.2" />
        <path d="M24 18 30 24 24 30 18 24Z" fill="currentColor" stroke="none" opacity="0.92" />
        <path d="M24 4.5v3M24 40.5v3M4.5 24h3M40.5 24h3" strokeWidth="1.2" opacity="0.5" />
        <path
          d="M10.2 10.2l2.1 2.1M35.7 35.7l2.1 2.1M37.8 10.2l-2.1 2.1M12.3 35.7l-2.1 2.1"
          strokeWidth="1"
          opacity="0.3"
        />
      </g>
    </svg>
  );
}

/* A balança, e não duas setas: é o mesmo símbolo que o códice usa para "o que
   vale em jogo", e diz o que o RMT Market faz de diferente — a casa pesa a
   troca. Seta de troca é ícone de carteira de cripto, não de mercado medieval. */
function BrasaoBalanca() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M24 5.2 27 8.2 24 11.2 21 8.2Z" fill="currentColor" strokeWidth="1" />
        <path d="M24 11.2V38" />
        <path d="M16.5 38h15M19 41.6h10" opacity="0.85" />
        <path d="M9 15.5h30" />
        <path d="M12 15.5 9.5 23.5M12 15.5l2.5 8M36 15.5l-2.5 8M36 15.5l2.5 8" strokeWidth="1" opacity="0.7" />
        {/* os pratos: meia-circunferência varrendo para BAIXO (sweep 0) */}
        <path d="M6.5 23.5a5.5 5.5 0 0 0 11 0Z" strokeWidth="1.2" />
        <path d="M30.5 23.5a5.5 5.5 0 0 0 11 0Z" strokeWidth="1.2" />
      </g>
    </svg>
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
    // a data vinha cravada em português ("05 JUL") e aparecia assim em russo e
    // polonês também; agora vem do dicionário, com a ordem dia/mês de cada idioma
    { date: t("site.zp.news.1.date"), title: t("site.news.1.title"), excerpt: t("site.news.1.excerpt") },
    { date: t("site.zp.news.2.date"), title: t("site.news.2.title"), excerpt: t("site.news.2.excerpt") },
    { date: t("site.zp.news.3.date"), title: t("site.news.3.title"), excerpt: t("site.news.3.excerpt") },
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
      {/* ===== HEADER — o mesmo SiteHeader do resto do site.
          A home mantinha uma CÓPIA inline destes dois andares, e toda
          melhoria no header precisava ser feita duas vezes (na prática era
          feita numa). A prop `home` troca só o que é legítimo trocar: a
          âncora de eventos rola na própria página. ===== */}
      <SiteHeader home />

      {/* ===== HERO full-bleed (arte = background, zero moldura, zero espaço morto) ===== */}
      <header className="relative w-full overflow-hidden border-b border-[rgba(78,70,55,0.3)]">
        {/* camadas de fundo: cena viva (Ken Burns) + rays + brasas */}
        <div className="absolute inset-0">
          {/* cena com sangria vertical: desliza no scroll sem mostrar borda */}
          <div data-plx="10" className="absolute inset-x-0 -inset-y-[16%]">
            <Image src="/art/scene-siege.png" alt="" fill priority sizes="100vw" className="kenburns object-cover object-[center_28%] opacity-45 [filter:saturate(1.3)_contrast(1.08)]" />
            {/* A CIDADELA VIVA: o sobrevoo em loop palíndromo (15,9s, sem
                corte) por cima da arte estática. Nasce invisível e só
                aparece quando está de fato rodando — se o autoplay falhar,
                celular, Save-Data ou reduced-motion, fica o Ken Burns de
                sempre: o modo de falha é a página de ontem. Os scrims e o
                recorte do cavaleiro continuam por cima, intocados. */}
            <VideoFundo
              webm="/video/cidadela-loop.webm"
              mp4="/video/cidadela-loop.mp4"
              className="absolute inset-0 h-full w-full object-cover object-[center_28%] opacity-60 [filter:saturate(1.25)_contrast(1.06)]"
            />
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

      <DiamondRule />

      {/* ===== A FORJA =====
          Fica AQUI, no meio da página, de propósito: até este ponto tudo o que
          a home faz é reprodução comandada pela barra de rolagem — parallax,
          Ken Burns, split-text e brasas em toda seção. Quando tudo anima
          igual, nada é momento. Esta é a única coisa da página que responde ao
          jogador em vez de responder ao scroll, e vem logo antes da zona
          pergaminho, que é densa de dado e pede um respiro antes. */}
      <section className="mx-auto max-w-6xl px-4 pb-6 md:px-6">
        <Forja
          textos={{
            kicker: t("site.forja.kicker"),
            titulo: t("site.forja.titulo"),
            sub: t("site.forja.sub"),
            arma: t("site.forja.arma"),
            armadura: t("site.forja.armadura"),
            normal: t("site.forja.normal"),
            abencoado: t("site.forja.abencoado"),
            encantar: t("site.forja.encantar"),
            chance: t("site.forja.chance"),
            recorde: t("site.forja.recorde"),
            tentativas: t("site.forja.tentativas"),
            quebrou: t("site.forja.quebrou"),
            zerou: t("site.forja.zerou"),
            teto: t("site.forja.teto"),
            recomecar: t("site.forja.recomecar"),
            nota: t("site.forja.nota"),
            seguro: t("site.forja.seguro"),
            escada: t("site.forja.escada"),
            escadaNota: t("site.forja.escada_nota"),
          }}
        />
      </section>

      {/* ===== ZONA PERGAMINHO (corte diagonal, claro × escuro) =====
          Composição nova: RANKINGS + NOTÍCIAS lado a lado, e a ECONOMIA numa
          FAIXA LARGA embaixo. Antes a economia morava na coluna estreita da
          direita, em dois quadrados de ~250px — e o dono estava certo em dizer
          que pareciam rodapé: são as DUAS fontes de receita do servidor
          disputando o espaço que sobrava de um cartão de notícia. Em 250px não
          caberia hierarquia nenhuma; na faixa cada cartão fica com ~560px, o
          que é o que permite os quatro degraus (o que é · o que eu ganho ·
          ação). De quebra a faixa encosta no vídeo do RMT que vem logo
          depois — o cartão apresenta o mercado, o filme mostra. ===== */}
      <section className="zone-parchment cut-both">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
            {/* ---------------- RANKINGS ---------------- */}
            <div data-plx="-3" data-cine="left" className="min-w-0">
              <div className="zp-cabeca">
                <div className="min-w-0">
                  <span className="zp-olho">{t("site.zp.rank.olho")}</span>
                  <h2 className="zp-titulo">{t("site.rank.title")}</h2>
                </div>
                <Link href="/rankings?tab=pvp" className="zp-tudo">
                  {t("site.zp.rank.viewall")}
                </Link>
              </div>
              <div className="zp-fio-cabeca" aria-hidden />
              <p className="zp-sub">{t("site.zp.rank.sub")}</p>

              <div className="filet zp-moldura panel panel-lit mt-6 overflow-hidden">
                <span className="filet-alt" aria-hidden />
                <div className="zp-painel-cabeca">
                  <span className="zp-painel-titulo">{t("site.rank.top_pvp")}</span>
                  {/* Estes quatro rótulos pareciam filtro e não clicavam em
                      nada — e "Heróis", que era um deles, não existe como aba
                      no /rankings. Agora são as três que existem de verdade,
                      como link, e a atual é placa preenchida. */}
                  <nav className="zp-abas" aria-label={t("site.rank.title")}>
                    <span className="zp-aba zp-aba-ativa" aria-current="page">{t("site.rank.pvp")}</span>
                    <Link href="/rankings?tab=pk" className="zp-aba">{t("site.rank.pk")}</Link>
                    <Link href="/rankings?tab=clans" className="zp-aba">{t("site.rank.clans")}</Link>
                    <Link href="/rankings" className="zp-aba">{t("site.zp.tab_level")}</Link>
                  </nav>
                </div>

                {/* Celular: lista, nunca rolagem lateral (o corte diagonal da
                    zona já consome 3,5vw de cada lado). A troca lista↔tabela
                    é feita no CSS (.zp-mob / .zp-tabela-caixa) e não por
                    utility, porque as duas precisam do MESMO limiar de 640px. */}
                <ul className="zp-mob">
                  {ladder.length === 0 ? (
                    <li className="zp-vazio">{t("site.rank.empty")}</li>
                  ) : ladder.map((p) => (
                    <li key={p.name} className="zp-mob-item">
                      <Medal rank={p.rank} />
                      <div className="min-w-0 flex-1">
                        <div className="zp-mob-nome">{p.name}</div>
                        <div className="zp-mob-meta">{p.cls} · {t("site.zp.col_lvl")} {p.lvl}</div>
                      </div>
                      <div className="text-right">
                        <div className="zp-mob-num">{p.pvp.toLocaleString(nf)}</div>
                        <div className="zp-mob-rot">{t("site.rank.pvp")}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* ≥640px: tabela com cabeçalho de coluna de verdade. Sem
                    thead, "1.482" e "76" eram dois números sem nome. */}
                <div className="zp-tabela-caixa">
                  <table className="zp-tabela">
                    <thead>
                      <tr>
                        <th scope="col" className="zp-th zp-th-pos">{t("site.zp.col_pos")}</th>
                        <th scope="col" className="zp-th">{t("site.zp.col_player")}</th>
                        {/* a coluna mostra a RAÇA (r.race), não a classe —
                            o rótulo antigo mentiria */}
                        <th scope="col" className="zp-th">{t("site.zp.col_race")}</th>
                        <th scope="col" className="zp-th zp-col-clan">{t("site.zp.col_clan")}</th>
                        <th scope="col" className="zp-th zp-th-dir">{t("site.zp.col_lvl")}</th>
                        <th scope="col" className="zp-th zp-th-dir">{t("site.rank.pvp")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ladder.length === 0 ? (
                        <tr><td colSpan={6} className="zp-vazio">{t("site.rank.empty")}</td></tr>
                      ) : ladder.map((p) => (
                        <tr key={p.name} className={`zp-linha${p.rank <= 3 ? " zp-linha-top" : ""}`}>
                          <td className="zp-cel-pos"><Medal rank={p.rank} /></td>
                          <td className="zp-cel-nome">{p.name}</td>
                          <td className="zp-cel-meta">{p.cls}</td>
                          <td className="zp-cel-meta zp-col-clan">{p.clan}</td>
                          <td className="zp-cel-lvl">{p.lvl}</td>
                          <td className="zp-cel-num">{p.pvp.toLocaleString(nf)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ---------------- NOTÍCIAS ---------------- */}
            <div data-plx="3" data-cine="right" className="min-w-0">
              <div className="zp-cabeca">
                <div className="min-w-0">
                  <span className="zp-olho">{t("site.zp.news.olho")}</span>
                  <h2 className="zp-titulo">{t("site.news.title")}</h2>
                </div>
              </div>
              <div className="zp-fio-cabeca" aria-hidden />
              <div className="zp-noticias">
                {NEWS.map((n) => (
                  <article key={n.title} className="panel zp-noticia">
                    <span className="zp-data">{n.date}</span>
                    <div className="min-w-0">
                      <h3 className="zp-noticia-titulo">{n.title}</h3>
                      <p className="zp-noticia-texto">{n.excerpt}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <DiamondRule />

          {/* ---------------- ECONOMIA (faixa larga) ---------------- */}
          <div className="zp-bloco-eco">
            <div className="zp-cabeca">
              <div className="min-w-0">
                <span className="zp-olho">{t("site.zp.eco.olho")}</span>
                <h2 className="zp-titulo">{t("site.eco.title")}</h2>
              </div>
            </div>
            <div className="zp-fio-cabeca" aria-hidden />
            <p className="zp-sub zp-sub-largo">{t("site.zp.eco.sub")}</p>

            <div data-cine-group="rise" className="zp-eco">
              <Link href="/donate" className="filet zp-moldura panel panel-gold panel-lit wk-luz zp-cartao">
                <span className="filet-alt" aria-hidden />
                <span className="zp-brasao">
                  <BrasaoMoeda />
                </span>
                <span className="zp-cartao-corpo">
                  <span className="zp-olho-linha">
                    <span className="zp-olho">{t("site.zp.shop.olho")}</span>
                  </span>
                  <span className="zp-cartao-titulo">{t("site.eco.shop")}</span>
                  {/* uma chave só, com a marcação de realce dentro dela: em RU
                      e PL a palavra realçada cai em outro ponto da oração, e
                      frase picada em pedaços sai torta nos dois */}
                  <span className="zp-cartao-lead">
                    {realce(t("site.zp.shop.lead"), { forte: "zp-forte", enfase: "zp-enfase" })}
                  </span>
                  <span className="zp-cartao-acao">{t("site.zp.shop.cta")}</span>
                </span>
              </Link>

              {/* /marketplace, não /login: o cartão vizinho leva a /donate, que
                  explica antes de pedir conta. Mandar este direto para o muro
                  de senha era pedir cadastro para um mercado que o visitante
                  ainda não sabe o que é. */}
              <Link href="/marketplace" className="filet zp-moldura panel panel-gold panel-lit wk-luz zp-cartao">
                <span className="filet-alt" aria-hidden />
                <span className="zp-brasao">
                  <BrasaoBalanca />
                </span>
                <span className="zp-cartao-corpo">
                  <span className="zp-olho-linha">
                    <span className="zp-olho">{t("site.zp.rmt.olho")}</span>
                    {/* o selo entra NO FLUXO, ao lado do olho: absoluto no
                        canto ele cavalgava a primeira linha do texto quando o
                        cartão estreitava */}
                    <span className="selo zp-selo">{t("site.eco.new")}</span>
                  </span>
                  <span className="zp-cartao-titulo">{t("site.eco.rmt")}</span>
                  <span className="zp-cartao-lead">
                    {realce(t("site.zp.rmt.lead"), { forte: "zp-forte", enfase: "zp-enfase" })}
                  </span>
                  <span className="zp-cartao-acao">{t("site.zp.rmt.cta")}</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RMT CINEMÁTICO: o clipe da elfa, quadro a quadro no scroll =====
          O scroll é o controle do tempo: a moeda de PvP vira a comparação
          RMT-externo × RMT-plataforma (texto queimado no próprio vídeo) e
          termina no "Saque Realizado". As legendas ficam no terço de baixo
          para nunca brigar com os cartões do quadro. */}
      {/* 96 quadros: reextraídos do clipe original (ver wiki/page.tsx) */}
      <SequenciaScrub pasta="/seq/mercado" quadros={192} quadrosBase={96} modo="heroi" alturaVh={260}>
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
