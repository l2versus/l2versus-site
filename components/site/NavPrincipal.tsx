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
  const listaRef = useRef<HTMLUListElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const [filete, setFilete] = useState<{ x: number; w: number; on: boolean }>({
    x: 0,
    w: 0,
    on: false,
  });

  /* compactação no scroll — passivo, e só troca estado quando cruza o limiar */
  useEffect(() => {
    const onScroll = () => {
      const passou = window.scrollY > 40;
      setCompacto((antes) => (antes === passou ? antes : passou));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const ativo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const moverFilete = (el: HTMLElement | null) => {
    if (!el || !listaRef.current) return;
    const lista = listaRef.current.getBoundingClientRect();
    const alvo = el.getBoundingClientRect();
    setFilete({ x: alvo.left - lista.left, w: alvo.width, on: true });
  };

  return (
    <>
      <nav className={`nav-barra ${compacto ? "nav-compacta" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="nav-marca" aria-label="L2 Versus — início">
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
                  <Tag
                    href={i.href}
                    aria-current={!i.ancora && ativo(i.href) ? "page" : undefined}
                    onMouseEnter={(e: React.MouseEvent<HTMLElement>) =>
                      moverFilete(e.currentTarget)
                    }
                    className={
                      i.destaque
                        ? "nav-chip"
                        : `nav-link ${!i.ancora && ativo(i.href) ? "nav-link-ativo" : ""}`
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
            <Link href="/login" className="btn-ghost hidden px-4 py-2.5 text-xs lg:inline-flex">
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
                  onClick={() => setAberto(false)}
                  aria-current={!i.ancora && ativo(i.href) ? "page" : undefined}
                  className={`nav-painel-link ${
                    !i.ancora && ativo(i.href) ? "nav-painel-link-ativo" : ""
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
