"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * O FLUXO DA CUSTÓDIA — o argumento da página, animado pelo scroll.
 *
 * Por que existe: "custódia" é palavra abstrata. A versão em cartões dizia
 * tudo certo e não convencia ninguém, porque o jogador desconfiado não precisa
 * LER que o item fica retido — ele precisa VER o item sair da mão dele, entrar
 * no cofre e só então andar. Esta seção substitui os quatro cartões estáticos
 * pela mesma informação encenada: três postos (você, o servidor, o comprador),
 * um item e uma moeda que percorrem o caminho conforme a pessoa rola.
 *
 * O ponto que a animação precisa deixar claro, e que os cartões não deixavam:
 * entre o passo 2 e o 3 o item está COM O SERVIDOR, não com nenhum dos dois.
 * É exatamente aí que mora a diferença para uma troca combinada no chat.
 *
 * Técnica: um trilho alto com palco sticky e uma timeline do GSAP amarrada ao
 * progresso (scrub). Nada de keyframe por tempo — tudo anda e VOLTA com o dedo
 * do jogador, igual à SequenciaScrub. Os tokens são DOM com transform, não
 * canvas: são dois elementos, e transform é de graça na GPU.
 *
 * prefers-reduced-motion: o trilho encolhe, o palco destrava e os passos viram
 * uma lista legível. Nada anima e nada se perde.
 */
