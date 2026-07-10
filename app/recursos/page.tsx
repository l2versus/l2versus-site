import Link from "next/link";
import type { Metadata } from "next";
import BrandLogo from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Recursos — L2 Versus",
  description:
    "Todos os sistemas do L2 Versus: Auto-Farm, DressMe, GM Shop, Offline Shops, Olympíada, Cercos e mais — qualidade de vida sem quebrar o clássico.",
};

/* Cada recurso do servidor com sua âncora (linkado pelos tiles da home). */
const RECURSOS: {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  how: string;
}[] = [
  {
    slug: "itens-custom",
    icon: "⚔",
    title: "Itens Custom",
    desc: "Arsenal exclusivo com linhas Dynasty, Icarus e Vesper balanceadas para o Interlude+. Poder de verdade, sem quebrar o PvP — nada de item apelão de servidor descartável.",
    how: "Disponíveis no GM Shop e em drops de eventos e raids especiais.",
  },
  {
    slug: "auto-farm",
    icon: "⟳",
    title: "Auto-Farm",
    desc: "Farme enquanto trabalha ou dorme: o sistema caça mobs na área com as skills que você configurar, respeitando raio, HP mínimo e uso de poções.",
    how: "Abra o Community Board (ALT+B) e ative na aba Auto-Farm.",
  },
  {
    slug: "offline-shops",
    icon: "⌂",
    title: "Offline Shops",
    desc: "Monte sua loja privada e feche o jogo — o personagem continua vendendo na cidade. Economia viva 24/7 sem precisar deixar o PC ligado.",
    how: "Abra sua private store e deslogue: a loja permanece ativa.",
  },
  {
    slug: "dressme",
    icon: "✦",
    title: "DressMe",
    desc: "Visual de um set, status de outro. Aplique a aparência de qualquer armadura ou arma sobre seu equipamento atual e entre em Aden com estilo.",
    how: "Pelo Community Board (ALT+B), aba DressMe.",
  },
  {
    slug: "gm-shop",
    icon: "◆",
    title: "GM Shop",
    desc: "Tudo que você precisa até grade S sem caçar vendedor: consumíveis, equipamentos, soulshots e itens de crafting a preço justo em adena.",
    how: "NPC nas praças de todas as vilas e pelo Community Board.",
  },
  {
    slug: "anti-bot",
    icon: "⛨",
    title: "Anti-Bot",
    desc: "Proteção ativa contra bots e automação ilegal de terceiros. Quem quebra a regra cai — farm justo para quem joga de verdade.",
    how: "Sempre ativo. Denúncias pelo Discord com vídeo aceleram o ban.",
  },
  {
    slug: "olympiada",
    icon: "♛",
    title: "Olympíada",
    desc: "O caminho para o status de Herói: duelos ranqueados por classe em ciclo mensal, com skills de Herói e o brilho que todo mundo reconhece de longe.",
    how: "Registre-se no Grand Olympiad Manager em Giran (nível 55+, 3ª classe).",
  },
  {
    slug: "cercos",
    icon: "⚑",
    title: "Cercos",
    desc: "Guerra de clãs pelos castelos de Aden: quem domina o trono controla impostos, teleportes e o respeito do servidor inteiro.",
    how: "Registre seu clã com o Mercenary Manager do castelo desejado.",
  },
];

function Diamond() {
  return (
    <span className="inline-block h-2 w-2 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.2)]" />
  );
}

export default function RecursosPage() {
  return (
    <main className="min-h-screen">
      {/* Header padrão das páginas internas */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[rgba(7,7,10,0.72)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Diamond />
            <BrandLogo className="w-[124px] sm:w-[144px]" priority />
          </Link>
          <nav className="hidden items-center gap-8 text-sm uppercase tracking-widest text-[var(--color-muted)] md:flex">
            <Link href="/" className="transition-colors hover:text-[var(--color-gold-bright)]">
              Início
            </Link>
            <Link href="/recursos" aria-current="page" className="text-[var(--color-gold-bright)]">
              Recursos
            </Link>
            <Link href="/rankings" className="transition-colors hover:text-[var(--color-gold-bright)]">
              Rankings
            </Link>
            <Link href="/download" className="transition-colors hover:text-[var(--color-gold-bright)]">
              Downloads
            </Link>
          </nav>
          <Link href="/register" className="btn-gold px-5 py-2 text-xs">
            Jogar Agora
          </Link>
        </div>
      </header>

      {/* Hero curto */}
      <section className="relative overflow-hidden border-b border-[rgba(78,70,55,0.3)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_-10%,rgba(201,162,75,0.14),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 text-center md:px-6 md:py-16">
          <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-[var(--color-gold)]">
            <span className="block h-1.5 w-1.5 rotate-45 bg-[var(--color-gold)]" />
            Sistemas do servidor
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-[0.06em] text-[var(--color-parchment)] md:text-5xl">
            RECURSOS DO <span className="text-glow-gold">VERSUS</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
            Qualidade de vida sem quebrar o clássico: cada sistema abaixo existe
            para você jogar mais e perder menos tempo — nunca para vender poder.
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
                      Como usar:{" "}
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
            Pronto para testar tudo isso?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-gold px-8 py-3.5 text-sm">
              ⚔ Criar Conta
            </Link>
            <Link href="/download" className="btn-ghost px-8 py-3.5 text-sm">
              Baixar o Cliente
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
