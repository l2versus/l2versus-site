"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * DIRETOR DE CENA DO WIKI.
 *
 * Existe separado do ParallaxFx da home DE PROPÓSITO. Aquele é um diretor de
 * landing: pina cenas, faz o cavaleiro invadir, quebra título palavra por
 * palavra, joga cartões de lados alternados. É ótimo para vender o servidor em
 * dez segundos — e é exatamente o que torna uma página de referência ilegível.
 * Reusá-lo aqui seria confundir "temos um sistema de motion" com "esse sistema
 * serve para esta página".
 *
 * A TESE DESTE ARQUIVO:
 *
 *      O livro é um objeto físico. O texto não é.
 *
 * Movimento vai na ENCADERNAÇÃO — capa, fio, ornamento de canto, margem — e
 * nunca no plano de leitura. A profundidade vem de camadas ATRÁS do texto se
 * movendo em velocidades diferentes, não do texto se movendo. Quem está lendo
 * a resistência de Hold do Ring of Baium não pode ter o número fugindo do olho.
 *
 * Daí as regras duras:
 *   - Nenhum parágrafo, tabela, número ou rótulo recebe parallax. Zero.
 *   - Reveals são curtos (≤ 0,7s), uma vez, e terminam em identidade explícita.
 *   - Scrub só na moldura: frontispício, fio de ouro, camadas de fundo.
 *   - 220 entradas não ganham 220 ScrollTriggers — reveal via IntersectionObserver,
 *     que é geometria barata. ScrollTrigger fica para os poucos elementos de moldura.
 *   - Lenis com lerp mais curto que o da home (0.08 vs 0.11): leitura quer
 *     controle, não deslize.
 *
 * API por atributo (prefixo wk- para não colidir com a da home):
 *   data-wk-plx="N"     camada de profundidade — desliza N% da viewport
 *   data-wk-lift        o frontispício: a virada da página
 *   data-wk-thread      o fio de ouro da encadernação, desenhado no scroll
 *   data-wk-balanca     a balança pende e assenta ao entrar em cena
 *   data-wk-tilt        contêiner cujos filhos inclinam na direção do cursor
 *   data-wk-rise        entrada discreta (o default das entradas)
 */
