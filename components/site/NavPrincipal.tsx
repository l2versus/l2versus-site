"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

/**
 * A NAVEGAÇÃO PRINCIPAL — desktop e mobile no mesmo componente.
 *
 * O que ela resolve, em ordem de importância:
 *
 * 1. MOBILE TINHA BURACO. A nav antiga era `hidden md:flex`: no celular ela
 *    simplesmente não existia, e o jogador só alcançava Wiki e Jogar. Num
 *    site mobile-first isso é o defeito mais caro da página. Agora existe um
 *    painel de verdade, com foco preso dentro dele e fechamento por Esc,
 *    toque fora ou navegação.
 *
 * 2. O HEADER COMPACTA AO DESCER. Passando de ~40px de rolagem a barra perde
 *    altura e ganha opacidade/blur. Devolve altura de tela para o conteúdo
 *    sem tirar a navegação do alcance, e dá a sensação de material — a barra
 *    "assenta" sobre a página em vez de flutuar sempre igual.
 *
 * 3. O SUBLINHADO DESLIZA. Um único filete dourado viaja até o item sob o
 *    cursor em vez de cada link acender o seu. É o detalhe que separa uma nav
 *    montada de uma nav desenhada — e é barato: uma transformação de um
 *    elemento só, medida na entrada do mouse.
 *
 * O estado ativo vem de `usePathname`, não de prop, para a barra continuar
 * correta em navegação cliente (o layout não remonta entre rotas).
 */
export type ItemNav = { href: string; rotulo: string; destaque?: boolean; ancora?: boolean };

/* Clique vindo DA BARRA, para o efeito de pathname distinguir navegação de
   menu (zera o scroll) de volta por histórico (o navegador restaura e nós
   não encostamos). Vive no módulo porque o layout não remonta entre rotas. */
let cliqueVeioDaNav = false;