export default function FluxoCustodia({
  passos,
  rotulos,
  razao,
}: {
  passos: { titulo: string; desc: string }[];
  rotulos: { voce: string; servidor: string; comprador: string; custodia: string };
  /* O registro que se escreve sozinho. Não é enfeite: a página inteira fala a
     língua de livro-razão, e ver a operação sendo LANÇADA linha a linha é o
     que amarra a cena ao argumento — custódia é, no fim, uma questão de
     registro. Os valores repetem a folha do herói (mesma venda, #1842). */
  razao: { titulo: string; linhas: { rot: string; desc: string; val: string }[] };
}) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trilho = trilhoRef.current;
    const palco = palcoRef.current;
    if (!trilho || !palco) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      trilho.dataset.estatico = "1";
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const item = palco.querySelector<HTMLElement>(".fluxo-item");
    const moeda = palco.querySelector<HTMLElement>(".fluxo-moeda");
    const cofre = palco.querySelector<HTMLElement>(".fluxo-cofre");
    const trava = palco.querySelector<HTMLElement>(".fluxo-trava");
    const listaPassos = Array.from(palco.querySelectorAll<HTMLElement>(".fluxo-passo"));
    const linhasRazao = Array.from(palco.querySelectorAll<HTMLElement>(".fluxo-razao-linha"));
    const rail = palco.querySelector<HTMLElement>(".fluxo-rail-cheio");
    const postoVoce = palco.querySelector<HTMLElement>('[data-posto="voce"]');
    const postoComprador = palco.querySelector<HTMLElement>('[data-posto="comprador"]');
    if (!item || !moeda || !cofre || !postoVoce || !postoComprador) return;

    /* As posições são MEDIDAS dos postos, não chutadas em porcentagem: o
       layout muda entre telas e um offset fixo desalinharia o token do cofre
       justamente no quadro em que ele precisa parecer guardado.

       A referência é a .fluxo-cena e NÃO o palco: os tokens são absolutos
       dentro dela, então é a origem dela que vale. Medindo pelo palco o item
       parava 56px ao lado do cofre — a cena tem largura máxima e é centrada,
       e essa diferença de origem virava erro de posição. */
    const cena = palco.querySelector<HTMLElement>(".fluxo-cena");
    const medir = () => {
      const base = (cena ?? palco).getBoundingClientRect();
      const centro = (el: HTMLElement) => {
        const b = el.getBoundingClientRect();
        return { x: b.left + b.width / 2 - base.left, y: b.top + b.height / 2 - base.top };
      };
      return { voce: centro(postoVoce), cofre: centro(cofre), comprador: centro(postoComprador) };
    };

    let ctx = gsap.context(() => {});

    const montar = () => {
      ctx.revert();
      const p = medir();
      ctx = gsap.context(() => {
        gsap.set(item, { x: p.voce.x, y: p.voce.y, xPercent: -50, yPercent: -50, scale: 1, opacity: 1 });
        gsap.set(moeda, { x: p.comprador.x, y: p.comprador.y, xPercent: -50, yPercent: -50, opacity: 0 });
        gsap.set(trava, { scale: 0, opacity: 0 });
        gsap.set(listaPassos, { opacity: 0.25 });
        gsap.set(linhasRazao, { opacity: 0, x: -12 });
        gsap.set(rail, { scaleX: 0, transformOrigin: "left center" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: trilho,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        /* o trilho preenche ao longo de TODA a timeline: é a régua de progresso
           da operação, e dá ao olho uma referência de "quanto falta" */
        tl.to(rail, { scaleX: 1, duration: 1 }, 0);

        /* cada lançamento do razão entra junto com o seu passo */
        linhasRazao.forEach((l, i) => {
          tl.to(l, { opacity: 1, x: 0, duration: 0.1 }, [0.04, 0.3, 0.6, 0.84][i]);
        });

        /* 1 — você anuncia */
        tl.to(listaPassos[0], { opacity: 1, duration: 0.2 }, 0);

        /* 2 — o item sai de você e entra no cofre; a trava fecha */
        tl.to(listaPassos[0], { opacity: 0.25, duration: 0.15 }, 0.22)
          .to(listaPassos[1], { opacity: 1, duration: 0.15 }, 0.22)
          .to(item, { x: p.cofre.x, y: p.cofre.y, duration: 0.3 }, 0.22)
          .to(item, { scale: 0.62, duration: 0.3 }, 0.22)
          .to(trava, { scale: 1, opacity: 1, duration: 0.12 }, 0.5)
          .to(cofre, { "--brilho": 1, duration: 0.12 } as gsap.TweenVars, 0.5);

        /* 3 — o comprador paga: a moeda viaja até o cofre */
        tl.to(listaPassos[1], { opacity: 0.25, duration: 0.12 }, 0.56)
          .to(listaPassos[2], { opacity: 1, duration: 0.12 }, 0.56)
          .to(moeda, { opacity: 1, duration: 0.08 }, 0.56)
          .to(moeda, { x: p.cofre.x, y: p.cofre.y, duration: 0.2 }, 0.58);

        /* 4 — entrega: item vai ao comprador, moeda volta para você */
        tl.to(listaPassos[2], { opacity: 0.25, duration: 0.12 }, 0.8)
          .to(listaPassos[3], { opacity: 1, duration: 0.12 }, 0.8)
          .to(trava, { scale: 0, opacity: 0, duration: 0.1 }, 0.8)
          .to(item, { x: p.comprador.x, y: p.comprador.y, scale: 1, duration: 0.2 }, 0.82)
          .to(moeda, { x: p.voce.x, y: p.voce.y, duration: 0.2 }, 0.82);
      }, cena ?? palco);
    };

    montar();
    /* remontar no resize: as coordenadas vêm de medição, então mudar a largura
       sem remedir deixaria o item parando ao lado do cofre */
    const ro = new ResizeObserver(() => {
      montar();
      ScrollTrigger.refresh();
    });
    ro.observe(palco);

    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, [passos.length]);

  return (
    <div ref={trilhoRef} className="fluxo-trilho">
      <div ref={palcoRef} className="fluxo-palco">
        <div className="fluxo-cena">
          {/* trilho: fio apagado por baixo, fio dourado por cima que preenche
              com o progresso. Antes havia só um gradiente estático e a cena
              não dava noção de percurso. */}
          <div className="fluxo-rail" aria-hidden>
            <span className="fluxo-rail-cheio" />
          </div>

          <div className="fluxo-posto" data-posto="voce">
            <span className="fluxo-poca" aria-hidden />
            <Silhueta />
            <span className="fluxo-rotulo">{rotulos.voce}</span>
          </div>

          <div className="fluxo-cofre">
            <span className="fluxo-poca fluxo-poca-forte" aria-hidden />
            <Cofre />
            <span className="fluxo-trava" aria-hidden>
              <Cadeado />
            </span>
            <span className="fluxo-rotulo">{rotulos.servidor}</span>
            <span className="fluxo-selo">{rotulos.custodia}</span>
          </div>

          <div className="fluxo-posto" data-posto="comprador">
            <span className="fluxo-poca" aria-hidden />
            <Silhueta />
            <span className="fluxo-rotulo">{rotulos.comprador}</span>
          </div>

          {/* tokens que viajam */}
          <span className="fluxo-item" aria-hidden />
          <span className="fluxo-moeda" aria-hidden />
        </div>

        {/* o registro, lançado linha a linha */}
        <div className="fluxo-razao">
          <div className="fluxo-razao-topo">
            <span>{razao.titulo}</span>
            <span>#1842</span>
          </div>
          {razao.linhas.map((l) => (
            <div key={l.rot} className="fluxo-razao-linha">
              <span className="fluxo-razao-rot">{l.rot}</span>
              <span className="fluxo-razao-desc">{l.desc}</span>
              <span className="fluxo-razao-val">{l.val}</span>
            </div>
          ))}
        </div>

        <ol className="fluxo-passos">
          {passos.map((p, i) => (
            <li key={p.titulo} className="fluxo-passo">
              <span className="fluxo-n">{i + 1}</span>
              <h3>{p.titulo}</h3>
              <p>{p.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Silhueta() {
  return (
    <svg viewBox="0 0 64 72" className="fluxo-svg" role="presentation">
      <circle cx="32" cy="20" r="13" />
      <path d="M6 70 Q6 40 32 40 Q58 40 58 70 Z" />
    </svg>
  );
}

/* Cofre com peso: a primeira versão era um retângulo com um círculo dentro e
   lia como wireframe ao lado do resto da página. Rebites, dobradiças e aro do
   volante dão massa sem custar nada — é tudo vetor. */
function Cofre() {
  const rebites = [
    [15, 15], [105, 15], [15, 95], [105, 95],
    [60, 12], [60, 98],
  ];
  return (
    <svg viewBox="0 0 120 110" className="fluxo-svg fluxo-svg-cofre" role="presentation">
      <rect x="4" y="4" width="112" height="102" rx="7" />
      <rect x="18" y="18" width="84" height="74" rx="5" className="fluxo-porta" />
      {/* dobradiças */}
      <rect x="14" y="30" width="7" height="14" rx="2" className="fluxo-dobra" />
      <rect x="14" y="66" width="7" height="14" rx="2" className="fluxo-dobra" />
      {/* volante */}
      <circle cx="60" cy="55" r="19" className="fluxo-aro" />
      <circle cx="60" cy="55" r="12" className="fluxo-roda" />
      <circle cx="60" cy="55" r="3.5" className="fluxo-eixo" />
      <path d="M60 38 L60 72 M43 55 L77 55 M48 43 L72 67 M72 43 L48 67" className="fluxo-raios" />
      {rebites.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" className="fluxo-rebite" />
      ))}
    </svg>
  );
}

function Cadeado() {
  return (
    <svg viewBox="0 0 40 46" role="presentation">
      <path d="M12 20 V14 a8 8 0 0 1 16 0 V20" className="fluxo-arco" />
      <rect x="6" y="20" width="28" height="22" rx="3" />
    </svg>
  );
}
