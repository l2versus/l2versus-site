"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * DIRETOR DE CENA do site — imersão dobra a dobra.
 *
 * Arquitetura (por robustez, nesta ordem de confiança):
 *  1. ENTRADAS (cine/grupos/títulos): IntersectionObserver do browser toca
 *     tweens GSAP pausados — play ao entrar, reverse ao sair (ir e vir).
 *     IO é geometria real: imune a pin-spacer, ordem de criação e direção.
 *  2. PROFUNDIDADE (data-plx): ScrollTrigger scrub — camadas deslizam N% da
 *     viewport amarradas ao scroll.
 *  3. CENA PINADA (banner das raças): timeline com pin + scrub.
 *
 * API por atributo:
 *  - data-plx="N"                       → desliza N% da viewport (+desce/-sobe)
 *  - data-cine="left|right|up|pop"      → entrada individual
 *  - data-cine-group="rise|alt-x|pop|tilt" → filhos em cascata
 *  - data-cine-depth="2"                → anima os netos (grids aninhados)
 *  - data-count="1248"                  → conta de 0 até o alvo
 *  - data-split                         → título revela palavra por palavra
 *  - data-hero-knight                   → cavaleiro invade pela direita no load
 *  - data-races-pin/-bg/-strip/-title/-sub → cena pinada
 */
