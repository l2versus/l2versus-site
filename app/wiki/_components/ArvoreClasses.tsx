"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { ARQUETIPOS, RACAS, TIERS } from "@/lib/wiki/classes-ui";
import type { Classe, Divergencia } from "@/lib/wiki/classes";
import GlifoArquetipo from "./GlifoArquetipo";

/**
 * A ÁRVORE DE CLASSES.
 *
 * Decisões que valem explicar:
 *
 * 1. LAYOUT EM COLUNAS, NÃO EM DIAGRAMA LIVRE. Quatro colunas — inicial, 1ª,
 *    2ª, 3ª — e a linhagem lida da esquerda para a direita. Um diagrama de nós
 *    com posição arbitrária seria mais "bonito" em print e pior de usar: o
 *    jogador quer responder "onde isso vai dar" seguindo uma linha reta.
 *
 * 2. OS CONECTORES SÃO CSS, NÃO SVG. Cada cartão desenha seu próprio cotovelo
 *    (::before entrando pela esquerda, ::after saindo pela direita) com o
 *    tronco vertical no grupo. SVG exigiria medir posição real no cliente,
 *    re-medir a cada resize, e quebraria no scroll horizontal do mobile.
 *
 * 3. O CAMINHO ACENDE. Passar o mouse numa classe ilumina a linhagem inteira,
 *    ancestrais e descendentes, e apaga o resto. É a pergunta que a árvore
 *    existe para responder, respondida sem clique.
 *
 * 4. FILTRO POR FUNÇÃO NÃO ESCONDE — APAGA. Sumir com os cartões faria as
 *    colunas dançarem e a topologia perder o sentido. Quem não casa com o
 *    filtro fica no lugar, esmaecido.
 */
