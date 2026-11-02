"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { SkillCliente, SkillsClienteDaClasse, TipoSkill } from "@/lib/wiki/skills-ui";
import { MAGIA, TIPO, descDoGrau, iconeUrl, nomeDoGrau, sp } from "@/lib/wiki/skills-ui";
import { makeT } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/dict";
import { realce } from "@/lib/i18n/realce";

/**
 * O GRIMÓRIO — a árvore de skills de uma classe.
 *
 * A wiki de referência do High Five (l2j.ru) resolve isto com uma tabela que
 * repete a skill UMA VEZ POR GRAU: Stun Attack aparece 15 vezes, Aura Flare 38.
 * É completo e ilegível ao mesmo tempo — e o jogador não vem aqui contar
 * linhas, vem saber o que a skill faz e quanto custa chegar no topo.
 *
 * Aqui a skill é UMA entrada. Os graus viram uma ESCADA: uma régua de entalhes
 * sob a descrição. Passar o mouse (ou as setas do teclado) por ela percorre os
 * graus e o texto, o SP e o nível exigido mudam no lugar. Nenhuma linha se
 * perde — 492 linhas do Gladiator cabem em 32 entradas sem jogar fora um dado.
 *
 * Três coisas que a referência não tem e que são o ponto desta tela:
 *   · o ÍCONE certo, lido do cliente do Versus (801 PNGs 32×32);
 *   · a DESCRIÇÃO que o jogador lê em jogo — já com as alterações do servidor,
 *     que é justamente o que diverge do retail;
 *   · busca que entra no texto do efeito, não só no nome.
 *
 * Os dados vêm prontos e agrupados do build (ver `scripts/preparar-skills-
 * cliente.mjs`). Este componente não calcula nada de servidor: só filtra,
 * agrupa por nível e desenha.
 */

type Props = {
  dados: SkillsClienteDaClasse;
  /** Cor do arquétipo da classe, para o grimório falar a língua da página. */
  cor: string;
  /** Vem do server component que renderiza: aqui não dá para chamar getT(). */
  locale: Locale;
};

type Filtro = "todas" | TipoSkill;

/** O tradutor, como os subcomponentes o recebem. */
type T = (chave: string) => string;

/** Troca `{marca}` pelo valor. Sem regex, que nome de skill tem `(` e `+`. */
function fmt(texto: string, valores: Record<string, string | number>): string {
  let saida = texto;
  for (const [k, v] of Object.entries(valores)) {
    saida = saida.split(`{${k}}`).join(String(v));
  }
  return saida;
}

const SOMENTE = [
  { chave: "magica", rotulo: "wiki.gs.so.magica.rotulo", ajuda: "wiki.gs.so.magica.ajuda" },
  { chave: "fs", rotulo: "wiki.gs.so.fs.rotulo", ajuda: "wiki.gs.so.fs.ajuda" },
  { chave: "auto", rotulo: "wiki.gs.so.auto.rotulo", ajuda: "wiki.gs.so.auto.ajuda" },
] as const;

type ChaveSomente = (typeof SOMENTE)[number]["chave"];

/** Rótulo plural de cada tipo, para a barra de mistura e o aria dela. */
const PLURAL_TIPO: Record<TipoSkill, string> = {
  Ativa: "wiki.gs.mistura.ativas",
  Passiva: "wiki.gs.mistura.passivas",
  Toggle: "wiki.gs.mistura.toggles",
};

