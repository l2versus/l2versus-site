import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { getT } from "@/lib/i18n/server";
import { DISCORD_URL, INSTAGRAM_URL } from "@/lib/links";

function Diamond() {
  return (
    <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]" />
  );
}

/** Footer padrão das páginas internas — links reais (Discord/Instagram). */
export default async function SiteFooter() {
  const t = await getT();
  return (
    <footer className="border-t border-[var(--color-line)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-[var(--color-faint)] md:flex-row">
        <div className="flex items-center gap-3">
          <Diamond />
          <BrandLogo className="w-[112px]" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-[0.68rem] uppercase tracking-[0.15em]">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]"
          >
            Discord
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]"
          >
            Instagram
          </a>
          <Link
            href="/rankings"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]"
          >
            {t("site.nav.rankings")}
          </Link>
          <Link
            href="/dashboard"
            className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]"
          >
            {t("site.panel")}
          </Link>
        </div>
        <p className="text-center md:text-right">
          © {new Date().getFullYear()} L2 Versus. {t("site.footer.legal")}
        </p>
      </div>
    </footer>
  );
}
