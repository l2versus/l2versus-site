import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import WikiMotion from "./_components/WikiMotion";

/**
 * Casca do wiki.
 *
 * `wiki-quiet` baixa o grão da landing: textura de filme compete com texto
 * denso, e aqui o trabalho da página é ser lida. O resto do material — cor,
 * fonte, losango — é o mesmo do site.
 *
 * O WikiMotion é o diretor de cena PRÓPRIO do wiki, deliberadamente separado
 * do ParallaxFx da home — ver o cabeçalho daquele arquivo para o porquê.
 *
 * O estado inicial escondido dos elementos animados é resolvido em CSS puro,
 * com `@media (scripting: enabled)`: sem JavaScript, nada fica invisível.
 */
export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="wiki-quiet min-h-screen">
      <WikiMotion />
      <SiteHeader active="wiki" />
      {children}
      <SiteFooter />
    </div>
  );
}