export default function NavPrincipal({
  itens,
  entrar,
  jogar,
  menuRotulo,
  fecharRotulo,
}: {
  itens: ItemNav[];
  entrar: string;
  jogar: string;
  menuRotulo: string;
  fecharRotulo: string;
}) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [compacto, setCompacto] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const [filete, setFilete] = useState<{ x: number; w: number; on: boolean }>({
    x: 0,
    w: 0,
    on: false,
  });

  /* compactação + fio de progresso no scroll — um listener só, passivo.
     O progresso vai numa CSS var no próprio <nav> (não em estado React):
     é um valor que muda a cada quadro de rolagem, e re-renderizar o
     componente inteiro 60×/s para mover um scaleX seria pagar reconciliação
     por uma transformação que o compositor faz de graça. */
  useEffect(() => {
    let raf = 0;
    const aplicar = () => {
      raf = 0;
      const passou = window.scrollY > 40;
      setCompacto((antes) => (antes === passou ? antes : passou));
      const curso = document.documentElement.scrollHeight - window.innerHeight;
      /* páginas curtas não ganham fio: um indicador que salta de 0 a 100%
         com um toque de roda informa errado — melhor ausente que mentiroso */
      const p = curso > 400 ? Math.min(1, window.scrollY / curso) : 0;
      navRef.current?.style.setProperty("--nav-prog", String(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(aplicar);
    };
    aplicar();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* O CLIQUE NA MARCA/ITEM TEM QUE LEVAR AO COMEÇO — e falhava de DOIS
     jeitos diferentes, um por rota:

     1. Na própria rota: `<Link href="/">` estando em `/` não navega (o App
        Router não refaz a rota atual), então o clique era simplesmente
        ignorado. Resolve-se aqui, com preventDefault + scroll suave.

     2. Entre rotas: o Next até navega e rola ao topo, mas as seções
        pinadas do GSAP remontam DEPOIS e a altura da página muda — medido:
        sair do wiki pela logo aterrissava na home com 2232px de rolagem.
        Resolve-se marcando que a navegação veio da barra e zerando o
        scroll quando o pathname troca (abaixo). A marca existe para NÃO
        encostar no botão voltar: histórico restaura posição, e isso é do
        navegador. */
  const cliqueLocal = (e: React.MouseEvent, href: string) => {
    const [caminho, hash] = href.split("#");
    if (hash) return; // âncora: o navegador resolve
    if ((caminho || "/") === pathname) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      cliqueVeioDaNav = true;
    }
  };

  useEffect(() => {
    if (!cliqueVeioDaNav) return;
    /* Segurar o topo a cada quadro, por até 2,5s — não é paranoia, é medido
       com o scrollTo instrumentado:
       - um scrollTo(0,0) único vira ANIMAÇÃO por causa do
         `html { scroll-behavior: smooth }` global;
       - o ScrollTrigger.refresh() dos pins da home devolve o scroll
         capturado (aos 785ms E de novo aos ~2s, quando o vídeo/imagens
         terminam de assentar) — a logo "levava" ao topo e a página
         aterrissava em 2232px;
       - a flag NÃO é zerada na entrada: o StrictMode roda o efeito duas
         vezes em dev, e zerar na primeira matava o laço da segunda. Ela
         morre no fim da janela ou na mão do jogador.
       `behavior: "instant"` fura o smooth; o rAF ganha de qualquer refresh;
       roda do mouse, toque ou tecla devolvem o controle na hora. */
    const fim = performance.now() + 2500;
    let raf = 0;
    const forcar = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (performance.now() < fim && cliqueVeioDaNav) {
        raf = requestAnimationFrame(forcar);
      } else {
        cliqueVeioDaNav = false;
      }
    };
    const soltar = () => {
      cliqueVeioDaNav = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    raf = requestAnimationFrame(forcar);
    window.addEventListener("wheel", soltar, { passive: true, once: true });
    window.addEventListener("touchstart", soltar, { passive: true, once: true });
    window.addEventListener("keydown", soltar, { passive: true, once: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("wheel", soltar);
      window.removeEventListener("touchstart", soltar);
      window.removeEventListener("keydown", soltar);
    };
  }, [pathname]);

  /* o painel fecha sozinho ao navegar */
  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  /* trava o corpo, prende o foco e escuta Esc enquanto o painel está aberto */
  useEffect(() => {
    if (!aberto) return;
    const overflowAntes = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !painelRef.current) return;
      const focaveis = painelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    /* foca o primeiro link — quem abriu por teclado continua pelo teclado */
    window.setTimeout(() => {
      painelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    }, 60);

    return () => {
      document.body.style.overflow = overflowAntes;
      document.removeEventListener("keydown", onKey);
    };
  }, [aberto]);

  /* SEÇÃO ATIVA (scroll spy).
     Itens como `/#eventos` apontam para uma seção, não para uma rota — e o
     `pathname` na home é sempre "/". Sem isto, `ativo("/#eventos")` é falso em
     qualquer situação e a bolinha mora em INÍCIO para sempre, mesmo com a
     seção de eventos ocupando a tela inteira.

     A faixa de observação é uma fatia fina do terço superior da viewport
     (-25% no topo, -65% embaixo): a seção vira "a atual" quando CRUZA a altura
     da leitura, não quando aparece num canto. Sem isso duas seções ficariam
     ativas ao mesmo tempo em telas altas. */
  const [secaoAtiva, setSecaoAtiva] = useState<string | null>(null);
  const hashes = itens
    .map((i) => i.href.split("#")[1])
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    const ids = hashes.split(",").filter(Boolean);
    const alvos = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!alvos.length) {
      setSecaoAtiva(null);
      return;
    }
    const visiveis = new Set<string>();
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) visiveis.add(e.target.id);
          else visiveis.delete(e.target.id);
        }
        /* a primeira da ordem do menu, para a escolha ser estável */
        setSecaoAtiva(ids.find((id) => visiveis.has(id)) ?? null);
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    alvos.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [hashes, pathname]);

  const ativo = (href: string) => {
    const [caminho, hash] = href.split("#");
    const base = caminho || "/";
    if (hash) return pathname === base && secaoAtiva === hash;
    /* a home só fica ativa quando NENHUMA seção com âncora está na leitura —
       senão INÍCIO e EVENTOS acendem juntos */
    if (base === "/") return pathname === "/" && !secaoAtiva;
    return pathname.startsWith(base);
  };

  const moverFilete = (el: HTMLElement | null) => {
    if (!el || !listaRef.current) return;
    const lista = listaRef.current.getBoundingClientRect();
    const alvo = el.getBoundingClientRect();
    setFilete({ x: alvo.left - lista.left, w: alvo.width, on: true });
  };

  return (
    <>
      <nav ref={navRef} className={`nav-barra ${compacto ? "nav-compacta" : ""}`}>
        {/* a forja: brasa atrás da marca + cantos lavrados + pedra angular.
            Tudo aria-hidden e absoluto — ornamento não ocupa fluxo nem leitor
            de tela. Os cantos são o mesmo gesto do `filet` dos painéis do
            códice: o header passa a ser o primeiro painel do site, não uma
            tira neutra em cima dele. */}
        <span className="nav-brasa" aria-hidden />
        <span className="nav-canto nav-canto-esq" aria-hidden />
        <span className="nav-canto nav-canto-dir" aria-hidden />
        <span className="nav-pedra" aria-hidden>
          <span className="dia" />
        </span>
        {/* o fio de leitura: desenha o progresso da página na beirada da
            barra — a mesma costura dourada do códice, agora em todo o site */}
        <span className="nav-fio" aria-hidden />

        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          {/* `aria-current` na MARCA, e não num item da lista: desde que
              RECURSOS tomou a vaga do INÍCIO, a marca é o único caminho para
              "/" — sem isto, estando na home nenhum elemento da navegação se
              anuncia como página atual para leitor de tela. A condição é a
              mesma do `ativo("/")`: só vale quando nenhuma seção com âncora
              está na faixa de leitura, senão INÍCIO e EVENTOS marcariam juntos. */}
          <Link
            href="/"
            className="nav-marca"
            aria-label="L2 Versus — início"
            aria-current={pathname === "/" && !secaoAtiva ? "page" : undefined}
            onClick={(e) => cliqueLocal(e, "/")}
          >
            <span className="nav-marca-dia" aria-hidden />
            <BrandLogo className="nav-logo" priority />
          </Link>

          {/* ---------- desktop ---------- */}
          <ul
            ref={listaRef}
            className="nav-lista"
            onMouseLeave={() => setFilete((f) => ({ ...f, on: false }))}
          >
            {itens.map((i) => {
              const Tag = i.ancora ? "a" : Link;
              return (
                <li key={i.href}>
                  {/* `ancora` escolhe <a> vs <Link>; NÃO decide o que está
                      ativo. Enquanto decidia, o item de eventos da landing
                      (href "#eventos", ancora: true) era o único que nunca
                      podia acender — exatamente o sintoma relatado. */}
                  <Tag
                    href={i.href}
                    aria-current={ativo(i.href) ? "page" : undefined}
                    onClick={(e: React.MouseEvent) => cliqueLocal(e, i.href)}
                    onMouseEnter={(e: React.MouseEvent<HTMLElement>) =>
                      moverFilete(e.currentTarget)
                    }
                    className={
                      i.destaque
                        ? `nav-chip ${ativo(i.href) ? "nav-chip-ativo" : ""}`
                        : `nav-link ${ativo(i.href) ? "nav-link-ativo" : ""}`
                    }
                  >
                    {i.destaque && (
                      <span aria-hidden className="nav-chip-dia" />
                    )}
                    {i.rotulo}
                  </Tag>
                </li>
              );
            })}
            {/* o filete que persegue o cursor */}
            <span
              aria-hidden
              className="nav-filete"
              style={{
                transform: `translateX(${filete.x}px)`,
                width: filete.w,
                opacity: filete.on ? 1 : 0,
              }}
            />
          </ul>

          {/* ---------- ações ---------- */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* O display mora em `.nav-entrar`, no globals.css, e NÃO numa
                utility: `.btn-ghost` define display e esta folha vence o
                Tailwind aqui — com `hidden lg:inline-flex` o botão aparecia em
                toda largura, celular inclusive. Ver o comentário da classe. */}
            <Link href="/login" className="btn-ghost nav-entrar px-4 py-2.5 text-xs">
              {entrar}
            </Link>
            <Link href="/register" className="btn-gold px-4 py-2.5 text-xs md:px-6 md:py-3">
              {jogar}
            </Link>
            <button
              ref={botaoRef}
              type="button"
              className="nav-hamburguer md:hidden"
              aria-expanded={aberto}
              aria-controls="menu-mobile"
              aria-label={aberto ? fecharRotulo : menuRotulo}
              onClick={() => setAberto((a) => !a)}
            >
              <span className={`nav-barrinha ${aberto ? "b1" : ""}`} />
              <span className={`nav-barrinha ${aberto ? "b2" : ""}`} />
              <span className={`nav-barrinha ${aberto ? "b3" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* ---------- painel mobile ---------- */}
      <div
        className={`nav-veu ${aberto ? "nav-veu-on" : ""}`}
        onClick={() => setAberto(false)}
        aria-hidden
      />
      <div
        id="menu-mobile"
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-label={menuRotulo}
        className={`nav-painel ${aberto ? "nav-painel-on" : ""}`}
      >
        <ul className="nav-painel-lista">
          {itens.map((i, n) => {
            const Tag = i.ancora ? "a" : Link;
            return (
              <li key={i.href} style={{ ["--n" as string]: String(n) }}>
                <Tag
                  href={i.href}
                  onClick={(e: React.MouseEvent) => {
                    setAberto(false);
                    cliqueLocal(e, i.href);
                  }}
                  aria-current={ativo(i.href) ? "page" : undefined}
                  className={`nav-painel-link ${
                    ativo(i.href) ? "nav-painel-link-ativo" : ""
                  } ${i.destaque ? "nav-painel-link-destaque" : ""}`}
                >
                  <span aria-hidden className="nav-painel-dia" />
                  {i.rotulo}
                </Tag>
              </li>
            );
          })}
          <li style={{ ["--n" as string]: String(itens.length) }}>
            <Link
              href="/login"
              onClick={() => setAberto(false)}
              className="nav-painel-link"
            >
              <span aria-hidden className="nav-painel-dia" />
              {entrar}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
