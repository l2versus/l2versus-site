"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * SEQUÊNCIA SCRUB — vídeo controlado pelo scroll, quadro a quadro.
 *
 * Por que não <video> com currentTime: seek de vídeo é assíncrono e depende
 * de decode de keyframe — o resultado visível é soquinho, não scrub. A
 * técnica aqui é a clássica de página de produto: os quadros do vídeo viram
 * imagens WebP, e um canvas desenha o quadro mais próximo do progresso do
 * scroll. drawImage é síncrono e barato, então o "vídeo" anda e VOLTA com o
 * dedo do jogador, na velocidade do dedo do jogador.
 *
 * Os quadros vivem em /public/seq/<nome>/q_001.webp..q_NNN.webp (1-based).
 * O primeiro quadro também é o poster (background do palco), então existe
 * imagem na tela antes do JS hidratar — e é o que fica se o JS não rodar.
 *
 * O carregamento começa quando a seção se APROXIMA (IntersectionObserver a
 * uma viewport de distância), em duas ondas: primeiro 1 quadro a cada 8
 * (cobertura grosseira imediata — scrubbar já funciona, só quantizado),
 * depois o resto. O desenho usa o quadro CARREGADO mais próximo do alvo,
 * então nunca há buraco preto no meio da sequência.
 *
 * Modos:
 *   heroi  — trilho de alturaVh com palco sticky de 100svh. Os filhos com
 *            classe ss-cap + data-de/data-ate são capítulos de texto que
 *            entram e saem por faixa de progresso (0..1).
 *   banda  — faixa full-bleed que scrubba enquanto cruza a viewport.
 *   painel — preenche o pai; o progresso vem do ancestral [data-scrub-cena]
 *            (a cena inteira do split). Tem que ser assim: um painel sticky
 *            não sai do lugar, e um trigger nele mesmo congelaria o scrub.
 *
 * prefers-reduced-motion: o componente marca data-ss-estatico no trilho e o
 * CSS empilha os capítulos como texto normal sobre o poster. Nada anima.
 */
type Props = {
  pasta: string;
  quadros: number;
  modo?: "heroi" | "banda" | "painel";
  alturaVh?: number;
  className?: string;
  children?: ReactNode;
};

