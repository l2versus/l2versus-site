import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import FluxoCustodia from "./_components/FluxoCustodia";
import Calculadora from "./_components/Calculadora";
import { getT } from "@/lib/i18n/server";

/**
 * RMT MARKET — a página PÚBLICA de explicação.
 *
 * Por que existe: na seção Economia da home, os dois cartões levavam a lugares
 * diferentes em natureza. "Loja Donate" ia para /donate, que explica o produto
 * antes de pedir qualquer coisa; "RMT Market" ia direto para /login. Quem
 * nunca ouviu falar do mercado batia num muro de senha sem saber o que havia
 * do outro lado — e mercado entre jogadores é justamente o assunto em que
 * desconhecido-que-pede-login soa a golpe. Esta página é o /donate do RMT:
 * explica, e só no fim manda para o /login.
 *
 * Tudo que ela afirma está no código, não em suposição de marketing:
 *   custódia no anúncio ....... createListing enfileira op 'escrow'
 *   devolução no cancelamento . cancelListing enfileira op 'restore'
 *   12% da casa / 88% ao vendedor  settleSale: houseCents/sellerNet
 *   carteira e saque .......... getWallet / requestPayout
 *   não comprar o próprio item  settleSale rejeita seller_uid === buyerUid
 * (todos em lib/repos/rmt.ts). Se a regra mudar lá, esta página mente — é o
 * tipo de página que precisa ser revisitada junto com o repo.
 *
 * O aviso de modo teste fica à vista de propósito: a área logada já avisa, e
 * esconder isso da página pública seria vender o que ainda não existe.
 */
export const metadata: Metadata = {
  title: "RMT Market — compre e venda itens com segurança | L2 Versus",
  description:
    "Mercado entre jogadores do L2 Versus: o item fica em custódia do servidor até o pagamento confirmar. A casa retém 12%, o vendedor fica com 88%. Sem calote, sem combinar por fora.",
};

