import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Como Jogar & Downloads — L2 Versus",
  description:
    "Baixe o client Interlude, aplique o patch do Versus, crie sua conta e entre no mundo de Aden. Guia de instalação, requisitos e informações de conexão.",
};

const RATES = [
  { label: "EXP", value: "100x" },
  { label: "SP", value: "100x" },
  { label: "ADENA", value: "1x" },
  { label: "DROP", value: "1x" },
  { label: "SPOIL", value: "1x" },
];

const STEPS = [
  {
    n: "1",
    title: "Baixar o Client",
    desc: "Faça o download do client oficial de Lineage II — Crônica Interlude (C6). É a base do jogo, instale em qualquer pasta do seu PC.",
    cta: { label: "Baixar Client (em breve)", href: "#", variant: "gold" as const },
  },
  {
    n: "2",
    title: "Baixar o Patch do Versus",
    desc: "Extraia o patch do L2 Versus por cima da pasta do client, substituindo os arquivos. Ele adiciona o conteúdo High Five, itens custom e o system de conexão.",
    cta: { label: "Baixar Patch (em breve)", href: "#", variant: "gold" as const },
  },
  {
    n: "3",
    title: "Criar sua Conta",
    desc: "Registre sua conta gratuitamente em segundos. Uma conta serve para todos os seus personagens no servidor.",
    cta: { label: "Criar Conta", href: "/register", variant: "ghost" as const },
  },
  {
    n: "4",
    title: "Entrar e Jogar",
    desc: "Abra o L2.exe pelo patch, faça login com sua conta e escolha o servidor Versus. Sua lenda começa agora.",
    cta: null,
  },
];

const REQ_MIN = [
  ["Sistema", "Windows 7 (64-bit)"],
  ["Processador", "Dual Core 2.0 GHz"],
  ["Memória RAM", "2 GB"],
  ["Placa de Vídeo", "DirectX 9 compatível, 512 MB"],
  ["Espaço em Disco", "~5 GB livres"],
  ["Conexão", "Banda larga estável"],
];

const REQ_REC = [
  ["Sistema", "Windows 10 / 11 (64-bit)"],
  ["Processador", "Quad Core 3.0 GHz+"],
  ["Memória RAM", "4 GB ou mais"],
  ["Placa de Vídeo", "DirectX 9+, 1 GB dedicada"],
  ["Espaço em Disco", "SSD com 8 GB livres"],
  ["Conexão", "Banda larga, baixa latência"],
];

const CONN = [
  { k: "Login Server", v: "em breve", port: "2106" },
  { k: "Game Server", v: "em breve", port: "7777" },
];

function Diamond() {
  return (
    <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]" />
  );
}

function NavHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] backdrop-blur-md bg-[rgba(7,7,10,0.72)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Diamond />
          <BrandLogo className="w-[124px] sm:w-[144px]" priority />
        </Link>
        <nav className="hidden items-center gap-8 text-sm uppercase tracking-widest text-[var(--color-muted)] md:flex">
          <Link href="/" className="transition-colors hover:text-[var(--color-gold-bright)]">
            Início
          </Link>
          <Link href="/rankings" className="transition-colors hover:text-[var(--color-gold-bright)]">
            Rankings
          </Link>
          <Link
            href="/download"
            aria-current="page"
            className="text-[var(--color-gold-bright)] text-glow-gold"
          >
            Downloads
          </Link>
          <Link href="/donate" className="transition-colors hover:text-[var(--color-gold-bright)]">
            Doar
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost px-4 py-2 text-xs">
            Entrar
          </Link>
          <Link href="/register" className="btn-gold px-4 py-2 text-xs">
            Registrar
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-[var(--color-faint)] md:flex-row">
        <div className="flex items-center gap-3">
          <Diamond />
          <BrandLogo className="w-[112px]" />
        </div>
        <p>
          © {new Date().getFullYear()} L2 Versus. Lineage II é marca da NCSoft. Projeto sem fins
          lucrativos.
        </p>
      </div>
    </footer>
  );
}

