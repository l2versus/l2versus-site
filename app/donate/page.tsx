import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Loja VSCOIN & Apoie o Versus — L2 Versus",
  description:
    "Apoie o L2 Versus e mantenha o servidor online. Adquira VSCOIN para itens cosméticos e de conveniência — nunca pay-to-win. Pacotes com bônus por volume.",
};

type Pkg = {
  price: string;
  coins: string;
  base: string;
  bonus: string | null;
  popular?: boolean;
};

// 1 VSCOIN = 1 € (âncora do dono). Bônus só de volume nos pacotes maiores.
const PACKAGES: Pkg[] = [
  { price: "€ 5", coins: "5", base: "5", bonus: null },
  { price: "€ 10", coins: "10", base: "10", bonus: null },
  { price: "€ 20", coins: "21", base: "20", bonus: "+5%", popular: true },
  { price: "€ 50", coins: "55", base: "50", bonus: "+10%" },
  { price: "€ 100", coins: "115", base: "100", bonus: "+15%" },
];

export default async function DonatePage() {
  const t = await getT();

  // Métodos europeus (servidor EU): cartão, PayPal, SEPA, cripto.
  const PAYMENTS = [t("site.dn.pay.card"), "PayPal", "SEPA", t("site.dn.pay.crypto")];

  const HOW = [
    { n: "1", title: t("site.dn.how1.title"), desc: t("site.dn.how1.desc") },
    { n: "2", title: t("site.dn.how2.title"), desc: t("site.dn.how2.desc") },
    { n: "3", title: t("site.dn.how3.title"), desc: t("site.dn.how3.desc") },
  ];

  const FAQ = [
    { q: t("site.dn.faq1.q"), a: t("site.dn.faq1.a") },
    { q: t("site.dn.faq2.q"), a: t("site.dn.faq2.a") },
    { q: t("site.dn.faq3.q"), a: t("site.dn.faq3.a") },
    { q: t("site.dn.faq4.q"), a: t("site.dn.faq4.a") },
  ];

  return (
    <main className="min-h-screen">
      <SiteHeader active="donate" />

      {/* HERO */}
      <section className="relative flex min-h-[58vh] items-center justify-center overflow-hidden">
        <Image
          src="/art/scene-siege.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,10,0.55)_0%,rgba(7,7,10,0.8)_55%,var(--color-abyss)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_15%,rgba(201,162,75,0.18),transparent_60%)]" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
          <p
            className="reveal mb-6 text-xs uppercase tracking-[0.5em] text-[var(--color-gold)]"
            style={{ animationDelay: "0.05s" }}
          >
            {t("site.dn.kicker")}
          </p>
          <h1
            className="reveal font-display text-glow-gold text-5xl leading-none tracking-[0.08em] sm:text-6xl md:text-7xl"
            style={{ animationDelay: "0.15s" }}
          >
            {t("site.dn.title")}
          </h1>
          <div className="reveal diamond-rule my-8 w-full max-w-md" style={{ animationDelay: "0.3s" }}>
            <span className="dia" />
          </div>
          <p
            className="reveal max-w-2xl text-lg leading-relaxed text-[var(--color-muted)] md:text-xl"
            style={{ animationDelay: "0.4s" }}
          >
            {t("site.dn.desc1")} <span className="text-[var(--color-parchment)]">VSCOIN</span>{" "}
            {t("site.dn.desc2")}{" "}
            <span className="text-[var(--color-gold-bright)]">{t("site.dn.never")}</span>
          </p>
          <div
            className="reveal mt-10 flex flex-col items-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.55s" }}
          >
            <Link href="#pacotes" className="btn-gold px-8 py-4 text-sm">
              ◈ {t("site.dn.see")}
            </Link>
            <Link href="#faq" className="btn-ghost px-8 py-4 text-sm">
              {t("site.dn.faq_btn")}
            </Link>
          </div>
        </div>
      </section>

      {/* PACOTES VSCOIN */}
      <section id="pacotes" className="mx-auto max-w-6xl px-6 py-20 scroll-mt-24">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="mb-3 text-center font-display text-3xl tracking-[0.15em] text-[var(--color-parchment)] md:text-4xl">
          {t("site.dn.packs_title")}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-[var(--color-muted)]">
          {t("site.dn.packs_sub")}
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <div
              key={p.price}
              className={`reveal relative flex flex-col rounded-sm p-7 text-center transition-transform hover:-translate-y-1 ${
                p.popular ? "panel panel-gold" : "panel"
              }`}
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-[var(--color-gold-bright)] bg-[var(--color-crimson)] px-4 py-1 text-[0.6rem] font-bold uppercase tracking-[0.25em] text-[var(--color-parchment)] shadow-[0_8px_20px_-8px_rgba(200,67,59,0.8)]">
                  {t("site.dn.popular")}
                </span>
              )}

              <div className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                {t("site.dn.donation")}
              </div>
              <div className="mt-2 font-display text-4xl tracking-wide text-[var(--color-gold-bright)]">
                {p.price}
              </div>

              <div className="diamond-rule my-6">
                <span className="dia" />
              </div>

              <div className="flex items-baseline justify-center gap-2">
                <span className="font-display text-3xl text-[var(--color-parchment)]">{p.coins}</span>
                <span className="text-sm uppercase tracking-widest text-[var(--color-gold)]">
                  VSCOIN
                </span>
              </div>

              <div className="mt-3 min-h-[1.75rem]">
                {p.bonus ? (
                  <span className="inline-block rounded-sm border border-[rgba(201,162,75,0.4)] bg-[rgba(201,162,75,0.08)] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[var(--color-gold-bright)]">
                    {p.base} + {p.bonus} {t("site.dn.bonus")}
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-widest text-[var(--color-faint)]">
                    {t("site.dn.starter")}
                  </span>
                )}
              </div>

              <Link href="/dashboard" className="btn-gold mt-7 px-6 py-3 text-sm">
                {t("site.dn.buy")}
              </Link>
            </div>
          ))}

          {/* Card institucional */}
          <div
            className="reveal panel flex flex-col items-center justify-center rounded-sm p-7 text-center"
            style={{ animationDelay: `${0.1 + PACKAGES.length * 0.08}s` }}
          >
            <div className="mb-3 text-3xl text-[var(--color-gold)]">♥</div>
            <h3 className="mb-2 font-display text-lg tracking-wide text-[var(--color-gold-bright)]">
              {t("site.dn.other_title")}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-[var(--color-muted)]">
              {t("site.dn.other_desc")}
            </p>
            <Link href="/dashboard" className="btn-ghost px-6 py-3 text-xs">
              {t("site.dn.talk")}
            </Link>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="mt-14 flex flex-col items-center gap-5">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
            {t("site.dn.payments")}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PAYMENTS.map((m) => (
              <span
                key={m}
                className="rounded-sm border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2 text-sm uppercase tracking-widest text-[var(--color-muted)] transition-colors hover:border-[rgba(201,162,75,0.5)] hover:text-[var(--color-gold-bright)]"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="mb-12 text-center font-display text-3xl tracking-[0.15em] text-[var(--color-parchment)] md:text-4xl">
          {t("site.dn.how_title")}
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          {HOW.map((h, i) => (
            <div
              key={h.n}
              className="reveal panel group relative rounded-sm p-7 transition-all duration-300 hover:border-[rgba(201,162,75,0.5)]"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-[rgba(201,162,75,0.3)] bg-[rgba(201,162,75,0.06)] font-display text-xl text-[var(--color-gold-bright)] transition-transform group-hover:scale-110">
                {h.n}
              </div>
              <h3 className="mb-2 font-display text-lg tracking-wide text-[var(--color-gold-bright)]">
                {h.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-16 scroll-mt-24">
        <div className="diamond-rule mb-4">
          <span className="dia" />
        </div>
        <h2 className="mb-12 text-center font-display text-3xl tracking-[0.15em] text-[var(--color-parchment)] md:text-4xl">
          {t("site.dn.faq_title")}
        </h2>

        <div className="flex flex-col gap-3">
          {FAQ.map((f) => (
            <details
              key={f.q}
              className="panel group rounded-sm px-6 py-1 transition-colors open:border-[rgba(201,162,75,0.5)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-base tracking-wide text-[var(--color-parchment)] transition-colors hover:text-[var(--color-gold-bright)] [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <span className="text-lg text-[var(--color-gold)] transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-[var(--color-muted)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <div className="panel panel-gold rounded-sm px-8 py-14">
          <h2 className="font-display text-3xl tracking-[0.1em] text-glow-gold md:text-4xl">
            {t("site.dn.cta_title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--color-muted)]">
            {t("site.dn.cta_desc")}
          </p>
          <Link href="#pacotes" className="btn-gold mt-8 px-10 py-4 text-sm">
            {t("site.dn.cta_btn")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
