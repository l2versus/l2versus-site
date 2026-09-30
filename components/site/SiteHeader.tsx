import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NavPrincipal from "@/components/site/NavPrincipal";
import { getT, getLocale } from "@/lib/i18n/server";
import { onlineCount } from "@/lib/repos/rankings";
import { DISCORD_URL } from "@/lib/links";

export type ActivePage =
  | "home"
  | "features"
  | "wiki"
  | "rankings"
  | "streams"
  | "download"
  | "donate";

/**
 * Cabeçalho das páginas internas.
 *
 * Usa o MESMO `NavPrincipal` da landing — antes eram dois headers diferentes,
 * e o wiki ficava com uma nav de outra época (links soltos, sem drawer no
 * celular, sem compactação no scroll). Dois headers em um site é sempre um
 * acidente esperando acontecer: qualquer melhoria precisava ser feita duas
 * vezes, e na prática só era feita numa.
 *
 * A diferença legítima entre os dois lugares é só a âncora de eventos, que na
 * landing é `#eventos` (rolagem na própria página) e aqui precisa voltar para
 * a home — por isso ela é montada aqui, não dentro do componente de nav.
 *
 * O estado ativo NÃO vem mais da prop `active`: o `NavPrincipal` resolve
 * sozinho pelo pathname. A prop continua aceita para não quebrar as chamadas
 * existentes, mas é ignorada.
 */
export default async function SiteHeader({ active: _active }: { active?: ActivePage } = {}) {
  const [t, locale, online] = await Promise.all([getT(), getLocale(), onlineCount()]);
  const nf = { pt: "pt-BR", en: "en-GB", ru: "ru-RU", pl: "pl-PL" }[locale] ?? "pt-BR";

  return (
    <div className="sticky top-0 z-50 border-b border-[rgba(78,70,55,0.35)]">
      {/* faixa utilitária — a mesma da landing */}
      <div className="border-b border-[rgba(78,70,55,0.25)] bg-[#0a090c]">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-[0.62rem] uppercase tracking-[0.18em] md:px-6">
          <div className="flex items-center gap-4 text-[var(--color-faint)]">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ec26a]" />
              <span className="tabular-nums text-[#5ec26a]">
                {online.toLocaleString(nf)} {t("site.online_suffix")}
              </span>
            </span>
            <span className="hidden text-[var(--color-line)] sm:inline">|</span>
            <span className="hidden text-[var(--color-muted)] sm:inline">{t("site.region")}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)] sm:flex"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3c-.2.4-.5.9-.6 1.3a18.3 18.3 0 0 0-5.5 0C9.1 3.9 8.8 3.4 8.6 3a19.7 19.7 0 0 0-4.9 1.5A20.4 20.4 0 0 0 .2 18.1a19.9 19.9 0 0 0 6 3c.5-.7.9-1.4 1.3-2.1-.7-.3-1.4-.6-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1 .4.7.8 1.5 1.3 2.1a19.8 19.8 0 0 0 6-3A20.3 20.3 0 0 0 20.3 4.4ZM8 15.3c-1.2 0-2.1-1-2.1-2.3S6.8 10.7 8 10.7s2.2 1 2.1 2.3c0 1.2-.9 2.3-2.1 2.3Zm8 0c-1.2 0-2.1-1-2.1-2.3s.9-2.3 2.1-2.3 2.2 1 2.1 2.3c0 1.2-.9 2.3-2.1 2.3Z" />
              </svg>
              Discord
            </a>
            <Link
              href="/dashboard"
              className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]"
            >
              {t("site.panel")}
            </Link>
            <LanguageSwitcher current={locale} compact />
          </div>
        </div>
      </div>

      <NavPrincipal
        itens={[
          { href: "/", rotulo: t("site.nav.home") },
          { href: "/#eventos", rotulo: t("site.nav.events") },
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
  );
}