export default async function RmtPage() {
  const t = await getT();

  const SAFE = [
    { icon: "⛊", title: t("site.rmt.safe1.title"), desc: t("site.rmt.safe1.desc") },
    { icon: "$", title: t("site.rmt.safe2.title"), desc: t("site.rmt.safe2.desc") },
    { icon: "◈", title: t("site.rmt.safe3.title"), desc: t("site.rmt.safe3.desc") },
  ];

  const HOW = [
    { n: "1", title: t("site.rmt.how1.title"), desc: t("site.rmt.how1.desc") },
    { n: "2", title: t("site.rmt.how2.title"), desc: t("site.rmt.how2.desc") },
    { n: "3", title: t("site.rmt.how3.title"), desc: t("site.rmt.how3.desc") },
    { n: "4", title: t("site.rmt.how4.title"), desc: t("site.rmt.how4.desc") },
  ];

  const FAQ = [
    { q: t("site.rmt.faq1.q"), a: t("site.rmt.faq1.a") },
    { q: t("site.rmt.faq2.q"), a: t("site.rmt.faq2.a") },
    { q: t("site.rmt.faq3.q"), a: t("site.rmt.faq3.a") },
    { q: t("site.rmt.faq4.q"), a: t("site.rmt.faq4.a") },
  ];

  return (
    <main className="min-h-screen">
      <SiteHeader />

      {/* HERO — tipográfico, não ilustrado.
          A versão anterior reaproveitava `scene-siege.png`, a MESMA arte do
          /donate, com o mesmo título centralizado e a mesma régua de losango.
          Duas páginas idênticas lado a lado é o que faz um site parecer molde.
          E o assunto aqui não é épico de cerco: é dinheiro, registro e
          garantia. Por isso a folha de razão vale mais que uma batalha — ela
          mostra, antes de qualquer texto, o que o jogador leva pra casa. */}
      <section className="rmt-pauta">
        <div className="rmt-hero">
          <div>
            <p className="reveal rmt-hero-marca" style={{ animationDelay: "0.05s" }}>
              {t("site.rmt.kicker")}
            </p>
            <h1 className="reveal rmt-hero-titulo" style={{ animationDelay: "0.12s" }}>
              RMT
              <em>MARKET</em>
            </h1>
            <p className="reveal rmt-hero-texto" style={{ animationDelay: "0.26s" }}>
              {t("site.rmt.desc1")} <b>{t("site.rmt.money")}</b> {t("site.rmt.desc2")}
            </p>
            <div className="reveal rmt-hero-acoes" style={{ animationDelay: "0.38s" }}>
              <Link href="#como" className="btn-gold px-8 py-4 text-sm">
                ◈ {t("site.rmt.cta_how")}
              </Link>
              <Link href="/login" className="btn-ghost px-8 py-4 text-sm">
                {t("site.rmt.cta_enter")}
              </Link>
            </div>
          </div>

          {/* A folha: uma venda de exemplo já fechada, com a conta aberta.
              Os números batem com a regra real (12% da casa) — é a mesma conta
              da calculadora mais abaixo, só que estática e pronta. */}
          <aside className="reveal rmt-folha" style={{ animationDelay: "0.5s" }} aria-hidden>
            <div className="rmt-folha-topo">
              <span>{t("site.rmt.folha.titulo")}</span>
              <span>#1842</span>
            </div>
            <div className="rmt-linha">
              <span>{t("site.rmt.folha.item")}</span>
              <span>$150.00</span>
            </div>
            <div className="rmt-linha neg">
              <span>{t("site.rmt.folha.taxa")} · 12%</span>
              <span>−$18.00</span>
            </div>
            <div className="rmt-linha tot">
              <span>{t("site.rmt.folha.liquido")}</span>
              <span>$132.00</span>
            </div>
            <div className="rmt-lacre">
              <span>
                {t("site.rmt.folha.selo1")}
                <br />
                {t("site.rmt.folha.selo2")}
              </span>
            </div>
          </aside>
        </div>
      </section>

      {/* POR QUE É SEGURO — o argumento central vem antes da mecânica, porque a
          objeção do jogador não é "como faço", é "como sei que não vou tomar
          calote". */}
      <section className="pt-16 md:pt-24">
        {/* rótulo curto, título curto, frase longa como entrada de leitura.
            Na primeira versão a frase longa virou o título de 48px e o título
            curto virou rótulo — invertido: uma sentença inteira em corpo de
            display não é manchete, é parede de texto. */}
        <p className="rmt-secao-rot">{t("site.rmt.safe_rot")}</p>
        <h2 className="rmt-secao-tit">{t("site.rmt.safe_title")}</h2>
        <p className="rmt-secao-lead">{t("site.rmt.safe_sub")}</p>

        {/* Cláusulas, não três painéis iguais com quadradinho de ícone.
            O grid de cards dá a todas as garantias o mesmo peso visual e
            nenhuma hierarquia de leitura; cláusula numerada com fio fino lê
            como compromisso assumido, que é o tom certo pra quem está
            desconfiado de levar calote. */}
        <div className="rmt-clausulas">
          {SAFE.map((s, i) => (
            <article
              key={s.title}
              className="reveal rmt-clausula"
              style={{ animationDelay: `${0.06 + i * 0.09}s` }}
            >
              <span className="rmt-clausula-n" aria-hidden>
                §{i + 1}
              </span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          ))}
        </div>

        {/* Logo abaixo do cartão dos 88%, e não numa seção própria: a pergunta
            que o jogador faz ao ler "a casa retém 12%" é imediata — "quanto
            cai pra mim?". Responder ali, arrastando, vale mais do que mandar
            ele fazer conta de cabeça ou criar conta para descobrir. */}
        {/* mesmo container das cláusulas: sem ele a calculadora saía em
            largura total e quebrava o alinhamento da coluna de leitura */}
        <div className="reveal mx-auto max-w-6xl px-[clamp(1.25rem,5vw,3rem)]">
          <Calculadora
            rotulos={{
              titulo: t("site.rmt.calc.titulo"),
              preco: t("site.rmt.calc.preco"),
              voceRecebe: t("site.rmt.calc.recebe"),
              casa: t("site.rmt.calc.casa"),
              nota: t("site.rmt.calc.nota"),
            }}
          />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="py-16">
        {/* mesmo par rótulo+título das cláusulas: régua de losango e título
            centralizado eram do molde antigo e brigavam com a nova página */}
        <p className="rmt-secao-rot">{t("site.rmt.safe_rot")}</p>
        <h2 className="rmt-secao-tit mb-10">{t("site.rmt.how_title")}</h2>

        {/* Os quatro cartões estáticos saíram daqui e viraram a cena animada.
            Diziam a mesma coisa e não convenciam: o que trava o jogador não é
            falta de informação, é não enxergar ONDE o item fica entre pagar e
            receber. A cena mostra ele parado no cofre do servidor, que é
            exatamente a diferença para uma troca combinada no chat. */}
        <FluxoCustodia
          passos={HOW.map((h) => ({ titulo: h.title, desc: h.desc }))}
          rotulos={{
            voce: t("site.rmt.voce"),
            servidor: t("site.rmt.servidor"),
            comprador: t("site.rmt.comprador"),
            custodia: t("site.rmt.custodia"),
          }}
          /* mesma venda da folha do herói (#1842), para a página contar UMA
             história do começo ao fim em vez de números soltos por seção */
          razao={{
            titulo: t("site.rmt.razao.tit"),
            linhas: [
              { rot: t("site.rmt.razao.1"), desc: t("site.rmt.razao.d1"), val: "—" },
              { rot: t("site.rmt.razao.2"), desc: t("site.rmt.razao.d2"), val: "—" },
              { rot: t("site.rmt.razao.3"), desc: t("site.rmt.razao.d3"), val: "$150.00" },
              { rot: t("site.rmt.razao.4"), desc: t("site.rmt.razao.d4"), val: "+$132.00" },
            ],
          }}
        />

        {/* aviso honesto de modo teste — o mesmo que a área logada já exibe */}
        <div className="reveal mt-10 flex items-start gap-3 rounded-sm border border-[rgba(201,162,75,0.35)] bg-[rgba(201,162,75,0.06)] px-5 py-4">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            {t("site.rmt.test_note")}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <h2 className="rmt-secao-tit mb-10">{t("site.rmt.faq_title")}</h2>

        {/* Era o último componente de molde da página: sanfona em caixa com
            borda e canto arredondado, idêntica à do /donate. Vira lançamento
            de razão — fio fino, sem caixa, numerada à esquerda. */}
        <div className="rmt-faq mx-auto max-w-6xl px-[clamp(1.25rem,5vw,3rem)]">
          {FAQ.map((f, i) => (
            <details key={f.q}>
              <summary>
                <span className="rmt-faq-n" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{f.q}</span>
                <span className="rmt-faq-sinal" aria-hidden>
                  +
                </span>
              </summary>
              <p className="rmt-faq-resp">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA FINAL — é aqui que a página entrega o jogador ao login, e só aqui */}
      {/* Fecha como abriu: pauta de razão, alinhado à esquerda, com o lacre.
          O bloco dourado centralizado era o mesmo do /donate — e repetir o
          fecho das outras páginas desfaria tudo o que a página construiu. */}
      <section className="rmt-pauta">
        <div className="rmt-fecho">
          <div>
            <h2 className="rmt-fecho-tit">{t("site.rmt.cta_title")}</h2>
            <p className="rmt-fecho-txt">{t("site.rmt.cta_desc")}</p>
            <Link href="/login" className="btn-gold mt-8 inline-flex px-10 py-4 text-sm">
              {t("site.rmt.cta_btn")}
            </Link>
          </div>
          <div className="rmt-lacre rmt-lacre-grande" aria-hidden>
            <span>
              {t("site.rmt.folha.selo1")}
              <br />
              {t("site.rmt.folha.selo2")}
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