export default function WikiMotion() {
  /* BUG REAL, CORRIGIDO: este componente vive no LAYOUT do wiki, e no App
     Router o layout NÃO remonta em navegação cliente entre páginas do wiki.
     Sem o pathname na dependência, o efeito rodava uma vez, observava os
     elementos da primeira página, e as fichas de toda página visitada por
     clique ficavam em opacity:0 para sempre — página "vazia" com o conteúdo
     inteiro presente e invisível. Os testes não pegavam porque page.goto()
     é sempre carga cheia; só clique reproduz. Com o pathname aqui, cada
     navegação desmonta tudo (ctx.revert, observers, Lenis) e re-inicializa
     contra o DOM novo. */
  const pathname = usePathname();

  useEffect(() => {
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (semMovimento.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    /* Lenis com lerp mais curto que o da home. Página de leitura quer que o
       scroll PARE quando você para — deslize longo atrapalha quem procura. */
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const desktop = window.innerWidth >= 768;
    const podeHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const observers: IntersectionObserver[] = [];
    const limpadores: (() => void)[] = [];

    /* gsap.context: revert() mata tweens E restaura estilos inline. Sem isso o
       double-mount do StrictMode envenena o estado — o from() da 2ª montagem
       captura elementos já escondidos e anima de 0 para 0. Mesma disciplina do
       ParallaxFx; é a parte dele que vale herdar. */
    const ctx = gsap.context(() => {
      /* ============================================================
         1. PROFUNDIDADE — camadas de fundo, atrás do texto
         ============================================================ */
      document.querySelectorAll<HTMLElement>("[data-wk-plx]").forEach((el) => {
        const v = parseFloat(el.dataset.wkPlx ?? "0");
        if (!v) return;
        /* No mobile a janela é curta demais: o mesmo deslocamento vira um
           salto visível em vez de profundidade. Corta pela metade. */
        const dist = (v / 100) * window.innerHeight * (desktop ? 1 : 0.45);
        gsap.fromTo(
          el,
          { y: -dist },
          {
            y: dist,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          }
        );
      });

      /* ============================================================
         2. A VIRADA DA PÁGINA — o momento assinatura
         ------------------------------------------------------------
         O frontispício em pergaminho não some com um fade. Ele LEVANTA:
         gira uma fração de grau no eixo X com perspectiva, escurece na
         borda inferior e encolhe de leve, enquanto o obsidiana embaixo
         sobe para encontrá-lo. Lido de canto de olho, é uma página sendo
         virada — que é exatamente o gesto de entrar num códice.

         Os números são pequenos de propósito (3,5°, 4% de escala). Acima
         disso vira efeito de apresentação de slides e denuncia o truque.
         ============================================================ */
      const capa = document.querySelector<HTMLElement>("[data-wk-lift]");
      if (capa && desktop) {
        gsap.fromTo(
          capa,
          { rotationX: 0, scale: 1, transformOrigin: "50% 0%" },
          {
            rotationX: -3.5,
            scale: 0.96,
            transformPerspective: 1400,
            ease: "none",
            scrollTrigger: {
              trigger: capa,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
        /* a sombra na dobra: só aparece conforme a página levanta */
        const dobra = capa.querySelector<HTMLElement>("[data-wk-dobra]");
        if (dobra) {
          gsap.fromTo(
            dobra,
            { opacity: 0 },
            {
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: capa,
                start: "top top",
                end: "bottom top",
                scrub: 0.6,
              },
            }
          );
        }
      }

      /* ============================================================
         3. O FIO DE OURO — a linha da encadernação
         ------------------------------------------------------------
         Um fio de 1px na calha esquerda que se DESENHA conforme você
         desce. É indicador de progresso e costura do livro ao mesmo
         tempo: o tema carrega a função, em vez de uma barrinha genérica
         colada no topo da janela.
         ============================================================ */
      document.querySelectorAll<HTMLElement>("[data-wk-thread]").forEach((fio) => {
        gsap.fromTo(
          fio,
          { scaleY: 0, transformOrigin: "50% 0%" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: fio.parentElement ?? fio,
              start: "top 75%",
              end: "bottom 60%",
              scrub: 0.3,
            },
          }
        );
      });

      /* ============================================================
         4. A BALANÇA PENDE E ASSENTA
         ------------------------------------------------------------
         O componente se chama Balança. Então ela se comporta como uma:
         ao entrar em cena chega levemente inclinada e assenta no fiel.
         0,5° — perceptível como peso, não como animação.

         Os valores do lado AGORA sobem em cascata curta depois, porque
         é neles que o olho tem que parar. O lado ANTES não anima: ele é
         memória, e memória não se move.
         ============================================================ */
      const balancas = document.querySelectorAll<HTMLElement>("[data-wk-balanca]");
      if (balancas.length) {
        const ioBal = new IntersectionObserver(
          (entradas) => {
            entradas.forEach((e) => {
              if (!e.isIntersecting) return;
              ioBal.unobserve(e.target);
              const el = e.target as HTMLElement;
              const tl = gsap.timeline();
              tl.fromTo(
                el,
                { rotationZ: 0.5, y: 10, opacity: 0.55 },
                { rotationZ: 0, y: 0, opacity: 1, duration: 0.62, ease: "power3.out" }
              );
              const agora = el.querySelectorAll(".balanca-lado-agora .efeito-agora, .efeito-agora");
              if (agora.length) {
                tl.fromTo(
                  agora,
                  { y: 7, opacity: 0 },
                  {
                    y: 0,
                    opacity: 1,
                    duration: 0.34,
                    ease: "power2.out",
                    stagger: { each: 0.035, amount: Math.min(0.28, agora.length * 0.035) },
                  },
                  "-=0.34"
                );
              }
              const dia = el.querySelector(".balanca-regua .dia");
              if (dia) {
                tl.fromTo(
                  dia,
                  { scale: 0, rotate: 0 },
                  { scale: 1, rotate: 45, duration: 0.42, ease: "back.out(2.2)" },
                  "-=0.42"
                );
              }
            });
          },
          { threshold: 0.2, rootMargin: "0px 0px -6% 0px" }
        );
        balancas.forEach((b) => ioBal.observe(b));
        observers.push(ioBal);
      }

      /* ============================================================
         5. ENTRADA DISCRETA DAS FICHAS
         ------------------------------------------------------------
         IntersectionObserver, não ScrollTrigger: são 220 fichas na seção
         de Masterwork, e 220 triggers com scrub custam quadro. IO é
         geometria barata do próprio browser.

         Destino em identidade EXPLÍCITA (y:0, opacity:1) para o fim nunca
         depender do estado capturado — determinístico sob HMR.
         ============================================================ */
      const fichas = document.querySelectorAll<HTMLElement>("[data-wk-rise]");
      if (fichas.length) {
        const ioRise = new IntersectionObserver(
          (entradas) => {
            entradas.forEach((e) => {
              if (!e.isIntersecting) return;
              ioRise.unobserve(e.target);
              gsap.fromTo(
                e.target,
                { y: 18, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
              );
            });
          },
          { threshold: 0.06, rootMargin: "0px 0px -4% 0px" }
        );
        fichas.forEach((f) => ioRise.observe(f));
        observers.push(ioRise);
      }

      /* ============================================================
         6. INCLINAÇÃO MAGNÉTICA + BRILHO ESPECULAR
         ------------------------------------------------------------
         Os cartões do índice inclinam na direção do cursor e ganham um
         realce dourado que SEGUE o ponteiro, como luz batendo em folha
         metálica. É o que separa "card com hover" de superfície com
         material.

         Máximo 5°: acima disso o texto do cartão distorce e fica difícil
         de ler — o efeito tem que servir o conteúdo, não competir.
         Só com ponteiro fino: em toque não existe hover, e o listener
         seria custo puro.
         ============================================================ */
      if (podeHover) {
        document.querySelectorAll<HTMLElement>("[data-wk-tilt]").forEach((caixa) => {
          const alvos = Array.from(caixa.children) as HTMLElement[];
          alvos.forEach((cartao) => {
            const rx = gsap.quickTo(cartao, "rotationX", { duration: 0.5, ease: "power2.out" });
            const ry = gsap.quickTo(cartao, "rotationY", { duration: 0.5, ease: "power2.out" });

            const mover = (ev: MouseEvent) => {
              const r = cartao.getBoundingClientRect();
              const px = (ev.clientX - r.left) / r.width;
              const py = (ev.clientY - r.top) / r.height;
              gsap.set(cartao, { transformPerspective: 900 });
              ry((px - 0.5) * 10);
              rx(-(py - 0.5) * 10);
              /* o realce especular acompanha o cursor */
              cartao.style.setProperty("--luz-x", `${px * 100}%`);
              cartao.style.setProperty("--luz-y", `${py * 100}%`);
            };
            const sair = () => {
              rx(0);
              ry(0);
              cartao.style.removeProperty("--luz-x");
              cartao.style.removeProperty("--luz-y");
            };

            cartao.addEventListener("mousemove", mover);
            cartao.addEventListener("mouseleave", sair);
            limpadores.push(() => {
              cartao.removeEventListener("mousemove", mover);
              cartao.removeEventListener("mouseleave", sair);
            });
          });
        });
      }
    });

    /* fontes e imagens mudam o layout depois do primeiro paint */
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t1 = setTimeout(refresh, 900);
    const t2 = setTimeout(refresh, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", refresh);
      observers.forEach((o) => o.disconnect());
      limpadores.forEach((f) => f());
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
