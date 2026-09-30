import { readFile } from "node:fs/promises";
import path from "node:path";
import { ArvoreSchema, type ArvoreCarregada } from "./classes";

/**
 * O CARREGADOR — vive separado de `classes.ts` porque aquele arquivo é
 * importado pelo componente CLIENTE da árvore (tipos, cores, ordem das
 * raças). Misturar `node:fs` lá quebrava o bundle do navegador:
 *   "the chunking context does not support external modules (node:fs/promises)"
 * Tipos e constantes de um lado, acesso a disco do outro.
 */

export async function carregarArvore(): Promise<ArvoreCarregada> {
  const arquivo = path.join(process.cwd(), "content", "wiki", "classes.json");
  let cru: string;
  try {
    cru = await readFile(arquivo, "utf8");
  } catch {
    return { ok: false, erro: "ainda-nao-extraida" };
  }

  let json: unknown;
  try {
    json = JSON.parse(cru);
  } catch (e) {
    return { ok: false, erro: "json-invalido", detalhe: e instanceof Error ? e.message : String(e) };
  }

  const r = ArvoreSchema.safeParse(json);
  if (!r.success) {
    return { ok: false, erro: "fora-do-schema", detalhe: r.error.issues.slice(0, 3).map((i) => `${i.path.join(".")}: ${i.message}`).join(" · ") };
  }
  return { ok: true, arvore: r.data };
}

/** Agrupa as classes de uma raça em colunas por tier, já ordenadas. */
export function colunasDaRaca(classes: Classe[], raca: string) {
  const daRaca = classes.filter((c) => c.raca === raca);
  return [0, 1, 2, 3].map((t) => daRaca.filter((c) => c.tier === t).sort((a, b) => a.id - b.id));
}
