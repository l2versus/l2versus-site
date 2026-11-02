import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getLocale } from "@/lib/i18n/server";
import { realce } from "@/lib/i18n/realce";
import { tRecursos } from "@/lib/i18n/recursos";
import "./recursos.css";

/**
 * /recursos — A CARTA DOS OITO SISTEMAS
 *
 * O QUE ESTAVA ERRADO (e é o que esta reescrita conserta)
 *
 * A versão anterior era uma pilha de oito cartões idênticos: quadradinho com
 * glifo unicode, título, parágrafo, linha "COMO USAR" — repetida oito vezes, e
 * no fim uma fileira de oito ícones ainda menores. Três defeitos somados:
 *
 *   1. Sem hierarquia. Auto-Farm e Anti-Bot não valem o mesmo para quem está
 *      decidindo se cria conta. Um é o motivo de ficar; o outro é garantia.
 *      Grade uniforme diz ao olho que são equivalentes — e aí nada é
 *      argumento, tudo é inventário.
 *   2. Sem peso. Nenhum texto passava de 1rem, metade em caixa alta com
 *      tracking largo. A tese da página saía em 0,875rem e cinza.
 *   3. Sem benefício. Cada cartão descrevia o MECANISMO ("o sistema caça mobs
 *      respeitando raio e HP mínimo") e deixava para o jogador deduzir o que
 *      aquilo faz pela vida dele.
 *
 * O DESENHO NOVO: quatro atos, três ritmos
 *
 *   Ato I   — pilar (Auto-Farm, largura cheia) + par (Offline Shops, GM Shop).
 *             São os três que vendem o servidor; ganham a maior escala.
 *   Ato II  — par (Itens Custom, DressMe): a identidade.
 *   Ato III — linhas editoriais alternadas (Olympiad, Cercos): o endgame.
 *   Ato IV  — pergaminho (Anti-Bot): a cláusula, não a feature.
 *
 * Cada sistema agora tem três camadas de texto, na ordem em que o jogador
 * decide: LEAD (o que isso faz por você) > CORPO (o que é) > PASSO (como usar).
 * Os passos são os mesmos da versão anterior, intactos: ALT+B no Community
 * Board, nível 55+ e terceira classe no Grand Olympiad Manager, NPC nas praças,
 * preço em Adena, drop em eventos e raids, denúncia por Discord com vídeo.
 * Nenhum sistema novo, nenhum número novo — só redação com peso.
 *
 * ÂNCORAS SÃO CONTRATO
 *
 * Os oito `id` (auto-farm, offline-shops, gm-shop, itens-custom, dressme,
 * olympiada, cercos, anti-bot) são linkados pelos tiles da home
 * (`/recursos#slug`, app/page.tsx). Renomear um quebra a home sem erro de
 * compilação — o link simplesmente deixa de rolar. Eles ficam como estavam.
 *
 * PENDÊNCIA QUE NÃO É MINHA: o dono notou que "não tem como acessar essa
 * página se não for clicando no ícone". É verdade, e a causa está fora deste
 * arquivo — /recursos não existe na lista de itens do SiteHeader. O conserto é
 * uma linha lá. Aqui ficou o que dá para fazer de dentro: um sumário de
 * verdade no topo e saídas para /wiki, /download e /register no fim.
 *
 * i18n: as strings vivem em lib/i18n/recursos.ts (namespace `rc.*`), lidas
 * direto para a página não depender do merge em site-dict.ts, que está sendo
 * editado em paralelo.
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = tRecursos(await getLocale());
  return { title: t("rc.meta.titulo"), description: t("rc.meta.desc") };
}

type Slug =
  | "auto-farm"
  | "offline-shops"
  | "gm-shop"
  | "itens-custom"
  | "dressme"
  | "olympiada"
  | "cercos"
  | "anti-bot";

/* ============================================================
   OS GLIFOS
   ------------------------------------------------------------
   Desenhados aqui, não importados: são oito, pequenos, e viram SVG
   inline no HTML — zero requisição, zero flash de ícone faltando.
   O vocabulário é o do resto do site: traço de 1px, canto reto
   (`stroke-linecap: square`, no CSS) e o losango de 45° como peça
   cheia. Todos usam `currentColor`, então quem muda a cor é o hover
   do cartão inteiro, não um seletor por ícone.
   Cada um precisa dizer o SISTEMA, não a categoria: o Offline Shop
   leva uma lua dentro do toldo (vende enquanto você dorme), o
   Auto-Farm é uma roda que gira sozinha, o Anti-Bot é escudo de
   contorno duplo (gravado, não "ícone de segurança").
   ============================================================ */
