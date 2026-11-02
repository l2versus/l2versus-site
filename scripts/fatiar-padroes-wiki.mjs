/**
 * Corta os padrões do códice em fatias de trabalho de tamanho PAREJO.
 *
 *   node scripts/fatiar-padroes-wiki.mjs [fatias]
 *
 * Corta por VOLUME DE TEXTO, não por contagem de itens. Os padrões vão de
 * "sim" a parágrafos de 400 caracteres; dividir 1.755 em 14 pedaços iguais
 * daria uma fatia de 300 caracteres e outra de 20.000, e a última seria a
 * que atrasa tudo e a que sai pior — tradutor cansado erra no fim do lote.
 *
 * A ordem de entrada é a de FREQUÊNCIA (ver extrair-padroes-wiki.mjs), e as
 * fatias são intercaladas round-robin sobre ela. Assim cada fatia recebe um
 * naco do topo e um naco da cauda: se sobrar tempo para só metade das
 * fatias, a cobertura do texto lido cresce parelha em vez de ficar toda
 * numa ponta.
 */
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { colher } from "./extrair-padroes-wiki.mjs";

const DIR = path.join(process.cwd(), "content", "wiki", "i18n", "_lotes");
const nFatias = Number(process.argv[2] ?? 14);

const lista = await colher();
await rm(DIR, { recursive: true, force: true });
await mkdir(DIR, { recursive: true });

/* round-robin por peso: cada padrão vai para a fatia mais leve até agora,
   percorrendo a lista do mais frequente para o menos */
const fatias = Array.from({ length: nFatias }, () => ({ chars: 0, itens: [] }));
for (const p of lista) {
  const alvo = fatias.reduce((a, b) => (b.chars < a.chars ? b : a));
  alvo.itens.push(p.padrao);
  alvo.chars += p.padrao.length;
}

let i = 0;
for (const f of fatias) {
  i++;
  const nome = `fatia-${String(i).padStart(2, "0")}.json`;
  await writeFile(path.join(DIR, nome), JSON.stringify(f.itens, null, 1), "utf8");
  console.log(`${nome}: ${String(f.itens.length).padStart(4)} padrões · ${f.chars} chars`);
}
console.log(`\n${lista.length} padrões em ${nFatias} fatias → content/wiki/i18n/_lotes/`);
