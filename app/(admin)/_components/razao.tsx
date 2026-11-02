/**
 * Os tipos móveis do painel: as peças de LIVRO-RAZÃO que todas as seções usam.
 *
 * Por que um arquivo de peças e não Tailwind solto em cada tabela: o painel
 * precisa parecer o mesmo produto que /marketplace — fio fino, número tabular
 * à direita, rótulo em versalete apagado. Isso é meia dúzia de decisões
 * tipográficas repetidas em sete seções; espalhá-las é garantir que a sétima
 * saia diferente das seis primeiras.
 *
 * As classes globais (.panel, .wiki-table, .selo-*, .rmt-folha, .rmt-linha)
 * vêm de app/globals.css e são reaproveitadas de propósito — foram desenhadas
 * para exatamente esta linguagem na página pública do RMT.
 *
 * ⚠️ ALINHAMENTO VAI EM `style`, NÃO EM CLASSE TAILWIND.
 *    `.wiki-table thead th { text-align: left }` tem especificidade (0,1,2) e
 *    ganha de `.text-right` (0,1,0) — a utility é silenciosamente ignorada no
 *    cabeçalho. Em vez de descobrir isso de novo a cada tabela, as peças daqui
 *    usam `style={{ textAlign: "right" }}`, que não tem como perder.
 */

import type { ReactNode } from "react";

/* ---------------------------------------------------------------- dinheiro */

const DEC = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Centavos → USD. Locale fixo em `en-US` e não o do visitante: a moeda do
 * mercado é dólar, e o mesmo número tem que ler igual para os cinco sócios,
 * independente do idioma do navegador de cada um.
 *
 * Não usa `style: "currency"` porque ela produz "-$18.00"; a linguagem da casa
 * é o sinal de menos tipográfico, "−$18.00", igual à folha de /marketplace.
 */
export function usd(cents: number | null | undefined): string {
  const c = Number(cents ?? 0);
  return (c < 0 ? "−$" : "$") + DEC.format(Math.abs(c) / 100);
}

export type Tom = "neutro" | "credito" | "debito" | "alarme" | "apagado";

const COR: Record<Tom, string> = {
  neutro: "var(--color-parchment)",
  credito: "#7bd88f",
  debito: "#e2857c",
  alarme: "var(--color-crimson)",
  apagado: "var(--color-faint)",
};

/** Valor em USD, alinhado à direita, em numeral tabular. */
export function Usd({
  cents,
  tom = "neutro",
  forte = false,
}: {
  cents: number | null | undefined;
  tom?: Tom;
  forte?: boolean;
}) {
  return (
    <span
      style={{
        display: "block",
        textAlign: "right",
        fontFamily: "var(--font-display)",
        fontVariantNumeric: "tabular-nums",
        fontSize: forte ? "1.05rem" : undefined,
        color: COR[tom],
        whiteSpace: "nowrap",
      }}
    >
      {usd(cents)}
    </span>
  );
}

/** Inteiro simples (contagem, id, nível) — também tabular e à direita. */
export function Num({
  v,
  tom = "neutro",
}: {
  v: number | null | undefined;
  tom?: Tom;
}) {
  return (
    <span
      style={{
        display: "block",
        textAlign: "right",
        fontVariantNumeric: "tabular-nums",
        color: COR[tom],
      }}
    >
      {v == null ? "—" : Number(v).toLocaleString("en-US")}
    </span>
  );
}

/* ------------------------------------------------------------------- datas */

/**
 * Formato pt-BR curto com hora. A hora importa: uma op presa "há 26 horas" e
 * um `reserved_until` que já passou só fazem sentido com minuto na tela.
 *
 * Renderiza no servidor, no fuso do servidor — que é o fuso em que o
 * GameServer grava os TIMESTAMP. Converter para o fuso do navegador faria a
 * linha do painel discordar do log do jogo, que é onde o incidente é
 * investigado de verdade.
 */
export function data(v: Date | string | null | undefined): string {
  if (!v) return "—";
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Data({ v }: { v: Date | string | null | undefined }) {
  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        color: "var(--color-faint)",
        whiteSpace: "nowrap",
        fontSize: "0.82rem",
      }}
    >
      {data(v)}
    </span>
  );
}

/* ----------------------------------------------------------------- rótulos */

