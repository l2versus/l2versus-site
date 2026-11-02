import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getT, getLocale } from "@/lib/i18n/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ===== LADO DA ARTE (desktop) ===== */}
      <aside className="relative hidden overflow-hidden lg:block">
        {/* A arte RESPIRA em vez de ficar parada: deriva lenta de 28s (±2,5%)
            + brasas subindo + um passe de luz na armadura a cada 9s. É
            animação de verdade sem vídeo — e sem o risco de qualidade que
            vídeo traz aqui. Existe um /art/knight-anim.webm, mas ele é um
            SEGUNDO guerreiro: empilhar os dois brigaria com esta arte, e a
            máscara alpha dele está furada no brilho da espada (sobra o xadrez
            de transparência do gerador). Ver .auth-arte-* em globals.css. */}
        <div className="auth-arte-deriva absolute inset-0">
          <Image
            src="/art/auth-hero.png"
            alt=""
            fill
            priority
            sizes="55vw"
            className="object-cover object-[center_18%]"
          />
        </div>
        <div className="auth-arte-luz" aria-hidden />
        <div className="auth-brasas" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
        {/* Escurecimento para dar profundidade e emenda com o formulário */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,7,10,0.35)] via-[rgba(7,7,10,0.15)] to-[var(--color-abyss)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-abyss)] via-transparent to-[rgba(7,7,10,0.45)]" />

        {/* Voltar ao site */}
        <Link
          href="/"
          className="group absolute left-10 top-8 z-10 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-gold-bright)]"
        >
          <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)] transition-transform group-hover:rotate-[135deg]" />
          {t("site.auth.back")}
        </Link>

        {/* Marca + tagline */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-12">
          <div className="diamond-rule mb-5 max-w-xs">
            <span className="dia" />
          </div>
          <BrandLogo priority className="w-[min(72vw,400px)]" />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--color-muted)]">
            {t("site.auth.tagline")}
          </p>
        </div>
      </aside>

      {/* ===== LADO DO FORMULÁRIO ===== */}
      <main className="relative flex items-center justify-center px-6 py-16 sm:px-10">
        {/* Fundo de arte só no mobile (bem escurecido para legibilidade) */}
        <div className="absolute inset-0 -z-10 lg:hidden">
          <Image
            src="/art/auth-hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_15%] opacity-25"
          />
          <div className="absolute inset-0 bg-[rgba(7,7,10,0.82)]" />
        </div>

        {/* Seletor de idioma (todas as páginas, inclusive auth) */}
        <div className="absolute right-6 top-6 z-10 sm:right-10 sm:top-8">
          <LanguageSwitcher current={locale} compact />
        </div>

        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
