"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ícone REAL do L2 servido de /public/l2icons/.
 * - Item:  <L2Icon itemId={1538} />              -> /l2icons/1538.png
 * - Classe:<L2Icon classId={118} kind="class" /> -> /l2icons/class/118.png
 * Se o arquivo não existir, cai num placeholder de losango dourado (sem quebrar).
 *
 * Robustez SSR: o onError pode disparar ANTES do React hidratar (perdendo o evento),
 * deixando o "ícone quebrado" do browser. Por isso também checamos no mount se a
 * imagem já falhou (complete && naturalWidth === 0).
 */
export default function L2Icon({
  itemId,
  classId,
  kind = "item",
  size = 32,
  alt = "",
  className = "",
}: {
  itemId?: number;
  classId?: number;
  kind?: "item" | "class";
  size?: number;
  alt?: string;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const id = kind === "class" ? classId : itemId;
  const src =
    kind === "class" ? `/l2icons/class/${id}.png` : `/l2icons/${id}.png`;

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setErr(true);
  }, [src]);

  if (err || id == null) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={`inline-grid shrink-0 place-items-center rounded-sm border border-[rgba(201,162,75,0.3)] bg-[rgba(201,162,75,0.06)] ${className}`}
      >
        <span className="h-1.5 w-1.5 rotate-45 border border-[var(--color-gold)] bg-[rgba(201,162,75,0.25)]" />
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setErr(true)}
      className={`inline-block shrink-0 rounded-sm border border-[rgba(201,162,75,0.25)] bg-[rgba(0,0,0,0.35)] ${className}`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