/** Cabeça de seção: versalete apagado + fio fino que varre o resto da largura. */
export function Secao({
  rotulo,
  titulo,
  nota,
  alerta,
  children,
}: {
  rotulo: string;
  titulo: string;
  nota?: ReactNode;
  alerta?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="mt-14 first:mt-0">
      <p
        className="flex items-center gap-4 text-[0.6rem] font-bold uppercase"
        style={{
          letterSpacing: "0.36em",
          color: alerta ? "var(--color-crimson)" : "var(--color-gold)",
        }}
      >
        {rotulo}
        <span
          aria-hidden
          className="h-px flex-1"
          style={{
            background: `linear-gradient(90deg, ${
              alerta ? "rgba(200,67,59,0.5)" : "rgba(201,162,75,0.45)"
            }, transparent)`,
          }}
        />
      </p>
      <h2 className="mt-2 font-display text-2xl tracking-[0.05em] text-[var(--color-parchment)] md:text-[1.75rem]">
        {titulo}
      </h2>
      {nota ? (
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[var(--color-muted)]">
          {nota}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------- selo/chips */

/**
 * Status de anúncio como selo. O mapa é EXAUSTIVO sobre o ENUM da migração 006
 * — se alguém acrescentar um estado lá e esquecer daqui, o selo cai no neutro
 * em vez de desaparecer, e o texto cru do status aparece na tela. Falha
 * visível é melhor que falha bonita.
 */
const SELO_STATUS: Record<string, string> = {
  pending_escrow: "selo-pendente",
  active: "selo-tier-normal",
  reserved: "selo-tier-improved",
  sold: "selo-tier-improved",
  delivering: "selo-tier-improved",
  delivered: "selo-tier-lesser",
  cancelled: "selo-tier-lesser",
  refunded: "selo-aviso",
  // ops e saques compartilham a peça
  pending: "selo-pendente",
  done: "selo-tier-lesser",
  failed: "selo-aviso",
  requested: "selo-pendente",
  processing: "selo-tier-normal",
  paid: "selo-tier-lesser",
  rejected: "selo-aviso",
};

export function Selo({
  valor,
  variante,
}: {
  valor: string;
  variante?: "aviso" | "ok" | "pendente";
}) {
  const cls =
    variante === "aviso"
      ? "selo-aviso"
      : variante === "ok"
        ? "selo-tier-normal"
        : variante === "pendente"
          ? "selo-pendente"
          : (SELO_STATUS[valor] ?? "selo-tier-lesser");
  return <span className={`selo ${cls}`}>{valor.replace(/_/g, " ")}</span>;
}

/* -------------------------------------------------------------- celas (KPI) */

/**
 * Cela do resumo. Deliberadamente NÃO é um cartão com sombra e ícone: é uma
 * casa de livro-razão — rótulo minúsculo em cima, número grande embaixo,
 * separada das vizinhas por um fio. Cartões dariam o mesmo peso visual a
 * "anúncios ativos" e "passivo da casa", e esses dois números não têm o mesmo
 * peso nenhum.
 */
export function Cela({
  rotulo,
  valor,
  nota,
  tom = "neutro",
}: {
  rotulo: string;
  valor: string;
  nota?: string;
  tom?: Tom;
}) {
  return (
    // O fio divisório mora no CONTAINER (`divide-x`), não aqui: borda própria
    // em cada cela dobraria a linha junto da moldura do painel e desenharia um
    // traço solto no começo de cada fileira ao quebrar.
    <div
      className="min-w-0 px-4 py-4"
      style={{
        background: tom === "alarme" ? "rgba(200,67,59,0.07)" : "transparent",
      }}
    >
      <p
        className="text-[0.56rem] font-bold uppercase"
        style={{ letterSpacing: "0.22em", color: "var(--color-faint)" }}
      >
        {rotulo}
      </p>
      <p
        className="mt-2 font-display"
        style={{
          fontSize: "clamp(1.25rem, 2.4vw, 1.7rem)",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
          color: COR[tom],
        }}
      >
        {valor}
      </p>
      {nota ? (
        <p className="mt-1 text-[0.7rem] leading-snug text-[var(--color-faint)]">
          {nota}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ tabela */

/**
 * Toda tabela do painel mora dentro deste invólucro.
 *
 * O `overflow-x: auto` não é detalhe de responsividade: a tabela de custódia
 * tem onze colunas e, sem um contexto de rolagem PRÓPRIO, ela empurra a página
 * inteira para o lado no celular (e o site usa `overflow-x: clip` no body, o
 * que esconderia a coluna de preço em vez de dar barra). `min-w-0` é o
 * companheiro obrigatório: sem ele um filho de grid/flex se recusa a encolher
 * abaixo do conteúdo e o `auto` nunca ativa.
 */
export function Quadro({ children }: { children: ReactNode }) {
  return (
    <div className="panel panel-gold min-w-0 overflow-x-auto">
      <div className="min-w-[46rem]">{children}</div>
    </div>
  );
}

/** Linha única de "não há nada aqui" — com o motivo, nunca só um travessão. */
export function Vazio({ texto }: { texto: string }) {
  return (
    <div className="panel px-5 py-7 text-center text-sm text-[var(--color-faint)]">
      {texto}
    </div>
  );
}

/** Cabeçalho de coluna numérica (alinhamento por `style`, ver topo do arquivo). */
export function Th({
  children,
  num = false,
}: {
  children: ReactNode;
  num?: boolean;
}) {
  return <th style={num ? { textAlign: "right" } : undefined}>{children}</th>;
}