export default function ArvoreClasses({
  classes,
  divergencias,
  resumoSkills,
}: {
  classes: Classe[];
  divergencias: Divergencia[];
  /** contagens por classId, do extrator de skillTrees; vazio se o arquivo faltar */
  resumoSkills?: Record<number, { skillsUnicas: number; spTotal: number; nivelMinimo: number }>;
}) {
  const [raca, setRaca] = useState<string>("HUMAN");
  const [funcao, setFuncao] = useState<string | null>(null);
  const [aceso, setAceso] = useState<number | null>(null);

  const porId = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const idsDivergentes = useMemo(
    () => new Set(divergencias.map((d) => d.id)),
    [divergencias]
  );

  /* A linhagem de um nó: a cadeia reta até a raiz, mais o que nasce DELE.
     Os dois conjuntos são calculados separadamente de propósito — a versão
     ingênua (jogar ancestrais e descendentes no mesmo saco e expandir) acende
     a árvore quase inteira: ao incluir "Human Fighter" como ancestral, a
     expansão pega TODOS os filhos dele, e Gladiator passava a iluminar
     Paladin, Hawkeye e mais 12. Descendente é descendente do nó focado, não
     de quem veio antes dele. */
  const linhagem = useMemo(() => {
    if (aceso === null) return null;
    const dentro = new Set<number>([aceso]);

    /* para cima: só a cadeia direta */
    let atual = porId.get(aceso);
    while (atual?.paiId != null) {
      dentro.add(atual.paiId);
      atual = porId.get(atual.paiId);
    }

    /* para baixo: fronteira que parte apenas do nó aceso */
    let fronteira = [aceso];
    while (fronteira.length) {
      const filhos = classes.filter(
        (c) => c.paiId != null && fronteira.includes(c.paiId) && !dentro.has(c.id)
      );
      filhos.forEach((c) => dentro.add(c.id));
      fronteira = filhos.map((c) => c.id);
    }
    return dentro;
  }, [aceso, classes, porId]);

  const colunas = useMemo(() => {
    const daRaca = classes.filter((c) => c.raca === raca);
    return [0, 1, 2, 3].map((t) =>
      daRaca.filter((c) => c.tier === t).sort((a, b) => a.id - b.id)
    );
  }, [classes, raca]);

  const cor = useCallback(
    (a: string) => ARQUETIPOS.find((x) => x.chave === a)?.cor ?? "var(--color-gold)",
    []
  );

  const totalRaca = colunas.reduce((n, c) => n + c.length, 0);

  return (
    <div>
      {/* ---------- abas de raça ---------- */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--color-line)] pb-px">
        {RACAS.map((r) => {
          const ativa = r.chave === raca;
          const n = classes.filter((c) => c.raca === r.chave).length;
          return (
            <button
              key={r.chave}
              type="button"
              onClick={() => {
                setRaca(r.chave);
                setAceso(null);
              }}
              aria-current={ativa ? "true" : undefined}
              className={`aba-raca ${ativa ? "aba-raca-ativa" : ""}`}
            >
              {r.nome}
              <span className="ml-2 text-[0.92rem] opacity-60">{n}</span>
            </button>
          );
        })}
      </div>

      {/* ---------- legenda / filtro por função ---------- */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[0.68rem] uppercase tracking-[0.24em] text-[var(--color-faint)]">
          Função
        </span>
        {ARQUETIPOS.map((a) => {
          const ativo = funcao === a.chave;
          return (
            <button
              key={a.chave}
              type="button"
              onClick={() => setFuncao(ativo ? null : a.chave)}
              aria-pressed={ativo}
              className={`chip-funcao ${ativo ? "chip-funcao-ativo" : ""}`}
              style={{ ["--c" as string]: a.cor }}
            >
              <GlifoArquetipo arquetipo={a.chave} className="h-3.5 w-3.5" />
              {a.nome}
            </button>
          );
        })}
        {funcao && (
          <button
            type="button"
            onClick={() => setFuncao(null)}
            className="ml-1 text-[0.75rem] uppercase tracking-[0.18em] text-[var(--color-faint)] underline-offset-4 transition-colors hover:text-[var(--color-gold-bright)] hover:underline"
          >
            limpar
          </button>
        )}
        <span className="ml-auto text-[0.75rem] uppercase tracking-[0.18em] text-[var(--color-faint)]">
          {totalRaca} classes
        </span>
      </div>

      {/* ---------- MOBILE: trilhas verticais ----------
          Quatro colunas lado a lado precisam de ~900px. Num celular de 390px
          isso vira rolagem lateral cega: vê-se a coluna 1 e um pedaço da 2,
          com um vazio enorme embaixo (a 1ª tem 2 classes, a 4ª tem 13). Então
          no celular a topologia muda de eixo: cada classe INICIAL abre uma
          trilha, e a descendência desce indentada por profissão. A informação
          é a mesma; o que muda é a direção da leitura — que no celular é
          vertical. */}
      <div className="arv-trilhas md:hidden">
        {colunas[0].map((raiz) => {
          const descendentes = (pai: number): Classe[] =>
            classes
              .filter((c) => c.paiId === pai)
              .sort((a, b) => a.id - b.id);
          const linha = (c: Classe, nivel: number): React.ReactNode => {
            const apagado =
              (funcao !== null && c.arquetipo !== funcao) ||
              (linhagem !== null && !linhagem.has(c.id));
            return (
              <div key={c.id}>
                <Link
                  href={`/wiki/classes/${c.slug}`}
                  className={`arv-trilha-no ${apagado ? "arv-apagado" : ""}`}
                  style={{
                    ["--c" as string]: cor(c.arquetipo),
                    ["--nivel" as string]: String(nivel),
                  }}
                >
                  <span className="arv-glifo">
                    <GlifoArquetipo arquetipo={c.arquetipo} className="h-[17px] w-[17px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="arv-nome">{c.nome}</span>
                    <span className="arv-meta">
                      {TIERS[c.tier]}
                      {c.invocador && <span className="arv-tag">invocador</span>}
                    </span>
                    {resumoSkills?.[c.id] && (
                      <span className="arv-nums">
                        <b>{resumoSkills[c.id].skillsUnicas}</b> skills
                        <span className="sep" aria-hidden />
                        nível <b>{resumoSkills[c.id].nivelMinimo}</b>
                      </span>
                    )}
                  </span>
                  <span className="arv-id">{c.id}</span>
                </Link>
                {descendentes(c.id).map((f) => linha(f, nivel + 1))}
              </div>
            );
          };
          return (
            <section key={raiz.id} className="arv-trilha">
              {linha(raiz, 0)}
            </section>
          );
        })}
      </div>

      {/* ---------- DESKTOP: um painel por RAMO ----------
          A versão anterior era uma grade só, com as 29 classes da raça
          empilhadas em 4 colunas. Isso tinha dois defeitos estruturais que
          nenhuma largura conserta: a 1ª coluna tem 2 cartões e a 4ª tem 13,
          então sobrava um vazio enorme à esquerda; e nada dizia a QUAL
          tronco cada cartão pertencia — Bishop aparecia na mesma coluna que
          Gladiator, sem relação visível.

          Agora cada classe inicial abre seu próprio painel, com sua grade de
          4 colunas. As alturas ficam coerentes dentro de cada painel, o
          tronco fica explícito, e a leitura horizontal (inicial → 3ª) se
          mantém, que era o que funcionava. */}
      <div className="mt-6 hidden md:block">
        {colunas[0].map((raiz) => {
          const doRamo = (c: Classe): boolean => {
            let atual: Classe | undefined = c;
            while (atual) {
              if (atual.id === raiz.id) return true;
              atual = atual.paiId == null ? undefined : porId.get(atual.paiId);
            }
            return false;
          };
          const colunasRamo = [0, 1, 2, 3].map((t) =>
            classes
              .filter((c) => c.raca === raca && c.tier === t && doRamo(c))
              .sort((a, b) => a.id - b.id)
          );
          const totalRamo = colunasRamo.reduce((n, c) => n + c.length, 0);

          return (
            <section key={raiz.id} className="arv-ramo">
              <header className="arv-ramo-cabeca">
                <span
                  className="arv-ramo-glifo"
                  style={{ ["--c" as string]: cor(raiz.arquetipo) }}
                  aria-hidden
                >
                  <GlifoArquetipo arquetipo={raiz.arquetipo} className="h-[15px] w-[15px]" />
                </span>
                <h3 className="arv-ramo-titulo">{raiz.nome}</h3>
                <span className="arv-ramo-linha" aria-hidden />
                <span className="arv-ramo-total">{totalRamo} classes</span>
              </header>

              <div className="arv-sangria overflow-x-auto pb-2">
                <div className="arv-grade" onMouseLeave={() => setAceso(null)}>
                  {colunasRamo.map((coluna, t) => (
                    <div key={t} className="arv-coluna">
                      <p className="arv-cabecalho">{TIERS[t]}</p>
                      <div className="arv-pilha">
                        {coluna.map((c) => {
                          const apagado =
                            (funcao !== null && c.arquetipo !== funcao) ||
                            (linhagem !== null && !linhagem.has(c.id));
                          const naLinhagem = linhagem !== null && linhagem.has(c.id);
                          return (
                            <Link
                              key={c.id}
                              href={`/wiki/classes/${c.slug}`}
                              className={`arv-no ${t > 0 ? "arv-no-filho" : ""} ${
                                apagado ? "arv-apagado" : ""
                              } ${naLinhagem ? "arv-aceso" : ""}`}
                              style={{ ["--c" as string]: cor(c.arquetipo) }}
                              onMouseEnter={() => setAceso(c.id)}
                              onFocus={() => setAceso(c.id)}
                              aria-label={`${c.nome} — ${TIERS[c.tier]}, ${
                                ARQUETIPOS.find((a) => a.chave === c.arquetipo)?.nome ?? "—"
                              }`}
                            >
                              {t > 0 && <span className="arv-fio" aria-hidden />}
                              <span className="arv-glifo">
                                <GlifoArquetipo
                                  arquetipo={c.arquetipo}
                                  className="h-[18px] w-[18px]"
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="arv-nome">{c.nome}</span>
                                <span className="arv-meta">
                                  {TIERS[c.tier]}
                                  {c.invocador && <span className="arv-tag">invocador</span>}
                                  {idsDivergentes.has(c.id) && (
                                    <span
                                      className="arv-tag arv-tag-aviso"
                                      title="As duas fontes do servidor discordam do pai desta classe — ver nota abaixo"
                                    >
                                      fontes divergem
                                    </span>
                                  )}
                                </span>
                                {resumoSkills?.[c.id] && (
                                  <span className="arv-nums">
                                    <b>{resumoSkills[c.id].skillsUnicas}</b> skills
                                    <span className="sep" aria-hidden />
                                    nível <b>{resumoSkills[c.id].nivelMinimo}</b>
                                  </span>
                                )}
                              </span>
                              <span className="arv-id">{c.id}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