const GLIFOS: Record<Slug, ReactNode> = {
  "auto-farm": (
    <svg viewBox="0 0 40 40" className="rc-svg" aria-hidden focusable="false">
      <path d="M20 5.5A14.5 14.5 0 0 1 34.5 20" />
      <path d="M20 34.5A14.5 14.5 0 0 1 5.5 20" />
      <path className="sol" d="M34.5 23.4 31.6 17.9h5.8z" />
      <path className="sol" d="M5.5 16.6 8.4 22.1H2.6z" />
      <path d="M20 12.6 27.4 20 20 27.4 12.6 20z" />
      <path className="sol" d="M20 17.2 22.8 20 20 22.8 17.2 20z" />
    </svg>
  ),
  "offline-shops": (
    <svg viewBox="0 0 40 40" className="rc-svg" aria-hidden focusable="false">
      <path className="sol" d="M20 2.6 22.6 5.2 20 7.8 17.4 5.2z" />
      <path d="M5.5 15 20 7.4 34.5 15" />
      <path d="M5.5 15q2.9 4.2 5.8 0q2.9 4.2 5.8 0q2.9 4.2 5.8 0q2.9 4.2 5.8 0q2.9 4.2 5.8 0" />
      <path d="M8.6 20v13M31.4 20v13M4.5 33h31" />
      <path d="M23.2 23.6a4.4 4.4 0 1 0 0 7.8 5.4 5.4 0 0 1 0-7.8z" />
    </svg>
  ),
  "gm-shop": (
    <svg viewBox="0 0 40 40" className="rc-svg" aria-hidden focusable="false">
      <path className="sol" d="M20 4.6 22.4 7 20 9.4 17.6 7z" />
      <path d="M7 33.5V19a13 13 0 0 1 26 0v14.5" />
      <path d="M4 33.5h32" />
      <circle cx="20" cy="21" r="5.4" />
      <path className="sol" d="M20 17.6 23.4 21 20 24.4 16.6 21z" />
    </svg>
  ),
  "itens-custom": (
    <svg viewBox="0 0 40 40" className="rc-svg" aria-hidden focusable="false">
      <path d="M20 2.5 24 11v13h-8V11z" />
      <path d="M20 6v18" />
      <path d="M10.5 24h19" />
      <path d="M20 24v8" />
      <path className="sol" d="M20 31.8 22.8 34.6 20 37.4 17.2 34.6z" />
    </svg>
  ),
  dressme: (
    <svg viewBox="0 0 40 40" className="rc-svg" aria-hidden focusable="false">
      <path d="M20 5.5 11.5 9.5 7.5 33.5h25L28.5 9.5z" />
      <path d="M14.5 8 20 14l5.5-6" />
      <path className="sol" d="M33.5 1.5 34.9 5.1 38.5 6.5 34.9 7.9 33.5 11.5 32.1 7.9 28.5 6.5 32.1 5.1z" />
    </svg>
  ),
  olympiada: (
    <svg viewBox="0 0 40 40" className="rc-svg" aria-hidden focusable="false">
      <path d="M20 35.5C9.5 31.5 6.5 24 7.5 13" />
      <path d="M20 35.5C30.5 31.5 33.5 24 32.5 13" />
      <path d="M9.6 26.6 5 24.8M8 20.2 3.3 19.4M8.2 14 3.7 14.6" />
      <path d="M30.4 26.6 35 24.8M32 20.2 36.7 19.4M31.8 14 36.3 14.6" />
      <path className="sol" d="M20 3.6 23.4 7 20 10.4 16.6 7z" />
      <path className="sol" d="M12.6 7.6 14.6 9.6 12.6 11.6 10.6 9.6z" />
      <path className="sol" d="M27.4 7.6 29.4 9.6 27.4 11.6 25.4 9.6z" />
    </svg>
  ),
  cercos: (
    <svg viewBox="0 0 40 40" className="rc-svg" aria-hidden focusable="false">
      <path className="sol" d="M13.5 2 15.6 4.1 13.5 6.2 11.4 4.1z" />
      <path d="M13.5 5.5V36" />
      <path d="M13.5 8h20l-4.6 6.5L33.5 21h-20z" />
      <path className="sol" d="M20.5 11 24 14.5 20.5 18 17 14.5z" />
      <path d="M4 36h32" />
      <path d="M21 36v-7h4v3h4v-3h4v7" />
    </svg>
  ),
  "anti-bot": (
    <svg viewBox="0 0 40 40" className="rc-svg" aria-hidden focusable="false">
      <path d="M20 3.5 33 7.8V20c0 7.6-5.3 13-13 16.5C12.3 33 7 27.6 7 20V7.8z" />
      <path d="M20 8.2 29.2 11.2V20c0 5.6-3.8 9.6-9.2 12.2-5.4-2.6-9.2-6.6-9.2-12.2v-8.8z" />
      <path className="sol" d="M20 14.5 24.6 20 20 25.5 15.4 20z" />
    </svg>
  ),
};