export default function SequenciaScrub({
  pasta,
  quadros,
  modo = "heroi",
  alturaVh = 280,
  className = "",
  children,
}: Props) {
  const raizRef = useRef<HTMLDivElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const raiz = raizRef.current;
    const palco = palcoRef.current;
    const canvas = canvasRef.current;
    if (!raiz || !palco || !canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raiz.dataset.ssEstatico = "1";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    /* ---------- carregamento dos quadros ---------- */
    const prontos: (HTMLImageElement | undefined)[] = new Array(quadros);
    let iniciou = false;
    let vivo = true;

    const nome = (i: number) => `${pasta}/q_${String(i + 1).padStart(3, "0")}.webp`;

    const pedir = (i: number) => {
      const img = new Image();
      img.decoding = "async";
      img.src = nome(i);
      /* decode() ANTES de publicar em `prontos`: sem isso o primeiro
         drawImage de cada quadro paga a decodificação na thread principal,
         no meio do scroll — 48 micro-travadas, uma por quadro novo. Com
         decode() a imagem só entra na lista já pronta para desenhar, e o
         custo sai do caminho do scroll. O catch mantém o carregamento vivo
         se um quadro falhar (o desenho usa o vizinho mais próximo). */
      const publicar = () => {
        if (!vivo) return;
        const primeiro = !prontos.some(Boolean);
        prontos[i] = img;
        /* o primeiro quadro revela a resolução real da fonte — só então dá
           para calcular o teto do buffer (ver `dimensionar`) */
        if (primeiro) dimensionar();
        if (Math.abs(i - alvoAtual()) < 8) agendar();
      };
      if (typeof img.decode === "function") {
        img.decode().then(publicar).catch(() => {
          img.onload = publicar;
        });
      } else {
        img.onload = publicar;
      }
    };

    const carregarTudo = () => {
      if (iniciou) return;
      iniciou = true;
      const vistos = new Set<number>();
      /* onda 1: cobertura grosseira; onda 2: o resto em ordem */
      for (let i = 0; i < quadros; i += 8) {
        vistos.add(i);
        pedir(i);
      }
      for (let i = 0; i < quadros; i++) {
        if (!vistos.has(i)) pedir(i);
      }
    };

    /* o primeiro quadro entra já — é o poster de verdade */
    pedir(0);
    const io = new IntersectionObserver(
      (ent) => {
        if (ent.some((e) => e.isIntersecting)) {
          carregarTudo();
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px 100% 0px" }
    );
    io.observe(raiz);

    /* ---------- desenho ---------- */
    let progresso = 0;
    let raf = 0;
    const alvoAtual = () =>
      Math.max(0, Math.min(quadros - 1, Math.round(progresso * (quadros - 1))));

    const desenhar = () => {
      raf = 0;
      const alvo = alvoAtual();
      /* o carregado mais próximo do alvo — nunca tela preta no meio */
      let img: HTMLImageElement | undefined;
      for (let d = 0; d < quadros; d++) {
        img = prontos[alvo - d] ?? prontos[alvo + d];
        if (img) break;
      }
      if (!img || !canvas.width) return;
      ctx2d.imageSmoothingEnabled = true;
      ctx2d.imageSmoothingQuality = "high";
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(desenhar);
    };

    /* Buffer do canvas: NUNCA maior que a fonte.
       A sequência tem 1272px de largura e o palco ocupa 1920. Um buffer em
       dpr 1,5 (2880px) desenharia 5× mais pixels que o quadro original tem —
       custo de GPU puro, zero detalhe a mais, e é o que fazia o scroll
       engasgar em tela cheia. O teto passa a ser a largura real do quadro;
       o upscale que sobrar fica a cargo do CSS, que é praticamente de graça. */
    const larguraFonte = () => prontos.find(Boolean)?.naturalWidth ?? 0;
    const dimensionar = () => {
      const cssW = palco.clientWidth;
      const cssH = palco.clientHeight;
      if (!cssW || !cssH) return;
      const dprBruto = Math.min(window.devicePixelRatio || 1, 1.5);
      const fonte = larguraFonte();
      const teto = fonte ? fonte / cssW : dprBruto;
      const dpr = Math.max(1, Math.min(dprBruto, teto));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      agendar();
    };
    dimensionar();
    const ro = new ResizeObserver(dimensionar);
    ro.observe(palco);

    /* ---------- capítulos (só no modo herói) ---------- */
    const caps =
      modo === "heroi"
        ? Array.from(palco.querySelectorAll<HTMLElement>(".ss-cap")).map((el) => ({
            el,
            de: parseFloat(el.dataset.de ?? "0"),
            ate: parseFloat(el.dataset.ate ?? "1"),
          }))
        : [];
    const fio = palco.querySelector<HTMLElement>(".ss-fio span");

    const encenar = (p: number) => {
      for (const c of caps) {
        const faixa = Math.max(0.0001, c.ate - c.de);
        const entra = Math.max(0, Math.min(1, (p - c.de) / (faixa * 0.22)));
        const sai =
          c.ate >= 0.985 ? 1 : Math.max(0, Math.min(1, (c.ate - p) / (faixa * 0.22)));
        const a = Math.min(entra, sai);
        c.el.style.opacity = String(a);
        c.el.style.transform = `translateY(${(1 - entra) * 26 - (1 - sai) * 14}px)`;
        c.el.style.pointerEvents = a > 0.6 ? "auto" : "none";
      }
      if (fio) fio.style.transform = `scaleX(${p})`;
    };

    /* ---------- o trigger ---------- */
    const gatilho =
      modo === "painel"
        ? (raiz.closest<HTMLElement>("[data-scrub-cena]") ?? raiz)
        : raiz;
    const janela =
      modo === "heroi"
        ? { start: "top top", end: "bottom bottom" }
        : modo === "banda"
          ? { start: "top bottom", end: "bottom top" }
          : { start: "top 60%", end: "bottom 85%" };

    const st = ScrollTrigger.create({
      trigger: gatilho,
      start: janela.start,
      end: janela.end,
      scrub: true,
      onUpdate: (self) => {
        progresso = self.progress;
        agendar();
        if (caps.length || fio) encenar(self.progress);
      },
    });
    encenar(0);

    return () => {
      vivo = false;
      st.kill();
      ro.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pasta, quadros, modo]);

  const ehHeroi = modo === "heroi";
  return (
    <div
      ref={raizRef}
      className={`ss-trilho ${className}`}
      /* inline porque o .ss-trilho{position:relative} do globals vem DEPOIS
         das utilities do Tailwind e engoliria um `absolute inset-0` vindo do
         call-site — foi exatamente o bug do painel da linha-de-base: trilho
         em fluxo, altura zero, canvas de 0px. Inline não perde para folha. */
      style={
        ehHeroi
          ? { height: `${alturaVh}vh` }
          : modo === "painel"
            ? { position: "absolute", inset: 0 }
            : undefined
      }
      data-ss-modo={modo}
    >
      <div
        ref={palcoRef}
        className={ehHeroi ? "ss-palco" : "ss-palco-fixo"}
        style={{ backgroundImage: `url(${pasta}/q_001.webp)` }}
      >
        <canvas ref={canvasRef} className="ss-canvas" aria-hidden />
        <div className="ss-scrim" aria-hidden />
        {children}
        {ehHeroi && (
          <div className="ss-fio" aria-hidden>
            <span />
          </div>
        )}
      </div>
    </div>
  );
}