export default function GrimorioSkills({ dados, cor, locale }: Props) {
  const t = makeT(locale);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<Filtro>("todas");
  const [somente, setSomente] = useState<Record<ChaveSomente, boolean>>({
    magica: false,
    fs: false,
    auto: false,
  });
  const [densidade, setDensidade] = useState<"lista" | "grade">("lista");
  /** Grau em foco por skill. Ausente = grau 1 (onde ela entra). */
  const [grauSel, setGrauSel] = useState<Record<number, number>>({});
  const [nivelAtivo, setNivelAtivo] = useState<number | null>(null);

  const idBusca = useId();
  const campoBusca = useRef<HTMLInputElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  /** Skill que a grade pediu para abrir na lista (troca de modo + scroll). */
  const pendente = useRef<number | null>(null);

  /* `/` foca a busca, como em todo buscador decente. Esc limpa e devolve o
     foco à página — sem isso o campo vira uma armadilha de teclado. */
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const digitando =
        alvo &&
        (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA" || alvo.isContentEditable);
      if (e.key === "/" && !digitando) {
        e.preventDefault();
        campoBusca.current?.focus();
      }
      if (e.key === "Escape" && alvo === campoBusca.current) {
        setBusca("");
        campoBusca.current?.blur();
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  const alvo = busca.trim().toLowerCase();

  const filtradas = useMemo(() => {
    const porId = alvo.startsWith("#") ? alvo.slice(1) : null;
    return dados.skills.filter((s) => {
      if (tipo !== "todas" && s.tipo !== tipo) return false;
      if (somente.magica && s.magia !== "Sim") return false;
      if (somente.fs && !s.fs) return false;
      if (somente.auto && !s.auto) return false;
      if (!alvo) return true;
      if (porId !== null) return String(s.id).startsWith(porId);
      if (s.nome.toLowerCase().includes(alvo)) return true;
      if (s.nomes?.some((n) => n.toLowerCase().includes(alvo))) return true;
      /* A busca entra no EFEITO, não só no nome: é assim que se acha "todas as
         minhas skills que dão stun" sem saber o nome de nenhuma. */
      return s.graus.some((g) => g.d?.toLowerCase().includes(alvo));
    });
  }, [dados.skills, alvo, tipo, somente]);

  /* Agrupado pelo nível em que a skill ENTRA — a mesma espinha da wiki de
     referência, que é o jeito que o jogador pensa ("o que eu pego no 40?"). */
  const grupos = useMemo(() => {
    const m = new Map<number, SkillCliente[]>();
    for (const s of filtradas) {
      const lista = m.get(s.nivel);
      if (lista) lista.push(s);
      else m.set(s.nivel, [s]);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtradas]);

  /**
   * A RÉGUA.
   *
   * Construída sobre TODAS as skills, nunca sobre as filtradas: ela é o mapa
   * da classe e não pode encolher quando você digita. O que o filtro apagou
   * fica apagado, mas continua no lugar.
   *
   * Os entalhes são posicionados pelo NÍVEL de verdade, não espaçados por
   * igual. É a diferença entre uma lista e um mapa: distribuído por igual,
   * o Gladiator parece ganhar coisa a cada passo; na escala real aparece o
   * bloco denso dos 40 e o deserto de doze níveis até o 76.
   *
   * O rótulo só sai quando cabe. O critério é geométrico e independe da
   * largura da tela: um número por vez, e nunca a menos de 5,5% da régua do
   * número anterior. Primeiro e último sempre aparecem.
   */
  const regua = useMemo(() => {
    const total = new Map<number, number>();
    for (const s of dados.skills) total.set(s.nivel, (total.get(s.nivel) ?? 0) + 1);
    const vivos = new Set(grupos.map(([n]) => n));
    const pico = Math.max(...total.values());
    const niveis = [...total.entries()].sort((a, b) => a[0] - b[0]);
    const min = niveis[0][0];
    const max = niveis[niveis.length - 1][0];
    const faixa = Math.max(1, max - min);

    let ultimoRotulo = -Infinity;
    return niveis.map(([nivel, n], k) => {
      const x = (nivel - min) / faixa;
      const extremo = k === 0 || k === niveis.length - 1;
      const rotulo = extremo || x - ultimoRotulo >= 0.055;
      if (rotulo && k !== niveis.length - 1) ultimoRotulo = x;
      return { nivel, n, x, altura: n / pico, vivo: vivos.has(nivel), rotulo };
    });
  }, [dados.skills, grupos]);

  /* Qual grupo está na tela, para acender o degrau certo na régua. */
  useEffect(() => {
    const nos = raiz.current?.querySelectorAll<HTMLElement>("[data-nivel]");
    if (!nos?.length) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setNivelAtivo(Number((visivel.target as HTMLElement).dataset.nivel));
      },
      { rootMargin: "-140px 0px -70% 0px" }
    );
    nos.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [grupos]);

  /* A grade é um scanner: clicar numa peça volta para a lista já na skill
     clicada. A troca de modo só vale no próximo paint, então o alvo fica
     guardado numa ref em vez de num estado. */
  useEffect(() => {
    if (densidade !== "lista" || pendente.current == null) return;
    const id = pendente.current;
    pendente.current = null;
    requestAnimationFrame(() => {
      document.getElementById(`skill-${id}`)?.scrollIntoView({ block: "center" });
    });
  }, [densidade]);

  const irParaNivel = useCallback((n: number) => {
    document.querySelector(`[data-nivel="${n}"]`)?.scrollIntoView({ block: "start" });
  }, []);

  const limpar = () => {
    setBusca("");
    setTipo("todas");
    setSomente({ magica: false, fs: false, auto: false });
  };

  const filtrando =
    alvo !== "" || tipo !== "todas" || somente.magica || somente.fs || somente.auto;

  const tot = dados.totais;
  const quantos = (k: TipoSkill) =>
    k === "Ativa" ? tot.ativas : k === "Passiva" ? tot.passivas : tot.toggles;

  return (
    <div className="gs" ref={raiz} style={{ ["--c" as string]: cor }}>
      {/* ---------- o que esta classe é, em números ---------- */}
      <div className="gs-resumo">
        <Cifra valor={tot.skills} rotulo={t("wiki.gs.cifra.skills")} />
        <Cifra valor={tot.linhas} rotulo={t("wiki.gs.cifra.graus")} />
        <Cifra valor={sp(tot.sp)} rotulo={t("wiki.gs.cifra.sp")} />
        <Cifra valor={`${tot.nivelMin}–${tot.nivelMax}`} rotulo={t("wiki.gs.cifra.faixa")} />
        <div
          className="gs-mistura"
          role="img"
          aria-label={(["Ativa", "Passiva", "Toggle"] as const)
            .map((k) => `${quantos(k)} ${t(PLURAL_TIPO[k])}`)
            .join(", ")}
        >
          <span className="gs-mistura-barra">
            {(["Ativa", "Passiva", "Toggle"] as const).map((k) => {
              const q = quantos(k);
              if (!q) return null;
              return (
                <span
                  key={k}
                  style={{ flex: q, background: TIPO[k].cor }}
                  title={`${q} ${t(PLURAL_TIPO[k])}`}
                />
              );
            })}
          </span>
          <span className="gs-mistura-legenda">
            {(["Ativa", "Passiva", "Toggle"] as const).map((k) => {
              const q = quantos(k);
              if (!q) return null;
              return (
                <span key={k}>
                  <i style={{ background: TIPO[k].cor }} aria-hidden /> {q} {t(PLURAL_TIPO[k])}
                </span>
              );
            })}
          </span>
        </div>
      </div>

      {/* ---------- a régua: onde a classe ganha coisa ---------- */}
      {regua.length > 1 && (
        <div className="gs-regua" aria-hidden>
          <span className="gs-regua-base" />
          {regua.map((d) => (
            <button
              key={d.nivel}
              type="button"
              tabIndex={-1}
              onClick={() => irParaNivel(d.nivel)}
              className={`gs-tick${d.vivo ? "" : " gs-tick-morto"}${
                nivelAtivo === d.nivel ? " gs-tick-ativo" : ""
              }${d.rotulo ? "" : " gs-tick-mudo"}`}
              style={{
                ["--h" as string]: `${16 + d.altura * 42}px`,
                ["--x" as string]: `${d.x * 100}%`,
              }}
              title={fmt(t(d.n === 1 ? "wiki.gs.regua.tick_1" : "wiki.gs.regua.tick_n"), {
                lv: d.nivel,
                n: d.n,
              })}
            >
              <span className="gs-tick-haste" />
              <span className="gs-tick-num">{d.nivel}</span>
            </button>
          ))}
        </div>
      )}

      {/* ---------- a bancada ---------- */}
      <div className="gs-bancada">
        <div className="gs-campo">
          <span className="gs-lupa" aria-hidden>
            ⌕
          </span>
          <label className="sr-only" htmlFor={idBusca}>
            {t("wiki.gs.busca.rotulo")}
          </label>
          <input
            id={idBusca}
            ref={campoBusca}
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={t("wiki.gs.busca.placeholder")}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd aria-hidden>/</kbd>
        </div>

        <div className="gs-seg" role="group" aria-label={t("wiki.gs.aria.tipo")}>
          {(["todas", "Ativa", "Passiva", "Toggle"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={tipo === k}
              onClick={() => setTipo(k)}
              style={k === "todas" ? undefined : { ["--c" as string]: TIPO[k].cor }}
              title={t(k === "todas" ? "wiki.gs.tipo.todas.ajuda" : TIPO[k].ajuda)}
            >
              {t(k === "todas" ? "wiki.gs.tipo.todas.rotulo" : TIPO[k].rotulo)}
            </button>
          ))}
        </div>

        <div className="gs-marcas" role="group" aria-label={t("wiki.gs.aria.recortes")}>
          {SOMENTE.map((o) => (
            <button
              key={o.chave}
              type="button"
              aria-pressed={somente[o.chave]}
              title={t(o.ajuda)}
              onClick={() => setSomente((s) => ({ ...s, [o.chave]: !s[o.chave] }))}
            >
              {t(o.rotulo)}
            </button>
          ))}
        </div>

        <div className="gs-densidade" role="group" aria-label={t("wiki.gs.aria.densidade")}>
          <button
            type="button"
            aria-pressed={densidade === "lista"}
            onClick={() => setDensidade("lista")}
            title={t("wiki.gs.modo.lista.ajuda")}
          >
            ☰ <span>{t("wiki.gs.modo.lista.rotulo")}</span>
          </button>
          <button
            type="button"
            aria-pressed={densidade === "grade"}
            onClick={() => setDensidade("grade")}
            title={t("wiki.gs.modo.grade.ajuda")}
          >
            ▦ <span>{t("wiki.gs.modo.grade.rotulo")}</span>
          </button>
        </div>

        <p className="gs-conta" aria-live="polite">
          <b>{filtradas.length}</b>
          {filtradas.length !== dados.skills.length && (
            <> {fmt(t("wiki.gs.conta.de"), { n: dados.skills.length })}</>
          )}
          {filtrando && (
            <button type="button" onClick={limpar} className="gs-limpar">
              {t("wiki.gs.limpar")}
            </button>
          )}
        </p>
      </div>

      {/* ---------- o corpo ---------- */}
      {grupos.length === 0 ? (
        <div className="gs-vazio">
          <span aria-hidden>◇</span>
          <p>{realce(fmt(t("wiki.gs.vazio.texto"), { classe: dados.nome }))}</p>
          <button type="button" onClick={limpar} className="btn-ghost px-4 py-2 text-xs">
            {t("wiki.gs.vazio.botao")}
          </button>
        </div>
      ) : densidade === "grade" ? (
        <div className="gs-grade">
          {filtradas.map((s) => (
            <button
              key={s.id}
              type="button"
              className="gs-peca"
              style={{ ["--t" as string]: TIPO[s.tipo].cor }}
              title={descDoGrau(s.graus, 0)}
              onClick={() => {
                pendente.current = s.id;
                setDensidade("lista");
              }}
            >
              <Moldura skill={s} tam={64} t={t} />
              <span className="gs-peca-nome">{s.nome}</span>
              <span className="gs-peca-lv">
                {fmt(t("wiki.gs.peca.nv"), { n: s.nivel })}
                {s.graus.length > 1 && (
                  <i> · {fmt(t("wiki.gs.peca.graus"), { n: s.graus.length })}</i>
                )}
              </span>
            </button>
          ))}
        </div>
      ) : (
        grupos.map(([nivel, lista], gi) => (
          <section key={nivel} className="gs-grupo" style={{ ["--i" as string]: Math.min(gi, 12) }}>
            <h3 className="gs-degrau" data-nivel={nivel} id={`nivel-${nivel}`}>
              <span className="gs-degrau-num">{nivel}</span>
              <span className="gs-degrau-rot">{t("wiki.gs.degrau_rot")}</span>
              <span className="gs-degrau-regua" aria-hidden />
              <span className="gs-degrau-q">
                {fmt(t(lista.length === 1 ? "wiki.gs.grupo.qtd_1" : "wiki.gs.grupo.qtd_n"), {
                  n: lista.length,
                })}
              </span>
            </h3>

            <div className="gs-lista">
              {lista.map((s) => (
                <Verbete
                  key={s.id}
                  skill={s}
                  i={grauSel[s.id] ?? 0}
                  aoEscolher={(i) => setGrauSel((m) => ({ ...m, [s.id]: i }))}
                  termo={alvo.startsWith("#") ? "" : alvo}
                  t={t}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Cifra({ valor, rotulo }: { valor: string | number; rotulo: string }) {
  return (
    <div className="gs-cifra">
      <b>{typeof valor === "number" ? valor.toLocaleString("pt-BR") : valor}</b>
      <span>{rotulo}</span>
    </div>
  );
}

/**
 * A moldura forjada do ícone.
 *
 * O arquivo servido é o ampliado de 128×128 (/skills/x4/*.webp), exibido em
 * 64px. O 32×32 cru do cliente fica em /skills/ como fonte da verdade e das
 * auditorias — ver scripts/ampliar-icones-skill.mjs.
 *
 * Em 51 das 2.318 skills o extrator gravou um PNG que não é o ícone (mipmap
 * de 4×4 esticado, ou o magenta de textura ausente). Nessas, a moldura mostra
 * o GLIFO DO TIPO: assumir a lacuna é melhor do que exibir um borrão como se
 * fosse arte — e aí dá para ver quais faltam, em vez de achar que o ícone da
 * War Frenzy é roxo mesmo.
 */
function Moldura({ skill, tam, t }: { skill: SkillCliente; tam: number; t: T }) {
  const tp = TIPO[skill.tipo];
  return (
    <span
      className={`gs-moldura${skill.semIcone ? " gs-moldura-falta" : ""}`}
      style={{ ["--t" as string]: tp.cor, ["--tam" as string]: `${tam}px` }}
      title={skill.semIcone ? t("wiki.gs.icone_falta") : undefined}
    >
      {skill.semIcone ? (
        <span className="gs-glifo" aria-hidden>
          {tp.glifo}
        </span>
      ) : (
        <img
          src={iconeUrl(skill.icone)}
          alt=""
          width={tam}
          height={tam}
          loading="lazy"
          decoding="async"
        />
      )}
    </span>
  );
}

/** Realça o trecho buscado dentro do nome — sem regex, para não quebrar com
 *  `(`, `+` e afins que aparecem em nome de skill. */
function Realce({ texto, termo }: { texto: string; termo: string }) {
  if (!termo) return <>{texto}</>;
  const i = texto.toLowerCase().indexOf(termo);
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <mark>{texto.slice(i, i + termo.length)}</mark>
      {texto.slice(i + termo.length)}
    </>
  );
}

function Verbete({
  skill,
  i,
  aoEscolher,
  termo,
  t,
}: {
  skill: SkillCliente;
  i: number;
  aoEscolher: (i: number) => void;
  termo: string;
  t: T;
}) {
  const g = skill.graus[i] ?? skill.graus[0];
  const multi = skill.graus.length > 1;
  const nome = nomeDoGrau(skill, i);
  const magia = MAGIA[skill.magia];
  /* Graus que a classe anterior já ensinou — a árvore de uma 2ª/3ª profissão
     continua de onde a anterior parou, não recomeça do 1. */
  const herdados = skill.graus[0].lvl - 1;

  return (
    <article className="gs-verbete" id={`skill-${skill.id}`} style={{ ["--t" as string]: TIPO[skill.tipo].cor }}>
      <Moldura skill={skill} tam={64} t={t} />

      <div className="gs-corpo">
        <header className="gs-cabeca">
          <h4>
            <Realce texto={nome} termo={termo} />
          </h4>

          <span className="gs-tags">
            <span className="gs-tag gs-tag-tipo" title={t(TIPO[skill.tipo].ajuda)}>
              {TIPO[skill.tipo].glifo} {t(TIPO[skill.tipo].rotulo)}
            </span>
            <span
              className="gs-tag"
              style={{ ["--g" as string]: magia.cor }}
              title={t(magia.ajuda)}
            >
              {t(magia.rotulo)}
            </span>
            {skill.fs && (
              <span className="gs-tag gs-tag-fs" title={t("wiki.gs.tag.fs.ajuda")}>
                {t("wiki.gs.tag.fs.rotulo")}
              </span>
            )}
            {skill.livro && (
              <span className="gs-tag gs-tag-livro" title={t("wiki.gs.tag.livro.ajuda")}>
                {t("wiki.gs.tag.livro.rotulo")}
              </span>
            )}
            {skill.auto && (
              <span className="gs-tag gs-tag-auto" title={t("wiki.gs.tag.auto.ajuda")}>
                {t("wiki.gs.tag.auto.rotulo")}
              </span>
            )}
            <a className="gs-id" href={`#skill-${skill.id}`} title={t("wiki.gs.tag.link")}>
              #{skill.id}
            </a>
          </span>
        </header>

        <p className="gs-desc">{descDoGrau(skill.graus, i)}</p>

        {multi && (
          <Escada skill={skill} i={i} aoEscolher={aoEscolher} t={t} />
        )}

        {/* UMA LINHA CORRIDA, não cinco pares rótulo/valor.
            A versão em `<dl>` punha Nível, SP do grau, Graus, Completa em e SP
            ao todo com o MESMO peso — cinco números empatados, nenhum em
            primeiro plano. Como frase, o negrito faz a hierarquia sozinho e a
            unidade ("SP", "graus") vem colada ao número, que é como se lê. */}
        <p className="gs-linha">
          {t("wiki.cls.nivel")} <b>{g.nivel}</b>
          {multi && g.nivel !== skill.nivel && (
            <span className="gs-linha-nota">{t("wiki.gs.linha.neste_grau")}</span>
          )}
          <span className="gs-ponto" aria-hidden />
          {skill.auto ? (
            <em>{t("wiki.gs.linha.auto")}</em>
          ) : (
            <>
              <b>{g.sp > 0 ? g.sp.toLocaleString("pt-BR") : "—"}</b> SP
              {multi && <span className="gs-linha-nota">{t("wiki.gs.linha.neste_grau")}</span>}
            </>
          )}
          {multi && !skill.auto && (
            <>
              <span className="gs-ponto" aria-hidden />
              <b>{sp(skill.spTotal)}</b>{" "}
              {fmt(t("wiki.gs.linha.sp_graus"), { n: skill.graus.length })}
            </>
          )}
          {multi && (
            <>
              <span className="gs-ponto" aria-hidden />
              {t("wiki.gs.linha.completa")} <b>{skill.nivelMax}</b>
            </>
          )}
          {/* Quantos graus ESTA classe ensina ≠ até que grau a skill vai. O
              Gladiator pega Heavy Armor Mastery do grau 14 ao 50: são 37 graus
              aqui, porque o Warrior já ensinou os 13 primeiros. Dizer "50
              graus" seria contar o que a classe anterior pagou. */}
          {herdados > 0 && (
            <>
              <span className="gs-ponto" aria-hidden />
              <em>
                {herdados === 1
                  ? t("wiki.gs.linha.herdado_1")
                  : fmt(t("wiki.gs.linha.herdado_n"), { n: herdados })}
              </em>
            </>
          )}
          {skill.nomes && (
            <>
              <span className="gs-ponto" aria-hidden />
              <em>
                {fmt(t("wiki.gs.linha.muda_nome"), { nomes: skill.nomes.join(" → ") })}
              </em>
            </>
          )}
        </p>
      </div>
    </article>
  );
}

/**
 * A ESCADA DE GRAUS.
 *
 * Um entalhe por grau. Passar o mouse percorre — é leitura, não comando
 * destrutivo, então não exige clique. Setas do teclado fazem o mesmo para quem
 * não usa mouse, e cada entalhe se anuncia inteiro (grau, nível, SP) para
 * leitor de tela, porque sem isso a escada não existiria para quem não enxerga.
 */
function Escada({
  skill,
  i,
  aoEscolher,
  t,
}: {
  skill: SkillCliente;
  i: number;
  aoEscolher: (i: number) => void;
  t: T;
}) {
  const n = skill.graus.length;
  /* Última posição do ponteiro. Sem ela, ROLAR a página com o mouse parado em
     cima da escada troca o grau sozinho: o navegador dispara mouseenter para o
     elemento que passou sob o cursor, mesmo que o cursor não tenha se mexido.
     O grau mudava enquanto o jogador só estava descendo a página. */
  const ultima = useRef({ x: -1, y: -1 });

  return (
    <div
      className="gs-escada"
      role="group"
      aria-label={fmt(t("wiki.gs.escada.aria"), { n, skill: skill.nome })}
      data-graus={n}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          aoEscolher(Math.min(n - 1, i + 1));
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          aoEscolher(Math.max(0, i - 1));
        } else if (e.key === "Home") {
          e.preventDefault();
          aoEscolher(0);
        } else if (e.key === "End") {
          e.preventDefault();
          aoEscolher(n - 1);
        }
      }}
    >
      <span className="gs-escada-rot" aria-hidden>
        {t("wiki.gs.escada.rot")}
      </span>
      {skill.graus.map((g, k) => (
        <button
          key={g.lvl}
          type="button"
          className={`gs-entalhe${k === i ? " gs-entalhe-atual" : ""}${k < i ? " gs-entalhe-feito" : ""}`}
          aria-pressed={k === i}
          tabIndex={k === i ? 0 : -1}
          onPointerMove={(e) => {
            if (e.clientX === ultima.current.x && e.clientY === ultima.current.y) return;
            ultima.current = { x: e.clientX, y: e.clientY };
            aoEscolher(k);
          }}
          onFocus={() => aoEscolher(k)}
          onClick={() => aoEscolher(k)}
          aria-label={fmt(t("wiki.gs.escada.entalhe"), {
            g: g.lvl,
            lv: g.nivel,
            sp:
              g.sp > 0
                ? fmt(t("wiki.gs.escada.com_sp"), { sp: g.sp.toLocaleString("pt-BR") })
                : t("wiki.gs.escada.sem_sp"),
          })}
        >
          <span aria-hidden>{n <= 12 ? g.lvl : ""}</span>
        </button>
      ))}
      <span className="gs-escada-fim" aria-hidden>
        <b>{skill.graus[i].lvl}</b>
        <i>{fmt(t("wiki.gs.escada.de"), { n: skill.graus[n - 1].lvl })}</i>
      </span>
    </div>
  );
}