/* Os quatro atos, com os sistemas de cada um. Serve ao sumário E à ordem da
   página — uma fonte só, para o índice nunca mentir sobre o conteúdo. */
const ATOS: { n: string; rot: string; slugs: Slug[] }[] = [
  { n: "I", rot: "rc.ato1.rot", slugs: ["auto-farm", "offline-shops", "gm-shop"] },
  { n: "II", rot: "rc.ato2.rot", slugs: ["itens-custom", "dressme"] },
  { n: "III", rot: "rc.ato3.rot", slugs: ["olympiada", "cercos"] },
  { n: "IV", rot: "rc.ato4.rot", slugs: ["anti-bot"] },
];

/** O tradutor desta página, passado por prop. */
type Trad = (chave: string) => string;

/* Os três pesos de bloco vivem no escopo do MÓDULO, e não dentro do
   componente de página, de propósito: função declarada dentro do corpo de
   outro componente nasce com identidade nova a cada render. Aqui isso seria
   inofensivo (é server component, renderiza uma vez e não tem estado), mas o
   dia em que alguém colar esse mesmo padrão num client component vira remonte
   de subárvore a cada tecla. Barato manter certo desde já.
   Também NÃO viram componentes em components/: só esta página os usa, e três
   linhas de JSX compartilhadas com ninguém é dívida, não reuso. */

function Placa({ s, grande }: { s: Slug; grande?: boolean }) {
  return (
    <span className={grande ? "rc-placa rc-placa-g" : "rc-placa"} aria-hidden>
      {GLIFOS[s]}
    </span>
  );
}

/** A faixa acionável: o único conteúdo do cartão que manda o jogador fazer
    algo. Por isso tem fundo e fio próprios, em vez de ser a última linha
    cinza do parágrafo, como era antes. */
function Passo({ t, s }: { t: Trad; s: Slug }) {
  return (
    <p className="rc-passo">
      <span className="rc-passo-rot">{t("rc.how")}</span>
      <span className="rc-passo-txt">{t(`rc.${s}.passo`)}</span>
    </p>
  );
}

/** Peso médio (atos I e II): placa e nome na mesma linha, texto embaixo. */
function Cartao({ t, s }: { t: Trad; s: Slug }) {
  return (
    <article id={s} className="rc-cartao filet panel">
      <span className="filet-alt" aria-hidden />
      <div className="rc-cartao-cab">
        <Placa s={s} />
        <h3 className="rc-nome">{t(`rc.${s}.nome`)}</h3>
      </div>
      <p className="rc-lead">{t(`rc.${s}.lead`)}</p>
      <p className="rc-corpo-txt">{t(`rc.${s}.corpo`)}</p>
      <Passo t={t} s={s} />
    </article>
  );
}

/** Linha editorial (ato III): a placa troca de lado a cada linha. */
function Linha({ t, s, invertida }: { t: Trad; s: Slug; invertida?: boolean }) {
  return (
    <article
      id={s}
      className={`rc-linha filet panel${invertida ? " rc-linha-inv" : ""}`}
    >
      <span className="filet-alt" aria-hidden />
      <Placa s={s} />
      <div className="rc-linha-txt">
        <h3 className="rc-nome">{t(`rc.${s}.nome`)}</h3>
        <p className="rc-lead">{t(`rc.${s}.lead`)}</p>
        <p className="rc-corpo-txt">{t(`rc.${s}.corpo`)}</p>
        <Passo t={t} s={s} />
      </div>
    </article>
  );
}

