import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Como Jogar & Downloads — L2 Versus",
  description:
    "Baixe o client High Five, aplique o patch do Versus, crie sua conta e entre no mundo de Aden. Guia de instalação, requisitos e informações de conexão.",
};

const CLIENT_URL =
  "https://mega.nz/file/kihCWJIL#X4GqhOSCd6uSJZTa0EMp1WNNUiwnodJGTIW3_lJWFIg";
const LAUNCHER_URL = "https://l2versus.com/patch/L2Versus-Launcher.exe";

const CONN = [
  { k: "Login Server", v: "187.77.226.144", port: "2106" },
  { k: "Game Server", v: "187.77.226.144", port: "7777" },
];

export default async function DownloadPage() {
  const t = await getT();

  const RATES = [
    { label: "EXP", value: "7x" },
    { label: "SP", value: "7x" },
    { label: "ADENA", value: "7x" },
    { label: "DROP", value: "7x" },
    { label: "SPOIL", value: "7x" },
  ];

  const STEPS = [
    {
      n: "1",
      title: t("site.dl.s1.title"),
      desc: t("site.dl.s1.desc"),
      cta: { label: t("site.dl.s1.cta"), href: CLIENT_URL, variant: "gold" as const },
    },
    {
      n: "2",
      title: t("site.dl.s2.title"),
      desc: t("site.dl.s2.desc"),
      cta: { label: t("site.dl.s2.cta"), href: LAUNCHER_URL, variant: "gold" as const },
    },
    {
      n: "3",
      title: t("site.dl.s3.title"),
      desc: t("site.dl.s3.desc"),
      cta: { label: t("site.dl.s3.cta"), href: "/register", variant: "ghost" as const },
    },
    {
      n: "4",
      title: t("site.dl.s4.title"),
      desc: t("site.dl.s4.desc"),
      cta: null,
    },
  ];

  const REQ_MIN: [string, string][] = [
    [t("site.dl.req.os"), "Windows 7 (64-bit)"],
    [t("site.dl.req.cpu"), "Dual Core 2.0 GHz"],
    [t("site.dl.req.ram"), "2 GB"],
    [t("site.dl.req.gpu"), t("site.dl.minv.gpu")],
    [t("site.dl.req.disk"), t("site.dl.minv.disk")],
    [t("site.dl.req.net"), t("site.dl.minv.net")],
  ];

  const REQ_REC: [string, string][] = [
    [t("site.dl.req.os"), "Windows 10 / 11 (64-bit)"],
    [t("site.dl.req.cpu"), "Quad Core 3.0 GHz+"],
    [t("site.dl.req.ram"), t("site.dl.recv.ram")],
    [t("site.dl.req.gpu"), t("site.dl.recv.gpu")],
    [t("site.dl.req.disk"), t("site.dl.recv.disk")],
    [t("site.dl.req.net"), t("site.dl.recv.net")],
  ];

  return (
    <main className="min-h-screen">
      <SiteHeader active="download" />

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
            {t("site.dl.kicker")}
          </p>
          <h1
            className="reveal font-display text-glow-gold text-5xl leading-none tracking-[0.08em] sm:text-6xl md:text-7xl"
            style={{ animationDelay: "0.15s" }}
          >
            {t("site.dl.title")}
          </h1>
          <div className="reveal diamond-rule my-8 w-full max-w-md" style={{ animationDelay: "0.3s" }}>
            <span className="dia" />
          </div>
          <p
            className="reveal max-w-2xl text-lg leading-relaxed text-[var(--color-muted)] md:text-xl"
            style={{ animationDelay: "0.4s" }}
          >
            {t("site.dl.desc")}
          </p>
          <div
            className="reveal mt-10 flex flex-col items-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.55s" }}
          >
            <Link href="#guia" className="btn-gold px-8 py-4 text-sm">
              ⚔ {t("site.dl.guide_btn")}
            </Link>
            <Link href="/register" className="btn-ghost px-8 py-4 text-sm">
              {t("site.dl.s3.cta")}
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
              {t("site.status.chronicle")}
            </div>
            <div className="mt-1 font-display text-2xl text-[var(--color-parchment)]">High Five</div>
          </div>
        </div>
      </section>

      {/* GUIA DE INSTALAÇÃO */}
      <section id="guia" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="mb-3 text-center font-display text-3xl tracking-[0.15em] text-[var(--color-parchment)] md:text-4xl">
          {t("site.dl.guide_title")}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-[var(--color-muted)]">
          {t("site.dl.guide_sub")}
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
                  {t("site.dl.step")} {s.n}/4
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
          {t("site.dl.req_title")}
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Mínimo */}
          <div className="panel rounded-sm p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                {t("site.dl.min")}
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
                {t("site.dl.rec")}
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
          {t("site.dl.conn_title")}
        </h2>

        <div className="panel panel-gold rounded-sm p-8">
          <p className="mb-8 text-center text-sm text-[var(--color-muted)]">
            {t("site.dl.conn_note")}
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
                    {t("site.dl.port")}
                  </div>
                  <div className="mt-1 font-mono text-lg text-[var(--color-parchment)]">{c.port}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="panel panel-gold rounded-sm px-8 py-14">
          <h2 className="font-display text-3xl tracking-[0.1em] text-glow-gold md:text-4xl">
            {t("site.dl.cta_title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--color-muted)]">
            {t("site.dl.cta_desc")}
          </p>
          <Link href="/register" className="btn-gold mt-8 px-10 py-4 text-sm">
            {t("site.dl.cta_btn")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
