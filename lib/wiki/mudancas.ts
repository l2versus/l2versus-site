import { carregarFamilia } from "./data";
import { SECOES, type Entrada } from "./types";

/**
 * O FEED DO DIFF — a página-assinatura do códice.
 *
 * As seções respondem "como funciona X aqui". Esta responde outra pergunta,
 * que nenhum wiki de servidor costuma responder: **o que mudou, e quando**.
 * Para quem já joga, é a página que diz se vale reler alguma coisa.
 *
 * Duas listas, porque o dado tem duas naturezas e misturá-las mentiria:
 *
 *   datadas   — a fonte registrou a data da alteração. Viram uma linha do
 *               tempo de verdade, da mais recente para a mais antiga.
 *   sem data  — a alteração está documentada, mas o arquivo não diz quando.
 *               Não inventamos data nem escondemos a entrada: ela aparece
 *               numa lista própria, contada e rotulada.
 */

export type MudancaNoFeed = {
  entrada: Entrada;
  secaoSlug: string;
  secaoTitulo: string;
  glifo: string;
};

export type Marco = { data: string; itens: MudancaNoFeed[] };

export type Feed = {
  marcos: Marco[];
  semData: MudancaNoFeed[];
  totalDatadas: number;
  totalSemData: number;
  familiasIndisponiveis: string[];
};

export async function carregarFeed(): Promise<Feed> {
  const todas: MudancaNoFeed[] = [];
  const familiasIndisponiveis: string[] = [];

  await Promise.all(
    SECOES.map(async (s) => {
      const estado = await carregarFamilia(s.familia);
      if (!estado.ok) {
        familiasIndisponiveis.push(s.titulo);
        return;
      }
      for (const entrada of estado.familia.entradas) {
        todas.push({
          entrada,
          secaoSlug: s.slug,
          secaoTitulo: s.titulo,
          glifo: s.glifo,
        });
      }
    })
  );

  const datadas = todas.filter((m) => m.entrada.alteradoEm);
  const semData = todas.filter((m) => !m.entrada.alteradoEm);

  /* agrupa por data e ordena do mais recente para o mais antigo. As datas
     vêm em ISO (AAAA-MM-DD), então comparação de string já ordena certo. */
  const porData = new Map<string, MudancaNoFeed[]>();
  for (const m of datadas) {
    const d = m.entrada.alteradoEm!;
    const lista = porData.get(d);
    if (lista) lista.push(m);
    else porData.set(d, [m]);
  }

  const marcos: Marco[] = [...porData.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([data, itens]) => ({
      data,
      /* dentro de um marco, agrupa por seção para a leitura não pular de
         assunto a cada linha */
      itens: itens.sort(
        (a, b) =>
          a.secaoTitulo.localeCompare(b.secaoTitulo) ||
          a.entrada.titulo.localeCompare(b.entrada.titulo)
      ),
    }));

  return {
    marcos,
    semData: semData.sort(
      (a, b) =>
        a.secaoTitulo.localeCompare(b.secaoTitulo) ||
        a.entrada.titulo.localeCompare(b.entrada.titulo)
    ),
    totalDatadas: datadas.length,
    totalSemData: semData.length,
    familiasIndisponiveis,
  };
}

const MES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "2026-08-18" → "18 de agosto de 2026". Sem `new Date`: a string ISO já
 *  tem tudo, e converter para Date introduz fuso e pode recuar um dia. */
export function dataPorExtenso(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return iso;
  return `${d} de ${MES[m - 1]} de ${a}`;
}
