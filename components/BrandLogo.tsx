import Image from "next/image";

/**
 * Logo VERSUS metálica com efeito (shine varrendo + glow pulsante).
 * Componente de marca COMPARTILHADO — usar em todas as telas no lugar do
 * wordmark de texto. O PNG tem fundo preto sólido → `mix-blend: lighten`
 * (definido em globals.css `.brand-logo img`) faz o preto sumir contra o
 * fundo escuro, deixando só o metal.
 */
export default function BrandLogo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`brand-logo ${className}`}>
      <Image
        src="/art/versus-logo-alpha.png"
        alt="Versus"
        width={1745}
        height={581}
        priority={priority}
        sizes="(max-width: 768px) 80vw, 480px"
      />
    </span>
  );
}
