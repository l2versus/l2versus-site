import { z } from "zod";

/**
 * TIPOS E CONSTANTES DAS CLASSES — sem acesso a disco.
 *
 * Este arquivo é importado TAMBÉM pelo componente cliente da árvore, então
 * não pode tocar em `node:fs`. Quem lê o JSON é `classes.server.ts`.
 *
 * Vive separado de `lib/wiki/data.ts` de propósito. Aquele modela o códice
 * inteiro em torno da Entrada (antes/agora — o diff de balanceamento). Uma
 * árvore de classes não tem "antes" nem "agora": é TOPOLOGIA. Forçar pai/filho
 * dentro de EntradaSchema seria torcer o schema para caber um dado que ele não
 * descreve — e o schema do zod descarta campo desconhecido em silêncio, que já
 * custou caro neste projeto uma vez.
 *
 * Mesma disciplina do resto, porém: falha é VISÍVEL (retorna {ok:false}), nunca
 * um array vazio fingindo sucesso.
 */

const ClasseSchema = z.object({
  id: z.number().int().nonnegative(),
  slug: z.string().min(1),
  nome: z.string().min(1),
  constante: z.string(),
  paiId: z.number().int().nonnegative().nullable(),
  tier: z.number().int().min(0).max(3),
  raca: z.string(),
  racaPt: z.string(),
  mago: z.boolean(),
  invocador: z.boolean(),
  arquetipo: z.string(),
  fonte: z.string().min(1),
  fonteEnum: z.string(),
});

const DivergenciaSchema = z.object({
  classe: z.string(),
  id: z.number().int(),
  paiSegundoXml: z.number().int().nullable(),
  paiSegundoEnum: z.number().int().nullable(),
  adotado: z.string(),
  porque: z.string(),
  fonteXml: z.string(),
  fonteEnum: z.string(),
});

export const ArvoreSchema = z.object({
  familia: z.literal("classe"),
  titulo: z.string().optional(),
  geradoDe: z.array(z.string()).default([]),
  curadoPor: z.string().optional(),
  total: z.number().int(),
  porTier: z.array(z.object({ tier: z.number().int(), total: z.number().int() })).default([]),
  divergencias: z.array(DivergenciaSchema).default([]),
  classes: z.array(ClasseSchema),
});

export type Classe = z.infer<typeof ClasseSchema>;
export type Divergencia = z.infer<typeof DivergenciaSchema>;
export type Arvore = z.infer<typeof ArvoreSchema>;

export type ArvoreCarregada =
  | { ok: true; arvore: Arvore }
  | { ok: false; erro: "ainda-nao-extraida" | "json-invalido" | "fora-do-schema"; detalhe?: string };

/* Constantes de apresentação moram em `classes-ui.ts` (sem zod) — ver o
   cabeçalho de lá para o porquê. Re-exportadas aqui por conveniência do
   lado servidor; o cliente deve importar direto do módulo leve. */
export { RACAS, ARQUETIPOS, TIERS } from "./classes-ui";

