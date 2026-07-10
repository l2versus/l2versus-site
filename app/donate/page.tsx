import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

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

const PACKAGES: Pkg[] = [
  { price: "R$ 10", coins: "100", base: "100", bonus: null },
  { price: "R$ 25", coins: "275", base: "250", bonus: "+10%" },
  { price: "R$ 50", coins: "600", base: "500", bonus: "+20%", popular: true },
  { price: "R$ 100", coins: "1.300", base: "1.000", bonus: "+30%" },
  { price: "R$ 200", coins: "2.800", base: "2.000", bonus: "+40%" },
];

const PAYMENTS = ["Pix", "Cartão", "PayPal", "MercadoPago", "Cripto"];

const HOW = [
  {
    n: "1",
    title: "Escolha o pacote",
    desc: "Selecione o valor que preferir. Quanto maior o pacote, maior o bônus de VSCOIN.",
  },
  {
    n: "2",
    title: "Pague com segurança",
    desc: "Checkout protegido via Pix, cartão ou carteira digital. Seus dados nunca passam pelo servidor de jogo.",
  },
  {
    n: "3",
    title: "VSCOIN na conta",
    desc: "O crédito cai automaticamente na sua conta em instantes. Gaste na loja quando quiser.",
  },
];

const FAQ = [
  {
    q: "É seguro doar?",
    a: "Sim. O pagamento é processado por gateways reconhecidos (Pix, cartão, PayPal, MercadoPago) com criptografia. Nunca pedimos sua senha do jogo para creditar VSCOIN.",
  },
  {
    q: "O servidor é pay-to-win?",
    a: "Não. VSCOIN dá acesso a itens cosméticos (visuais, DressMe), conveniências e serviços de conveniência. Nada que desequilibre o PvP ou substitua o esforço no jogo. O poder se conquista jogando.",
  },
  {
    q: "Quanto tempo leva para creditar?",
    a: "Na maioria dos casos o VSCOIN é creditado automaticamente em poucos instantes após a confirmação do pagamento. Pix e cartão são praticamente imediatos.",
  },
  {
    q: "Posso pedir reembolso?",
    a: "Doações são voluntárias e ajudam a manter o servidor online. Em caso de cobrança indevida ou falha no crédito, fale com a equipe pelo Discord que resolvemos o quanto antes.",
  },
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
          <Link href="/download" className="transition-colors hover:text-[var(--color-gold-bright)]">
            Downloads
          </Link>
          <Link
            href="/donate"
            aria-current="page"
            className="text-[var(--color-gold-bright)] text-glow-gold"
          >
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

export default function DonatePage() {
  return (
    <main className="min-h-screen">
      <NavHeader />

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
            Loja VSCOIN
          </p>
          <h1
            className="reveal font-display text-glow-gold text-5xl leading-none tracking-[0.08em] sm:text-6xl md:text-7xl"
            style={{ animationDelay: "0.15s" }}
          >
            APOIE O VERSUS
          </h1>
          <div className="reveal diamond-rule my-8 w-full max-w-md" style={{ animationDelay: "0.3s" }}>
            <span className="dia" />
          </div>
          <p
            className="reveal max-w-2xl text-lg leading-relaxed text-[var(--color-muted)] md:text-xl"
            style={{ animationDelay: "0.4s" }}
          >
            Cada doação mantém o servidor online, os eventos rodando e o time trabalhando. Em troca
            você recebe <span className="text-[var(--color-parchment)]">VSCOIN</span> — para itens
            cosméticos e de conveniência.{" "}
            <span className="text-[var(--color-gold-bright)]">Nunca pay-to-win.</span>
          </p>
          <div
            className="reveal mt-10 flex flex-col items-center gap-4 sm:flex-row"
            style={{ animationDelay: "0.55s" }}
          >
            <Link href="#pacotes" className="btn-gold px-8 py-4 text-sm">
              ◈ Ver Pacotes
            </Link>
            <Link href="#faq" className="btn-ghost px-8 py-4 text-sm">
              Dúvidas Frequentes
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
          PACOTES DE VSCOIN
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-[var(--color-muted)]">
          Quanto maior o pacote, mais VSCOIN de bônus você leva. Preços em Reais (BRL).
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
                  Mais Popular
                </span>
              )}

              <div className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
                Doação
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
                    {p.base} + {p.bonus} bônus
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-widest text-[var(--color-faint)]">
                    Pacote inicial
                  </span>
                )}
              </div>

              <Link href="/dashboard" className="btn-gold mt-7 px-6 py-3 text-sm">
                Comprar
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
              Outro valor?
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-[var(--color-muted)]">
              Qualquer contribuição ajuda a manter o Versus vivo. Valores personalizados em breve.
            </p>
            <Link href="/dashboard" className="btn-ghost px-6 py-3 text-xs">
              Falar com a Equipe
            </Link>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="mt-14 flex flex-col items-center gap-5">
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--color-faint)]">
            Formas de Pagamento
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
          COMO FUNCIONA
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
          PERGUNTAS FREQUENTES
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
            Faça parte da lenda
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--color-muted)]">
            Seu apoio mantém Aden de pé. Toda contribuição, grande ou pequena, faz diferença.
          </p>
          <Link href="#pacotes" className="btn-gold mt-8 px-10 py-4 text-sm">
            Escolher um Pacote
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