export default function DownloadPage() {
  return (
    <main className="min-h-screen">
      <NavHeader />

      {/* HERO */}
      <section className="relative flex min-h-[62vh] items-center justify-center overflow-hidden">
        <Image
          src="/art/scene-duel.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,10,0.55)_0%,rgba(7,7,10,0.78)_55%,var(--color-abyss)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_20%,rgba(201,162,75,0.16),transparent_60%)]" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
          <p
            className="reveal mb-6 text-xs uppercase tracking-[0.5em] text-[var(--color-gold)]"
            style={{ animationDelay: "0.05s" }}
          >
            Crônica Interlude · Conteúdo High Five
          </p>
          <h1
            className="reveal font-display text-glow-gold text-5xl leading-none tracking-[0.08em] sm:text-6xl md:text-7xl"
            style={{ animationDelay: "0.15s" }}
          >
            COMECE A JOGAR
          </h1>
          <div className="reveal diamond-rule my-8 w-full max-w-md" style={{ animationDelay: "0.3s" }}>
            <span className="dia" />
          </div>
          <p
            className="reveal max-w-2xl text-lg leading-relaxed text-[var(--color-muted)] md:text-xl"
            style={{ animationDelay: "0.4s" }}
          >
            Quatro passos e você está em Aden. Baixe o client, aplique o patch do Versus, crie sua
            conta e mergulhe na luta.
          </p>
          <div
            className="reveal mt-10 flex flex-col items-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.55s" }}
          >
            <Link href="#guia" className="btn-gold px-8 py-4 text-sm">
              ⚔ Ver Guia de Instalação
            </Link>
            <Link href="/register" className="btn-ghost px-8 py-4 text-sm">
              Criar Conta
            </Link>
          </div>
        </div>
      </section>

      {/* RATES STRIP */}
      <section className="mx-auto -mt-10 max-w-6xl px-6">
        <div className="reveal grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-[rgba(201,162,75,0.25)] bg-[var(--color-line)] sm:grid-cols-3 md:grid-cols-6">
          {RATES.map((r) => (
            <div key={r.label} className="bg-[var(--color-panel)] px-4 py-5 text-center">
              <div className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--color-faint)]">
                {r.label}
              </div>
              <div className="mt-1 font-display text-2xl text-[var(--color-gold-bright)]">
                {r.value}
              </div>
            </div>
          ))}
          <div className="bg-[var(--color-panel)] px-4 py-5 text-center">
            <div className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--color-faint)]">
              Crônica
            </div>
            <div className="mt-1 font-display text-2xl text-[var(--color-parchment)]">Interlude+</div>
          </div>
        </div>
      </section>

      {/* GUIA DE INSTALAÇÃO */}
      <section id="guia" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="mb-3 text-center font-display text-3xl tracking-[0.15em] text-[var(--color-parchment)] md:text-4xl">
          GUIA DE INSTALAÇÃO
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-[var(--color-muted)]">
          Siga a ordem dos passos. Todo o processo leva poucos minutos.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="reveal panel group relative flex flex-col rounded-sm p-7 transition-all duration-300 hover:border-[rgba(201,162,75,0.5)]"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="font-display text-6xl leading-none text-[var(--color-gold)] opacity-80 transition-transform group-hover:scale-105">
                  {s.n}
                </span>
                <span className="mt-2 text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                  Passo {s.n}/4
                </span>
              </div>
              <h3 className="mb-2 font-display text-xl tracking-wide text-[var(--color-gold-bright)]">
                {s.title}
              </h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
                {s.desc}
              </p>
              {s.cta && (
                <Link
                  href={s.cta.href}
                  className={`${s.cta.variant === "gold" ? "btn-gold" : "btn-ghost"} px-5 py-3 text-xs`}
                >
                  {s.cta.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* REQUISITOS DO SISTEMA */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="mb-12 text-center font-display text-3xl tracking-[0.15em] text-[var(--color-parchment)] md:text-4xl">
          REQUISITOS DO SISTEMA
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Mínimo */}
          <div className="panel rounded-sm p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                Mínimo
              </span>
              <span className="h-px flex-1 bg-[var(--color-line)]" />
            </div>
            <dl className="divide-y divide-[var(--color-line)]">
              {REQ_MIN.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs uppercase tracking-widest text-[var(--color-faint)]">{k}</dt>
                  <dd className="text-right text-sm text-[var(--color-parchment)]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Recomendado */}
          <div className="panel panel-gold rounded-sm p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-gold)]">
                Recomendado
              </span>
              <span className="h-px flex-1 bg-[rgba(201,162,75,0.3)]" />
            </div>
            <dl className="divide-y divide-[var(--color-line)]">
              {REQ_REC.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-xs uppercase tracking-widest text-[var(--color-faint)]">{k}</dt>
                  <dd className="text-right text-sm text-[var(--color-gold-bright)]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* INFORMAÇÕES DE CONEXÃO */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="mb-12 text-center font-display text-3xl tracking-[0.15em] text-[var(--color-parchment)] md:text-4xl">
          INFORMAÇÕES DE CONEXÃO
        </h2>

        <div className="panel panel-gold rounded-sm p-8">
          <p className="mb-8 text-center text-sm text-[var(--color-muted)]">
            O endereço do servidor já vem configurado no patch. Você não precisa alterar nada — os
            dados abaixo são apenas informativos.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {CONN.map((c) => (
              <div
                key={c.k}
                className="flex items-center justify-between gap-4 rounded-sm border border-[var(--color-line)] bg-[var(--color-abyss)] px-5 py-4"
              >
                <div>
                  <div className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                    {c.k}
                  </div>
                  <div className="mt-1 font-display text-lg tracking-widest text-[var(--color-gold-bright)]">
                    {c.v}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                    Porta
                  </div>
                  <div className="mt-1 font-mono text-lg text-[var(--color-parchment)]">{c.port}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs uppercase tracking-[0.25em] text-[var(--color-faint)]">
            IP do servidor · <span className="text-[var(--color-gold)]">divulgado no lançamento</span>
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="panel panel-gold rounded-sm px-8 py-14">
          <h2 className="font-display text-3xl tracking-[0.1em] text-glow-gold md:text-4xl">
            Tudo pronto para a batalha?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--color-muted)]">
            Crie sua conta agora e garanta seu nome antes que os melhores nicks sejam levados.
          </p>
          <Link href="/register" className="btn-gold mt-8 px-10 py-4 text-sm">
            Criar Conta Grátis
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
