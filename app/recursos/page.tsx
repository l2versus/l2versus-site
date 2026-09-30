import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Recursos — L2 Versus",
  description:
    "Todos os sistemas do L2 Versus: Auto-Farm, DressMe, GM Shop, Offline Shops, Olympíada, Cercos e mais — qualidade de vida sem quebrar o clássico.",
};

export default async function RecursosPage() {
  const t = await getT();

  /* Cada recurso do servidor com sua âncora (linkado pelos tiles da home). */
  const RECURSOS: {
    slug: string;
    icon: string;
    title: string;
    desc: string;
    how: string;
  }[] = [
    { slug: "itens-custom", icon: "⚔", title: t("site.feat.custom"), desc: t("site.rc.custom.desc"), how: t("site.rc.custom.how") },
    { slug: "auto-farm", icon: "⟳", title: t("site.feat.autofarm"), desc: t("site.rc.autofarm.desc"), how: t("site.rc.autofarm.how") },
    { slug: "offline-shops", icon: "⌂", title: t("site.feat.offline"), desc: t("site.rc.offline.desc"), how: t("site.rc.offline.how") },
    { slug: "dressme", icon: "✦", title: t("site.feat.dressme"), desc: t("site.rc.dressme.desc"), how: t("site.rc.dressme.how") },
    { slug: "gm-shop", icon: "◆", title: t("site.feat.gmshop"), desc: t("site.rc.gmshop.desc"), how: t("site.rc.gmshop.how") },
    { slug: "anti-bot", icon: "⛨", title: t("site.feat.antibot"), desc: t("site.rc.antibot.desc"), how: t("site.rc.antibot.how") },
    { slug: "olympiada", icon: "♛", title: t("site.feat.oly"), desc: t("site.rc.oly.desc"), how: t("site.rc.oly.how") },
    { slug: "cercos", icon: "⚑", title: t("site.feat.siege"), desc: t("site.rc.siege.desc"), how: t("site.rc.siege.how") },
  ];

  return (
    <main className="min-h-screen">
      <SiteHeader active="features" />

      {/* Hero curto */}
      <section className="relative overflow-hidden border-b border-[rgba(78,70,55,0.3)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_-10%,rgba(201,162,75,0.14),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-16">
          <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            <span className="block h-1.5 w-1.5 rotate-45 bg-[var(--color-gold)]" />
            {t("site.rc.kicker")}
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-[0.06em] text-glow-gold md:text-5xl">
            {t("site.rc.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
            {t("site.rc.desc")}
          </p>
        </div>
      </section>

      {/* Um painel ancorado por recurso */}
      <section className="mx-auto max-w-4xl space-y-5 px-4 py-12 md:px-6 md:py-16">
        {RECURSOS.map((r) => (
          <article
            key={r.slug}
            id={r.slug}
            className="panel panel-lit scroll-mt-28 rounded-sm p-5 transition-colors hover:border-[rgba(201,162,75,0.4)] md:p-7"
          >
            <div className="flex items-start gap-4 md:gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.08)] text-2xl text-[var(--color-gold-bright)]">
                {r.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl tracking-[0.08em] text-[var(--color-gold-bright)] md:text-2xl">
                  {r.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)] md:text-[15px]">
                  {r.desc}
                </p>
                <p className="mt-3 flex items-start gap-2 text-xs text-[var(--color-parchment)] md:text-sm">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--color-gold)]" />
                  <span>
                    <span className="font-semibold uppercase tracking-[0.15em] text-[var(--color-gold)]">
                      {t("site.rc.how")}{" "}
                    </span>
                    {r.how}
                  </span>
                </p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* CTA final */}
      <section className="border-t border-[var(--color-line)] bg-[rgba(201,162,75,0.04)]">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-12 text-center md:px-6">
          <h2 className="font-display text-2xl tracking-[0.08em] text-[var(--color-parchment)] md:text-3xl">
            {t("site.rc.cta")}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-gold px-8 py-3.5 text-sm">
              ⚔ {t("site.steps.acc")}
            </Link>
            <Link href="/download" className="btn-ghost px-8 py-3.5 text-sm">
              {t("site.hero.download")}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