export default function ParallaxFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const desktop = window.innerWidth >= 768;
    const DX = desktop ? 110 : 48;
    const DY = desktop ? 70 : 40;

    const observers: IntersectionObserver[] = [];

    // gsap.context: no cleanup, revert() mata os tweens E restaura os estilos
    // inline. Sem isso, o double-mount do StrictMode envenena o estado: o
    // from() da 2ª montagem captura elementos já escondidos e anima "0 → 0".
    const ctx = gsap.context(() => {

    /* ================= 1. ENTRADAS via IntersectionObserver =============== */

    // Um IO só para todos os reveals: play ao entrar, reverse ao sair.
    const revealMap = new Map<Element, gsap.core.Tween>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const tw = revealMap.get(e.target);
          if (!tw) return;
          if (e.isIntersecting) tw.play();
          else tw.reverse();
        }),
      { threshold: 0.12 }
    );
    observers.push(io);

    // fromTo com destino EXPLÍCITO (identidade): o fim nunca depende do
    // estado capturado — determinístico mesmo sob HMR/StrictMode.
    const IDENTITY: gsap.TweenVars = {
      x: 0,
      y: 0,
      scale: 1,
      rotationX: 0,
      yPercent: 0,
      opacity: 1,
    };
    const register = (
      watch: Element,
      targets: gsap.TweenTarget,
      from: gsap.TweenVars,
      opts: gsap.TweenVars = {}
    ) => {
      const tw = gsap.fromTo(targets, from, {
        ...IDENTITY,
        paused: true,
        immediateRender: true,
        duration: (opts.duration as number) ?? 0.95,
        ease: (opts.ease as string) ?? "power3.out",
        stagger: opts.stagger ?? 0,
      });
      revealMap.set(watch, tw);
      io.observe(watch);
    };

    // entradas individuais
    const FROM: Record<string, gsap.TweenVars> = {
      left: { x: -DX, opacity: 0 },
      right: { x: DX, opacity: 0 },
      up: { y: DY, opacity: 0 },
      pop: { scale: 0.72, opacity: 0 },
    };
    document.querySelectorAll<HTMLElement>("[data-cine]").forEach((el) => {
      const kind = el.dataset.cine ?? "up";
      register(el, el, FROM[kind] ?? FROM.up, {
        ease: kind === "pop" ? "back.out(1.6)" : "power3.out",
        duration: 1.05,
      });
    });

    // grupos: filhos (ou netos) em cascata
    document
      .querySelectorAll<HTMLElement>("[data-cine-group]")
      .forEach((group) => {
        const kind = group.dataset.cineGroup ?? "rise";
        const depth = group.dataset.cineDepth === "2";
        const items = depth
          ? group.querySelectorAll(":scope > * > *")
          : group.querySelectorAll(":scope > *");
        if (!items.length) return;

        if (kind === "alt-x") {
          register(
            group,
            items,
            {
              x: (i: number) => (i % 2 === 0 ? -DX : DX),
              opacity: 0,
            },
            { stagger: 0.08 }
          );
        } else if (kind === "pop") {
          register(
            group,
            items,
            { scale: 0.6, opacity: 0 },
            { ease: "back.out(1.7)", stagger: { each: 0.06, from: "center" } }
          );
        } else if (kind === "tilt") {
          register(
            group,
            items,
            {
              rotationX: -32,
              transformPerspective: 900,
              transformOrigin: "50% 0%",
              y: 48,
              opacity: 0,
            },
            { duration: 1.15, stagger: 0.16 }
          );
        } else {
          register(group, items, { y: DY, opacity: 0 }, { stagger: 0.09 });
        }
      });

    // títulos: revelam palavra por palavra (clip)
    document.querySelectorAll<HTMLElement>("[data-split]").forEach((h) => {
      if (h.dataset.splitDone) return;
      h.dataset.splitDone = "1";
      const words = (h.textContent ?? "").split(/\s+/).filter(Boolean);
      h.textContent = "";
      const inners: HTMLElement[] = [];
      words.forEach((w, i) => {
        const clip = document.createElement("span");
        clip.style.cssText =
          "display:inline-block;overflow:hidden;vertical-align:top";
        const inner = document.createElement("span");
        inner.style.display = "inline-block";
        inner.textContent = w;
        clip.appendChild(inner);
        h.appendChild(clip);
        if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
        inners.push(inner);
      });
      register(h, inners, { yPercent: 115 }, { ease: "power4.out", stagger: 0.07, duration: 0.85 });
    });

    // contador: conta uma vez ao aparecer
    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count ?? "0", 10);
      if (!target) return;
      const cIo = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          cIo.disconnect();
          const obj = { n: 0 };
          gsap.to(obj, {
            n: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.n).toLocaleString("pt-BR");
            },
          });
        },
        { threshold: 0.4 }
      );
      cIo.observe(el);
      observers.push(cIo);
    });

    /* ================= 2. PROFUNDIDADE (parallax scrub) ==================== */

    document.querySelectorAll<HTMLElement>("[data-plx]").forEach((el) => {
      const speed = parseFloat(el.dataset.plx ?? "0");
      if (!speed) return;
      const dist = (speed / 100) * window.innerHeight;
      gsap.fromTo(
        el,
        { y: -dist },
        {
          y: dist,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.4,
          },
        }
      );
    });

    /* ================= 3. MOMENTOS ÚNICOS ================================= */

    // cavaleiro invade a cena pela direita no load
    const knight = document.querySelector<HTMLElement>("[data-hero-knight]");
    if (knight && desktop) {
      gsap.from(knight, {
        x: 220,
        opacity: 0,
        duration: 1.5,
        delay: 0.2,
        ease: "power3.out",
      });
    }

    // cena pinada: banner das raças
    const pinSec = document.querySelector<HTMLElement>("[data-races-pin]");
    if (pinSec) {
      const bg = pinSec.querySelector("[data-races-bg]");
      const strip = pinSec.querySelector("[data-races-strip]");
      const title = pinSec.querySelector("[data-races-title]");
      const sub = pinSec.querySelector("[data-races-sub]");
      if (desktop) {
        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: pinSec,
            start: "top top",
            end: "+=120%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        });
        if (bg) pinTl.fromTo(bg, { scale: 1.02, y: -50 }, { scale: 1.22, y: 50, ease: "none" }, 0);
        if (strip) pinTl.fromTo(strip, { xPercent: 4 }, { xPercent: -46, ease: "none" }, 0);
        if (title)
          pinTl.fromTo(
            title,
            { scale: 0.86, letterSpacing: "0.02em" },
            { scale: 1.12, letterSpacing: "0.1em", ease: "none" },
            0
          );
        if (sub) pinTl.fromTo(sub, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.3 }, 0.12);
      } else if (strip) {
        gsap.fromTo(
          strip,
          { xPercent: 4 },
          {
            xPercent: -40,
            ease: "none",
            scrollTrigger: { trigger: pinSec, start: "top bottom", end: "bottom top", scrub: 0.4 },
          }
        );
      }
    }

    }); // fim do gsap.context

    // layout muda quando imagens/fontes chegam — recalcular os triggers
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t1 = setTimeout(refresh, 1200);
    const t2 = setTimeout(refresh, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", refresh);
      observers.forEach((o) => o.disconnect());
      ctx.revert(); // mata tweens/triggers E restaura estilos inline
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
