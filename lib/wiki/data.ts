import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FamiliaSchema, SECOES, type Familia, type SecaoMeta } from "./types";
import { traduzirFamilia } from "./frases-conteudo.mjs";
import { getLocale } from "../i18n/server";
import type { Locale } from "../i18n/dict";

/**
 * Carregador do conteúdo do wiki.
 *
 * O dado vive em `content/wiki/<familia>.json`, gerado dos arquivos-fonte em
 * `docs/wiki-fonte/` do repo do servidor. NÃO vem do MariaDB, por três razões:
 *
 *  1. É dado de referência que muda quando o servidor muda — raramente — e não
 *     por request. Ler do disco no build e servir estático é a forma certa.
 *  2. Commitado, o diff do git vira changelog de balanceamento de graça.
 *  3. O site builda sem banco, o que mantém o deploy simples.
 *
 * DECISÃO DELIBERADA SOBRE FALHA: este carregador NÃO devolve lista vazia em
 * silêncio. Se um JSON falta ou está malformado, ele devolve `{ erro }` e a UI
 * desenha um estado de erro VISÍVEL na página. É o oposto do que os
 * repositórios de `lib/repos/` fazem (capturam, logam, devolvem [] e a página
 * responde 200 fingindo que está tudo bem). Num wiki cuja fonte é
 * insubstituível, seção que desaparece calada é o pior modo de falha possível.
 */

const DIR = path.join(process.cwd(), "content", "wiki");

export type FamiliaCarregada =
  | { ok: true; familia: Familia }
  | { ok: false; erro: string; detalhe?: string };

/**
 * Lê e valida uma família. Erro é devolvido, nunca engolido.
 *
 * `traduzir: false` devolve o português cru e NÃO toca no cookie de idioma.
 * Serve para quem só quer contar entradas (o índice do códice carrega as 8
 * famílias de uma vez): traduzir 733 entradas para exibir o número 733 é
 * trabalho jogado fora, e o tradutor aqui percorre campo a campo.
 */
export async function carregarFamilia(
  nome: string,
  opcoes?: { traduzir?: boolean }
): Promise<FamiliaCarregada> {
  const arquivo = path.join(DIR, `${nome}.json`);
  let cru: string;

  try {
    cru = await readFile(arquivo, "utf8");
  } catch {
    return {
      ok: false,
      erro: "ainda-nao-extraida",
      detalhe: `content/wiki/${nome}.json não existe. A família ainda não foi extraída dos arquivos-fonte.`,
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(cru);
  } catch (e) {
    return {
      ok: false,
      erro: "json-invalido",
      detalhe: `content/wiki/${nome}.json não é JSON válido: ${(e as Error).message}`,
    };
  }

  const r = FamiliaSchema.safeParse(json);
  if (!r.success) {
    const primeiros = r.error.issues
      .slice(0, 4)
      .map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`)
      .join(" · ");
    return {
      ok: false,
      erro: "fora-do-schema",
      detalhe: `content/wiki/${nome}.json não bate com o schema — ${primeiros}`,
    };
  }

  if (opcoes?.traduzir === false) return { ok: true, familia: r.data };
  return { ok: true, familia: await traduzido(r.data) };
}

/* ------------------------------------------------------------------ *
 *  TRADUÇÃO DO CONTEÚDO
 *
 *  Os JSON de `content/wiki/` são escritos em português — é a língua em que
 *  a documentação do servidor foi redigida e em que o códice é curado. Os
 *  outros três idiomas saem de um dicionário por PADRÃO
 *  (`content/wiki/i18n/<locale>.json`), aplicado aqui, na leitura.
 *
 *  Na leitura, e não na geração, pelos mesmos dois motivos do grimório de
 *  skills: o repositório guarda UM arquivo de conteúdo em vez de quatro que
 *  podem divergir, e corrigir uma tradução é editar o dicionário e recarregar
 *  — sem reprocessar e sem recommitar o conteúdo.
 *
 *  Padrão ausente devolve o português. É uma lacuna visível, e visível é o
 *  que queremos: a alternativa (campo em branco) seria o wiki afirmando que
 *  a jóia não tem efeito nenhum.
 * ------------------------------------------------------------------ */

type Dicionario = Record<string, string>;
const cacheDic = new Map<Locale, Promise<Dicionario>>();

function lerDicionario(locale: Locale): Promise<Dicionario> {
  let p = cacheDic.get(locale);
  if (!p) {
    p = readFile(path.join(DIR, "i18n", `${locale}.json`), "utf8")
      .then((t) => (JSON.parse(t) as { padroes?: Dicionario }).padroes ?? {})
      /* arquivo ausente = idioma ainda não traduzido, não erro de servidor */
      .catch(() => ({}));
    cacheDic.set(locale, p);
  }
  return p;
}

async function traduzido(familia: Familia): Promise<Familia> {
  const locale = await getLocale();
  if (locale === "pt") return familia;
  const dic = await lerDicionario(locale);
  if (Object.keys(dic).length === 0) return familia;
  return traduzirFamilia(familia, dic) as Familia;
}

export type SecaoCarregada = SecaoMeta & {
  estado: FamiliaCarregada;
  /** Quantas entradas a seção tem. 0 quando indisponível. */
  total: number;
};

/** Carrega todas as seções do índice, em ordem. */
export async function carregarSecoes(): Promise<SecaoCarregada[]> {
  return Promise.all(
    SECOES.map(async (s) => {
      const estado = await carregarFamilia(s.familia, { traduzir: false });
      return {
        ...s,
        estado,
        total: estado.ok ? estado.familia.entradas.length : 0,
      };
    })
  );
}

/** Números romanos para a marginália das entradas — vira arábico acima de 3999. */
export function romano(n: number): string {
  if (n <= 0 || n > 3999) return String(n);
  const tabela: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let resto = n;
  let saida = "";
  for (const [valor, letra] of tabela) {
    while (resto >= valor) {
      saida += letra;
      resto -= valor;
    }
  }
  return saida;
}
