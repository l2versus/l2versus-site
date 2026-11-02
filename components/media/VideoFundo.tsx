"use client";

import { useEffect, useRef, useState } from "react";

/**
 * VÍDEO DE FUNDO — a camada viva atrás do hero.
 *
 * Não é um <video autoplay> solto, por três razões que são regra aqui:
 *
 * 1. CELULAR NÃO PAGA. O arquivo tem ~4 MB; no 4G do jogador isso é custo
 *    real por uma decoração que o scrim quase cobre. Abaixo de `minWidth`
 *    (e com Save-Data ligado) o componente nem monta o <video> — montar com
 *    `display:none` não bastaria, o navegador baixa mesmo escondido.
 *
 * 2. `prefers-reduced-motion` é lei. Quem pediu menos movimento recebe a
 *    arte estática que sempre esteve embaixo — o vídeo nunca monta.
 *
 * 3. SEM FLASH. O vídeo nasce invisível em cima da arte estática e só
 *    aparece (fade de 1,2s) quando o evento `playing` dispara — a página
 *    nunca mostra retângulo preto nem pulo de poster. Se o autoplay for
 *    bloqueado ou o arquivo falhar, nada acontece: fica a arte de sempre.
 *    O modo de falha é a página de ontem, não uma página quebrada.
 *
 * Fora da viewport o vídeo PAUSA (IntersectionObserver): decodificar 24fps
 * atrás de três seções de distância é bateria jogada fora.
 *
 * O loop é um palíndromo gerado offline (vai e volta — 15,9s sem corte);
 * ver a geração em scripts/, pasta public/video/.
 */
export default function VideoFundo({
  webm,
  mp4,
  className = "",
  minWidth = 768,
}: {
  webm?: string;
  mp4?: string;
  className?: string;
  minWidth?: number;
}) {
  const [liberado, setLiberado] = useState(false);
  const [rodando, setRodando] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const largo = window.matchMedia(`(min-width: ${minWidth}px)`).matches;
    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    type ConexaoComSaveData = { saveData?: boolean };
    const economia = (navigator as Navigator & { connection?: ConexaoComSaveData })
      .connection?.saveData === true;
    if (largo && !calmo && !economia) setLiberado(true);
  }, [minWidth]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {/* autoplay negado: fica a arte */});
        else v.pause();
      },
      { rootMargin: "20% 0px" }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [liberado]);

  if (!liberado) return null;

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      onPlaying={() => setRodando(true)}
      className={`${className} transition-opacity duration-[1200ms] ease-out ${
        rodando ? "opacity-100" : "opacity-0"
      }`}
    >
      {webm && <source src={webm} type="video/webm" />}
      {mp4 && <source src={mp4} type="video/mp4" />}
    </video>
  );
}
