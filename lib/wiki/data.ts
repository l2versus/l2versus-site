import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FamiliaSchema, SECOES, type Familia, type SecaoMeta } from "./types";

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

/** Lê e valida uma família. Erro é devolvido, nunca engolido. */
export async function carregarFamilia(nome: string): Promise<FamiliaCarregada> {
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

  return { ok: true, familia: r.data };
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
      const estado = await carregarFamilia(s.familia);
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