export default async function RecursosPage() {
  const t = tRecursos(await getLocale());

  return (
    <main className="min-h-screen">
      <SiteHeader active="features" />

      {/* ========== ABERTURA ========== */}
      <section className="rc-hero">
        <span className="rc-hero-ghost" aria-hidden>
          VERSUS
        </span>
        <div className="rc-hero-corpo">
          <p className="rc-kicker">
            <span className="rc-dia" aria-hidden />
            {t("rc.kicker")}
          </p>
          <h1 className="rc-h1">{t("rc.titulo")}</h1>
          <div className="diamond-rule rc-regua">
            <span className="dia" />
          </div>
          {/* uma chave só, com **forte** no meio: em RU e PL a palavra
              realçada cai em outra posição da oração */}
          <p className="rc-tese">{realce(t("rc.tese"), { forte: "rc-forte" })}</p>
        </div>
      </section>

      {/* ========== SUMÁRIO ========== */}
      <nav className="rc-sumario" aria-label={t("rc.sumario")}>
        <p className="rc-sum-rot">{t("rc.sumario")}</p>
        <div className="rc-sum-grade">
          {ATOS.map((ato) => (
            <div key={ato.n} className="rc-sum-grupo">
              <p className="rc-sum-ato">
                <span className="marginalia">{ato.n}</span>
                {t(ato.rot)}
              </p>
              <div className="rc-sum-lista">
                {ato.slugs.map((s) => (
                  <Link key={s} href={`#${s}`} className="rc-sum-link">
                    {t(`rc.${s}.nome`)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* ========== ATO I — A ROTINA ========== */}
      <section className="rc-ato">
        <header className="rc-ato-cab">
          <span className="marginalia rc-ato-num">I</span>
          <h2 className="rc-ato-tit">{t("rc.ato1.titulo")}</h2>
          <p className="rc-ato-sub">{t("rc.ato1.sub")}</p>
        </header>

        {/* O PILAR. Auto-Farm é o único sistema desta página que muda o que o
            jogador faz quando NÃO está no jogo — por isso é ele que ganha a
            largura cheia, a placa de 7,5rem e o `panel-gold`. */}
        <article id="auto-farm" className="rc-pilar filet panel panel-gold panel-lit">
          <span className="filet-alt" aria-hidden />
          <div className="rc-pilar-sel">
            <Placa s="auto-farm" grande />
            <span className="selo selo-tier-improved">{t("rc.selo.pilar")}</span>
          </div>
          <div className="rc-pilar-txt">
            <h3 className="rc-nome rc-nome-g">{t("rc.auto-farm.nome")}</h3>
            <p className="rc-lead rc-lead-g">{t("rc.auto-farm.lead")}</p>
            <p className="rc-corpo-txt">{t("rc.auto-farm.corpo")}</p>
            <Passo t={t} s="auto-farm" />
          </div>
        </article>

        <div className="rc-par">
          <Cartao t={t} s="offline-shops" />
          <Cartao t={t} s="gm-shop" />
        </div>
      </section>

      {/* ========== ATO II — A IDENTIDADE ========== */}
      <section className="rc-ato">
        <header className="rc-ato-cab">
          <span className="marginalia rc-ato-num">II</span>
          <h2 className="rc-ato-tit">{t("rc.ato2.titulo")}</h2>
          <p className="rc-ato-sub">{t("rc.ato2.sub")}</p>
        </header>
        <div className="rc-par">
          <Cartao t={t} s="itens-custom" />
          <Cartao t={t} s="dressme" />
        </div>
      </section>

      {/* ========== ATO III — O ENDGAME ========== */}
      <section className="rc-ato">
        <header className="rc-ato-cab">
          <span className="marginalia rc-ato-num">III</span>
          <h2 className="rc-ato-tit">{t("rc.ato3.titulo")}</h2>
          <p className="rc-ato-sub">{t("rc.ato3.sub")}</p>
        </header>
        <Linha t={t} s="olympiada" />
        <Linha t={t} s="cercos" invertida />
      </section>

      {/* ========== ATO IV — A CLÁUSULA (pergaminho) ==========
          A virada tonal é o argumento: três atos vendendo conforto, e aqui a
          página vira a folha e assina a regra. O `id` fica na própria seção
          porque é ele que o tile "Anti-Bot" da home procura. */}
      <section id="anti-bot" className="rc-carta zone-parchment cut-both">
        <div className="rc-carta-corpo">
          <Placa s="anti-bot" grande />
          <div>
            <span className="marginalia rc-ato-num">IV</span>
            <h2 className="rc-ato-tit">{t("rc.ato4.titulo")}</h2>
            <p className="rc-ato-sub">{t("rc.ato4.sub")}</p>
            <h3 className="rc-nome rc-carta-nome">{t("rc.anti-bot.nome")}</h3>
            <p className="rc-lead">{t("rc.anti-bot.lead")}</p>
            <p className="rc-corpo-txt">{t("rc.anti-bot.corpo")}</p>
            <Passo t={t} s="anti-bot" />
            <p className="rc-carta-selo">
              <span className="selo selo-tier-normal">{t("rc.selo.sempre")}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ========== FECHAMENTO ========== */}
      <section className="rc-cta">
        <h2 className="rc-cta-tit">{t("rc.cta.titulo")}</h2>
        <p className="rc-cta-sub">{t("rc.cta.sub")}</p>
        <div className="rc-cta-botoes">
          <Link href="/register" className="btn-gold rc-btn">
            {t("rc.cta.acc")}
          </Link>
          <Link href="/download" className="btn-ghost rc-btn">
            {t("rc.cta.dl")}
          </Link>
          {/* saída lateral: metade de quem lê isto ainda está decidindo, e o
              códice é o argumento mais forte que o site tem */}
          <Link href="/wiki" className="rc-cta-link">
            {t("rc.cta.wiki")} →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
